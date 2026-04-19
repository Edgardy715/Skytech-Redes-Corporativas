# Instalación Servidor FTP + Portal Web de Archivos — vsftpd + FileBrowser

Guía completa para montar un servidor FTP (vsftpd) y un portal web de gestión de archivos (FileBrowser) en Ubuntu 20.04 para la red corporativa SkyTech.

**Servidor:** `mail.skytech.com.do` (10.64.0.36) — VLAN 100 Centro de Datos Santiago
**Rol del servidor:** Mail + FTP + RADIUS (all-in-one)
**FTP (vsftpd):** puerto 21 — acceso por línea de comandos o FileZilla
**Portal web (FileBrowser):** `http://10.64.0.36:8080` — acceso desde navegador
**Usuarios:** Los 7 integrantes del equipo SkyTech

---

## ¿Qué es vsftpd?

vsftpd (Very Secure FTP Daemon) es el servidor FTP estándar de Linux. Permite transferir archivos usando cualquier cliente FTP (FileZilla, WinSCP, línea de comandos). Es la base del servicio de archivos.

## ¿Qué es FileBrowser?

FileBrowser es un portal web ligero tipo Google Drive que se monta encima del FTP y permite subir, descargar y organizar archivos directamente desde el navegador, sin instalar nada en los clientes.

### Diferencia entre los dos

| | vsftpd | FileBrowser |
|---|---|---|
| Acceso | Cliente FTP (FileZilla, cmd) | Navegador web |
| Puerto | 21/TCP | 8080/TCP |
| Para qué | Transferencias programáticas | Uso diario del equipo |
| Interfaz | Línea de comandos | Web (tipo Google Drive) |

### Diferencia con TFTP

| | TFTP | vsftpd + FileBrowser |
|---|---|---|
| Usuarios | Equipos Cisco | Personas del equipo |
| Para qué | Backups de configs IOS | Archivos del proyecto |
| Autenticación | Sin usuario | Usuario + contraseña |

---

## Requisitos previos

- Ubuntu 20.04 con IP `10.64.0.36/27` ya configurada
- Gateway `10.64.0.33` operativo
- Internet disponible para instalar paquetes
- Puertos 21 y 8080 libres

> **Si ya montaste el servidor Mail en este servidor, la red ya está configurada. No necesitas reconfigurar nada de red.**

---

# PARTE 1 — Servidor FTP (vsftpd)

## PASO 1 — Verificar conectividad

```bash
ip a
ping -c 2 10.64.0.33
ping -c 2 8.8.8.8
```

---

## PASO 2 — Instalar vsftpd

```bash
sudo apt update && sudo apt install -y vsftpd
sudo systemctl status vsftpd
```

---

## PASO 3 — Configurar vsftpd

Hacer backup del config original:

```bash
sudo cp /etc/vsftpd.conf /etc/vsftpd.conf.backup
```

Reescribir con la configuración correcta:

```bash
sudo tee /etc/vsftpd.conf > /dev/null <<'EOF'
listen=YES
listen_ipv6=NO
anonymous_enable=NO
local_enable=YES
write_enable=YES
local_umask=022
dirmessage_enable=YES
use_localtime=YES
xferlog_enable=YES
connect_from_port_20=YES
chroot_local_user=YES
allow_writeable_chroot=YES
secure_chroot_dir=/var/run/vsftpd/empty
pam_service_name=vsftpd
userlist_enable=YES
userlist_file=/etc/vsftpd.userlist
userlist_deny=NO
pasv_enable=YES
pasv_min_port=40000
pasv_max_port=50000
EOF
```

---

## PASO 4 — Crear lista de usuarios permitidos

```bash
sudo tee /etc/vsftpd.userlist > /dev/null <<'EOF'
jvasquez
jcarlos
eolivero
mrobles
jsantana
ksantiago
jortega
EOF
```

---

## PASO 5 — Crear usuarios del sistema

```bash
for user in jvasquez jcarlos eolivero mrobles jsantana ksantiago jortega; do
  sudo adduser --gecos "" --disabled-password $user 2>/dev/null || true
  echo "$user:root" | sudo chpasswd
  sudo mkdir -p /home/$user/ftp
  sudo chown $user:$user /home/$user/ftp
  echo "Usuario $user listo"
done
```

---

## PASO 6 — Reiniciar vsftpd y verificar

```bash
sudo systemctl restart vsftpd
sudo systemctl enable vsftpd
sudo systemctl status vsftpd
sudo ss -tlnp | grep :21
```

