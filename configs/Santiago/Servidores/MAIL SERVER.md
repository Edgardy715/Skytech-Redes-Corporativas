# Instalación Servidor de Correo — Postfix + Dovecot + Roundcube

Guía optimizada para montar un servidor de correo corporativo interno en Ubuntu 20.04, listo para que usuarios internos de múltiples sedes se conecten vía webmail.

**Proyecto:** Red Corporativa SkyTech
**Servidor:** `mail.skytech.com.do` (10.64.0.36 — VLAN 100 Centro de Datos Santiago)
**Dominio de correo:** `skytech.com.do`
**Alcance:** Correo interno entre sedes (Santo Domingo, Santiago, La Romana)

---

## Arquitectura

| Componente | Puerto | Rol |
|---|---|---|
| Postfix | 25 (SMTP) | Envío y recepción de correo |
| Dovecot | 143 (IMAP) | Acceso a buzones |
| Apache + Roundcube | 80 (HTTP) | Webmail accesible desde navegador |
| MariaDB | 3306 (local) | Base de datos de Roundcube |

---

## Requisitos previos

- Ubuntu 20.04 LTS con salida a internet para instalar paquetes
- Acceso root o usuario con `sudo`
- Red interna funcionando (gateway alcanzable, OSPF entre sedes, NAT a internet)
- Nombre DNS resoluble o entradas en `/etc/hosts` (documentado abajo)

---

## ⚡ Verificación previa: ¿Ya tienes servidor DNS funcionando?

Antes de empezar, verifica si el servidor DNS corporativo (10.64.0.35) ya está operativo. Si lo está, **puedes skipear varios pasos** de esta guía.

### Prueba rápida desde cualquier máquina de la red interna

```bash
nslookup mail.skytech.com.do 10.64.0.35
nslookup skytech.com.do 10.64.0.35
dig @10.64.0.35 mail.skytech.com.do
```

### Si el DNS responde correctamente (✅ DNS funcional)

El DNS resuelve `mail.skytech.com.do → 10.64.0.36` y tiene registro MX. En ese caso, **puedes omitir estos pasos**:

| Paso | Acción | Motivo para skipear |
|---|---|---|
| **2.2** | Reescribir `/etc/hosts` manualmente en el server | El DNS resuelve todo, no necesitas entradas locales |
| **Troubleshooting "página lenta"** | Agregar hosts locales | El DNS resuelve rápido, no hay timeouts |
| **PCs clientes** | Editar `/etc/hosts` en cada PC | Los clientes apuntan al DNS y resuelven solos |

Lo que **sí debes hacer aún con DNS funcional**:
- Paso 1 completo (red y MTU)
- Paso 2.1 (hostname del server)
- Paso 3 en adelante (instalación, Postfix, Dovecot, Roundcube)

### Si el DNS NO responde o no tiene los registros (❌ DNS no listo)

Sigue la guía completa. Las entradas en `/etc/hosts` del server y de las PCs clientes suplen al DNS temporalmente.

### Registros DNS necesarios en el servidor DNS (10.64.0.35)

Para que el entorno funcione con DNS real, el servidor DNS debe tener:

```
skytech.com.do.         IN  A     10.64.0.36
mail.skytech.com.do.    IN  A     10.64.0.36
dns.skytech.com.do.     IN  A     10.64.0.35
skytech.com.do.         IN  MX 10 mail.skytech.com.do.
```

Una vez agregados, todas las sedes (Santo Domingo, Santiago, La Romana) resolverán el correo sin configuración adicional en los clientes.

---

## PASO 1 — Configurar red (IP estática)

### 1.1) Verificar interfaz activa

```bash
ip a
```

Identifica el nombre de la interfaz de red (por ejemplo `eth0`, `ens3`, `enp0s3`).

### 1.2) Crear el archivo netplan

```bash
sudo tee /etc/netplan/00-installer-config.yaml > /dev/null <<'EOF'
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: no
      addresses: [10.64.0.36/27]
      gateway4: 10.64.0.33
      mtu: 1400
      nameservers:
        addresses: [10.64.0.35, 8.8.8.8]
        search: [skytech.com.do]
EOF
```

