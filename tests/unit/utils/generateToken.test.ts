import jwt from "jsonwebtoken";
import { beforeAll, describe, expect, it } from "vitest";

let generateToken: (user: { id: string }) => string;

// Define o env de teste antes de importar o módulo que depende dele
beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret";
  process.env.JWT_EXPIRES_IN = "1h";

  ({ generateToken } = await import("../../../src/utils/generateToken.js"));
});

describe("generateToken", () => {
  it("gera um token JWT válido", () => {
    const user = { id: "uuid-test-1", role: "USER", isActive: true };
    const token = generateToken(user);

    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
  });

  it("o token contém o id do usuário", () => {
    const user = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      role: "USER",
      isActive: true,
    };
    const token = generateToken(user);

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as jwt.JwtPayload;
    expect(decoded.id).toBe("550e8400-e29b-41d4-a716-446655440000");
  });
});
