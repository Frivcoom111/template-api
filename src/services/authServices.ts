import type { Prisma } from "../generated/prisma/client";
import type {
  LoginDTO,
  LoginResponse,
  RegisterDTO,
} from "../interfaces/auth.interface";
import type { UserResponse } from "../interfaces/user.interface";
import prisma from "../lib/prisma";
import redis from "../lib/redis";
import { compareHash } from "../utils/compareHash";
import { createError } from "../utils/createError";
import { generateHash } from "../utils/generateHash";
import { generateToken } from "../utils/generateToken";

class AuthService {
  async register({
    name,
    email,
    password,
  }: RegisterDTO): Promise<UserResponse> {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const hashPassword = await generateHash(password);

      const user = await prisma.user.create({
        data: {
          name: name,
          email: normalizedEmail,
          password: hashPassword,
          role: "USER",
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
      });

      return user;
    } catch (error) {
      if ((error as Prisma.PrismaClientKnownRequestError).code === "P2002") {
        throw createError("Email já cadastrado.", 409);
      }
      throw error;
    }
  }

  async login({ email, password }: LoginDTO): Promise<LoginResponse> {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) throw createError("Email ou senha inválidos.", 401);
    if (!user.isActive) throw createError("Usuário inativo.", 403);

    const isMatch = await compareHash(password, user.password);
    if (!isMatch) throw createError("Email ou senha inválidos.", 401);

    const token = generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }

  async logout(token: string, exp: number): Promise<void> {
    if (!exp) throw createError("Token sem expiração definida.", 400);

    const tokenExpiration: number = exp - Math.floor(Date.now() / 1000);

    const key = `blacklist:token:${String(token)}`;

    if (tokenExpiration > 0) {
      await redis.set(key, "blacklisted", "EX", tokenExpiration);
    }
  }

  async getUser(id: string): Promise<UserResponse> {
    if (!id) throw createError("ID inválido.", 400);

    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) throw createError("Usuário não encontrado.", 404);
    if (!user.isActive) throw createError("Usuário inativo.", 403);

    return user;
  }
}

export default new AuthService();