**Nota importante sobre MTU:** En ambientes virtualizados (EVE-NG, GNS3, CML) el MTU 1500 causa pérdida de paquetes grandes, bloqueando HTTP. El MTU 1400 resuelve ese problema de raíz.

### 1.3) Si existen archivos de netplan duplicados (cloud-init), eliminarlos

```bash
ls /etc/netplan/
# Si hay otros archivos como 01-netcfg.yaml o 50-cloud-init.yaml:
sudo mv /etc/netplan/01-netcfg.yaml /root/backup-01-netcfg.yaml 2>/dev/null
sudo mv /etc/netplan/50-cloud-init.yaml /root/backup-50-cloud-init.yaml 2>/dev/null
sudo sh -c 'echo "network: {config: disabled}" > /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg'
```

### 1.4) Aplicar y verificar

```bash
sudo netplan apply
ip a
ip route
ping -c 2 10.64.0.33
ping -c 2 8.8.8.8
```

---

## PASO 2 — Configurar hostname y /etc/hosts

### 2.1) Hostname

```bash
sudo hostnamectl set-hostname mail.skytech.com.do
hostname -f
```

### 2.2) /etc/hosts

> **💡 Si el DNS corporativo (10.64.0.35) ya resuelve `mail.skytech.com.do`, puedes skipear este paso.** Verifica con `nslookup mail.skytech.com.do 10.64.0.35`. Si resuelve a `10.64.0.36`, pasa al Paso 3.

Si el DNS no está listo todavía, configura `/etc/hosts` como fallback temporal:

```bash
sudo tee /etc/hosts > /dev/null <<'EOF'
127.0.0.1       localhost
127.0.1.1       mail.skytech.com.do mail
10.64.0.36      mail.skytech.com.do mail skytech.com.do
10.64.0.35      dns.skytech.com.do dns
EOF
```

---

## PASO 3 — Arreglar repositorios de Ubuntu (si vienen con mirrors raros)

Algunas imágenes cloud vienen con mirrors de otros países (ej: Tsinghua) que tardan o no responden. Reemplazar:

```bash
sudo tee /etc/apt/sources.list > /dev/null <<'EOF'
deb http://archive.ubuntu.com/ubuntu focal main restricted universe multiverse
deb http://archive.ubuntu.com/ubuntu focal-updates main restricted universe multiverse
deb http://archive.ubuntu.com/ubuntu focal-security main restricted universe multiverse
deb http://archive.ubuntu.com/ubuntu focal-backports main restricted universe multiverse
EOF

sudo apt update
```

---

## PASO 4 — Instalación de todos los paquetes

```bash
sudo apt update && sudo apt install -y \
  postfix mailutils \
  dovecot-core dovecot-imapd \
  apache2 mariadb-server \
  php php-mysql php-mbstring php-xml php-zip php-intl php-imagick php-gd php-curl php-imap \
  libapache2-mod-php \
  roundcube roundcube-mysql \
  nano net-tools
```

### Respuestas durante la instalación interactiva

**Postfix:**
- General type of mail configuration: `Internet Site`
- System mail name: `skytech.com.do`

**Roundcube (dbconfig-common):**
- Configure database for roundcube? `Yes`
- Database type: `mysql`
- MySQL application password: `root` (o la que elijas; anótala)

---

## PASO 5 — Configurar Postfix

### 5.1) Reescribir `main.cf` desde cero

**Importante:** NO editar el archivo por partes con nano porque caracteres ocultos o pegados unidos suelen romper el parser. Mejor reescribirlo completo:

