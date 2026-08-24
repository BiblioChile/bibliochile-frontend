# BiblioChile Frontend — Decisiones de Diseño y Arquitectura

Historial de decisiones técnicas tomadas durante el desarrollo del frontend.
Cada decisión incluye el contexto, las alternativas evaluadas y la justificación.

---

## DEC-F01 — Framework UI: React 18

**Fecha:** Sprint 1  
**Estado:** Activo — *corrección de versión: 2026-08-20*

**Decisión:** Usar React 18 como framework principal de UI.

**Corrección (2026-08-20):** la versión instalada realmente es **React 19.2.8**
(`package.json`), no React 18 como decía este documento — discrepancia
detectada durante la verificación de estado previa al Sprint 3. La decisión
de framework (React sobre Vue/Svelte/HTML puro) sigue vigente; solo se
corrige el número de versión documentado.

**Alternativas evaluadas:**
- Vue 3
- Svelte
- HTML/CSS/JS puro

**Justificación:**
- Mayor adopción en el mercado laboral chileno
- Ecosistema maduro con amplia documentación
- Compatibilidad con todas las librerías del stack (React Bootstrap, React Router, Redux Toolkit)
- Soporte nativo para PWA con Vite

---

## DEC-F02 — Bundler: Vite

**Fecha:** Sprint 1  
**Estado:** Activo

**Decisión:** Usar Vite como bundler y servidor de desarrollo.

**Alternativas evaluadas:**
- Create React App (CRA)
- Webpack manual

**Justificación:**
- Significativamente más rápido que CRA en desarrollo
- Soporte nativo para ES Modules
- Plugin oficial para PWA (vite-plugin-pwa)
- Hot Module Replacement (HMR) instantáneo
- CRA está deprecado oficialmente por Meta

---

## DEC-F03 — Librería de componentes UI: React Bootstrap

**Fecha:** Sprint 2  
**Estado:** Activo

**Decisión:** Usar React Bootstrap como librería de componentes UI.

**Alternativas evaluadas:**
- Tailwind CSS
- Material UI (MUI)
- CSS puro con variables
- Shadcn/ui

**Justificación:**
- Componentes preconstruidos accesibles (navbar, cards, forms, badges, spinners)
- Menor curva de aprendizaje que Tailwind para el alcance del proyecto
- Se integra bien con variables CSS personalizadas de BiblioChile
- Conocido en el contexto académico UNAB

**Consideraciones:**
- Bootstrap sobreescribe estilos — se resolvió importando `index.css` después de Bootstrap en `main.jsx`
- Se usa la convención de clases `bc-*` para sobreescribir estilos de Bootstrap con los colores de BiblioChile

---

## DEC-F04 — Estrategia de estilos: CSS global por categoría

**Fecha:** Sprint 2  
**Estado:** Activo

**Decisión:** Usar dos archivos CSS globales en `src/styles/`:
- `pages.css` — estilos de layout y vistas
- `components.css` — estilos de componentes reutilizables

**Alternativas evaluadas:**
- CSS Modules (un archivo por componente)
- Styled Components
- CSS inline
- Un solo archivo global

**Justificación:**
- Más simple de mantener para un proyecto de una persona
- Las clases `bc-*` son reutilizables entre vistas
- CSS Modules agrega complejidad innecesaria para este alcance
- Styled Components requiere dependencia adicional

**Convención de nombres:**
- Prefijo `bc-` para todas las clases de BiblioChile
- Evita conflictos con clases de Bootstrap

---

## DEC-F05 — Routing: React Router v6

**Fecha:** Sprint 2  
**Estado:** Activo — *corrección de versión: 2026-08-20*

**Decisión:** Usar React Router v6 para la navegación entre vistas.

**Corrección (2026-08-20):** la versión instalada realmente es
**react-router-dom 7.18.1** (`package.json`), no v6 como decía este
documento — discrepancia detectada durante la verificación de estado previa
al Sprint 3. La decisión de librería (React Router sobre TanStack
Router/Next.js/routing manual) sigue vigente; solo se corrige el número de
versión documentado.

**Alternativas evaluadas:**
- TanStack Router
- Next.js (file-based routing)
- Routing manual con estados

**Justificación:**
- Estándar de facto para routing en React SPA
- API declarativa con `<Routes>` y `<Route>`
- Hooks disponibles: `useNavigate`, `useParams`, `useLocation`
- Compatible con PWA y navegación sin recarga

---

## DEC-F06 — Cliente HTTP: Axios

**Fecha:** Sprint 2  
**Estado:** Activo

**Decisión:** Usar Axios para las peticiones HTTP al backend.

**Alternativas evaluadas:**
- Fetch nativo del navegador
- SWR
- React Query

**Justificación:**
- Interceptores para adjuntar token JWT automáticamente (a implementar)
- Manejo de errores más limpio que fetch nativo (`err.response.data.message`)
- Transformación automática de JSON
- SWR y React Query agregan complejidad innecesaria para este alcance

---

## DEC-F07 — Almacenamiento del token JWT: localStorage

**Fecha:** Sprint 2  
**Estado:** Activo

**Decisión:** Guardar el token JWT en `localStorage`.