Debe aparecer vsftpd escuchando en puerto 21.

---

## PASO 7 — Prueba de conexión FTP

Desde el propio server:

```bash
ftp localhost
```

Login con `jvasquez` / `root`. Comandos básicos dentro del FTP:

```
ls          # listar archivos
put archivo # subir archivo
get archivo # descargar archivo
bye         # salir
```

Desde FileZilla (PC cliente):
- Host: `10.64.0.36`
- Usuario: `jvasquez`
- Password: `root`
- Puerto: `21`

---

# PARTE 2 — Portal Web FileBrowser

## PASO 8 — Instalar FileBrowser

```bash
curl -fsSL https://raw.githubusercontent.com/filebrowser/get/master/get.sh | bash
filebrowser version
```

---

## PASO 9 — Crear estructura de directorios

```bash
sudo mkdir -p /srv/ftp-files
sudo mkdir -p /etc/filebrowser
sudo mkdir -p /srv/ftp-files/Santo_Domingo
sudo mkdir -p /srv/ftp-files/Santiago
sudo mkdir -p /srv/ftp-files/La_Romana
sudo mkdir -p /srv/ftp-files/Documentacion
sudo mkdir -p /srv/ftp-files/Configs_Cisco
sudo mkdir -p /srv/ftp-files/Compartido
sudo chmod -R 777 /srv/ftp-files
```

---

## PASO 10 — Inicializar configuración de FileBrowser

```bash
filebrowser config init --database /etc/filebrowser/filebrowser.db

filebrowser config set \
  --address 0.0.0.0 \
  --port 8080 \
  --root /srv/ftp-files \
  --database /etc/filebrowser/filebrowser.db
```

---

## PASO 11 — Crear usuarios en FileBrowser

```bash
for user in jvasquez jcarlos eolivero mrobles jsantana ksantiago jortega; do
  filebrowser users add $user rootroot1234 --database /etc/filebrowser/filebrowser.db --perm.admin=false --perm.create=true --perm.delete=true --perm.download=true --perm.execute=false --perm.modify=true --perm.rename=true --perm.share=true
  echo "Usuario $user creado"
done
```

Verificar:

```bash
filebrowser users ls --database /etc/filebrowser/filebrowser.db
```

---

## PASO 12 — Crear usuario Admin

```bash
filebrowser users add admin SkyTechAdmin2026 --database /etc/filebrowser/filebrowser.db --perm.admin=true
```

---

## PASO 13 — Crear servicio systemd

```bash
sudo tee /etc/systemd/system/filebrowser.service > /dev/null <<'EOF'
[Unit]
Description=FileBrowser - Portal Web de Archivos SkyTech
After=network.target

[Service]
ExecStart=/usr/local/bin/filebrowser --database /etc/filebrowser/filebrowser.db
Restart=always
RestartSec=5
User=root
WorkingDirectory=/srv/ftp-files

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable filebrowser
sudo systemctl start filebrowser
sudo systemctl status filebrowser
```

---

## PASO 14 — Verificar FileBrowser

```bash
sudo ss -tlnp | grep :8080
curl -I http://localhost:8080
```

Debe responder `HTTP/1.1 200 OK`.

---

## PASO 15 — Acceder desde el navegador

Desde cualquier PC de la red (Santo Domingo, Santiago, La Romana):

```
http://10.64.0.36:8080
```

### Credenciales de acceso

| Integrante | Rol | Usuario | Password |
|---|---|---|---|
| Josue Vasquez | Ingeniero de Redes | `jvasquez` | root |
| Jose Carlos | Ingeniero de Redes | `jcarlos` | root |
| Edgardy Olivero | Ingeniero de Redes | `eolivero` | root |
| Michael Robles | Administrador de Servidores | `mrobles` | root |
| Josue Santana | Ingeniero de Seguridad | `jsantana` | root |
| Katiuska Santiago | Gestor de Proyectos y QA | `ksantiago` | root |
| Jan Nelson Ortega | — | `jortega` | root |

---

## Verificación final — Checklist completo

```bash
# vsftpd
sudo systemctl status vsftpd
sudo ss -tlnp | grep :21

# FileBrowser
sudo systemctl status filebrowser
sudo ss -tlnp | grep :8080
curl -I http://10.64.0.36:8080
```

- [ ] vsftpd `active (running)` en puerto 21
- [ ] FileBrowser `active (running)` en puerto 8080
- [ ] Login FTP funciona (FileZilla o ftp cmd)
- [ ] Login FileBrowser desde navegador funciona
- [ ] Subir archivo desde navegador exitoso
- [ ] Descargar archivo desde otra PC exitoso
- [ ] Ambos servicios sobreviven al reinicio del server

