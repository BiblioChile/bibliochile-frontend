# BiblioChile — Frontend

Aplicación web responsiva (PWA) para la plataforma BiblioChile. Construida con React 18 + Vite.

## Stack

- **Framework:** React 18
- **Bundler:** Vite
- **Routing:** React Router v6
- **Estado global:** Redux Toolkit
- **HTTP:** Axios
- **UI:** React Bootstrap
- **Formularios:** React Hook Form
- **Deploy:** Vercel

## Características

- **PWA** — instalable en pantalla de inicio, soporte offline para lectura en túneles del Metro
- **Responsive** — diseñada para móvil (uso principal) y desktop
- **Acceso vía QR** — escanear código QR redirige directamente al lector sin registro

## Paleta de diseño

```
Fondo principal:  #102a43
Superficie cards: #1b3a5c
Acento/wine:      #7b1023
Texto:            #F7F4EC
```

**Tipografías:** Cormorant Garamond (títulos) · Montserrat (UI)

## Estructura

```
src/
├── components/      → componentes reutilizables
├── pages/           → vistas por ruta
├── store/           → Redux store y slices
├── services/        → llamadas a la API (Axios)
└── router/          → configuración de React Router

mockups/             → mockups HTML estáticos trazables con HU-01 a HU-10
└── styles.css       → design system compartido
```

## Requisitos

- Node.js 22+
- npm
- Backend de BiblioChile corriendo (ver [bibliochile-backend](https://github.com/bibliochile/bibliochile-backend))

## Instalación

```bash
# Clonar el repo
git clone https://github.com/bibliochile/bibliochile-frontend.git
cd bibliochile-frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL del backend

# Iniciar en desarrollo
npm run dev
```

## Variables de entorno

```
VITE_API_URL=""    # URL del backend (ej: http://localhost:3000)
```

## Scripts

```bash
npm run dev      # servidor de desarrollo Vite
npm run build    # build de producción
npm run preview  # previsualizar build de producción
```

## Mockups

Los mockups HTML estáticos están en la carpeta `mockups/` — son las 15 vistas del sistema trazables con las Historias de Usuario HU-01 a HU-10.

| Archivo | Vista | HU |
|---|---|---|
| home.html | Catálogo principal | HU-01 |
| reader.html | Lector de libros | HU-01, HU-02 |
| login.html | Inicio de sesión | HU-04 |
| registro.html | Registro de usuario | HU-10 |
| detalle-libro.html | Detalle de obra | HU-01 |
| dashboard-pasajero.html | Dashboard del lector | HU-04 |
| suscripcion.html | Gestión de suscripción | HU-03 |
| registro-autor.html | Registro autor nacional | HU-05 |
| subir-obra.html | Publicar obra | HU-06 |
| dashboard-autor.html | Dashboard del autor | HU-07 |
| obras-autor.html | Gestión de obras | HU-06 |
| estadisticas-autor.html | Estadísticas de lectura | HU-07 |
| admin-panel.html | Panel administrador | HU-08 |
| admin-autores.html | Aprobación de autores | HU-09 |
| qr-invalido.html | Error QR inválido | HU-02 |

## Desarrollo por sprints

| Sprint | Módulo |
|---|---|
| Sprint 1 | Mockups HTML estáticos (HU-01 a HU-10) |
| Sprint 2 | Login, registro, rutas protegidas por rol |
| Sprint 3 | Catálogo, lector, progreso de lectura |
| Sprint 4 | Perfil de autor, publicación de obras |
| Sprint 5 | Suscripción y arriendo |
| Sprint 6 | Panel administrador |
| Sprint 7 | PWA, tests de usabilidad, deploy |
