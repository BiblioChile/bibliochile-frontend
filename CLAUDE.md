# CLAUDE.md — BiblioChile Frontend

Este archivo da contexto a Claude Code sobre el proyecto. Léelo completo antes de trabajar en cualquier tarea.

---

## ¿Qué es BiblioChile?

Proyecto de título — Ingeniería Civil en Computación (AINC410), Universidad Andrés Bello (UNAB), 2026.
Autor: Sebastián Lara Sepúlveda. Profesor guía: Pedro Veloso Hernández.

PWA que fomenta la lectura de literatura en el transporte público de Santiago mediante códigos QR.
Un pasajero escanea un QR en una estación de Metro y accede directo a una obra de dominio público,
sin registro. Autores nacionales contemporáneos pueden publicar obras de pago vía suscripción.

Este repositorio es **solo el frontend**. El backend vive en un repo separado: `bibliochile-backend`
(API REST corriendo en `http://localhost:3000` en desarrollo).

---

## Stack tecnológico (NO cambiar sin discutirlo primero)

- **React 19** — librería de UI
- **Vite** — bundler y dev server
- **React Bootstrap + Bootstrap 5** — librería de componentes UI (navbar, cards, forms, badges, spinners)
- **React Router v7** — routing SPA
- **Axios** — cliente HTTP
- **jwt-decode** — decodificar el JWT en el cliente para validar expiración (`AuthContext`)
- **uuid** — generar el UUID anónimo de lectura sin cuenta (`utils/anonymousId.js`)
- **vite-plugin-pwa** — configuración PWA (manifest + service worker)
- **Vitest + React Testing Library + @testing-library/user-event + jsdom** — tests (ver sección "Tests")
- **ESLint** — linter

**IMPORTANTE:** el stack ya incluye React Bootstrap. Nunca asumas que el proyecto usa CSS puro,
Tailwind, o styled-components — no es así. Todo componente de UI nuevo debería evaluarse primero
contra los componentes de React Bootstrap disponibles (`Navbar`, `Card`, `Form`, `Button`, `Badge`,
`Spinner`, `Alert`, `Container`, `Row`, `Col`, `InputGroup`) antes de escribir HTML plano.
Cuando uses `Form.Group` + `Form.Label` + `Form.Control`, pasá siempre `controlId` en el `Form.Group`
— si no, el label no queda asociado al input (falla de accesibilidad y de los tests con `getByLabelText`).

Dependencias planificadas pero aún no instaladas (revisar antes de asumir que existen):
- Redux Toolkit (manejo de estado global — pendiente)
- React Hook Form (formularios — actualmente los formularios usan useState simple)

---

## Arquitectura de estilos

Dos archivos CSS globales, importados en `src/main.jsx` en este orden exacto:
```
1. bootstrap/dist/css/bootstrap.min.css   (Bootstrap primero)
2. src/index.css                          (variables CSS + reset + overrides sobre Bootstrap)
3. src/styles/pages.css                   (clases bc-* de BiblioChile)
```

El orden importa: Bootstrap se sobreescribe con `!important` en varios selectores porque su
especificidad es alta. No elimines los `!important` de `index.css` sin verificar visualmente
que los colores de BiblioChile se siguen viendo.

**Convención de nombres de clases:** todo estilo propio de BiblioChile usa el prefijo `bc-`
(ej: `bc-page`, `bc-card`, `bc-btn-primary`) para no chocar con clases de Bootstrap.

### Paleta de colores (variables CSS en `:root`, `src/index.css`)
```css
--bg:          #102a43   /* fondo principal */
--surface:     #1b3a5c   /* fondo de cards */
--wine:        #7b1023   /* acento — botones, navbar */
--wine-hover:  #5e0c1a
--ivory:       #F7F4EC   /* texto principal */
--ivory-dim:   rgba(247, 244, 236, 0.55)  /* texto secundario */
--gold:        #C9A96E   /* badges, acentos */
--font-display: 'Cormorant Garamond', serif   /* títulos */
--font-ui:      'Montserrat', sans-serif      /* interfaz */
```

### Clases bc-* ya definidas en `src/styles/pages.css`
`bc-page`, `bc-navbar`, `bc-navbar-brand`, `bc-btn-primary`, `bc-btn-secondary`, `bc-card`,
`bc-card-title`, `bc-card-subtitle`, `bc-badge-free`, `bc-badge-active`, `bc-badge-pending`,
`bc-progress`, `bc-progress-bar`, `bc-bottom-nav`, `bc-nav-item`, `bc-search`,
`bc-section-title`, `bc-error`, `bc-loading`, `bc-input`, `bc-status-card`, `bc-status-row`,
`bc-status-name`, `bc-books-label`, `bc-plans-list`, `bc-plan-card`, `bc-plan-name`,
`bc-plan-detail`, `bc-plan-price`

Antes de crear una clase nueva, revisa si ya existe algo similar en ese archivo.

