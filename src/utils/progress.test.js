import { describe, it, expect, vi, beforeEach } from "vitest";
import api from "../services/api.js";
import { fetchContinueReading } from "./progress";
import { getAnonymousUuid } from "./anonymousId";

vi.mock("../services/api.js", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

describe("fetchContinueReading", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("con token, consulta sin params anónimos (el interceptor pone el header)", async () => {
    api.get.mockResolvedValue({ data: [] });

    await fetchContinueReading("fake-token");

    expect(api.get).toHaveBeenCalledWith("/progress", undefined);
  });

  it("sin token, consulta con el UUID anónimo como query param", async () => {
    api.get.mockResolvedValue({ data: [] });
    const uuid = getAnonymousUuid();

    await fetchContinueReading(null);

    expect(api.get).toHaveBeenCalledWith("/progress", { params: { anonymousUuid: uuid } });
  });

  it("devuelve los datos de la respuesta", async () => {
    const mockData = [{ bookId: 1, progressPercentage: 42 }];
    api.get.mockResolvedValue({ data: mockData });

    const result = await fetchContinueReading("fake-token");

    expect(result).toEqual(mockData);
  });
});