```bash
sudo cp /etc/postfix/main.cf /etc/postfix/main.cf.backup

sudo tee /etc/postfix/main.cf > /dev/null <<'EOF'
# SkyTech Mail Server Configuration

# Identity
myhostname = mail.skytech.com.do
mydomain = skytech.com.do
myorigin = $mydomain

# Network
inet_interfaces = all
inet_protocols = ipv4
mydestination = $myhostname, localhost.$mydomain, localhost, $mydomain
mynetworks = 127.0.0.0/8, 10.0.0.0/8

# Mailbox format (Maildir for Dovecot)
home_mailbox = Maildir/

# Banner
smtpd_banner = $myhostname ESMTP

# No relay to external (internal only)
relayhost =

# Compatibility
compatibility_level = 2

# Aliases and paths
alias_maps = hash:/etc/aliases
alias_database = hash:/etc/aliases
mailbox_size_limit = 0
recipient_delimiter = +

# TLS (basic self-signed for internal)
smtpd_tls_cert_file = /etc/ssl/certs/ssl-cert-snakeoil.pem
smtpd_tls_key_file = /etc/ssl/private/ssl-cert-snakeoil.key
smtpd_use_tls = yes
smtpd_tls_session_cache_database = btree:${data_directory}/smtpd_scache
smtp_tls_session_cache_database = btree:${data_directory}/smtp_scache

# System paths
queue_directory = /var/spool/postfix
command_directory = /usr/sbin
daemon_directory = /usr/lib/postfix/sbin
data_directory = /var/lib/postfix
mail_owner = postfix
EOF
```

### 5.2) Aplicar alias y reiniciar

```bash
sudo newaliases
sudo systemctl restart postfix
sudo systemctl enable postfix
sudo systemctl status postfix
```

### 5.3) Verificar

```bash
sudo postconf -n | grep -E "myhostname|mydomain|mydestination|mynetworks|home_mailbox"
sudo ss -tlnp | grep :25
```

---

## PASO 6 — Configurar Dovecot

### 6.1) Confirmar protocolo IMAP habilitado

```bash
ls /usr/share/dovecot/protocols.d/
# Debe aparecer: imapd.protocol
```

### 6.2) Formato Maildir

```bash
sudo sed -i 's|^mail_location.*|mail_location = maildir:~/Maildir|' /etc/dovecot/conf.d/10-mail.conf
```

### 6.3) Permitir autenticación en texto plano (red interna)

```bash
sudo sed -i 's|^#disable_plaintext_auth.*|disable_plaintext_auth = no|' /etc/dovecot/conf.d/10-auth.conf
sudo sed -i 's|^auth_mechanisms = plain$|auth_mechanisms = plain login|' /etc/dovecot/conf.d/10-auth.conf

# Agregar auth_username_format para permitir login con usuario@dominio
echo "auth_username_format = %n" | sudo tee -a /etc/dovecot/conf.d/10-auth.conf
```

### 6.4) Deshabilitar TLS obligatorio (para red interna)

```bash
sudo sed -i 's|^ssl = .*|ssl = no|' /etc/dovecot/conf.d/10-ssl.conf
```

### 6.5) Reiniciar Dovecot

```bash
sudo systemctl restart dovecot
sudo systemctl enable dovecot
sudo systemctl status dovecot
sudo ss -tlnp | grep :143
```

---

## PASO 7 — Crear usuarios de correo

### 7.1) Crear grupo compartido

```bash
sudo groupadd mailusers 2>/dev/null || true
```

### 7.2) Crear los 7 usuarios del equipo

```bash
sudo adduser --gecos "Josue Vasquez - Ingeniero de Redes" --ingroup mailusers --disabled-password jvasquez
sudo adduser --gecos "Jose Carlos - Ingeniero de Redes" --ingroup mailusers --disabled-password jcarlos
sudo adduser --gecos "Edgardy Olivero - Ingeniero de Redes" --ingroup mailusers --disabled-password eolivero
sudo adduser --gecos "Michael Robles - Administrador de Servidores" --ingroup mailusers --disabled-password mrobles
sudo adduser --gecos "Josue Santana - Ingeniero de Seguridad" --ingroup mailusers --disabled-password jsantana
sudo adduser --gecos "Katiuska Santiago - Gestor de Proyectos y QA" --ingroup mailusers --disabled-password ksantiago
sudo adduser --gecos "Jan Nelson Ortega Marte" --ingroup mailusers --disabled-password jortega
```

### 7.3) Asignar contraseñas (usa chpasswd para evitar restricciones de longitud)

