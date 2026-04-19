# Instalación FreePBX + Asterisk en Ubuntu 20.04

Guía completa para montar un servidor PBX (Voz IP) usando Asterisk + FreePBX en Ubuntu 20.04, con extensiones SIP para llamadas internas entre los integrantes del equipo.

**Servidor:** `freepbx.skytech.com.do` (10.64.0.37) — VLAN 100 Centro de Datos Santiago
**Software:** Asterisk 18 + FreePBX 16
**Acceso web:** `http://10.64.0.37`
**Extensiones:** 1001-1007 (uno por integrante del equipo)

---

## ¿Por qué FreePBX y no Issabel?

Originalmente queríamos Issabel, pero **Issabel solo se puede instalar sobre CentOS** (no Ubuntu). Como el server es Ubuntu 20.04, usamos **FreePBX** que:

- Funciona perfecto en Ubuntu
- Usa el mismo motor (Asterisk) que Issabel
- Interfaz web muy parecida a Issabel
- Activamente mantenido (Issabel está descontinuado desde 2022)

---

## Requisitos previos

- Ubuntu 20.04 LTS limpio
- 2 GB RAM mínimo, 20 GB disco
- Acceso a internet para descargar paquetes
- Acceso root o usuario con sudo

---

## PASO 0 — Conectar a internet (importante)

Antes de instalar, el server necesita salida a internet. Conéctalo a la nube del lab y verifica:

```bash
ping -c 2 8.8.8.8
```

Si no hay internet, configura DHCP temporal:
```bash
sudo tee /etc/netplan/00-installer-config.yaml > /dev/null <<'EOF'
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: yes
EOF
sudo netplan apply
```

---

## PASO 1 — Cambiar repositorios a US (más rápidos desde RD)

```bash
sudo tee /etc/apt/sources.list > /dev/null <<'EOF'
deb http://us.archive.ubuntu.com/ubuntu focal main restricted universe multiverse
deb http://us.archive.ubuntu.com/ubuntu focal-updates main restricted universe multiverse
deb http://us.archive.ubuntu.com/ubuntu focal-security main restricted universe multiverse
deb http://us.archive.ubuntu.com/ubuntu focal-backports main restricted universe multiverse
EOF

sudo apt update
sudo apt upgrade -y
```

---

## PASO 2 — Instalar dependencias base

```bash
sudo apt install -y build-essential linux-headers-`uname -r` openssh-server apache2 mariadb-server mariadb-client bison flex php php-curl php-cli php-pdo php-mysql php-pear php-gd php-mbstring php-intl php-xml curl sox libncurses5-dev libssl-dev libmariadb-dev mpg123 libxml2-dev libnewt-dev sqlite3 libsqlite3-dev pkg-config automake libtool autoconf git unixodbc-dev uuid uuid-dev libasound2-dev libogg-dev libvorbis-dev libicu-dev libcurl4-openssl-dev libical-dev libneon27-dev libsrtp2-dev libspandsp-dev sudo subversion libtool-bin python-dev unixodbc dirmngr sendmail-bin sendmail
```

Cuando pida **Telephone country code**, ingresa `1` (cubre USA, Canadá y Rep. Dominicana).

---

## PASO 3 — Compilar e instalar Asterisk 18

```bash
cd /usr/src
sudo wget http://downloads.asterisk.org/pub/telephony/asterisk/asterisk-18-current.tar.gz
sudo tar xvf asterisk-18-current.tar.gz
cd asterisk-18*/

sudo contrib/scripts/get_mp3_source.sh
sudo contrib/scripts/install_prereq install
sudo ./configure --libdir=/usr/lib --with-pjproject-bundled --with-jansson-bundled
sudo make menuselect.makeopts
sudo make -j2
sudo make install
sudo make samples
sudo make config
sudo ldconfig
```

**Tiempo:** 15-25 minutos (especialmente el `make -j2`).

---

## PASO 4 — Crear usuario asterisk y permisos

```bash
sudo groupadd asterisk
sudo useradd -r -d /var/lib/asterisk -g asterisk asterisk
sudo usermod -aG audio,dialout asterisk
sudo chown -R asterisk:asterisk /etc/asterisk /var/{lib,log,spool}/asterisk /usr/lib/asterisk
sudo chown -R asterisk:asterisk /var/www
```

---

## PASO 5 — Instalar Node.js 14 con NVM

> **⚠️ NodeSource cambió sus llaves GPG y los repos directos no funcionan en 2026. Usar NVM es la solución más confiable.**

```bash
# Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Cargar NVM en la sesión actual
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Instalar Node 14
nvm install 14
nvm use 14
nvm alias default 14

# Verificar
node --version
```

Debe decir `v14.21.x`.

