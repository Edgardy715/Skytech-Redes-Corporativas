<div align="center">

<img src="https://img.shields.io/badge/SKYTECH-IT%20SECURITY-00BFFF?style=for-the-badge&labelColor=0A1929" alt="SkyTech Banner"/>

# ☁️ SKYTECH

### *IT 100% Seguro para tu Empresa*

**Líderes en Transformación Digital** — Diseñamos infraestructuras tecnológicas de alto rendimiento, seguras y preparadas para el futuro de tu negocio.

---

![Status](https://img.shields.io/badge/Status-Production%20Ready-00D26A?style=flat-square&logo=checkmarx&logoColor=white)
![Emulator](https://img.shields.io/badge/Lab-PNETLAB-00509E?style=flat-square&logo=cisco&logoColor=white)
![Cisco IOS](https://img.shields.io/badge/Cisco-IOS%2015%2F17-1BA0D7?style=flat-square&logo=cisco&logoColor=white)
![Ubuntu](https://img.shields.io/badge/Ubuntu-20.04%20LTS-E95420?style=flat-square&logo=ubuntu&logoColor=white)
![IPsec](https://img.shields.io/badge/IPsec-AES--256-DC382D?style=flat-square&logo=wireguard&logoColor=white)
![OSPF](https://img.shields.io/badge/OSPF-Multi--Area-FF6B35?style=flat-square)
![Ansible](https://img.shields.io/badge/Automation-Ansible-EE0000?style=flat-square&logo=ansible&logoColor=white)
![Asterisk](https://img.shields.io/badge/VoIP-Asterisk%2018-B30F12?style=flat-square)

</div>

---

## 🎯 Sobre Nosotros

**SkyTech** es una firma de consultoría tecnológica especializada en el **diseño, implementación y aseguramiento de arquitecturas de red empresariales** y despliegues híbridos en la nube. Combinamos experiencia en networking, ciberseguridad y automatización para entregar infraestructuras que **crecen contigo**.

> *"No construimos redes. Construimos los cimientos digitales del futuro de tu empresa."*

### 🌟 ¿Qué nos diferencia?

<table>
<tr>
<td width="33%" align="center">

### 🛡️
**100% Seguro**
<br/>
Certificación A+<br/>
Cifrado IPsec AES-256<br/>
Hardening total

</td>
<td width="33%" align="center">

### ⚡
**Alto Rendimiento**
<br/>
Convergencia OSPF<br/>
HSRP y Keepalived<br/>
EtherChannel LACP

</td>
<td width="33%" align="center">

### 🚀
**Escalable**
<br/>
Diseño para 40% de<br/>
crecimiento a 5 años<br/>
Multi-sede unificado

</td>
</tr>
</table>

---

## 🏢 El Proyecto — CECOMPE

Una infraestructura corporativa unificada de misión crítica para **CECOMPE**, organización con presencia nacional en ventas directas y atención al cliente (Call Centers). El diseño contempla un crecimiento proyectado del **40% a 5 años** y conecta tres sedes estratégicas:

<table>
<tr>
<th>Sede</th>
<th>Rol</th>
<th>Características Clave</th>
</tr>
<tr>
<td>🏢 <b>Santo Domingo</b></td>
<td>Sede Central (HQ)</td>
<td>Núcleo de alta disponibilidad · Redundancia L2/L3 · HSRP Activo/Standby</td>
</tr>
<tr>
<td>☁️ <b>Santiago</b></td>
<td>Data Center</td>
<td>Centro de cómputos híbrido · Servicios críticos · Granja de servidores Linux</td>
</tr>
<tr>
<td>📍 <b>La Romana</b></td>
<td>Sucursal</td>
<td>Acceso optimizado · Enlace VPN dinámico · Conectividad transparente</td>
</tr>
</table>

---

## 🛠️ Stack Tecnológico

### 🌐 Infraestructura de Red

```
┌─────────────────────────────────────────────────────────────┐
│  OSPF Multi-Área  ·  DMVPN  ·  IPsec AES-256-SHA256         │
│  HSRP  ·  EtherChannel LACP  ·  Rapid-PVST  ·  VTP          │
└─────────────────────────────────────────────────────────────┘
```

### 🔒 Ciberseguridad

```
┌─────────────────────────────────────────────────────────────┐
│  DHCP Snooping  ·  Dynamic ARP Inspection  ·  Port-Security │
│  BPDU Guard  ·  Root Guard  ·  ACLs Granulares  ·  AAA      │
└─────────────────────────────────────────────────────────────┘
```

### 🖥️ Servicios de Servidor (Ubuntu 20.04)

| Servicio | Tecnología | Propósito |
|:--------:|:----------:|:----------|
| 📧 **Mail** | Postfix + Dovecot + Roundcube | Correo corporativo con webmail |
| 🔐 **RADIUS** | FreeRADIUS + daloRADIUS | Autenticación AAA centralizada |
| 📁 **FTP Web** | vsftpd + FileBrowser | Portal de archivos corporativo |
| 💾 **TFTP** | tftpd-hpa | Backups automáticos de equipos Cisco |
| 📞 **VoIP** | Asterisk 18 + FreePBX 16 | PBX con 7 extensiones SIP |
| 🌍 **DNS** | BIND9 | Resolución interna `skytech.com.do` |
| 🤖 **Ansible** | Ansible 2.x | Automatización multi-equipo |
| 🌐 **Web HA** | Apache + Keepalived VRRP | Sitio web con failover automático |

---

## 🏗️ Arquitectura

<div align="center">

```
                          ┌─────────────────┐
                          │   🌐 INTERNET    │
                          └────────┬────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
              ┌─────▼─────┐  ┌────▼─────┐  ┌────▼─────┐
              │  R-CORE   │  │ BORDE-   │  │R-LAROMANA│
              │    HUB    │  │  STGO    │  │  SPOKE   │
              │ (Sto. Dgo)│  │ (Santiago)│  │(La Romana)│
              └─────┬─────┘  └────┬─────┘  └────┬─────┘
                    │     DMVPN   │             │
                    │  IPsec VPN  │             │
                    ╰─────────────┴─────────────╯
                                  │
                         ┌────────┴─────────┐
                         │   Tunnel 172.16  │
                         │    OSPF Area 0   │
                         └──────────────────┘
```

</div>

---

## 🚀 Highlights Técnicos

### 🔥 Lo que está corriendo en producción

- ✅ **3 sedes interconectadas** con DMVPN dinámico y encriptación AES-256
- ✅ **OSPF Multi-área** — Santiago (Area 0), Santo Domingo (Area 1), La Romana (Area 2)
- ✅ **8 servicios críticos** operativos en servidores Linux dedicados
- ✅ **Web HA con VRRP** — failover automático en menos de 3 segundos
- ✅ **7 extensiones VoIP** con llamadas entre sedes vía túnel DMVPN
- ✅ **RADIUS centralizado** — un solo lugar para gestionar credenciales de red
- ✅ **Backups automáticos** programados con Ansible + cron al servidor TFTP
- ✅ **DNS interno** resolviendo el dominio corporativo `skytech.com.do`

---

## 📂 Estructura del Repositorio

```text
📦 SkyTech_Redes_Corporativas
 ┃
 ┣ 📂 configs/                   🔧 Configuraciones Cisco y servers Linux
 ┃   ┣ 📂 routers/               Routers (R-CORE, R-LaRomana, Santiago-L3, ISP)
 ┃   ┣ 📂 switches/              Switches L2/L3 (R-SW1, R-SW2, SW6-11)
 ┃   ┣ 📂 dmvpn/                 Configuración DMVPN + IPsec
 ┃   ┗ 📂 servers/               Configs de servicios Linux
 ┃
 ┣ 📂 docs/                      📚 Guías de instalación detalladas
 ┃   ┣ 📜 INSTALL_MAIL.md        Servidor de correo corporativo
 ┃   ┣ 📜 INSTALL_FREERADIUS.md  Autenticación AAA centralizada
 ┃   ┣ 📜 INSTALL_FREEPBX.md     PBX VoIP con Asterisk
 ┃   ┣ 📜 INSTALL_TFTP.md        Servidor de backups automáticos
 ┃   ┣ 📜 INSTALL_FILEBROWSER.md Portal web de archivos
 ┃   ┣ 📜 INSTALL_DALORADIUS.md  Panel web para RADIUS
 ┃   ┣ 📜 INSTALL_ANSIBLE.md     Automatización multi-dispositivo
 ┃   ┗ 📜 INSTALL_DNS_BIND9.md   DNS interno corporativo
 ┃
 ┣ 📂 docs_skytech/              🎨 Identidad corporativa y comercial
 ┃   ┣ 📜 cotizacion.pdf
 ┃   ┣ 📜 informe_ejecutivo.pdf
 ┃   ┗ 📜 brand_guidelines.pdf
 ┃
 ┣ 📂 documentacion_red/         📊 Documentación técnica de red
 ┃   ┣ 📜 direccionamiento_VLSM.pdf
 ┃   ┣ 📜 justificacion_hardware.pdf
 ┃   ┗ 📜 plan_de_crecimiento.pdf
 ┃
 ┣ 📂 topologia/                 🗺️ Diagramas y labs
 ┃   ┣ 📜 diagrama_logico.png
 ┃   ┣ 📜 diagrama_fisico.png
 ┃   ┗ 📜 lab.unl                Export de PNETLAB
 ┃
 ┣ 📜 .gitignore
 ┗ 📜 README.md
```

---

## 📈 Direccionamiento IP (Resumen)

<table>
<tr>
<th align="center">Sede</th>
<th align="center">Bloque</th>
<th align="center">VLANs</th>
<th align="center">Gateway</th>
</tr>
<tr>
<td><b>Santo Domingo</b></td>
<td><code>10.0.0.0/10</code></td>
<td>10, 20, 30, 40, 99</td>
<td>HSRP (R-SW1/R-SW2)</td>
</tr>
<tr>
<td><b>Santiago</b></td>
<td><code>10.64.0.0/10</code></td>
<td>100, 110, 120</td>
<td>SANTIAGO-L3</td>
</tr>
<tr>
<td><b>La Romana</b></td>
<td><code>10.128.0.0/10</code></td>
<td>50, 60, 70</td>
<td>R-LaRomana</td>
</tr>
<tr>
<td><b>DMVPN Tunnel</b></td>
<td><code>172.16.0.0/24</code></td>
<td>—</td>
<td>GRE/IPsec</td>
</tr>
</table>

---

## 👥 Equipo de Ingeniería

Somos un equipo multidisciplinario con un objetivo común: **entregar la mejor red posible**.

<table>
<tr>
<th width="20%">Rol</th>
<th width="25%">Ingeniero</th>
<th>Especialidad</th>
</tr>
<tr>
<td align="center">🏗️<br/><b>Arquitecto de Red</b></td>
<td><code>Edgardy Olivero</code></td>
<td>Diseño Core, OSPF Multi-área, Tech Lead del proyecto</td>
</tr>
<tr>
<td align="center">🖧<br/><b>Ingeniero de Routing</b></td>
<td><code>Josue Vasquez</code></td>
<td>VLSM, Trunking, Capa 2 y redundancia L3</td>
</tr>
<tr>
<td align="center">🌐<br/><b>Ingeniero de Switching</b></td>
<td><code>Jose Carlos</code></td>
<td>VLANs, EtherChannel, HSRP, Spanning-Tree</td>
</tr>
<tr>
<td align="center">🛡️<br/><b>Analista de Ciberseguridad</b></td>
<td><code>Josue Santana</code></td>
<td>DHCP Snooping, DAI, Port-Security, Hardening</td>
</tr>
<tr>
<td align="center">🔐<br/><b>Especialista en VPN</b></td>
<td><code>Jan Nelson Ortega</code></td>
<td>DMVPN, IPsec AES-256, ACLs, Control de Acceso</td>
</tr>
<tr>
<td align="center">🐧<br/><b>SysAdmin Server</b></td>
<td><code>Michael Robles</code></td>
<td>Linux, DNS, Web, Mail, RADIUS, Servicios Core</td>
</tr>
<tr>
<td align="center">📜<br/><b>Gestor de Proyectos & QA</b></td>
<td><code>Katiuska Santiago</code></td>
<td>Documentación técnica, Cotización, Pruebas</td>
</tr>
</table>

---

## 📞 Contacto Comercial

<div align="center">

**¿Listo para transformar tu infraestructura?**

📧 `info@skytech.com.do` · 🌐 `www.skytech.com.do` · 📱 `Extensiones SIP 1001-1007`

</div>

---

<div align="center">

### ⭐ Proyecto Final — Conmutación y Enrutamiento

**Instituto Tecnológico de Las Américas** — `ITLA`

---

<sub>*Diseñado con ❤️ y cafeína por el equipo de ingeniería SkyTech · Abril 2026*</sub>

![Footer](https://img.shields.io/badge/Made%20in-República%20Dominicana-002D62?style=for-the-badge)

</div>
