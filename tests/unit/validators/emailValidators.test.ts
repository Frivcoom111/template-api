import { describe, expect, it } from "vitest";
import { verifyEmailSchema } from "../../../src/validators/emailValidators";

describe("verifyEmailSchema", () => {
  it("rejeita código de 6 dígitos", () => {
    const result = verifyEmailSchema.safeParse({ code: 482931 });
    expect(result.success).toBe(false);
  });

  it("aceita string númerica", () => {
    const result = verifyEmailSchema.safeParse({ code: "482931" });
    expect(result.success).toBe(true);
  });

  it("rejeita código abaixo de 100000", () => {
    const result = verifyEmailSchema.safeParse({ code: "99999" });
    expect(result.success).toBe(false);
  });

  it("rejeita código acima de 999999", () => {
    const result = verifyEmailSchema.safeParse({ code: "1000000" });
    expect(result.success).toBe(false);
  });

  it("rejeita string não numérica", () => {
    const result = verifyEmailSchema.safeParse({ code: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejeita ausência do campo code", () => {
    const result = verifyEmailSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
