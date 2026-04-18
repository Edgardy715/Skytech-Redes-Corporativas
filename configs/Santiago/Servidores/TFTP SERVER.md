# Instalación y Configuración de Servidor TFTP en Ubuntu 20.04

Guía completa para montar un servidor TFTP que permite a equipos Cisco (routers y switches) subir y descargar archivos de configuración (backups de running-config, imágenes de IOS, etc).

**Servidor utilizado:** Ubuntu 20.04 LTS (10.64.0.36)  
**Proyecto:** Red Corporativa SkyTech — Sede Santiago, VLAN 100 (Centro de Datos)

---

## 1. Requisitos previos

- Servidor Ubuntu 20.04 con IP estática y salida a internet
- Acceso como root (o con `sudo`)
- Puerto UDP 69 disponible
- Conectividad desde los equipos Cisco hacia el server

---

## 2. Configurar IP estática (netplan)

```bash
sudo nano /etc/netplan/00-installer-config.yaml
```

Contenido:

```yaml
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: no
      addresses: [10.64.0.36/27]
      gateway4: 10.64.0.33
      nameservers:
        addresses: [10.64.0.35, 8.8.8.8]
        search: [skytech.com]
```

Aplicar:

```bash
sudo netplan apply
ip a
ping -c 2 8.8.8.8
```

---

## 3. Instalar TFTP Server

```bash
sudo apt update
sudo apt install -y tftpd-hpa tftp-hpa
```

- `tftpd-hpa` → el servidor
- `tftp-hpa` → cliente TFTP (opcional, para pruebas locales)

---

## 4. Configurar el servicio

Editar el archivo de configuración:

```bash
sudo nano /etc/default/tftpd-hpa
```

O reemplazarlo completamente con este comando (más confiable):

```bash
sudo tee /etc/default/tftpd-hpa > /dev/null <<'EOF'
TFTP_USERNAME="tftp"
TFTP_DIRECTORY="/srv/tftp"
TFTP_ADDRESS=":69"
TFTP_OPTIONS="--secure --create"
EOF
```

### Explicación de las opciones

| Opción | Descripción |
|---|---|
| `--secure` | Limita el acceso solo al directorio definido en `TFTP_DIRECTORY` |
| `--create` | Permite que los equipos Cisco **escriban** (suban) archivos nuevos |

Verificar que quedó correcto:

```bash
cat /etc/default/tftpd-hpa
wc -l /etc/default/tftpd-hpa
```

Debe mostrar **exactamente 4 líneas**.

---

## 5. Crear estructura de directorios

```bash
sudo mkdir -p /srv/tftp
sudo mkdir -p /srv/tftp/backups/santodomingo
sudo mkdir -p /srv/tftp/backups/santiago
sudo mkdir -p /srv/tftp/backups/laromana
sudo mkdir -p /srv/tftp/ios-images
sudo chown -R tftp:tftp /srv/tftp
sudo chmod -R 755 /srv/tftp
```

---

## 6. Iniciar y habilitar el servicio

```bash
sudo systemctl restart tftpd-hpa
sudo systemctl enable tftpd-hpa
sudo systemctl status tftpd-hpa
```

Debe aparecer:

```
Active: active (running)
```

---

## 7. Verificar que el puerto está escuchando

```bash
sudo ss -tulnp | grep 69
```

Debe mostrar:

```
udp   UNCONN  0  0  0.0.0.0:69  0.0.0.0:*  users:(("in.tftpd",pid=xxx,fd=4))
```

---

## 8. Pruebas desde equipos Cisco

### Guardar running-config al TFTP desde un router

```
copy running-config tftp://10.64.0.36/backups/santodomingo/R-CORE.cfg
```

Presiona Enter en los prompts (los valores ya van pre-rellenados).

Salida esperada:

```
!!
2980 bytes copied in 0.070 secs (42571 bytes/sec)
```

### Comandos de una línea para cada equipo de la red

**Santo Domingo:**

```
copy running-config tftp://10.64.0.36/backups/santodomingo/R-CORE.cfg
copy running-config tftp://10.64.0.36/backups/santodomingo/R-SW1.cfg
copy running-config tftp://10.64.0.36/backups/santodomingo/R-SW2.cfg
copy running-config tftp://10.64.0.36/backups/santodomingo/SW6.cfg
copy running-config tftp://10.64.0.36/backups/santodomingo/SW7.cfg
copy running-config tftp://10.64.0.36/backups/santodomingo/SW8.cfg
```

**Santiago:**

```
copy running-config tftp://10.64.0.36/backups/santiago/SANTIAGO-L3.cfg
copy running-config tftp://10.64.0.36/backups/santiago/SW-SANTIAGO.cfg
```

**La Romana:**

```
copy running-config tftp://10.64.0.36/backups/laromana/R-LaRomana.cfg
copy running-config tftp://10.64.0.36/backups/laromana/SW10.cfg
copy running-config tftp://10.64.0.36/backups/laromana/SW11.cfg
```

**ISP:**

```
copy running-config tftp://10.64.0.36/backups/R-ISP.cfg
```

---

## 9. Verificar en el server

```bash
ls -lR /srv/tftp/backups/
```

Debes ver todos los archivos `.cfg` organizados por sede.

Para ver el contenido:

```bash
cat /srv/tftp/backups/santodomingo/R-CORE.cfg | head -30
```

---

## 10. Restaurar una config a un equipo Cisco (opcional)

Para descargar un archivo desde el TFTP al running-config:

```
copy tftp://10.64.0.36/backups/santodomingo/R-CORE.cfg running-config
```

O para restaurar directamente a startup-config:

```
copy tftp://10.64.0.36/backups/santodomingo/R-CORE.cfg startup-config
```

---

## 11. Troubleshooting

### El servicio falla al iniciar

```bash
sudo systemctl status tftpd-hpa
sudo journalctl -u tftpd-hpa -n 30 --no-pager
```

Causas típicas:
- Error de sintaxis en `/etc/default/tftpd-hpa` (caracteres ocultos)
- Usuario `tftp` inexistente
- Puerto 69 ocupado por otro proceso

### El Cisco muestra "Timeout" al subir

- Verifica conectividad: `ping 10.64.0.36` desde el equipo Cisco
- Verifica que no hay ACL bloqueando UDP 69
- Revisa que el firewall del Ubuntu permita UDP 69:

```bash
sudo ufw status
sudo ufw allow 69/udp
```

### El Cisco muestra "Permission denied"

- Falta la opción `--create` en `TFTP_OPTIONS`
- Permisos incorrectos en `/srv/tftp/`:

```bash
sudo chown -R tftp:tftp /srv/tftp
sudo chmod -R 755 /srv/tftp
```

---

## 12. Checklist final

- [ ] Servicio `tftpd-hpa` en estado `active (running)`
- [ ] Puerto UDP 69 escuchando en `0.0.0.0`
- [ ] Estructura de carpetas creada en `/srv/tftp/backups/`
- [ ] Permisos `tftp:tftp` aplicados
- [ ] Backup exitoso desde al menos un router Cisco
- [ ] Archivo visible con `ls -l /srv/tftp/backups/`

---

## Autor

Proyecto Red Corporativa SkyTech  
Tech Lead: Edgardy  
Fecha: Abril 2026
