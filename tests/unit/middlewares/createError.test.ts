import { describe, expect, it } from "vitest";
import { createError } from "../../../src/utils/createError.js";

describe("createError", () => {
  it("cria um erro com mensagem correta", () => {
    const error = createError("Não encontrado.", 404);
    expect(error.message).toBe("Não encontrado.");
  });

  it("cria um erro com status correto", () => {
    const error = createError("Não autorizado.", 401);
    expect(error.status).toBe(401);
  });

  it("retorna uma instância de Error", () => {
    const error = createError("Erro.", 500);
    expect(error).toBeInstanceOf(Error);
  });
});
