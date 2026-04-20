# Servidor DNS Interno con BIND9 + Configuración de Hostnames

Guía completa para montar un servidor DNS autoritativo con BIND9 para el dominio `skytech.com.do`, y configurar los hostnames en todos los servidores, equipos Cisco y PCs de la red corporativa SkyTech.

**Servidor DNS:** `ftp.skytech.com.do` (10.64.0.35) — VLAN 100 Centro de Datos Santiago
**Dominio:** `skytech.com.do`
**Rol del servidor:** DNS + DHCP + FTP (all-in-one)

---

## ¿Por qué un DNS interno?

Antes de esta guía cada servidor usaba `/etc/hosts` local con las IPs hardcodeadas. Eso funciona pero:

- No escala — cada cambio hay que replicarlo en cada server
- Las PCs no resuelven nombres de la red
- No es profesional

Con BIND9 tendrás:

- Resolución central: `ping mail.skytech.com.do` funciona desde cualquier PC/server
- Los servicios web usan nombres amigables (`http://voip.skytech.com.do`)
- Los routers Cisco pueden usar `ntp server ntp.skytech.com.do`
- Más fácil de mantener y documentar

---

## Plan de nombres (FQDN)

### Servidores

| IP | Hostname FQDN | Servicios |
|---|---|---|
| 10.64.0.35 | `ftp.skytech.com.do` | DNS + DHCP + FTP |
| 10.64.0.36 | `mail.skytech.com.do` | Mail + TFTP + RADIUS |
| 10.64.0.37 | `voip.skytech.com.do` | FreePBX + Ansible |
| 10.64.0.40 | `web-master.skytech.com.do` | Web principal |
| 10.64.0.41 | `web-backup.skytech.com.do` | Web secundario |
| 10.64.0.42 | `skytech.com.do` | VIP flotante (Keepalived) |

### Equipos Cisco

| IP | Hostname | Sede |
|---|---|---|
| 10.0.2.129 | `r-core.skytech.com.do` | Santo Domingo |
| 10.0.2.130 | `r-sw1.skytech.com.do` | Santo Domingo |
| 10.0.2.134 | `r-sw2.skytech.com.do` | Santo Domingo |
| 10.64.0.33 | `santiago-l3.skytech.com.do` | Santiago |
| 1.0.0.9 | `r-laromana.skytech.com.do` | La Romana |

### PCs de usuarios (opcional)

| VLAN | IP ejemplo | Hostname |
|---|---|---|
| 10 | 10.0.0.10 | `pc-operaciones.skytech.com.do` |
| 20 | 10.0.2.10 | `pc-finanzas.skytech.com.do` |
| 30 | 10.0.1.140 | `pc-rrhh.skytech.com.do` |
| 40 | 10.0.1.10 | `pc-gerencia.skytech.com.do` |
| 100 | 10.64.0.x | `pc-admin.skytech.com.do` |
| 110 | 10.64.0.x | `pc-ventas.skytech.com.do` |
| 50 | 10.128.0.x | `pc-atencion.skytech.com.do` |
| 60 | 10.128.0.x | `pc-ventaslocales.skytech.com.do` |
| 70 | 10.128.0.x | `pc-gerenciasucursal.skytech.com.do` |

---

# PARTE 1 — Instalar y Configurar BIND9 (servidor DNS)

## PASO 1 — Verificar conectividad e internet

```bash
ip a
ping -c 2 8.8.8.8
```

Si no hay internet, conectar a la nube del lab para descargar BIND9.

---

## PASO 2 — Configurar hostname del propio server

```bash
sudo hostnamectl set-hostname ftp.skytech.com.do
```

---

## PASO 3 — Configurar /etc/hosts

```bash
sudo tee /etc/hosts > /dev/null <<'EOF'
127.0.0.1       localhost
127.0.1.1       ftp.skytech.com.do ftp

10.64.0.35      ftp.skytech.com.do ftp dns dhcp
10.64.0.36      mail.skytech.com.do mail tftp radius
10.64.0.37      voip.skytech.com.do voip pbx ansible
10.64.0.40      web-master.skytech.com.do web-master
10.64.0.41      web-backup.skytech.com.do web-backup
10.64.0.42      skytech.com.do www
EOF
```

