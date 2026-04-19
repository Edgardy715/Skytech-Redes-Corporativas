# Instalación y Configuración de Ansible — Automatización de Red SkyTech

Guía completa para montar Ansible como herramienta de automatización para la red corporativa SkyTech, usado para backups automáticos de equipos Cisco al servidor TFTP y actualizaciones masivas de servidores Ubuntu.

**Servidor Ansible:** `freepbx.skytech.com.do` (10.64.0.37) — VLAN 100 Centro de Datos Santiago
**Servidor TFTP destino:** `mail.skytech.com.do` (10.64.0.36)
**Equipos gestionados:** Todos los routers/switches Cisco + servers Ubuntu

---

## ¿Qué es Ansible?

Ansible es una herramienta de automatización que permite ejecutar comandos y configuraciones en muchos servidores/equipos al mismo tiempo, sin necesidad de hacer SSH manualmente a cada uno.

### Casos de uso en SkyTech

- **Backups automáticos** de configs Cisco al servidor TFTP
- **Updates masivos** de todos los servidores Ubuntu con un comando
- **Verificación de estado** de toda la red en segundos
- **Aplicación de cambios** uniformes en múltiples equipos
- **Programación con cron** para tareas recurrentes (diario, semanal)

---

## Requisitos previos

- Servidor Ubuntu 20.04 (usamos el FreePBX para no crear otro)
- Conectividad SSH desde el server Ansible a todos los equipos a gestionar
- Llaves RSA generadas en los routers Cisco (`crypto key generate rsa`)
- Usuario RADIUS funcionando (jvasquez con password root) para SSH a Cisco

---

## PASO 1 — Instalar Ansible

```bash
sudo apt update
sudo apt install -y ansible sshpass python3-paramiko
ansible --version
```

Debe decir `ansible 2.x.x` o superior.

---

## PASO 2 — Crear estructura de carpetas

```bash
sudo mkdir -p /etc/ansible/playbooks
sudo mkdir -p /var/log/ansible
```

---

## PASO 3 — Configurar Ansible para que NO valide host keys SSH

```bash
sudo tee /etc/ansible/ansible.cfg > /dev/null <<'EOF'
[defaults]
inventory = /etc/ansible/hosts
host_key_checking = False
retry_files_enabled = False
log_path = /var/log/ansible/ansible.log
deprecation_warnings = False

[ssh_connection]
ssh_args = -o ControlMaster=auto -o ControlPersist=60s -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null
EOF
```

---

## PASO 4 — Crear inventario (lista de equipos a manejar)

```bash
sudo tee /etc/ansible/hosts > /dev/null <<'EOF'
# ============================
# SERVIDORES UBUNTU
# ============================
[ubuntu_servers]
mail-server      ansible_host=10.64.0.36
web-master       ansible_host=10.64.0.40
web-backup       ansible_host=10.64.0.41
freepbx-server   ansible_host=10.64.0.37
radius-server    ansible_host=10.64.0.35

[ubuntu_servers:vars]
ansible_user=root
ansible_ssh_pass=root
ansible_python_interpreter=/usr/bin/python3
ansible_ssh_common_args='-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null'

# ============================
# EQUIPOS CISCO - SANTO DOMINGO
# ============================
[cisco_santodomingo]
R-CORE      ansible_host=10.0.2.129
R-SW1       ansible_host=10.0.2.130
R-SW2       ansible_host=10.0.2.134

# ============================
# EQUIPOS CISCO - SANTIAGO
# ============================
[cisco_santiago]
SANTIAGO-L3  ansible_host=10.64.0.33

# ============================
# EQUIPOS CISCO - LA ROMANA
# ============================
[cisco_laromana]
R-LaRomana   ansible_host=1.0.0.9

# ============================
# GRUPO GLOBAL CISCO
# ============================
[cisco:children]
cisco_santodomingo
cisco_santiago
cisco_laromana

[cisco:vars]
ansible_user=jvasquez
ansible_password=root
ansible_connection=network_cli
ansible_network_os=ios
ansible_become=yes
ansible_become_method=enable
ansible_ssh_common_args='-o KexAlgorithms=+diffie-hellman-group14-sha1 -o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedKeyTypes=+ssh-rsa -o StrictHostKeyChecking=no'
EOF
```

---

## PASO 5 — Probar conectividad

### A los servers Ubuntu

```bash
ansible ubuntu_servers -m ping
```

Debe responder `pong` para cada server.

### A los equipos Cisco

```bash
ansible cisco -m ios_facts
```

Debe devolver info del IOS de cada equipo (versión, hostname, etc.).

---

## PASO 6 — Playbook 1: Backup Cisco al servidor TFTP

> **Ventaja:** En vez de guardar las configs localmente en el server Ansible, hacemos que cada router ejecute `copy running-config tftp://...` para enviarlas directamente al servidor TFTP centralizado.

