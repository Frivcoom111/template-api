import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../src/lib/prisma", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("../../../src/lib/redis", () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

vi.mock("../../../src/lib/mailer", () => ({
  default: {
    sendMail: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("../../../src/utils/getRequiredEnv", () => ({
  getRequiredEnv: vi.fn().mockReturnValue("noreply@test.com"),
}));

vi.mock("../../../src/utils/generateHash", () => ({
  generateHash: vi.fn().mockResolvedValue("hashed_code"),
}));

vi.mock("../../../src/utils/compareHash", () => ({
  compareHash: vi.fn(),
}));

import transporter from "../../../src/lib/mailer";
import prisma from "../../../src/lib/prisma";
import redis from "../../../src/lib/redis";
import emailService from "../../../src/services/emailService";
import { compareHash } from "../../../src/utils/compareHash";
import { generateHash } from "../../../src/utils/generateHash";

const prismaMock = vi.mocked(prisma.user);
const redisMock = vi.mocked(redis);
const mailerMock = vi.mocked(transporter);
const generateHashMock = vi.mocked(generateHash);
const compareHashMock = vi.mocked(compareHash);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const activeUser = {
  name: "João",
  email: "joao@email.com",
  verifiedEmail: false,
} as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const verifiedUser = { ...activeUser, verifiedEmail: true } as any;

beforeEach(() => {
  vi.clearAllMocks();
  mailerMock.sendMail.mockResolvedValue(undefined as never);
  generateHashMock.mockResolvedValue("hashed_code");
});

describe("EmailService.sendEmail", () => {
  it("lança 404 quando usuário não encontrado", async () => {
    prismaMock.findUnique.mockResolvedValue(null);

    await expect(
      emailService.sendEmail("id-inexistente"),
    ).rejects.toMatchObject({
      status: 404,
    });
  });

  it("lança 400 quando e-mail já verificado", async () => {
    prismaMock.findUnique.mockResolvedValue(verifiedUser);

    await expect(emailService.sendEmail("id-1")).rejects.toMatchObject({
      status: 400,
    });
  });

  it("lança 400 quando já existe código ativo no Redis", async () => {
    prismaMock.findUnique.mockResolvedValue(activeUser);
    redisMock.get.mockResolvedValue("hashed_code");

    await expect(emailService.sendEmail("id-1")).rejects.toMatchObject({
      status: 400,
    });
  });

  it("gera código, armazena hash no Redis e envia e-mail para o usuário", async () => {
    prismaMock.findUnique.mockResolvedValue(activeUser);
    redisMock.get.mockResolvedValue(null);
    redisMock.set.mockResolvedValue("OK");

    await emailService.sendEmail("id-1");

    expect(generateHashMock).toHaveBeenCalledWith(
      expect.stringMatching(/^\d{6}$/),
    );
    expect(redisMock.set).toHaveBeenCalledWith(
      `verify:email:${activeUser.email}`,
      "hashed_code",
      "EX",
      300,
      "NX",
    );
    expect(mailerMock.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: activeUser.email }),
    );
  });

  it("gera código numérico entre 100000 e 999999", async () => {
    prismaMock.findUnique.mockResolvedValue(activeUser);
    redisMock.get.mockResolvedValue(null);
    redisMock.set.mockResolvedValue("OK");

    await emailService.sendEmail("id-1");

    const codeArg = generateHashMock.mock.calls[0]?.[0] as string;
    const code = parseInt(codeArg, 10);
    expect(code).toBeGreaterThanOrEqual(100000);
    expect(code).toBeLessThanOrEqual(999999);
  });

  it("remove chave do Redis se sendMail falhar (rollback)", async () => {
    prismaMock.findUnique.mockResolvedValue(activeUser);
    redisMock.get.mockResolvedValue(null);
    redisMock.set.mockResolvedValue("OK");
    redisMock.del.mockResolvedValue(1);
    mailerMock.sendMail.mockRejectedValue(new Error("SMTP error"));

    await expect(emailService.sendEmail("id-1")).rejects.toThrow("SMTP error");

    expect(redisMock.del).toHaveBeenCalledWith(
      `verify:email:${activeUser.email}`,
    );
  });
});

describe("EmailService.verifyEmail", () => {
  it("lança 404 quando usuário não encontrado", async () => {
    prismaMock.findUnique.mockResolvedValue(null);

    await expect(
      emailService.verifyEmail("id-inexistente", "482931"),
    ).rejects.toMatchObject({
      status: 404,
    });
  });

  it("lança 400 quando e-mail já verificado", async () => {
    prismaMock.findUnique.mockResolvedValue(verifiedUser);

    await expect(
      emailService.verifyEmail("id-1", "482931"),
    ).rejects.toMatchObject({
      status: 400,
    });
  });

  it("lança 400 quando código expirado (chave ausente no Redis)", async () => {
    prismaMock.findUnique.mockResolvedValue(activeUser);
    redisMock.get.mockResolvedValue(null);

    await expect(
      emailService.verifyEmail("id-1", "482931"),
    ).rejects.toMatchObject({
      status: 400,
    });
  });

  it("lança 400 quando código incorreto", async () => {
    prismaMock.findUnique.mockResolvedValue(activeUser);
    redisMock.get.mockResolvedValue("hashed_code");
    compareHashMock.mockResolvedValue(false);

    await expect(
      emailService.verifyEmail("id-1", "111111"),
    ).rejects.toMatchObject({
      status: 400,
    });
  });

  it("marca verifiedEmail como true e remove chave do Redis", async () => {
    prismaMock.findUnique.mockResolvedValue(activeUser);
    redisMock.get.mockResolvedValue("hashed_code");
    compareHashMock.mockResolvedValue(true);
    prismaMock.update.mockResolvedValue(undefined as never);
    redisMock.del.mockResolvedValue(1);

    await emailService.verifyEmail("id-1", "482931");

    expect(compareHashMock).toHaveBeenCalledWith("482931", "hashed_code");
    expect(prismaMock.update).toHaveBeenCalledWith({
      where: { id: "id-1" },
      data: { verifiedEmail: true },
    });
    expect(redisMock.del).toHaveBeenCalledWith(
      `verify:email:${activeUser.email}`,
    );
  });
});