### Crear symlinks globales para que FreePBX encuentre Node

```bash
sudo ln -sf $(which node) /usr/bin/node
sudo ln -sf $(which npm) /usr/bin/npm

node --version
sudo node --version
```

Ambos deben mostrar `v14.x.x`.

---

## PASO 6 — Configurar Apache

```bash
sudo sed -i "s/^\(User\|Group\).*/\1 asterisk/" /etc/apache2/apache2.conf
sudo sed -i 's/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

sudo a2enmod rewrite
sudo systemctl restart apache2
```

---

## PASO 7 — Descargar e instalar FreePBX 16

```bash
cd /usr/src
sudo wget http://mirror.freepbx.org/modules/packages/freepbx/freepbx-16.0-latest.tgz
sudo tar xfz freepbx-16.0-latest.tgz
cd freepbx
sudo ./start_asterisk start
```

Verifica que Asterisk arrancó:
```bash
sleep 5
sudo asterisk -rx "core show version"
```

Debe responder con la versión (ej: `Asterisk 18.26.4 ...`).

Ejecutar el instalador FreePBX:
```bash
sudo ./install -n
```

**Tiempo:** 5-10 minutos. Al final debe decir:
```
You have successfully installed FreePBX
```

---

## PASO 8 — Crear servicio systemd para Asterisk

```bash
sudo tee /etc/systemd/system/asterisk.service > /dev/null <<'EOF'
[Unit]
Description=Asterisk PBX
After=network.target mariadb.service

[Service]
Type=simple
User=asterisk
Group=asterisk
ExecStart=/usr/sbin/asterisk -f
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable asterisk
```

---

## PASO 9 — Configurar IP estática (después de instalación)

```bash
sudo tee /etc/netplan/00-installer-config.yaml > /dev/null <<'EOF'
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: no
      addresses: [10.64.0.37/27]
      gateway4: 10.64.0.33
      mtu: 1400
      nameservers:
        addresses: [10.64.0.35, 8.8.8.8]
        search: [skytech.com.do]
EOF

sudo mv /etc/netplan/01-netcfg.yaml /root/backup-01.yaml 2>/dev/null
sudo mv /etc/netplan/50-cloud-init.yaml /root/backup-cloud.yaml 2>/dev/null
sudo sh -c 'echo "network: {config: disabled}" > /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg'
```

---

## PASO 10 — Mover el cable al switch SW-SANTIAGO

Físicamente mueve el cable del server desde la nube Internet al puerto del SW-SANTIAGO (puerto libre en VLAN 100 del Centro de Datos).

Luego aplica netplan:

```bash
sudo netplan apply
ip a
ip route
```

---

## PASO 11 — Configurar el puerto en SW-SANTIAGO

> **Importante:** Puerto en VLAN 100 + DAI/DHCP Snooping en TRUST + sin port-security para evitar problemas.

En SW-SANTIAGO:

```
en
conf t

interface e2/3
 description FreePBX-Server
 switchport mode access
 switchport access vlan 100
 ip dhcp snooping trust
 ip arp inspection trust
 no switchport port-security
 no switchport port-security maximum
 no switchport port-security violation restrict
 no switchport port-security mac-address sticky
 no shutdown
exit

clear port-security all
do wr
```

(Reemplaza `e2/3` por el puerto donde realmente conectaste el server.)

---

## PASO 12 — Verificar conectividad

```bash
ping -c 2 10.64.0.33
ping -c 2 8.8.8.8
```

Ambos deben responder.

---

## PASO 13 — Acceder al portal web

Desde cualquier PC de la red:

```
http://10.64.0.37
```

**Primera vez:**
- **Username:** `admin`
- **Password:** `Skytech2026`
- **Email:** `admin@skytech.com.do`

Saltea/cierra los popups del wizard inicial.

---

## PASO 14 — Crear las 7 extensiones SIP

En el menú superior:

```
Applications → Extensions → +Add Extension → Add New SIP [chan_pjsip] Extension
```

### Tabla de extensiones del equipo

| Extensión | Integrante | Display Name | Secret |
|---|---|---|---|
| 1001 | Josue Vasquez | Josue Vasquez | `root1234` |
| 1002 | Jose Carlos | Jose Carlos | `root1234` |
| 1003 | Edgardy Olivero | Edgardy Olivero | `root1234` |
| 1004 | Michael Robles | Michael Robles | `root1234` |
| 1005 | Josue Santana | Josue Santana | `root1234` |
| 1006 | Katiuska Santiago | Katiuska Santiago | `root1234` |
| 1007 | Jan Nelson Ortega | Jan Nelson Ortega | `root1234` |

