// Iconos SVG inline para la navegación (bc-bottom-nav). Sin dependencia externa
// (react-bootstrap-icons no está en el stack — ver CLAUDE.md, "Stack tecnológico").
// currentColor hereda el color del texto del ítem, así que el estado activo/inactivo
// de .bc-nav-item los pinta solo.

export const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 11.5 12 4l8 7.5M6 9.5V20h12V9.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const PlansIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M4 10h16M9 14h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M15 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8M10 12h11m0 0-3.5-3.5M21 12l-3.5 3.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ProfileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);
