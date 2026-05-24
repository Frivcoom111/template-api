import type { NextFunction, Request, Response } from "express";
import type {
  AddToCartDTO,
  CartResponse,
  UpdateCartItemDTO,
} from "../interfaces/cart.interface";
import cartServices from "../services/cartServices";
import {
  addCartItemSchema,
  updateCartItemSchema,
} from "../validators/cartValidators";
import { idParamsSchema } from "../validators/globalValidators";

class CartControllers {
  async getCart(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.user?.id;
      if (!id) throw new Error("ID usuário inválido.");

      const cart: CartResponse = await cartServices.getCart(id);

      res.status(200).json({ cart });
    } catch (error) {
      next(error);
    }
  }

  async addItem(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.user?.id;
      if (!id) throw new Error("ID usuário inválido.");

      const validation = addCartItemSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({ error: validation.error.format() });
        return;
      }

      const data: AddToCartDTO = validation.data;

      const cart: CartResponse = await cartServices.addItem(
        id,
        data.productId,
        data.quantity,
      );

      res.status(200).json({ message: "Item adicionado ao carrinho.", cart });
    } catch (error) {
      next(error);
    }
  }

  async updateItem(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.user?.id;
      if (!id) throw new Error("ID usuário inválido.");

      const validationId = idParamsSchema.safeParse({
        id: req.params.productId,
      });
      const validation = updateCartItemSchema.safeParse(req.body);

      if (!validationId.success) {
        res.status(400).json({ error: validationId.error.format() });
        return;
      }

      if (!validation.success) {
        res.status(400).json({ error: validation.error.format() });
        return;
      }

      const data: UpdateCartItemDTO = validation.data;

      const cart: CartResponse = await cartServices.updateItem(
        id,
        validationId.data.id,
        data.quantity,
      );

      res.status(200).json({ message: "Quantidade atualizada.", cart });
    } catch (error) {
      next(error);
    }
  }

  async removeItem(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.user?.id;
      if (!id) throw new Error("ID usuário inválido.");

      const validation = idParamsSchema.safeParse({ id: req.params.productId });

      if (!validation.success) {
        res.status(400).json({ error: validation.error.format() });
        return;
      }

      const cart: CartResponse = await cartServices.removeItem(
        id,
        validation.data.id,
      );

      res.status(200).json({ message: "Item removido do carrinho.", cart });
    } catch (error) {
      next(error);
    }
  }

  async clearCart(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.user?.id;
      if (!id) throw new Error("ID usuário inválido.");

      const cart: CartResponse = await cartServices.clearCart(id);

      res.status(200).json({ message: "Carrinho esvaziado.", cart });
    } catch (error) {
      next(error);
    }
  }
}

export default new CartControllers();