---

## PASO 4 — Configurar IP estática

```bash
sudo tee /etc/netplan/00-installer-config.yaml > /dev/null <<'EOF'
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: no
      addresses: [10.64.0.35/27]
      gateway4: 10.64.0.33
      mtu: 1400
      nameservers:
        addresses: [127.0.0.1, 8.8.8.8]
        search: [skytech.com.do]
EOF

sudo mv /etc/netplan/01-netcfg.yaml /root/backup-01.yaml 2>/dev/null
sudo mv /etc/netplan/50-cloud-init.yaml /root/backup-cloud.yaml 2>/dev/null
sudo sh -c 'echo "network: {config: disabled}" > /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg'
```

**No aplicar netplan aún.** Primero instalamos BIND9 con internet.

---

## PASO 5 — Instalar BIND9

```bash
sudo apt update
sudo apt install -y bind9 bind9utils bind9-doc dnsutils
named -v
```

---

## PASO 6 — Configurar opciones globales de BIND9

```bash
sudo tee /etc/bind/named.conf.options > /dev/null <<'EOF'
options {
    directory "/var/cache/bind";

    // Forwarders: si no resuelve localmente, consulta a Google
    forwarders {
        8.8.8.8;
        8.8.4.4;
    };

    // Permitir consultas desde toda nuestra red interna
    allow-query { 10.0.0.0/8; 127.0.0.1; };
    allow-recursion { 10.0.0.0/8; 127.0.0.1; };

    // Configuración general
    recursion yes;
    dnssec-validation auto;
    listen-on { any; };
    listen-on-v6 { none; };

    auth-nxdomain no;
};
EOF
```

---

## PASO 7 — Declarar zonas (directa + inversa)

```bash
sudo tee /etc/bind/named.conf.local > /dev/null <<'EOF'
// Zona directa: nombre -> IP
zone "skytech.com.do" {
    type master;
    file "/etc/bind/db.skytech.com.do";
    allow-update { none; };
};

// Zona inversa VLAN 100 Santiago (10.64.0.0/27)
zone "0.64.10.in-addr.arpa" {
    type master;
    file "/etc/bind/db.10.64.0";
    allow-update { none; };
};

// Zona inversa Santo Domingo (10.0.0.0/24)
zone "0.0.10.in-addr.arpa" {
    type master;
    file "/etc/bind/db.10.0.0";
    allow-update { none; };
};
EOF
```

---

## PASO 8 — Archivo de zona DIRECTA

```bash
sudo tee /etc/bind/db.skytech.com.do > /dev/null <<'EOF'
$TTL    604800
@       IN      SOA     ftp.skytech.com.do. admin.skytech.com.do. (
                        2026042001      ; Serial (incrementar con cada cambio)
                        3600            ; Refresh
                        1800            ; Retry
                        604800          ; Expire
                        86400 )         ; Negative Cache TTL

; Servidor DNS autoritativo
@       IN      NS      ftp.skytech.com.do.

; ========== SERVIDORES ==========
ftp             IN      A       10.64.0.35
dns             IN      A       10.64.0.35
dhcp            IN      A       10.64.0.35

mail            IN      A       10.64.0.36
tftp            IN      A       10.64.0.36
radius          IN      A       10.64.0.36

voip            IN      A       10.64.0.37
pbx             IN      A       10.64.0.37
ansible         IN      A       10.64.0.37

web-master      IN      A       10.64.0.40
web-backup      IN      A       10.64.0.41
skytech         IN      A       10.64.0.42
@               IN      A       10.64.0.42

; ========== ALIAS CNAME ==========
www             IN      CNAME   skytech
smtp            IN      CNAME   mail
imap            IN      CNAME   mail
pop3            IN      CNAME   mail

; ========== EQUIPOS CISCO ==========
r-core          IN      A       10.0.2.129
r-sw1           IN      A       10.0.2.130
r-sw2           IN      A       10.0.2.134
santiago-l3     IN      A       10.64.0.33
r-laromana      IN      A       1.0.0.9

; ========== REGISTROS MX (mail) ==========
@               IN      MX   10 mail.skytech.com.do.
EOF
```