---

## Comandos útiles de administración FileBrowser

```bash
filebrowser users ls --database /etc/filebrowser/filebrowser.db
filebrowser users update jvasquez --password nueva_pass --database /etc/filebrowser/filebrowser.db
filebrowser users add nuevo_usuario password --database /etc/filebrowser/filebrowser.db
filebrowser users rm jvasquez --database /etc/filebrowser/filebrowser.db
sudo journalctl -u filebrowser -f
sudo systemctl restart filebrowser
```

---

## Troubleshooting

### vsftpd — conexión rechazada

```bash
sudo systemctl status vsftpd
sudo tail -20 /var/log/vsftpd.log
```

Causa típica: usuario no está en `/etc/vsftpd.userlist`. Verificar:

```bash
cat /etc/vsftpd.userlist
```

### FileBrowser no arranca

```bash
sudo journalctl -u filebrowser -n 30 --no-pager
sudo chmod 777 /srv/ftp-files
sudo systemctl restart filebrowser
```

### No abre desde PC cliente (timeout)

Problema de MTU — reducir a 1400:

```bash
sudo ip link set eth0 mtu 1400
```

Permanente en netplan (agregar `mtu: 1400`).

### Puerto bloqueado

```bash
sudo ufw status
sudo ufw allow 21/tcp
sudo ufw allow 8080/tcp
sudo ufw reload
```

---

## Notas de seguridad

- Contraseñas `root` son para entorno de laboratorio. En producción usar contraseñas fuertes.
- vsftpd está configurado con `chroot_local_user=YES` — cada usuario solo puede ver su propio directorio `/home/usuario/ftp`.
- FileBrowser corre en HTTP — aceptable en red interna. Para HTTPS agregar certificado SSL.

---

## Autor

**Proyecto Red Corporativa SkyTech**
Tech Lead: Edgardy Olivero
Equipo: Josue Vasquez, Jose Carlos, Michael Robles, Josue Santana, Katiuska Santiago, Jan Nelson Ortega
Fecha: Abril 2026


```bash
ip a
ping -c 2 10.64.0.33
ping -c 2 8.8.8.8
```

Si no hay internet, conecta temporalmente el server a la nube del lab, instala FileBrowser, y reconecta al SW-SANTIAGO.

---

## PASO 2 — Instalar FileBrowser

```bash
curl -fsSL https://raw.githubusercontent.com/filebrowser/get/master/get.sh | bash
```

Verifica que se instaló correctamente:

```bash
filebrowser version
which filebrowser
```

Debe mostrar algo como `FileBrowser v2.x.x` y la ruta `/usr/local/bin/filebrowser`.

---

## PASO 3 — Crear estructura de directorios

```bash
sudo mkdir -p /srv/ftp-files
sudo mkdir -p /etc/filebrowser
sudo mkdir -p /srv/ftp-files/Santo_Domingo
sudo mkdir -p /srv/ftp-files/Santiago
sudo mkdir -p /srv/ftp-files/La_Romana
sudo mkdir -p /srv/ftp-files/Documentacion
sudo mkdir -p /srv/ftp-files/Configs_Cisco
sudo mkdir -p /srv/ftp-files/Compartido
sudo chmod -R 777 /srv/ftp-files
```

---

## PASO 4 — Inicializar configuración

```bash
filebrowser config init --database /etc/filebrowser/filebrowser.db

filebrowser config set \
  --address 0.0.0.0 \
  --port 8080 \
  --root /srv/ftp-files \
  --database /etc/filebrowser/filebrowser.db
```

Verificar:

```bash
filebrowser config cat --database /etc/filebrowser/filebrowser.db
```

---

## PASO 5 — Crear usuarios del equipo

```bash
for user in jvasquez jcarlos eolivero mrobles jsantana ksantiago jortega; do
  filebrowser users add $user root \
    --database /etc/filebrowser/filebrowser.db \
    --perm.admin=false \
    --perm.create=true \
    --perm.delete=true \
    --perm.download=true \
    --perm.execute=false \
    --perm.modify=true \
    --perm.rename=true \
    --perm.share=true
  echo "Usuario $user creado"
done
```

Verificar usuarios creados:

```bash
filebrowser users ls --database /etc/filebrowser/filebrowser.db
```

---

## PASO 6 — Crear servicio systemd

