<div align="center">
  
  # ☁️ SKYTECH | Soluciones de Infraestructura & Nube
  
  **Proyecto Final de Conmutación y Enrutamiento - ITLA** ]

  ![Estado](https://img.shields.io/badge/Estado-En_Desarrollo-FF8C00?style=for-the-badge)
  ![Emulador](https://img.shields.io/badge/Emulador-PNETLAB-00509E?style=for-the-badge)
  ![Cisco](https://img.shields.io/badge/Cisco-Routing_&_Switching-1BA0D7?style=for-the-badge&logo=cisco&logoColor=white)
  ![Python](https://img.shields.io/badge/Automatización-Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
  ![Seguridad](https://img.shields.io/badge/Seguridad-IPsec_VPN-DC382D?style=for-the-badge&logo=wireguard&logoColor=white)

</div>

---

## 🌐 Sobre Nosotros

**Skytech** es una firma de consultoría tecnológica especializada en el diseño, implementación y aseguramiento de arquitecturas de red empresariales y despliegues en la nube. 

> **Nuestra Misión:** Proveer infraestructuras tecnológicas robustas, escalables y altamente seguras que impulsen el crecimiento operativo de nuestros clientes mediante la convergencia de redes tradicionales y servicios híbridos.

---

## 🚀 Resumen del Proyecto

[cite_start]Este repositorio contiene la ingeniería de detalle, configuraciones y documentación para el despliegue de una infraestructura de red corporativa unificada para **"Empresa del Grupo"**, una organización con presencia nacional dedicada a las ventas directas y centros de atención al cliente (Call Centers)[cite: 11, 12].

[cite_start]El diseño contempla el crecimiento proyectado de la empresa (40% a 5 años) [cite: 17] y se divide en tres sedes principales:
* 🏢 **Sede Central (Santo Domingo):** Núcleo de alta disponibilidad con redundancia de capa 2 y 3.
* [cite_start]☁️ **Sede Santiago (Data Center):** Centro de cómputos híbrido alojando servicios críticos (DNS, WEB, DHCP, Radius, Correo)[cite: 36, 38, 39, 40, 41, 42].
* [cite_start]📍 **Sede La Romana:** Sucursal de acceso optimizado[cite: 43, 44].

---

## 🛠️ Tecnologías y Protocolos Implementados

* [cite_start]**Enrutamiento Dinámico:** OSPF de Multiárea [cite: 24] para convergencia rápida.
* [cite_start]**Ciberseguridad:** Hardening de dispositivos, ACLs, mitigación de ataques (VLAN, DHCP Snooping, ARP Inspection, STP)[cite: 28, 31].
* [cite_start]**Conectividad WAN:** Túneles VPN dinámicos con encriptación IPsec entre sedes[cite: 30].
* [cite_start]**Servicios de Red:** Implementación de servidores Linux/Windows para servicios AAA y de infraestructura[cite: 37].
* **Automatización:** Scripts integrados para el despliegue de configuraciones.

---

## 📂 Estructura del Repositorio

```text
📦 Skytech_Redes_Corporativas
 ┣ 📂 configs_base/          # Scripts listos para inyección en equipos PNETLAB
 ┣ 📂 docs_skytech/          # Identidad corporativa, cotización e informe comercial
 ┣ 📂 documentacion_red/     # Tabla de direccionamiento (VLSM) y justificación de hardware
 ┣ 📂 scripts_automatizacion/# Herramientas de automatización de tareas de red
 ┣ 📂 seguridad_y_vpn/       # Archivos de configuración de IPsec, ACLs y Hardening
 ┣ 📂 servicios_santiago/    # Guías y archivos de servidores (DNS, WEB, RADIUS)
 ┣ 📂 topologia/             # Diagramas lógicos, físicos y archivos .unl exportados
 ┗ 📜 README.md              # Este documento
 ---
```

## 👥 Equipo de Ingeniería (Skytech)

Somos un equipo multidisciplinario de 8 ingenieros encargados de la implementación total de esta propuesta tecnológica:

| Rol | Ingeniero | Especialidad |
| :---: | :--- | :--- |
| 🏗️ **Arquitecto de Red (Core)** | `[Nombre]` | Diseño, OSPF, Routing & Switching. |
| 🖧 **Ingeniero de Enrutamiento** | `[Nombre]` | VLSM, Enlaces Trunk y Capa 2 (Sedes). |
| 🛡️ **Analista de Ciberseguridad** | `[Nombre]` | Mitigación de ataques (ARP, DHCP, STP), Hardening. |
| 🔐 **Especialista en VPN** | `[Nombre]` | Encriptación, IPsec, Control de Acceso (ACLs). |
| 🐧 **SysAdmin Server (Linux/Web)** | `[Nombre]` | Implementación DNS, Servidor Web (Apache/Nginx). |
| ✉️ **SysAdmin Server (Correo/AAA)**| `[Nombre]` | Implementación NFS/Radius y Servidor de Correo. |
| 🐍 **Ingeniero DevNet** | `[Nombre]` | Automatización de red con Python, Respaldos. |
| 📜 **Gestor de Proyectos & QA** | `[Nombre]` | Documentación técnica, Cotización, Pruebas de Red. |

---

<div align="center">
  <i>Diseñado con pasión por la tecnología para el Instituto Tecnológico de Las Américas (ITLA).</i>
</div>