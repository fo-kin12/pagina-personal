# Página personal — Michael López

Mi portafolio como desarrollador de software en Medellín: **JavaScript**, **Python** y **Ciberseguridad**.

🔗 **Ver en línea:** https://fo-kin12.github.io/pagina-personal/

## ✨ Qué tiene

- Presentación, habilidades con detalle y proyectos destacados.
- **Mis repos públicos de GitHub en vivo**: se cargan desde la API de GitHub (y hay una lista guardada por si no hay conexión).
- **Se instala como app en Android** (y en iPhone con *Compartir → Añadir a pantalla de inicio*). Abre aunque no haya internet.
- Botones para compartir, descargar la página en un solo archivo `.html` y guardar mi contacto (`.vcf`).
- Demo de pizarra sincronizada entre pestañas (Canvas + BroadcastChannel).
- Modo claro y oscuro.

## 🛠️ Tecnologías

HTML5 · JavaScript (ES6+) · **Tailwind CSS v4** · PWA (manifest + service worker)

## 📁 Estructura

```
pagina-personal/
├── index.html            # la página
├── css/
│   ├── tailwind.css      # generado por Tailwind (no editar a mano)
│   └── styles.css        # mis estilos propios
├── js/
│   └── main.js           # toda la lógica (repos, app, formulario, demo…)
├── src/
│   └── input.css         # configuración de Tailwind
├── icons/                # íconos de la app
├── manifest.webmanifest  # datos de la app para Android
├── sw.js                 # service worker (modo sin internet)
└── package.json
```

## 🚀 Cómo trabajar en el proyecto

```bash
npm install        # instala Tailwind (solo la primera vez)
npm run dev        # recompila el CSS cada vez que guardo cambios
npm run build      # genera css/tailwind.css listo para subir
```

Para verla en el computador abre `index.html` o usa `npm start`.

## ✏️ Cambiar mis datos

En `js/main.js`, el bloque `CONFIG` del inicio tiene mi correo, WhatsApp, GitHub y LinkedIn. Lo que cambie ahí se actualiza en toda la página.

---

Hecho por [fo-kin12](https://github.com/fo-kin12)
