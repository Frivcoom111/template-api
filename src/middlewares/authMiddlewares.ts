import type { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import redis from "../lib/redis";
import { createError } from "../utils/createError";
import { getRequiredEnv } from "../utils/getRequiredEnv";

const JWT_SECRET = getRequiredEnv("JWT_SECRET");

export const authToken: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const headerAuthorization = req.headers.authorization as string;

    if (!headerAuthorization || !headerAuthorization.startsWith("Bearer ")) {
      return next(createError("Token não fornecido.", 401));
    }

    const token = headerAuthorization?.split(" ")[1] as string;

    const key = `blacklist:token:${token}`;
    const tokenBlacklist = await redis.get(key);

    // Redis isolado — erro de infra não vira 401 enganoso
    try {
      const tokenBlacklist = await redis.get(key);
      if (tokenBlacklist) return next(createError("Token inválido.", 401));
    } catch {
      return next(createError("Erro interno ao validar sessão.", 500));
    }

    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { isActive: true, role: true },
    });

    if (!user || !user.isActive)
      return next(createError("Usuário desativado, acesso negado.", 401));

    req.user = {
      id: decoded.id,
      role: user.role,
      isActive: user.isActive,
      exp: decoded.exp,
    };

    next();
  } catch (error) {
    next(createError("Token inválido ou expirado.", 401));
  }
};

export const authAdminOnly: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const role = req.user?.role;

  if (!role || role !== "ADMIN") {
    return next(createError("Acesso admin negado.", 403));
  }

  next();
};
