# Instalación y Configuración de FreeRADIUS

Guía completa para montar un servidor FreeRADIUS en Ubuntu 20.04 para autenticación centralizada SSH en routers y switches Cisco.

**Proyecto:** Red Corporativa SkyTech
**Servidor:** `mail.skytech.com.do` (10.64.0.36) — VLAN 100 Centro de Datos Santiago
**Rol del servidor:** Mail (Postfix+Dovecot+Roundcube) + FTP (FileBrowser) + RADIUS (FreeRADIUS)
**Dominio:** `skytech.com.do`
**Alcance:** Autenticación SSH centralizada para todos los equipos Cisco de la red

---

## Arquitectura

```
PC Admin / Ingeniero
        │
        │ SSH (usuario@IP-equipo)
        ▼
Router/Switch Cisco
        │
        │ RADIUS (puerto 1812) → pregunta: ¿es válido este usuario?
        ▼
FreeRADIUS Server (10.64.0.36)
        │
        │ Access-Accept / Access-Reject
        ▼
Router/Switch Cisco → permite o deniega acceso
```

**Ventajas:**
- Un solo lugar para gestionar usuarios y contraseñas
- Si cambias la contraseña en RADIUS, cambia en todos los equipos
- Logs centralizados de quién accedió a qué equipo
- Si RADIUS no responde, el equipo cae a usuario local (fallback)

---

## Requisitos previos

- Ubuntu 20.04 con IP estática `10.64.0.36/27`
- Gateway `10.64.0.33` (SVI VLAN 100 en SANTIAGO-L3)
- Conectividad desde todos los equipos Cisco hacia `10.64.0.36`
- OSPF funcionando entre sedes (para que routers de otras sedes lleguen al RADIUS)

---

## PASO 1 — Configurar red (IP estática)

> **💡 Si ya montaste el servidor Mail en este servidor (10.64.0.36), la red ya está configurada. Skipea este paso.**

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
        addresses: [8.8.8.8]
        search: [skytech.com.do]
EOF

sudo mv /etc/netplan/01-netcfg.yaml /root/backup-01.yaml 2>/dev/null
sudo mv /etc/netplan/50-cloud-init.yaml /root/backup-cloud.yaml 2>/dev/null
sudo sh -c 'echo "network: {config: disabled}" > /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg'

sudo netplan apply
ip a
ping -c 2 10.64.0.33
ping -c 2 8.8.8.8
```

---

## PASO 2 — Instalar FreeRADIUS

```bash
sudo apt update && sudo apt install -y freeradius freeradius-utils
sudo systemctl enable freeradius
sudo systemctl status freeradius
```

---

## PASO 3 — Configurar usuarios

```bash
sudo nano /etc/freeradius/3.0/users
```

Agregar al final del archivo (respetando la indentación con TAB):

```
jvasquez    Cleartext-Password := "root"
            Service-Type = NAS-Prompt-User,
            Cisco-AVPair = "shell:priv-lvl=15"

jcarlos     Cleartext-Password := "root"
            Service-Type = NAS-Prompt-User,
            Cisco-AVPair = "shell:priv-lvl=15"

eolivero    Cleartext-Password := "root"
            Service-Type = NAS-Prompt-User,
            Cisco-AVPair = "shell:priv-lvl=15"

mrobles     Cleartext-Password := "root"
            Service-Type = NAS-Prompt-User,
            Cisco-AVPair = "shell:priv-lvl=15"

jsantana    Cleartext-Password := "root"
            Service-Type = NAS-Prompt-User,
            Cisco-AVPair = "shell:priv-lvl=15"

ksantiago   Cleartext-Password := "root"
            Service-Type = NAS-Prompt-User,
            Cisco-AVPair = "shell:priv-lvl=15"

jortega     Cleartext-Password := "root"
            Service-Type = NAS-Prompt-User,
            Cisco-AVPair = "shell:priv-lvl=15"
```

**Nota:** `shell:priv-lvl=15` da acceso directo a modo enable (privilegio 15) sin necesidad de escribir `enable` al entrar.

---

## PASO 4 — Configurar clientes RADIUS (equipos Cisco)

```bash
sudo nano /etc/freeradius/3.0/clients.conf
```

Agregar al final:

```
# Red interna completa SkyTech (acepta cualquier equipo del rango 10.x.x.x)
client skytech_network {
    ipaddr = 10.0.0.0/8
    secret = skytech123
    shortname = skytech_internal
}
```

**Nota:** Usar `10.0.0.0/8` cubre todas las sedes (Santo Domingo 10.0.x.x, Santiago 10.64.x.x, La Romana 10.128.x.x) sin tener que listar cada equipo individualmente.

---

## PASO 5 — Reiniciar FreeRADIUS

```bash
sudo systemctl restart freeradius
sudo systemctl status freeradius
```

---

## PASO 6 — Prueba local

```bash
radtest jvasquez root 127.0.0.1 0 testing123
```

Debe responder:
```
Received Access-Accept
    Service-Type = NAS-Prompt-User
    Cisco-AVPair = "shell:priv-lvl=15"
```

Si responde `Access-Reject` → revisar el archivo `users` (indentación con TAB, no espacios).

---

## PASO 7 — Configurar equipos Cisco

Aplicar en **cada router y switch** de la red:

### IOS moderno (recomendado):

```
en
conf t