```bash
echo "jvasquez:root" | sudo chpasswd
echo "jcarlos:root" | sudo chpasswd
echo "eolivero:root" | sudo chpasswd
echo "mrobles:root" | sudo chpasswd
echo "jsantana:root" | sudo chpasswd
echo "ksantiago:root" | sudo chpasswd
echo "jortega:root" | sudo chpasswd
```

### 7.4) Preparar Maildir para cada usuario

```bash
for user in jvasquez jcarlos eolivero mrobles jsantana ksantiago jortega; do
  sudo mkdir -p /home/$user/Maildir/{new,cur,tmp}
  sudo chown -R $user:mailusers /home/$user/Maildir
  sudo chmod -R 700 /home/$user/Maildir
done
```

### 7.5) Verificar usuarios

```bash
getent passwd | grep -E "jvasquez|jcarlos|eolivero|mrobles|jsantana|ksantiago|jortega"
```

---

## PASO 8 — Prueba de envío local (antes de webmail)

```bash
echo "Test desde el servidor SkyTech" | mail -s "Prueba 1" ksantiago@skytech.com.do
sudo ls -la /home/ksantiago/Maildir/new/
```

Si aparece un archivo en `new/`, Postfix + Dovecot están funcionando. ✅

### Prueba de autenticación IMAP

```bash
curl -v --user ksantiago:root imap://localhost/INBOX
```

Debe responder `A002 OK Logged in`.

---

## PASO 9 — Configurar Roundcube

### 9.1) Editar configuración principal

```bash
sudo sed -i "s|\$config\['smtp_port'\] = 587|\$config['smtp_port'] = 25|" /etc/roundcube/config.inc.php
```

### 9.2) Agregar opciones para conexiones sin TLS y dominio por defecto

```bash
sudo tee -a /etc/roundcube/config.inc.php > /dev/null <<'EOF'

// ====== SkyTech Custom Config ======
$config['username_domain'] = 'skytech.com.do';
$config['imap_conn_options'] = array(
  'ssl' => array(
    'verify_peer' => false,
    'verify_peer_name' => false,
    'allow_self_signed' => true,
  ),
);
$config['smtp_conn_options'] = array(
  'ssl' => array(
    'verify_peer' => false,
    'verify_peer_name' => false,
    'allow_self_signed' => true,
  ),
);
EOF
```

### 9.3) Habilitar Roundcube en Apache

```bash
# Descomentar el Alias de Roundcube
sudo sed -i 's|^#\s*Alias /roundcube|Alias /roundcube|' /etc/apache2/conf-enabled/roundcube.conf

# Habilitar
sudo a2enconf roundcube
```

### 9.4) Suprimir warning de ServerName

```bash
echo "ServerName mail.skytech.com.do" | sudo tee -a /etc/apache2/apache2.conf
```

### 9.5) Reiniciar Apache

```bash
sudo systemctl restart apache2
sudo systemctl status apache2
sudo ss -tlnp | grep :80
```

---

## PASO 10 — Prueba desde el navegador

Desde cualquier PC de la red interna, abrir navegador:

```
http://10.64.0.36/roundcube/
```

**Credenciales de prueba:**
- Usuario: `ksantiago`
- Password: `root`

---

## Directorio de cuentas

| Integrante | Usuario | Email | Password |
|---|---|---|---|
| Josue Vasquez | `jvasquez` | jvasquez@skytech.com.do | root |
| Jose Carlos | `jcarlos` | jcarlos@skytech.com.do | root |
| Edgardy Olivero | `eolivero` | eolivero@skytech.com.do | root |
| Michael Robles | `mrobles` | mrobles@skytech.com.do | root |
| Josue Santana | `jsantana` | jsantana@skytech.com.do | root |
| Katiuska Santiago | `ksantiago` | ksantiago@skytech.com.do | root |
| Jan Nelson Ortega | `jortega` | jortega@skytech.com.do | root |

**Base de datos MariaDB:**
- Usuario root: `root` / Password: `root`
- Usuario roundcube: `roundcube` / Password: `root`

---

## Verificación final — Checklist completo

