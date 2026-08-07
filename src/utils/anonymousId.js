import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "bc_anonymous_uuid";

// Devuelve el UUID anónimo del lector, generándolo una sola vez y
// reutilizándolo en cada sesión mientras no se borre localStorage.
export const getAnonymousUuid = () => {
  const storedUuid = localStorage.getItem(STORAGE_KEY);

  if (storedUuid) {
    return storedUuid;
  }

  const newUuid = uuidv4();
  localStorage.setItem(STORAGE_KEY, newUuid);
  return newUuid;
};

// Solo consulta si ya existe un UUID anónimo guardado, sin generar uno nuevo.
// Se usa antes de sincronizar progreso al iniciar sesión: si nunca hubo
// lectura anónima, no tiene sentido crear un UUID solo para sincronizarlo.
export const peekAnonymousUuid = () => localStorage.getItem(STORAGE_KEY);