```bash
sudo tee /etc/ansible/playbooks/backup_cisco_tftp.yml > /dev/null <<'EOF'
---
- name: Backup running-config a servidor TFTP
  hosts: cisco
  gather_facts: no
  connection: network_cli

  tasks:
    - name: Obtener fecha actual
      set_fact:
        fecha: "{{ lookup('pipe', 'date +%Y-%m-%d_%H%M') }}"

    - name: Determinar carpeta de la sede
      set_fact:
        sede: "{{ 'santodomingo' if inventory_hostname in groups['cisco_santodomingo'] else 'santiago' if inventory_hostname in groups['cisco_santiago'] else 'laromana' }}"

    - name: Hacer backup al TFTP server
      ios_command:
        commands:
          - command: "copy running-config tftp://10.64.0.36/backups/{{ sede }}/{{ inventory_hostname }}_{{ fecha }}.cfg"
            prompt:
              - "Address or name of remote host"
              - "Destination filename"
            answer:
              - "\r"
              - "\r"

    - name: Confirmar backup
      debug:
        msg: "Backup creado: /srv/tftp/backups/{{ sede }}/{{ inventory_hostname }}_{{ fecha }}.cfg"
EOF
```

### Ejecutar manualmente

```bash
ansible-playbook /etc/ansible/playbooks/backup_cisco_tftp.yml
```

### Verificar en el server TFTP

```bash
ssh root@10.64.0.36 "ls -lR /srv/tftp/backups/"
```

Debe mostrar todos los archivos `.cfg` con fecha y hora.

---

## PASO 7 — Playbook 2: Actualizar todos los servers Ubuntu

```bash
sudo tee /etc/ansible/playbooks/update_ubuntu.yml > /dev/null <<'EOF'
---
- name: Actualizar servidores Ubuntu
  hosts: ubuntu_servers
  become: yes

  tasks:
    - name: Actualizar cache de apt
      apt:
        update_cache: yes
        cache_valid_time: 3600

    - name: Upgrade de paquetes
      apt:
        upgrade: dist
        autoremove: yes
      register: upgrade_result

    - name: Mostrar paquetes actualizados
      debug:
        msg: "{{ upgrade_result.stdout_lines | default('Sin cambios') }}"

    - name: Verificar si necesita reboot
      stat:
        path: /var/run/reboot-required
      register: reboot_required

    - name: Avisar si necesita reboot
      debug:
        msg: "AVISO: Server {{ inventory_hostname }} REQUIERE REBOOT"
      when: reboot_required.stat.exists
EOF
```

### Ejecutar manualmente

```bash
ansible-playbook /etc/ansible/playbooks/update_ubuntu.yml
```

---

## PASO 8 — Playbook 3 (bonus): Estado general de la red

```bash
sudo tee /etc/ansible/playbooks/health_check.yml > /dev/null <<'EOF'
---
- name: Health check de servers Ubuntu
  hosts: ubuntu_servers
  gather_facts: yes

  tasks:
    - name: Uptime y memoria
      shell: |
        echo "=== {{ inventory_hostname }} ==="
        uptime
        free -h | head -2
        df -h / | tail -1
      register: stats

    - name: Mostrar estado
      debug:
        var: stats.stdout_lines

- name: Health check de equipos Cisco
  hosts: cisco
  gather_facts: no
  connection: network_cli

  tasks:
    - name: Obtener uptime y CPU
      ios_command:
        commands:
          - show version | include uptime
          - show processes cpu | include CPU
      register: cisco_stats

    - name: Mostrar estado
      debug:
        msg: "{{ inventory_hostname }}: {{ cisco_stats.stdout_lines }}"
EOF
```

### Ejecutar

```bash
ansible-playbook /etc/ansible/playbooks/health_check.yml
```

---

## PASO 9 — Programar con cron (automatización total)

```bash
sudo crontab -e
```

Agregar al final:

```
# Backup Cisco al TFTP server - Diario a las 2:00 AM
0 2 * * * /usr/bin/ansible-playbook /etc/ansible/playbooks/backup_cisco_tftp.yml >> /var/log/ansible/backup.log 2>&1

# Update Ubuntu - Domingos a las 3:00 AM
0 3 * * 0 /usr/bin/ansible-playbook /etc/ansible/playbooks/update_ubuntu.yml >> /var/log/ansible/update.log 2>&1

# Health check - Cada 6 horas
0 */6 * * * /usr/bin/ansible-playbook /etc/ansible/playbooks/health_check.yml >> /var/log/ansible/health.log 2>&1
```

Verificar que se programaron:

```bash
sudo crontab -l
```

---

## Comandos rápidos útiles (ad-hoc)

Sin necesidad de playbooks, comandos directos:

