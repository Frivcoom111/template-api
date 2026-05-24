import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../src/services/emailService", () => ({
  default: {
    sendEmail: vi.fn(),
    verifyEmail: vi.fn(),
  },
}));

import emailControllers from "../../../src/controllers/emailControllers";
import emailService from "../../../src/services/emailService";

const serviceMock = vi.mocked(emailService);

const makeRes = (): Response => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const next = vi.fn() as unknown as NextFunction;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("EmailController.sendEmail", () => {
  it("retorna 401 quando não há user no token", async () => {
    const req = { user: undefined } as unknown as Request;
    const res = makeRes();

    await emailControllers.sendEmail(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(serviceMock.sendEmail).not.toHaveBeenCalled();
  });

  it("retorna 200 em caso de sucesso", async () => {
    const req = { user: { id: "id-1" } } as unknown as Request;
    const res = makeRes();
    serviceMock.sendEmail.mockResolvedValue(undefined);

    await emailControllers.sendEmail(req, res, next);

    expect(serviceMock.sendEmail).toHaveBeenCalledWith("id-1");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("repassa erro ao next quando service lança", async () => {
    const req = { user: { id: "id-1" } } as unknown as Request;
    const res = makeRes();
    const error = new Error("falha no envio");
    serviceMock.sendEmail.mockRejectedValue(error);

    await emailControllers.sendEmail(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("EmailController.verifyEmail", () => {
  it("retorna 401 quando não há user no token", async () => {
    const req = {
      user: undefined,
      body: { code: 482931 },
    } as unknown as Request;
    const res = makeRes();

    await emailControllers.verifyEmail(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(serviceMock.verifyEmail).not.toHaveBeenCalled();
  });

  it("retorna 400 para código inválido (Zod)", async () => {
    const req = {
      user: { id: "id-1" },
      body: { code: "abc" },
    } as unknown as Request;
    const res = makeRes();

    await emailControllers.verifyEmail(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(serviceMock.verifyEmail).not.toHaveBeenCalled();
  });

  it("retorna 400 para código fora do intervalo", async () => {
    const req = {
      user: { id: "id-1" },
      body: { code: 99 },
    } as unknown as Request;
    const res = makeRes();

    await emailControllers.verifyEmail(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("retorna 200 e chama service com id e code corretos", async () => {
    const req = {
      user: { id: "id-1" },
      body: { code: "482931" },
    } as unknown as Request;
    const res = makeRes();
    serviceMock.verifyEmail.mockResolvedValue(undefined);

    await emailControllers.verifyEmail(req, res, next);

    expect(serviceMock.verifyEmail).toHaveBeenCalledWith("id-1", "482931");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("repassa erro ao next quando service lança", async () => {
    const req = {
      user: { id: "id-1" },
      body: { code: "482931" },
    } as unknown as Request;
    const res = makeRes();
    const error = new Error("falha na verificação");
    serviceMock.verifyEmail.mockRejectedValue(error);

    await emailControllers.verifyEmail(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });
});
