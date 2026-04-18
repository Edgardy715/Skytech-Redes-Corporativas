ienvenidos al repositorio oficial de **SkyTech Global**, una plataforma web moderna, interactiva y de alto rendimiento diseñada para una empresa de servicios de infraestructura tecnológica corporativa y ciberseguridad.

Explora la plataforma y experimenta una interfaz ciber-fluida, animaciones inmersivas y un Centro de Comando simulado en tiempo real.

---

## ✨ Características Principales

*   **⚡ Arquitectura Multi-Página:** Enrutamiento ultra rápido del lado del cliente utilizando `react-router-dom`.
*   **🤖 Asistente de IA (Gemini):** Chatbot inteligente integrado que responde en tiempo real como soporte oficial de la empresa gracias a la API de `@google/genai`.
*   **💻 Centro de Comando (C&C):** Una ruta secreta (`/comando`) que presenta un dashboard *Sci-Fi* con gráficas en vivo (`recharts`), logs de terminal falsos y simulación de tráfico de red a prueba de ciberataques.
*   **🎨 Animaciones Fluídas:** Transiciones de página, contadores de números físicos (`springs`), efectos *Typewriter* y barras de progreso al hacer scroll utilizando `framer-motion`.
*   **🔦 Efectos Sci-Fi:** Puntero del ratón que emite resplandor con paralaje en la sección principal y efectos "Glassmorphism" (cristalizado) a lo largo de toda la UI.
*   **🗺️ Mapas de Nodos Reales:** Integración interactiva de `react-leaflet` para visualización geográfica.
*   **⚖️ Ventanas Modales Legales Geográficamente Adaptadas:** Sistema de pop-ups renderizados sobre el canvas para Términos, Privacidad, Cookies y Seguridad con base en regulaciones estrictas de la **República Dominicana (Leyes 172-13, 53-07, INDOTEL)** e internacionales.
*   **🌗 Tema Claro / Oscuro:** Soporte nativo y rápido de *Dark Mode*.

---

## 🛠️ Tecnologías Empleadas

| Categoría | Tecnología / Librería |
| :--- | :--- |
| **Core** | React 18, TypeScript, Vite |
| **Estilos** | Tailwind CSS, Lucide React (Íconos) |
| **Animaciones** | Framer Motion / Motion for React |
| **Enrutamiento** | React Router DOM |
| **IA & Backend** | Google Gemini API SDK |
| **Visualización de Datos** | Recharts (Dashboards), React-leaflet (Mapas) |

---

## 🚀 Instalación y Despliegue Configuración Local

Sigue estos pasos para correr el proyecto directamente en tu entorno local:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/skytech-global.git
   cd skytech-global
   ```

2. **Instalar las dependencias:**
   ```bash
   npm install
   ```

3. **Configurar las Variables de Entorno:**
   Crea un archivo `.env` en la raíz del proyecto y agrega tu API Key de Gemini:
   ```env
   VITE_GEMINI_API_KEY=tu_clave_api_aqui
   ```

4. **Correr el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   *La aplicación estará viva en `http://localhost:3000`*

---

## 📂 Estructura del Proyecto

```text
/src
 ├── components/       # Componentes reutilizables (ChatWidget, AnimatedNumber, LegalModal...)
 ├── pages/            # Vistas enrutadas (Home, CommandCenter)
 ├── index.css         # Importaciones core de TailwindCSS y Custom Fonts
 ├── main.tsx          # Punto de entrada de la app
 └── App.tsx           # Configuración del Router y envoltorios
```

---

## 📜 Licencia

Propietario de código bajo derecho de uso. Esta plantilla y su lógica están desarrollados para **SkyTech Global** bajo términos de copyright y en cumplimiento de las normativas de Ciberseguridad expuestas en el módulo legal.

---