```bash
# Ver inventario completo
ansible-inventory --list

# Ping a todos los Ubuntu
ansible ubuntu_servers -m ping

# Ping a todos los Cisco
ansible cisco -m ios_facts

# Ejecutar comando en TODOS los servers Ubuntu
ansible ubuntu_servers -m shell -a "uptime"

# Comando en Cisco específico
ansible R-CORE -m ios_command -a "commands='show ip route ospf'"

# Comando en TODOS los Cisco
ansible cisco -m ios_command -a "commands='show ip int brief'"

# Reiniciar servicio en todos los Ubuntu
ansible ubuntu_servers -m systemd -a "name=apache2 state=restarted"

# Ver espacio en disco de todos los Ubuntu
ansible ubuntu_servers -m shell -a "df -h /"

# Ver memoria libre
ansible ubuntu_servers -m shell -a "free -h"

# Ejecutar como root específicamente
ansible all -m shell -a "whoami" --become

# Ver logs de Ansible
tail -f /var/log/ansible/ansible.log

# Ver logs de cron jobs
tail -f /var/log/ansible/backup.log
```

---

## Verificación final — Checklist

```bash
# Ansible instalado
ansible --version

# Inventario carga sin errores
ansible-inventory --list

# Conectividad a Ubuntu
ansible ubuntu_servers -m ping

# Conectividad a Cisco
ansible cisco -m ios_facts

# Playbooks creados
ls /etc/ansible/playbooks/

# Cron programado
sudo crontab -l
```

- [ ] Ansible 2.x instalado
- [ ] `/etc/ansible/hosts` con todos los equipos
- [ ] Ping a Ubuntu funciona (responde pong)
- [ ] ios_facts a Cisco funciona
- [ ] Playbook backup_cisco_tftp.yml ejecutado exitosamente
- [ ] Archivos en `/srv/tftp/backups/` del server TFTP
- [ ] Playbook update_ubuntu.yml ejecutado
- [ ] Cron programado para backup diario y update semanal

---

## Estructura de archivos resultante

```
/etc/ansible/
├── ansible.cfg              ← Configuración global
├── hosts                    ← Inventario de equipos
└── playbooks/
    ├── backup_cisco_tftp.yml
    ├── update_ubuntu.yml
    └── health_check.yml

/var/log/ansible/
├── ansible.log
├── backup.log
├── update.log
└── health.log

/srv/tftp/backups/           ← (en el server TFTP - 10.64.0.36)
├── santodomingo/
│   ├── R-CORE_2026-04-19_0200.cfg
│   ├── R-SW1_2026-04-19_0200.cfg
│   └── R-SW2_2026-04-19_0200.cfg
├── santiago/
│   └── SANTIAGO-L3_2026-04-19_0200.cfg
└── laromana/
    └── R-LaRomana_2026-04-19_0200.cfg
```

---

## Troubleshooting

### Error: "Failed to connect to the host via ssh"

Verificar SSH manual primero:
```bash
ssh root@10.64.0.36
```

Si pide contraseña, está OK. Si rechaza la conexión, verificar:
- Server destino tiene SSH activo (`systemctl status ssh`)
- Firewall permite puerto 22
- Conectividad de red (ping)

### Error en Cisco: "no matching key exchange method found"

Ya está cubierto en `ansible_ssh_common_args` con:
```
-o KexAlgorithms=+diffie-hellman-group14-sha1
-o HostKeyAlgorithms=+ssh-rsa
```

Si sigue fallando, agregar al inventario también:
```
-o Ciphers=+aes128-cbc,3des-cbc
```

### Error: "Authentication failed"

Verificar usuario/password correctos en el inventario:
- Para Ubuntu: usuario `root` y password `root`
- Para Cisco: usuario `jvasquez` (RADIUS) y password `root`

### Backup TFTP falla

Verificar que TFTP server está corriendo:
```bash
ssh root@10.64.0.36 "systemctl status tftpd-hpa"
```

Y que el equipo Cisco puede llegar al TFTP:
```
ping 10.64.0.36
```

### Cron no ejecuta los playbooks

Verificar logs:
```bash
sudo tail -50 /var/log/ansible/backup.log
sudo tail -50 /var/log/syslog | grep CRON
```

Verificar que el cron está activo:
```bash
sudo systemctl status cron
```

---

## Ejemplos avanzados (para extender)

### Crear nuevo usuario en TODOS los servers Ubuntu

```bash
ansible ubuntu_servers -m user -a "name=nuevoUsuario password={{ 'password123' | password_hash('sha512') }} shell=/bin/bash" --become
```

### Configurar NTP en todos los Cisco

```yaml
- hosts: cisco
  tasks:
    - name: Configurar NTP server
      ios_config:
        lines:
          - ntp server 10.64.0.36
          - ntp source loopback0
```

### Verificar versión de IOS de todos los Cisco

```bash
ansible cisco -m ios_command -a "commands='show version | include Software'"
```

---

## Autor

**Proyecto Red Corporativa SkyTech**
Tech Lead: Edgardy Olivero
Equipo: Josue Vasquez, Jose Carlos, Michael Robles, Josue Santana, Katiuska Santiago, Jan Nelson Ortega
Fecha: Abril 2026
