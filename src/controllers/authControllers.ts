import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import type {
  LoginDTO,
  LoginResponse,
  RegisterDTO,
} from "../interfaces/auth.interface";
import type { UserResponse } from "../interfaces/user.interface";
import authService from "../services/authServices";
import { loginSchema, registerSchema } from "../validators/authValidators";

class AuthController {
  async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const validation = registerSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({ error: validation.error.format() });
        return;
      }

      const data: RegisterDTO = validation.data;

      const userCreated: UserResponse = await authService.register(data);

      res
        .status(201)
        .json({ message: "Usuário criado com sucesso.", userCreated });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = loginSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({ error: validation.error.format() });
        return;
      }

      const data: LoginDTO = validation.data;

      const { token, user }: LoginResponse = await authService.login(data);

      res
        .status(200)
        .json({ message: "Login feito com sucesso.", token, user });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.authorization!.split(" ")[1] as string;
      const decoded = req.user as JwtPayload;
      const exp = decoded.exp;

      if (!exp) {
        res.status(401).json({ error: "Token sem expiração definida." });
        return;
      }

      await authService.logout(token, exp);

      res.status(200).json({ message: "Logout realizado com sucesso." });
    } catch (error) {
      next(error);
    }
  }

  async getUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.user?.id;

      if (!id) {
        res.status(401).json({ error: "ID usuário inválido." });
        return;
      }

      const user: UserResponse = await authService.getUser(id);

      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
