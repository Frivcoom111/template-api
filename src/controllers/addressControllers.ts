import type { NextFunction, Request, Response } from "express";
import type {
  AddressResponse,
  CreateAddressDTO,
  UpdateAddressDTO,
} from "../interfaces/address.interface";
import addressServices from "../services/addressServices";
import {
  createAddressSchema,
  updateAddressSchema,
} from "../validators/addressValidators";
import { idParamsSchema } from "../validators/globalValidators";

class AddressControllers {
  async getAddresses(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.user?.id;
      if (!id) throw new Error("ID usuário inválido.");

      const addresses: AddressResponse[] =
        await addressServices.getAddresses(id);

      res.status(200).json({ addresses });
    } catch (error) {
      next(error);
    }
  }

  async getAddressById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      const role = req.user?.role;
      if (!userId || !role) throw new Error("Usuário inválido.");

      const validation = idParamsSchema.safeParse({ id: req.params.id });

      if (!validation.success) {
        res.status(400).json({ error: validation.error.format() });
        return;
      }

      const address: AddressResponse = await addressServices.getAddressById(
        validation.data.id,
        userId,
        role,
      );

      res.status(200).json({ address });
    } catch (error) {
      next(error);
    }
  }

  async createAddress(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.user?.id;
      if (!id) throw new Error("ID usuário inválido.");

      const validation = createAddressSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({ error: validation.error.format() });
        return;
      }

      const data: CreateAddressDTO = validation.data;

      const address: AddressResponse = await addressServices.createAddress(
        id,
        data,
      );

      res
        .status(201)
        .json({ message: "Endereço criado com sucesso.", address });
    } catch (error) {
      next(error);
    }
  }

  async updateAddress(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.user?.id;
      if (!id) throw new Error("ID usuário inválido.");

      const validationId = idParamsSchema.safeParse({ id: req.params.id });
      const validation = updateAddressSchema.safeParse(req.body);

      if (!validationId.success) {
        res.status(400).json({ error: validationId.error.format() });
        return;
      }

      if (!validation.success) {
        res.status(400).json({ error: validation.error.format() });
        return;
      }

      const data: UpdateAddressDTO = validation.data;

      const address: AddressResponse = await addressServices.updateAddress(
        validationId.data.id,
        id,
        data,
      );

      res
        .status(200)
        .json({ message: "Endereço atualizado com sucesso.", address });
    } catch (error) {
      next(error);
    }
  }

  async deleteAddress(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.user?.id;
      if (!id) throw new Error("ID usuário inválido.");

      const validation = idParamsSchema.safeParse({ id: req.params.id });

      if (!validation.success) {
        res.status(400).json({ error: validation.error.format() });
        return;
      }

      const result = await addressServices.deleteAddress(
        validation.data.id,
        id,
      );

      res.status(200).json({
        message: result.softDeleted
          ? "Endereço desativado. Pedidos vinculados foram preservados."
          : "Endereço removido com sucesso.",
        softDeleted: result.softDeleted,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AddressControllers();