---

## PASO 9 — Archivos de zona INVERSA

```bash
sudo tee /etc/bind/db.10.64.0 > /dev/null <<'EOF'
$TTL    604800
@       IN      SOA     ftp.skytech.com.do. admin.skytech.com.do. (
                        2026042001      ; Serial
                        3600
                        1800
                        604800
                        86400 )

@       IN      NS      ftp.skytech.com.do.

33      IN      PTR     santiago-l3.skytech.com.do.
35      IN      PTR     ftp.skytech.com.do.
36      IN      PTR     mail.skytech.com.do.
37      IN      PTR     voip.skytech.com.do.
40      IN      PTR     web-master.skytech.com.do.
41      IN      PTR     web-backup.skytech.com.do.
42      IN      PTR     skytech.com.do.
EOF

sudo tee /etc/bind/db.10.0.0 > /dev/null <<'EOF'
$TTL    604800
@       IN      SOA     ftp.skytech.com.do. admin.skytech.com.do. (
                        2026042001      ; Serial
                        3600
                        1800
                        604800
                        86400 )

@       IN      NS      ftp.skytech.com.do.
EOF
```

---

## PASO 10 — Validar sintaxis

```bash
sudo named-checkconf
sudo named-checkzone skytech.com.do /etc/bind/db.skytech.com.do
sudo named-checkzone 0.64.10.in-addr.arpa /etc/bind/db.10.64.0
sudo named-checkzone 0.0.10.in-addr.arpa /etc/bind/db.10.0.0
```

Los checks de zona deben decir `OK`. Si hay errores, revisar el archivo que falla.

---

## PASO 11 — Reiniciar y habilitar BIND9

```bash
sudo systemctl restart bind9
sudo systemctl enable bind9
sudo systemctl status bind9
```

---

## PASO 12 — Aplicar netplan y probar

```bash
sudo netplan apply

# Probar resolución local
dig @127.0.0.1 ftp.skytech.com.do +short
dig @127.0.0.1 mail.skytech.com.do +short
dig @127.0.0.1 voip.skytech.com.do +short
dig @127.0.0.1 skytech.com.do +short
dig @127.0.0.1 www.skytech.com.do +short
dig @127.0.0.1 r-core.skytech.com.do +short

# Probar forward (internet)
dig @127.0.0.1 google.com +short

# Probar reverse
dig @127.0.0.1 -x 10.64.0.36 +short
```

Todo debe resolver correctamente.

---

# PARTE 2 — Configurar Hostnames en Servidores Ubuntu

Para cada servidor, aplicar los siguientes 3 pasos:

## PASO 13 — Server Mail (10.64.0.36)

```bash
sudo hostnamectl set-hostname mail.skytech.com.do

sudo tee /etc/hosts > /dev/null <<'EOF'
127.0.0.1       localhost
127.0.1.1       mail.skytech.com.do mail

10.64.0.35      ftp.skytech.com.do ftp
10.64.0.36      mail.skytech.com.do mail
10.64.0.37      voip.skytech.com.do voip
10.64.0.40      web-master.skytech.com.do
10.64.0.41      web-backup.skytech.com.do
10.64.0.42      skytech.com.do www
EOF
```

Actualizar netplan para usar el DNS interno:

```bash
sudo sed -i 's|addresses: \[.*\]|addresses: [10.64.0.35, 8.8.8.8]|' /etc/netplan/00-installer-config.yaml
sudo netplan apply
```

Verificar:

```bash
hostname
hostname -f
ping -c 2 ftp.skytech.com.do
ping -c 2 voip.skytech.com.do
```

---

## PASO 14 — Server VoIP/Ansible (10.64.0.37)