`src/styles/components.css` no existe más — se eliminó sin haber llegado a usarse. Todo el CSS
propio vive en `src/styles/pages.css`; no la recrees.

---

## Estructura de carpetas

```
src/
├── pages/          → una vista por archivo (Home.jsx, Login.jsx, BookDetail.jsx, Reader.jsx...)
├── components/      → UI reusada en 2+ vistas (por ahora: BookCard.jsx)
├── context/          → AuthContext.jsx — sesión persistente (token, user, login, logout)
├── services/          → api.js — instancia central de axios (baseURL + interceptor de auth)
├── utils/            → anonymousId.js (UUID anónimo), progress.js (fetchContinueReading)
├── test/             → setup.js — configuración global de Vitest/RTL
├── styles/
│   └── pages.css        → clases bc-* reutilizables
├── index.css        → variables CSS + reset + overrides de Bootstrap
├── App.jsx           → definición de rutas (BrowserRouter + Routes)
└── main.jsx           → entry point, importa los 3 CSS en orden
```

Si una pieza de UI nueva se repite en 2+ vistas, extraela a `src/components/` (ya existe el patrón
con `BookCard.jsx`). Los tests van junto al archivo que prueban (`Componente.test.jsx`), no en
una carpeta `__tests__/` aparte.

---

## Variables de entorno

Archivo `.env` en la raíz (NO commiteado — está en `.gitignore`):
```
VITE_API_URL=http://192.168.1.X:3000
```

Uso en código: `import.meta.env.VITE_API_URL`. Solo variables con prefijo `VITE_` son
accesibles desde el cliente — es una restricción de seguridad de Vite, no un descuido.

Para probar desde un celular en la misma red LAN:
```bash
npm run dev -- --host
```

---

## API del backend — endpoints disponibles

Base URL: `${VITE_API_URL}/api`

```
POST /auth/register          body: { name, email, password, role? }
POST /auth/login              body: { email, password } → { token, user }

GET  /books?search=&genre=&page=     → catálogo (integración Gutendex)
GET  /books/:id                       → detalle de un libro

GET  /qr/:code                        → { gutendex_id, location_name, redirect_to }
                                         404 si inválido/inactivo → { message, redirect_to: "/catalog" }

GET  /subscriptions/plans             → lista de planes (público)
GET  /subscriptions/me        [auth]  → suscripción activa del usuario (o estado inactivo)
POST /subscriptions           [auth]  body: { planId }  → 409 si ya tiene suscripción activa

GET  /progress           [auth opcional]  query: { anonymousUuid? } (con token, ignora el query)
                                           → lista de progreso en curso (< 100%), incluye datos del libro
POST /progress            [auth opcional]  body: { bookId, progressPercentage, lastPosition, anonymousUuid? }
POST /progress/sync        [auth requerida] body: { anonymousUuid }
```

`[auth]` = requiere header `Authorization: Bearer <token>`.
`[auth opcional]` = funciona con o sin token; con token usa `user_id`, sin token usa `anonymous_uuid`.

Todas las respuestas de error siguen el formato: `{ "message": "texto del error" }`.
Errores de validación (422) devuelven además: `{ "errors": [{ "field": "...", "message": "..." }] }`.

---

## Estado actual del proyecto (verificar contra el código real antes de asumir)

### Completado y probado
- `Home.jsx` — catálogo conectado a `GET /books`, con búsqueda y sección "Continuar leyendo", usando React Bootstrap
- `Login.jsx` — conectado a `POST /auth/login`, guarda token+user en `localStorage`, usando React Bootstrap
- `Register.jsx` — conectado a `POST /auth/register`
- `BookDetail.jsx` — conectado a `GET /books/:id`
- `Reader.jsx` — lector interno vía `<iframe>` con el `content_url` de Gutenberg + progreso real
  (`POST /progress` cada 15s y al desmontar, aproximado por tiempo transcurrido ya que Gutenberg
  no pagina el contenido)
- `QRRedirect.jsx` en `/qr/:code` — consulta `GET /qr/:code`, redirige al libro o muestra vista de error
  (distingue "QR inactivo" de "QR no encontrado")
- `Plans.jsx` — vista pública de `GET /subscriptions/plans`
- `Subscription.jsx` — gestión de suscripción propia: `GET /subscriptions/me` + `GET /subscriptions/plans`,
  contratación vía `POST /subscriptions`, maneja 409 (ya tiene una activa)
- `DashboardPasajero.jsx` — perfil del usuario + historial de lectura (`GET /progress` vía
  `utils/progress.js`)
- `src/context/AuthContext.jsx` — sesión persistente en `localStorage`, valida expiración del JWT
  con `jwt-decode`, y en `login()` sincroniza progreso anónimo → cuenta (`POST /progress/sync`)
  si existía un UUID anónimo guardado