```bash
# Servicios
sudo systemctl status postfix
sudo systemctl status dovecot
sudo systemctl status apache2
sudo systemctl status mariadb

# Puertos escuchando
sudo ss -tlnp | grep -E ':25|:143|:80'

# Prueba end-to-end IMAP
curl -v --user ksantiago:root imap://localhost/INBOX

# Prueba end-to-end HTTP
curl -I http://10.64.0.36/roundcube/
```

Resultado esperado:

- Postfix → `active (running)` en puerto 25
- Dovecot → `active (running)` en puerto 143
- Apache → `active (running)` en puerto 80
- MariaDB → `active (running)`
- IMAP login → `A002 OK Logged in`
- HTTP → `HTTP/1.1 200 OK`

---

## Configuración de clientes IMAP externos (opcional)

Si un usuario quiere usar Thunderbird/Outlook en lugar del webmail:

**Servidor de entrada (IMAP):**
- Host: `10.64.0.36`
- Puerto: `143`
- Seguridad: ninguna (STARTTLS: no)
- Autenticación: contraseña normal
- Usuario: `ksantiago` (sin dominio)

**Servidor de salida (SMTP):**
- Host: `10.64.0.36`
- Puerto: `25`
- Seguridad: ninguna
- Autenticación: ninguna (la red interna está confiada por `mynetworks`)

---

## Troubleshooting rápido

### La PC cliente no abre Roundcube (timeout)

Verificar MTU:
```bash
sudo ip link set eth0 mtu 1400
```

Hacerlo permanente en netplan (ya incluido en Paso 1.2 de esta guía).

### "Login failed" en Roundcube

1. Verificar contraseña con `chpasswd` (Paso 7.3).
2. Confirmar `auth_username_format = %n` en `/etc/dovecot/conf.d/10-auth.conf`.
3. Confirmar `ssl = no` en `/etc/dovecot/conf.d/10-ssl.conf`.
4. Revisar `sudo tail -30 /var/log/mail.log`.

### Postfix no arranca después de editar main.cf

Reemplazar el archivo con el bloque `tee` del Paso 5.1 (usualmente es error de sintaxis por caracteres ocultos).

### La página carga muy lento

Causa típica: el servidor está esperando timeouts de DNS porque no puede resolver `skytech.com.do`.

**Solución A (si el DNS corporativo funciona):**
Verificar que `/etc/resolv.conf` apunta al DNS corporativo (10.64.0.35) y que ese DNS tiene los registros del dominio.

```bash
cat /etc/resolv.conf
nslookup skytech.com.do 10.64.0.35
```

**Solución B (fallback sin DNS):**
Agregar registros en `/etc/hosts` del servidor para evitar timeouts:
```bash
echo "10.64.0.36 mail.skytech.com.do skytech.com.do" | sudo tee -a /etc/hosts
```

---

## Siguiente paso recomendado

Si todavía no tienes el servidor DNS corporativo operativo, montarlo (10.64.0.35) con los siguientes registros:

```
skytech.com.do.         IN  A     10.64.0.36
mail.skytech.com.do.    IN  A     10.64.0.36
dns.skytech.com.do.     IN  A     10.64.0.35
skytech.com.do.         IN  MX 10 mail.skytech.com.do.
```

**Beneficios al tener DNS funcional:**
- Roundcube cargará instantáneo desde cualquier PC (sin editar `/etc/hosts` locales)
- Las PCs clientes no requieren configuración manual de nombres
- El correo podrá enviarse usando nombres (`@skytech.com.do`) en lugar de IPs
- Los equipos Cisco podrán usar nombres para `logging host`, `ntp server`, etc.

Una vez el DNS esté operativo, puedes remover las entradas manuales de `/etc/hosts` (excepto `127.0.0.1 localhost` y `127.0.1.1 mail.skytech.com.do mail`) y todo seguirá funcionando — esta vez resolviendo vía DNS.

---

## Autor

**Proyecto Red Corporativa SkyTech**
Tech Lead: Edgardy Olivero
Equipo: Josue Vasquez, Jose Carlos, Michael Robles, Josue Santana, Katiuska Santiago, Jan Nelson Ortega
Fecha: Abril 2026