```bash
sudo hostnamectl set-hostname voip.skytech.com.do

sudo tee /etc/hosts > /dev/null <<'EOF'
127.0.0.1       localhost
127.0.1.1       voip.skytech.com.do voip

10.64.0.35      ftp.skytech.com.do ftp
10.64.0.36      mail.skytech.com.do mail
10.64.0.37      voip.skytech.com.do voip
10.64.0.40      web-master.skytech.com.do
10.64.0.41      web-backup.skytech.com.do
10.64.0.42      skytech.com.do www
EOF

sudo sed -i 's|addresses: \[.*\]|addresses: [10.64.0.35, 8.8.8.8]|' /etc/netplan/00-installer-config.yaml
sudo netplan apply
```

---

## PASO 15 — Server Web Master (10.64.0.40)

```bash
sudo hostnamectl set-hostname web-master.skytech.com.do

sudo tee /etc/hosts > /dev/null <<'EOF'
127.0.0.1       localhost
127.0.1.1       web-master.skytech.com.do web-master

10.64.0.35      ftp.skytech.com.do ftp
10.64.0.36      mail.skytech.com.do mail
10.64.0.37      voip.skytech.com.do voip
10.64.0.40      web-master.skytech.com.do
10.64.0.41      web-backup.skytech.com.do
10.64.0.42      skytech.com.do www
EOF

sudo sed -i 's|addresses: \[.*\]|addresses: [10.64.0.35, 8.8.8.8]|' /etc/netplan/00-installer-config.yaml
sudo netplan apply
```

---

## PASO 16 — Server Web Backup (10.64.0.41)

```bash
sudo hostnamectl set-hostname web-backup.skytech.com.do

sudo tee /etc/hosts > /dev/null <<'EOF'
127.0.0.1       localhost
127.0.1.1       web-backup.skytech.com.do web-backup

10.64.0.35      ftp.skytech.com.do ftp
10.64.0.36      mail.skytech.com.do mail
10.64.0.37      voip.skytech.com.do voip
10.64.0.40      web-master.skytech.com.do
10.64.0.41      web-backup.skytech.com.do
10.64.0.42      skytech.com.do www
EOF

sudo sed -i 's|addresses: \[.*\]|addresses: [10.64.0.35, 8.8.8.8]|' /etc/netplan/00-installer-config.yaml
sudo netplan apply
```

---

# PARTE 3 — Configurar Hostnames en Equipos Cisco

## PASO 17 — Plantilla para cada router/switch

Aplicar en cada equipo Cisco, ajustando el hostname:

```
en
conf t

! Hostname
hostname R-CORE
ip domain-name skytech.com.do

! DNS servers para resolver nombres desde el propio router
ip name-server 10.64.0.35
ip name-server 8.8.8.8

do wr
```

### Aplicar en cada equipo

**R-CORE:**
```
hostname R-CORE
ip domain-name skytech.com.do
ip name-server 10.64.0.35
```

**R-SW1:**
```
hostname R-SW1
ip domain-name skytech.com.do
ip name-server 10.64.0.35
```

**R-SW2:**
```
hostname R-SW2
ip domain-name skytech.com.do
ip name-server 10.64.0.35
```

**SANTIAGO-L3:**
```
hostname SANTIAGO-L3
ip domain-name skytech.com.do
ip name-server 10.64.0.35
```

**R-LaRomana:**
```
hostname R-LaRomana
ip domain-name skytech.com.do
ip name-server 10.64.0.35
```

**Switches L2 (SW6, SW7, SW8, SW10, SW11, SW-SANTIAGO):**
```
hostname SWx
ip domain-name skytech.com.do
ip name-server 10.64.0.35
```

### Verificar en el Cisco

```
ping mail.skytech.com.do
ping voip.skytech.com.do
show hosts
```

Debe resolver nombres como si fueran IPs.

---

# PARTE 4 — Configurar PCs de Usuarios Linux

## PASO 18 — Plantilla para cada PC

En cada PC Linux (Ubuntu), editar netplan o interfaces de red:

```bash
sudo tee /etc/netplan/01-netcfg.yaml > /dev/null <<'EOF'
network:
  version: 2
  ethernets:
    eth1:
      dhcp4: yes
      nameservers:
        addresses: [10.64.0.35, 8.8.8.8]
        search: [skytech.com.do]
EOF

sudo netplan apply
```