- `src/utils/anonymousId.js` — UUID anónimo (librería `uuid`) persistido en `localStorage`
  bajo la key `bc_anonymous_uuid`
- `src/components/BookCard.jsx` — card de libro extraída, reusada en catálogo, "Continuar leyendo"
  y el historial del dashboard
- Tests con Vitest + React Testing Library — ver sección "Tests" más abajo
- PWA configurada y verificada — instalable en iPhone (Safari) y Android

### Pendiente
- Ampliar cobertura de tests a las vistas que todavía no tienen (`Register.jsx`, `BookDetail.jsx`,
  `Subscription.jsx`, `DashboardPasajero.jsx`, `Home.jsx`, `Reader.jsx`)
- Ver "Recomendaciones de mejora" más abajo para mejoras incrementales no bloqueantes
  (interceptor de axios, etc.)

## Tests

Stack: **Vitest** + **React Testing Library** + **@testing-library/user-event** + **jsdom**.
Config en `vite.config.js` (bloque `test`), setup en `src/test/setup.js` (importa
`@testing-library/jest-dom/vitest` y define `import.meta.env.VITE_API_URL` para el entorno de test).

Los archivos de test viven junto al archivo que prueban (`Componente.test.jsx`, `utils.test.js`),
no en una carpeta `__tests__/` separada.

```bash
npm test          # corre toda la suite una vez (vitest run)
npm run test:watch  # modo watch
```

Convenciones:
- `axios` se mockea con `vi.mock("axios")` — nunca se pega a la red real en tests.
- Para JWTs de prueba (validación de expiración en `AuthContext`), se arma el payload en
  base64url a mano — `jwt-decode` no verifica firma, así que alcanza con esa estructura.
- Los textos de aserciones van en español, igual que la copy de la app.

---

## Convenciones de código

- Componentes funcionales con arrow functions: `const MiVista = () => { ... }`
- `export default` al final del archivo
- Hooks de React: `useState`, `useEffect`, `useNavigate`, `useParams` según necesidad
- Peticiones HTTP siempre con la instancia `api` de `src/services/api.js`, nunca `axios` directo
  ni URLs hardcodeadas (ver sección "Peticiones HTTP" más abajo)
- Manejo de error de axios: `err.response?.data?.message ?? "mensaje genérico"`
- Estados de carga: `loading` (bool), `error` (string|null) en cada vista que hace fetch

---

## Peticiones HTTP — `src/services/api.js`

Toda llamada al backend pasa por la instancia central de axios en `src/services/api.js`,
no por `axios` directo:

```js
import api from "../services/api.js";

const response = await api.get("/books");        // no axios.get(`${VITE_API_URL}/api/books`)
await api.post("/subscriptions", { planId });
```

- `baseURL` ya incluye `${VITE_API_URL}/api` — las rutas se escriben relativas (`/books`, no
  `/api/books` y menos la URL completa).
- Un interceptor de request agrega `Authorization: Bearer <token>` automáticamente si hay un
  token en `localStorage` — nunca armes ese header a mano en una vista o util nuevo.
- En tests, mockeá el módulo completo: `vi.mock("../services/api.js", () => ({ default: { get: vi.fn(), post: vi.fn() } }))`
  (no `vi.mock("axios")` — eso rompe `axios.create()` dentro de `api.js`).

## Recomendaciones de mejora (NO implementar sin acuerdo explícito)

Estas son sugerencias sobre el stack actual, pensadas para después de que el flujo completo
funcione de punta a punta. No son bloqueantes ni deben aplicarse por iniciativa propia:

1. **Lector interno sin iframe** — a futuro, extraer el texto plano de Gutenberg permitiría
   aplicar la tipografía y colores de BiblioChile al contenido del libro (actualmente se ve
   con el estilo de Gutenberg). Requiere trabajo adicional en el backend.
2. **CSS Modules o styled-components** — si el archivo `pages.css` crece demasiado y se vuelve
   difícil de mantener, considerar modularizar por componente. Por ahora, con el volumen actual
   de vistas, el archivo global es manejable.

(El interceptor de axios, la extracción de `BookCard` y el `AuthContext` que antes figuraban acá
como pendientes ya están implementados — ver "Estado actual del proyecto".)

Ninguna de estas reemplaza el stack decidido (React + Vite + React Bootstrap) — son mejoras
incrementales sobre él, no un cambio de dirección.

---

## Qué NO hacer

- No agregar Tailwind, styled-components, ni ningún otro sistema de estilos — el proyecto usa
  React Bootstrap + CSS con clases `bc-*`.
- No hardcodear `http://localhost:3000` en ningún archivo — siempre `import.meta.env.VITE_API_URL`.
- No commitear `.env` — ya está en `.gitignore`, verificar que se mantenga así.
- No asumir que existe una carpeta `components/`, Redux, o React Hook Form — revisar
  `package.json` antes de importar algo que podría no estar instalado.