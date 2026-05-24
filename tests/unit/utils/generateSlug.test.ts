import { describe, expect, it } from "vitest";
import { generateSlug } from "../../../src/utils/generateSlug.js";

describe("generateSlug", () => {
  it("Converte espaços em hífens", () => {
    expect(generateSlug("Guitarra Elétrica")).toBe("guitarra-eletrica");
  });

  it("Remove acentos", () => {
    expect(generateSlug("Ação e Reação")).toBe("acao-e-reacao");
  });

  it("remove caracteres especiais", () => {
    expect(generateSlug("Produto! @Novo#")).toBe("produto-novo");
  });

  it("converte tudo para minúsculo", () => {
    expect(generateSlug("GUITARRA")).toBe("guitarra");
  });

  it("remove espaços nas pontas", () => {
    expect(generateSlug("  baixo  ")).toBe("baixo");
  });
});
