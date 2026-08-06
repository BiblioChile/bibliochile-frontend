import api from "../services/api.js";
import { getAnonymousUuid } from "./anonymousId";

// Trae la lista de libros con progreso guardado (GET /api/progress).
// Con token, el interceptor de `api` ya manda el header Authorization;
// sin token, manda el UUID anónimo como query param.
export const fetchContinueReading = async (token) => {
  const config = token ? undefined : { params: { anonymousUuid: getAnonymousUuid() } };

  const response = await api.get("/progress", config);
  return response.data;
};