Para cada una:
1. **User Extension:** número (1001, 1002, etc.)
2. **Display Name:** nombre completo
3. **Outbound CID:** mismo número
4. **Secret:** `root1234` (mínimo 8 caracteres)
5. Click **Submit** abajo

---

## PASO 15 — Aplicar configuración

Arriba a la derecha verás un botón rojo **"Apply Config"** — click ahí.

**Importante:** Cada vez que cambies algo en FreePBX hay que dar Apply Config para que tome efecto.

---

## PASO 16 — Conectar softphones

Los usuarios necesitan un cliente SIP en su PC para hacer/recibir llamadas.

### Softphones recomendados

- **Linphone** (Linux/Windows/Mac) — gratis, código abierto
- **Zoiper** (Windows/Mac/Android/iOS) — gratis
- **MicroSIP** (Windows) — ligero

### Configuración del softphone

- **SIP Server / Domain:** `10.64.0.37`
- **Username:** número de extensión (`1001`, `1002`, etc.)
- **Password:** `root1234`
- **Transport:** UDP
- **Puerto:** 5060

Una vez conectado, marca otra extensión (ej: `1002`) para llamar a ese integrante.

---

## Verificación final — Checklist

```bash
# Servicios corriendo
sudo systemctl status asterisk
sudo systemctl status apache2
sudo systemctl status mariadb

# Asterisk responde
sudo asterisk -rx "core show version"

# Web responde
curl -I http://10.64.0.37

# Extensiones registradas (después de conectar softphones)
sudo asterisk -rx "pjsip show endpoints"
```

- [ ] Asterisk `active (running)`
- [ ] Apache `active (running)`
- [ ] MariaDB `active (running)`
- [ ] Portal web abre en `http://10.64.0.37`
- [ ] Login admin funciona
- [ ] 7 extensiones creadas
- [ ] Apply Config aplicado
- [ ] Al menos 2 softphones conectados (estado `Avail`)
- [ ] Llamada interna entre 2 extensiones funciona

---

## Troubleshooting

### Asterisk no arranca después de instalar

```bash
sudo asterisk -rx "core show version"
```

Si no responde:
```bash
cd /usr/src/freepbx/
sudo ./start_asterisk start
sleep 5
sudo asterisk -rx "core show version"
```

### Error: "NodeJS 8 or higher is not installed"

Node no está en PATH global. Crear symlinks:
```bash
sudo ln -sf $(which node) /usr/bin/node
sudo ln -sf $(which npm) /usr/bin/npm
```

### Error: "/etc/asterisk doesn't exist"

Falta `make samples`:
```bash
cd /usr/src/asterisk-18*/
sudo make samples
sudo chown -R asterisk:asterisk /etc/asterisk
```

### NodeSource GPG key error al instalar Node

Saltarse NodeSource y usar NVM:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm install 14
```

### Server no llega al gateway (Destination Host Unreachable)

Verificar 3 cosas en SW-SANTIAGO:

1. **Puerto en VLAN 100:**
```
show interfaces e2/3 status
```

2. **DAI/DHCP Snooping en TRUST** (causa más común):
```
en
conf t
interface e2/3
 ip dhcp snooping trust
 ip arp inspection trust
exit
```

3. **Port-security desactivado:**
```
interface e2/3
 no switchport port-security
exit
```

### Portal web no abre desde PC cliente (timeout)

Problema de MTU. Ya está configurado `mtu: 1400` en netplan. Verificar:
```bash
ip a show eth0 | grep mtu
```

Debe decir `mtu 1400`.

### El softphone no se registra

- Verificar que la PC cliente puede hacer ping a `10.64.0.37`
- Verificar firewall UFW en el server: `sudo ufw status`
- Si está activo: `sudo ufw allow 5060/udp && sudo ufw allow 10000:20000/udp`
- Verificar en Asterisk: `sudo asterisk -rx "pjsip show endpoints"`

---

## Cambiar contraseña del admin

Después de la primera entrada, cambiar la contraseña por defecto:
```
Admin → Administrators → admin → Change Password
```

---

## Comandos útiles de Asterisk CLI

```bash
sudo asterisk -r                                # Entrar a la consola Asterisk
core show version                               # Versión de Asterisk
pjsip show endpoints                            # Estado de las extensiones
pjsip show contacts                             # Quién está conectado
core show channels                              # Llamadas activas
sip show peers                                  # (chan_sip si lo usas)
exit                                            # Salir de la consola
```

---

## Autor

**Proyecto Red Corporativa SkyTech**
Tech Lead: Edgardy Olivero
Equipo: Josue Vasquez, Jose Carlos, Michael Robles, Josue Santana, Katiuska Santiago, Jan Nelson Ortega
Fecha: Abril 2026
