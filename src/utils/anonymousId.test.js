import { describe, it, expect, beforeEach } from "vitest";
import { getAnonymousUuid, peekAnonymousUuid } from "./anonymousId";

describe("anonymousId", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("genera un UUID nuevo si no hay uno guardado", () => {
    expect(peekAnonymousUuid()).toBeNull();

    const uuid = getAnonymousUuid();

    expect(uuid).toMatch(/^[0-9a-f-]{36}$/i);
    expect(localStorage.getItem("bc_anonymous_uuid")).toBe(uuid);
  });

  it("reutiliza el UUID guardado en vez de generar uno nuevo", () => {
    const first = getAnonymousUuid();
    const second = getAnonymousUuid();

    expect(second).toBe(first);
  });

  it("peekAnonymousUuid no genera un UUID si no existe", () => {
    expect(peekAnonymousUuid()).toBeNull();
    expect(localStorage.getItem("bc_anonymous_uuid")).toBeNull();
  });

  it("peekAnonymousUuid devuelve el UUID una vez que existe", () => {
    const uuid = getAnonymousUuid();
    expect(peekAnonymousUuid()).toBe(uuid);
  });
});