**Alternativas evaluadas:**
- Cookie httpOnly
- sessionStorage
- Estado en memoria (Redux)

**Justificación:**
- Más simple de implementar para el alcance del proyecto
- Persiste entre sesiones — el usuario no tiene que hacer login cada vez
- Cookie httpOnly requiere configuración adicional en el backend (CORS, SameSite)

**Consideración de seguridad:**
- localStorage es vulnerable a XSS. En producción real se recomendaría cookie httpOnly.
- Para el alcance académico de este proyecto, localStorage es aceptable.

---

## DEC-F08 — Lector de libros: iframe con contenido de Gutenberg

**Fecha:** Sprint 2  
**Estado:** Activo

**Decisión:** Usar un `<iframe>` que carga el HTML de Gutenberg para renderizar el contenido de los libros.

**Alternativas evaluadas:**
- Extraer y renderizar el texto del libro (scraping)
- Mostrar el PDF del libro
- Redirigir al sitio de Gutenberg

**Justificación:**
- Los libros de dominio público están disponibles en HTML en Gutenberg
- El iframe permite leer dentro de la app sin abandonarla
- Extraer el texto requeriría un servicio backend adicional complejo
- La redirección externa saca al usuario de BiblioChile

**Limitación conocida:**
- El contenido del iframe mantiene los estilos de Gutenberg (blanco y negro)
- En una versión futura se podría extraer solo el texto para aplicar el diseño de BiblioChile

---

## DEC-F09 — PWA: vite-plugin-pwa

**Fecha:** Sprint 1  
**Estado:** Activo

**Decisión:** Implementar PWA usando `vite-plugin-pwa`.

**Justificación:**
- Integración directa con Vite sin configuración manual del Service Worker
- Soporte para `manifest.json` automático
- Instalable en iOS (Safari) y Android (Chrome)
- Permite funcionamiento offline para lectura en túneles del Metro

**Configuración:**
- `registerType: "autoUpdate"` — actualiza el SW automáticamente
- `display: "standalone"` — se ve como app nativa al instalar
- `theme_color: "#102a43"` — color de la barra de estado del sistema

**Verificación:**
- Build de producción requerido para activar Service Worker
- Probado y verificado en iPhone — instalable desde Safari

---

## DEC-F10 — UUID anónimo: localStorage + librería `uuid`

**Fecha:** Sprint 2  
**Estado:** Activo

**Decisión:** Guardar el UUID anónimo del lector en `localStorage`, generado con la
librería `uuid` (npm) en lugar de `crypto.randomUUID()` nativo.

**Alternativas evaluadas:**
- `crypto.randomUUID()` nativo del navegador (Web Crypto API), sin dependencias

**Justificación del cambio de metodología:**
- `crypto.randomUUID()` solo está disponible en "secure context" (HTTPS o `localhost`).
  El flujo de prueba del proyecto incluye `npm run dev -- --host` para probar desde el
  celular por IP LAN (`http://192.168.1.X:...`) sin HTTPS, donde la API nativa puede no
  estar disponible según navegador — esto rompería la generación del UUID justo en el
  escenario de prueba más relevante del proyecto (lector escaneando un QR desde su celular).
- La librería `uuid` no depende del contexto de seguridad del navegador — funciona igual
  en HTTP LAN, HTTPS o `localhost`.
- Provee generación de UUID v4 con una API estable y probada, evitando mantener a mano
  un fallback manual para navegadores/contextos sin `crypto.randomUUID`.

**Justificación original (se mantiene):**
- Permite identificar al lector anónimo entre sesiones
- Se genera una sola vez y se persiste en `localStorage`
- Al crear cuenta, se sincroniza con `POST /api/progress/sync`

**Consideración:**
- Agrega una dependencia nueva no listada originalmente en el stack de CLAUDE.md. Se
  justifica puntualmente por la limitación de contexto seguro explicada arriba, no como
  cambio de dirección general del stack.

---

## DEC-F11 — Variable de entorno para URL del backend: VITE_API_URL

**Fecha:** Sprint 2  
**Estado:** Activo

**Decisión:** Centralizar la URL del backend en la variable de entorno `VITE_API_URL`.

**Justificación:**
- En desarrollo local apunta a `http://192.168.1.X:3000`
- En producción apunta a `https://bibliochile.onrender.com`
- Evita cambiar URLs hardcodeadas en cada archivo al hacer deploy
- Vite expone solo variables con prefijo `VITE_` al cliente por seguridad

---

## Paleta de colores BiblioChile

| Variable | Valor | Uso |
|---|---|---|
| `--bg` | `#102a43` | Fondo principal |
| `--surface` | `#1b3a5c` | Fondo de cards y superficies |
| `--wine` | `#7b1023` | Color de acento — botones, navbar |
| `--wine-hover` | `#5e0c1a` | Estado hover del wine |
| `--ivory` | `#F7F4EC` | Texto principal |
| `--ivory-dim` | `rgba(247,244,236,0.55)` | Texto secundario |
| `--gold` | `#C9A96E` | Badges, acentos dorados |

## Tipografías

| Variable | Fuente | Uso |
|---|---|---|
| `--font-display` | Cormorant Garamond | Títulos, nombre de la app |
| `--font-ui` | Montserrat | Interfaz, botones, labels |