Verificar:

```bash
ping -c 2 mail.skytech.com.do
dig @10.64.0.35 voip.skytech.com.do +short
```

### Cambiar hostname por PC

Ejemplo para la PC Operaciones:
```bash
sudo hostnamectl set-hostname pc-operaciones.skytech.com.do
```

Lo mismo para las otras PCs según la tabla al inicio del documento.

---

# Verificación Final — Checklist

En el servidor DNS (ftp.skytech.com.do):

```bash
# Servicio BIND9 corriendo
sudo systemctl status bind9

# Puerto 53 escuchando
sudo ss -tulnp | grep :53

# Todas las zonas cargan sin error
sudo named-checkconf
```

Desde cualquier servidor Ubuntu:

```bash
hostname
hostname -f
cat /etc/resolv.conf
ping -c 2 mail.skytech.com.do
dig mail.skytech.com.do +short
```

Desde cualquier equipo Cisco:

```
show hosts
ping mail.skytech.com.do
```

Desde cualquier PC cliente:

```bash
ping mail.skytech.com.do
nslookup voip.skytech.com.do
```

---

## Checklist completo

- [ ] BIND9 instalado y corriendo en 10.64.0.35
- [ ] Zonas directa e inversa cargan sin errores
- [ ] `dig @127.0.0.1 mail.skytech.com.do` resuelve correctamente
- [ ] Resolución externa funciona (`dig google.com`)
- [ ] Server Mail (10.64.0.36) tiene hostname correcto y usa DNS interno
- [ ] Server VoIP (10.64.0.37) tiene hostname correcto
- [ ] Servers Web (10.64.0.40, 10.64.0.41) configurados
- [ ] R-CORE, R-SW1, R-SW2 con `ip name-server 10.64.0.35`
- [ ] SANTIAGO-L3 configurado
- [ ] R-LaRomana configurado
- [ ] Al menos 2 PCs de usuarios resuelven nombres
- [ ] Probar: desde la PC Operaciones hacer `ping voip.skytech.com.do` funciona

---

## Troubleshooting

### BIND9 no arranca

```bash
sudo named-checkconf
sudo journalctl -u bind9 -n 30 --no-pager
```

Errores típicos:
- Sintaxis incorrecta en `named.conf.local`
- Archivo de zona con error (punto final faltante después de un dominio)
- Permisos incorrectos en `/etc/bind/`

Corregir permisos:
```bash
sudo chown -R root:bind /etc/bind/
sudo chmod -R 640 /etc/bind/
sudo systemctl restart bind9
```

### `dig` falla con "connection refused"

BIND9 no está escuchando. Verificar `listen-on { any; };` en `named.conf.options`.

### Resolución lenta desde clientes

Agregar `recursion yes;` en `named.conf.options` y verificar `allow-recursion`.

### Cisco no resuelve nombres

Verificar:
```
show ip name-servers
ping 10.64.0.35
```

Si el ping falla, el router no llega al DNS. Revisar OSPF/ruteo.

### Cambios en zona no toman efecto

Hay que **incrementar el número de serial** en el archivo de zona cada vez que se modifica, luego reiniciar BIND9:

```bash
sudo nano /etc/bind/db.skytech.com.do
# Cambiar: 2026042001 -> 2026042002
sudo systemctl reload bind9
```

---

## Ventajas de esta configuración

- **Centralización:** un solo lugar para gestionar nombres
- **Resolución inversa:** sabes qué IP pertenece a qué equipo
- **Redundancia:** si el DNS interno cae, los clientes caen al forwarder 8.8.8.8
- **Profesionalismo:** los servicios usan nombres, no IPs hardcoded
- **Integración:** Mail, RADIUS, Asterisk, Ansible todos pueden usar nombres

---

## Autor

**Proyecto Red Corporativa SkyTech**
Tech Lead: Edgardy Olivero
Equipo: Josue Vasquez, Jose Carlos, Michael Robles, Josue Santana, Katiuska Santiago, Jan Nelson Ortega
Fecha: Abril 2026