! Habilitar AAA
aaa new-model
aaa group server radius SKYTECH-GROUP
 server name SKYTECH
exit

! Autenticación: RADIUS primero, local como fallback
aaa authentication login default group SKYTECH-GROUP local
aaa authorization exec default group SKYTECH-GROUP local if-authenticated

! Aplicar en líneas VTY y consola
line vty 0 4
 login authentication default
 transport input ssh
exit

line con 0
 login authentication default
exit

! Definir servidor RADIUS
radius server SKYTECH
 address ipv4 10.64.0.36 auth-port 1812 acct-port 1813
 key skytech123
exit

do wr
```

### IOS legacy (si el anterior no funciona):

```
en
conf t

aaa new-model
radius-server host 10.64.0.36 key skytech123

aaa authentication login default group radius local
aaa authorization exec default group radius local if-authenticated

line vty 0 4
 login authentication default
 transport input ssh
exit

line con 0
 login authentication default
exit

do wr
```

### Verificar que SSH está habilitado en el equipo Cisco

```
show ip ssh
```

Si dice `SSH Disabled`, generar llaves RSA:

```
crypto key generate rsa general-keys modulus 2048
ip ssh version 2
do wr
```

---

## PASO 8 — Prueba de autenticación SSH

Desde cualquier PC Linux de la red:

```bash
ssh jvasquez@<IP-del-equipo-Cisco>
```

Por ejemplo:
```bash
ssh jvasquez@10.0.2.129   # R-CORE
ssh jvasquez@10.0.2.130   # R-SW1
ssh jvasquez@10.64.0.33   # SANTIAGO-L3
```

Password: `root`

Debe entrar directamente en **privilege level 15** (modo enable) sin necesidad de escribir `enable`.

---

## Directorio de usuarios RADIUS

| Integrante | Usuario | Password | Nivel |
|---|---|---|---|
| Josue Vasquez | `jvasquez` | root | 15 (admin) |
| Jose Carlos | `jcarlos` | root | 15 (admin) |
| Edgardy Olivero | `eolivero` | root | 15 (admin) |
| Michael Robles | `mrobles` | root | 15 (admin) |
| Josue Santana | `jsantana` | root | 15 (admin) |
| Katiuska Santiago | `ksantiago` | root | 15 (admin) |
| Jan Nelson Ortega | `jortega` | root | 15 (admin) |

**Secret compartido con equipos Cisco:** `skytech123`

---

## Verificación final

```bash
# Estado del servicio
sudo systemctl status freeradius

# Puerto escuchando
sudo ss -tulnp | grep 1812

# Prueba de autenticación
radtest jvasquez root 127.0.0.1 0 testing123
radtest eolivero root 127.0.0.1 0 testing123

# Ver logs en tiempo real
sudo tail -f /var/log/freeradius/radius.log
```

---

## Troubleshooting

### Access-Reject en radtest

Causa: error de indentación en `/etc/freeradius/3.0/users`. La segunda línea de cada usuario **debe tener TAB**, no espacios.

Verificar:
```bash
cat -A /etc/freeradius/3.0/users | grep -A2 jvasquez
```

Las líneas con atributos deben mostrar `^I` (TAB) al inicio.

### SSH pide contraseña pero no entra (RADIUS no responde)

El equipo Cisco no llega al server RADIUS. Verificar:

```
! Desde el equipo Cisco
ping 10.64.0.36
```

Si no responde:
- Verificar que el server tiene IP 10.64.0.36 activa (`ip a`)
- Verificar que el puerto del server en SW-SANTIAGO está en VLAN 100
- Verificar que OSPF está propagando rutas hacia 10.64.0.32/27

En ese caso, el equipo cae al usuario **local** (el que está en `username ... secret ...` del propio router).

### Debug en Cisco (para ver qué pasa con RADIUS)

```
debug aaa authentication
debug radius
```

Intentar SSH y ver los mensajes. Parar con:
```
undebug all
```

### FreeRADIUS no arranca

```bash
sudo freeradius -X 2>&1 | tail -30
```

El modo debug muestra el error exacto.

---

## Equipos donde aplicar la config RADIUS

| Equipo | IP de gestión | Sede |
|---|---|---|
| R-CORE | 10.0.2.129 | Santo Domingo |
| R-SW1 | 10.0.2.130 | Santo Domingo |
| R-SW2 | 10.0.2.134 | Santo Domingo |
| SW6 | VLAN 1 (mgmt) | Santo Domingo |
| SW7 | VLAN 1 (mgmt) | Santo Domingo |
| SW8 | VLAN 1 (mgmt) | Santo Domingo |
| SANTIAGO-L3 | 10.64.0.33 | Santiago |
| SW-SANTIAGO | VLAN 1 (mgmt) | Santiago |
| R-LaRomana | 1.0.0.9 | La Romana |
| SW10 | VLAN 50 (mgmt) | La Romana |
| SW11 | VLAN 50 (mgmt) | La Romana |
| ISP | 1.0.0.2 | Nube |

---

## Autor

**Proyecto Red Corporativa SkyTech**
Tech Lead: Edgardy Olivero
Fecha: Abril 2026
