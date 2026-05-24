import { describe, expect, it } from "vitest";
import { idParamsSchema } from "../../../src/validators/globalValidators.js";

describe("idParamsSchema", () => {
  it("aceita UUID válido", () => {
    const result = idParamsSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita string vazia", () => {
    const result = idParamsSchema.safeParse({ id: "" });
    expect(result.success).toBe(false);
  });

  it("rejeita id ausente", () => {
    const result = idParamsSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
