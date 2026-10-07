# 📱 BiblioChile — Frontend

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React%20Router-7-CA4245?logo=reactrouter&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-instalable-5A0FC8?logo=pwa&logoColor=white)
![Estado](https://img.shields.io/badge/Estado-MVP%20completo-success)

Aplicación web (PWA) *mobile-first* de BiblioChile, plataforma de lectura digital para el transporte público de Santiago.
Proyecto de título de Ingeniería Civil en Computación (AINC410), Universidad Andrés Bello.

Backend: [bibliochile-backend](https://github.com/BiblioChile/bibliochile-backend)

---

## 📌 Caso de uso

> Un pasajero escanea un código QR en una estación y llega directo a la obra,
> que lee desde el celular sin registrarse. Autores y administradores
> gestionan el contenido desde sus propios paneles.

| Rol | Qué ve |
|---|---|
| **Pasajero** | Catálogo, lector, planes, suscripción y panel personal |
| **Autor** | Registro, panel, subida de obras y estadísticas |
| **Administrador** | Panel general y aprobación de autores |

---

## ⚙️ ¿Cómo funciona?

1. `AuthContext` guarda el usuario y el token (persistidos en `localStorage`).
2. El interceptor de axios agrega el token a cada petición a la API.
3. `RequireRole` protege las rutas según el rol.
4. El lector guarda el progreso con un UUID anónimo generado en el navegador; al registrarse o iniciar sesión, ese progreso se migra a la cuenta.

```
Navegador → React (vistas + AuthContext) → axios → API BiblioChile → PostgreSQL
```

---

## 🚀 Ejecución

La guía completa (base de datos, backend y frontend) está en el
[README del backend](https://github.com/BiblioChile/bibliochile-backend#-instalación-y-ejecución-local).
Con el backend ya corriendo:

```bash
npm install
npm run dev                                  # http://localhost:5173
# o la versión compilada:
npm run build && npm run preview -- --host   # http://localhost:4173
```

**Requisitos:** Node.js 22.

| Variable | Uso |
|---|---|
| `VITE_API_URL` | URL base de la API del backend |

> 💡 Para probar desde el celular en la misma red, usa la IP de tu computador en `VITE_API_URL` y define esa misma dirección como `LAN_ORIGIN` en el `.env` del backend.

---

## 🧭 Roles, vistas y rutas

| Rol | Vista | Ruta |
|---|---|---|
| Público | Home (catálogo) | `/` |
| Público | Detalle de obra | `/books/:id` |
| Público | Lector | `/reader/:id` |
| Público | Acceso por QR | `/qr/:code` |
| Público | Planes | `/plans` |
| Público | Login y registro | ver `src/App.jsx` |
| Pasajero | Mi suscripción | `/subscription` |
| Pasajero | Mi panel | `/dashboard` |
| Pasajero | Registro como autor | `/autor/registro` |
| Autor | Panel | `/autor/dashboard` |
| Autor | Subir obra | `/autor/subir-obra` |
| Autor | Estadísticas | `/autor/estadisticas` |
| Admin | Panel | `/admin/panel` |
| Admin | Aprobación de autores | `/admin/autores` |

En la barra inferior móvil, **Perfil** lleva a un destino según el rol: sin sesión → login, pasajero → `/dashboard`, autor → `/autor/dashboard`, admin → `/admin/panel`.

---

## 🗂️ Estructura del proyecto

```
bibliochile-frontend/
│
├── src/
│   ├── views/               # Una por pantalla
│   ├── components/          # AppNavbar, BottomNav, BookCard, AdminSubNav, RequireRole
│   ├── context/             # AuthContext
│   ├── services/            # api.js (axios + interceptor)
│   └── utils/               # anonymousId, progress
│
├── mockups/                 # 15 mockups HTML + styles.css
└── README.md
```

---

## 📦 Dependencias principales

| Paquete | Versión | Descripción |
|---|---|---|
| `react` | 19.2.8 | Interfaz |
| `vite` | 8.1.5 | Build y servidor de desarrollo |
| `react-router-dom` | 7.18.1 | Ruteo |
| `axios` | 1.18.1 | Cliente HTTP |
| `vite-plugin-pwa` | 1.3.0 | Configuración PWA |
| `recharts` | 3.x | Gráfico de estadísticas del autor |
| `vitest` | 4.1.10 | Pruebas (con Testing Library) |

---

## 🛠️ Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (5173) |
| `npm run build` | Compilación de producción |
| `npm run preview` | Sirve la compilación (4173) |
| `npm test` | Vitest en modo *watch* |
| `npm test -- --run` | Vitest una sola vez |

---

## 🧪 Pruebas

Los tests están junto al código, como `*.test.jsx`. En cada push y pull request, la integración continua ejecuta las pruebas y la compilación.

```bash
npm test -- --run
```

---

## 🎨 Mockups

La carpeta `mockups/` tiene los 15 mockups HTML que sirvieron de referencia de diseño, con su `styles.css`.

| Elemento | Valor |
|---|---|
| Paleta | `#102a43` · `#1b3a5c` · `#7b1023` · `#F7F4EC` |
| Tipografías | Cormorant Garamond y Montserrat |

---

## ⚠️ Limitaciones conocidas

- La sesión vive en `localStorage`, con el riesgo ante XSS que implica (aceptado y documentado en `DECISIONS.md` del backend).
- El ambiente oficial es local y usa HTTP, sin TLS.
- Requiere conexión: no hay lectura sin red.
- Sin pasarela de pago.

---

## ✅ Estado del desarrollo

| Etapa | Estado |
|---|---|
| Sprint 1 | ✅ |
| Sprint 2 — módulos core | ✅ |
| Sprint 3 — módulos complementarios | ✅ |
| Pruebas | ✅ |
| Documentación y defensa | ✅ |

---

## 👤 Autor

**Sebastián Lara**
- GitHub: [@seba-lara](https://github.com/seba-lara)