```bash
sudo tee /etc/systemd/system/filebrowser.service > /dev/null <<'EOF'
[Unit]
Description=FileBrowser - Portal Web de Archivos SkyTech
After=network.target

[Service]
ExecStart=/usr/local/bin/filebrowser --database /etc/filebrowser/filebrowser.db
Restart=always
RestartSec=5
User=root
WorkingDirectory=/srv/ftp-files

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable filebrowser
sudo systemctl start filebrowser
sudo systemctl status filebrowser
```

---

## PASO 7 — Verificar que está corriendo

```bash
sudo systemctl status filebrowser
sudo ss -tlnp | grep :8080
curl -I http://localhost:8080
```

Debe responder `HTTP/1.1 200 OK`.

---

## PASO 8 — Cambiar contraseña del admin por defecto

```bash
filebrowser users update admin \
  --password SkyTechAdmin2026 \
  --database /etc/filebrowser/filebrowser.db
```

---

## PASO 9 — Acceder desde el navegador

Desde cualquier PC de la red:

```
http://10.64.0.36:8080
```

### Credenciales de acceso

| Integrante | Rol | Usuario | Password |
|---|---|---|---|
| Josue Vasquez | Ingeniero de Redes | `jvasquez` | root |
| Jose Carlos | Ingeniero de Redes | `jcarlos` | root |
| Edgardy Olivero | Ingeniero de Redes | `eolivero` | root |
| Michael Robles | Administrador de Servidores | `mrobles` | root |
| Josue Santana | Ingeniero de Seguridad | `jsantana` | root |
| Katiuska Santiago | Gestor de Proyectos y QA | `ksantiago` | root |
| Jan Nelson Ortega | — | `jortega` | root |

---

## Verificación final — Checklist

```bash
sudo systemctl status filebrowser
sudo ss -tlnp | grep :8080
curl -I http://10.64.0.36:8080
sudo journalctl -u filebrowser -n 20 --no-pager
```

- [ ] FileBrowser `active (running)`
- [ ] Puerto 8080 escuchando en `0.0.0.0`
- [ ] Login desde navegador funciona
- [ ] Subir un archivo de prueba exitoso
- [ ] Descargar el archivo desde otra PC (otra sede)
- [ ] Crear carpeta funciona
- [ ] Servicio sobrevive al reinicio del server

---

## Comandos útiles de administración

```bash
# Ver todos los usuarios
filebrowser users ls --database /etc/filebrowser/filebrowser.db

# Cambiar contraseña de un usuario
filebrowser users update jvasquez --password nueva_pass --database /etc/filebrowser/filebrowser.db

# Agregar nuevo usuario
filebrowser users add nuevo_usuario password --database /etc/filebrowser/filebrowser.db

# Borrar usuario
filebrowser users rm jvasquez --database /etc/filebrowser/filebrowser.db

# Ver logs en tiempo real
sudo journalctl -u filebrowser -f

# Reiniciar servicio
sudo systemctl restart filebrowser
```

---

## Troubleshooting

### FileBrowser no arranca

```bash
sudo journalctl -u filebrowser -n 30 --no-pager
```

Causa típica: base de datos corrupta o directorio sin permisos:

```bash
sudo chmod 777 /srv/ftp-files
sudo systemctl restart filebrowser
```

### No abre desde PC cliente (timeout / carga lenta)

Problema de MTU — igual que con el servidor Mail:

```bash
sudo ip link set eth0 mtu 1400
```

Permanente en netplan (agregar `mtu: 1400` en el yaml).

### Puerto 8080 bloqueado

```bash
sudo ufw status
sudo ufw allow 8080/tcp
sudo ufw reload
```

### Usuarios no pueden subir archivos

```bash
sudo chmod 777 /srv/ftp-files
sudo systemctl restart filebrowser
```

### Servicio no arranca después de reboot

```bash
sudo systemctl is-enabled filebrowser
sudo systemctl enable filebrowser
```

---

## Notas de seguridad

- Las contraseñas `root` son para entorno de laboratorio. En producción usar contraseñas fuertes.
- FileBrowser corre en HTTP (no HTTPS) — aceptable en red interna corporativa.
- Para HTTPS agregar certificado SSL con `--cert` y `--key` en el servicio.

---

## Autor

**Proyecto Red Corporativa SkyTech**
Tech Lead: Edgardy Olivero
Equipo: Josue Vasquez, Jose Carlos, Michael Robles, Josue Santana, Katiuska Santiago, Jan Nelson Ortega
Fecha: Abril 2026
