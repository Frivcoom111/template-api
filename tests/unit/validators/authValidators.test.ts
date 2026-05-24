import { describe, expect, it } from "vitest";
import {
  loginSchema,
  registerSchema,
} from "../../../src/validators/authValidators.js";

describe("registerSchema", () => {
  it("aceita dados válidos", () => {
    const result = registerSchema.safeParse({
      name: "Carlos",
      email: "carlos@email.com",
      password: "Senha123",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita nome curto", () => {
    const result = registerSchema.safeParse({
      name: "Ca",
      email: "carlos@email.com",
      password: "Senha123",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita email inválido", () => {
    const result = registerSchema.safeParse({
      name: "Carlos",
      email: "nao-e-um-email",
      password: "Senha123",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita senha sem maiúscula", () => {
    const result = registerSchema.safeParse({
      name: "Carlos",
      email: "carlos@email.com",
      password: "senha123",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita senha sem número", () => {
    const result = registerSchema.safeParse({
      name: "Carlos",
      email: "carlos@email.com",
      password: "SenhaSemNumero",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("aceita dados válidos", () => {
    const result = loginSchema.safeParse({
      email: "carlos@email.com",
      password: "qualquer",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita sem email", () => {
    const result = loginSchema.safeParse({ password: "Senha123" });
    expect(result.success).toBe(false);
  });

  it("rejeita senha vazia", () => {
    const result = loginSchema.safeParse({
      email: "carlos@email.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});
