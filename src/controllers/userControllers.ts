import type { NextFunction, Request, Response } from "express";
import type {
  CreateUserDTO,
  ToggleUserDTO,
  UpdateUserDTO,
  UpdateUserPasswordDTO,
  UpdateUserRoleDTO,
  UserListResponse,
  UserResponse,
} from "../interfaces/user.interface";
import userService from "../services/userServices";
import { idParamsSchema } from "../validators/globalValidators";
import {
  userCreateSchema,
  userUpdatePasswordSchema,
  userUpdateRoleSchema,
  userUpdateSchema,
} from "../validators/userValidators";

class UserController {
  async createUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const validation = userCreateSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({ error: validation.error.format() });
        return;
      }

      const data: CreateUserDTO = validation.data;

      const userCreated: UserResponse = await userService.create(data);

      res
        .status(201)
        .json({ message: "Usuário criado com sucesso.", userCreated });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const rawPage = req.query.page;
      const rawLimit = req.query.limit;

      const page =
        rawPage === undefined ? 1 : Number.parseInt(rawPage as string, 10);
      const limit =
        rawLimit === undefined ? 20 : Number.parseInt(rawLimit as string, 10);

      if (
        !Number.isInteger(page) ||
        !Number.isInteger(limit) ||
        page < 1 ||
        limit < 1 ||
        limit > 100
      ) {
        res.status(400).json({
          error:
            "Parâmetros de paginação inválidos. 'page' deve ser >= 1 e 'limit' deve estar entre 1 e 100.",
        });
        return;
      }
      const result: UserListResponse = await userService.getAll({
        page,
        limit,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const validation = userUpdateSchema.safeParse(req.body);
      const id = req.user?.id;

      if (!id) {
        res.status(401).json({ error: "ID usuário inválido." });
        return;
      }

      if (!validation.success) {
        res.status(400).json({ error: validation.error.format() });
        return;
      }

      const data: UpdateUserDTO = validation.data;

      const updatedUser: UserResponse = await userService.update(id, data);

      res
        .status(200)
        .json({ message: "Usuário atualizado com sucesso.", updatedUser });
    } catch (error) {
      next(error);
    }
  }

  async updateUserPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const validation = userUpdatePasswordSchema.safeParse(req.body);
      const id = req.user?.id;

      if (!id) throw new Error("ID usuário inválido.");

      if (!validation.success) {
        res.status(400).json({ error: validation.error.format() });
        return;
      }

      const data: UpdateUserPasswordDTO = validation.data;

      const updatedUser: UserResponse = await userService.updatePassword({
        id,
        ...data,
      });

      res
        .status(200)
        .json({ message: "Senha atualizada com sucesso.", updatedUser });
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;

      const validationId = idParamsSchema.safeParse({ id });
      const validation = userUpdateRoleSchema.safeParse(req.body);

      if (!validationId.success) {
        res.status(400).json({ error: validationId.error.format() });
        return;
      }
      if (!validation.success) {
        res.status(400).json({ error: validation.error.format() });
        return;
      }

      const data: UpdateUserRoleDTO = validation.data;

      const updatedUser: UserResponse = await userService.updateRole({
        id: validationId.data.id,
        role: data.role,
      });

      res
        .status(200)
        .json({ message: "Papel atualizado com sucesso.", updatedUser });
    } catch (error) {
      next(error);
    }
  }

  async toggle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const validation = idParamsSchema.safeParse({ id });

      if (!validation.success) {
        res.status(400).json({ error: validation.error.format() });
        return;
      }

      const { isActive } = req.body as ToggleUserDTO;

      if (typeof isActive !== "boolean") {
        res.status(400).json({ error: "isActive deve ser um boolean." });
        return;
      }

      const userToggle: UserResponse = await userService.toggle({
        id: validation.data.id,
        isActive,
      });

      res.status(200).json({
        message: `Usuário ${userToggle.isActive ? "ativado" : "desativado"} com sucesso.`,
        userToggle,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
