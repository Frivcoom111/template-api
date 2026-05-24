import type { NextFunction, Request, Response } from "express";
import type {
  CreateOrderDTO,
  OrderListResponse,
  OrderResponse,
  UpdateOrderStatusDTO,
} from "../interfaces/order.interface";
import orderServices from "../services/orderServices";
import { idParamsSchema } from "../validators/globalValidators";
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../validators/orderValidators";

class OrderControllers {
  async createOrder(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.user?.id;
      if (!id) throw new Error("ID usuário inválido.");

      const validation = createOrderSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({ error: validation.error.format() });
        return;
      }

      const data: CreateOrderDTO = validation.data;

      const order: OrderResponse = await orderServices.createOrder(
        id,
        data.addressId,
      );

      res.status(201).json({ message: "Pedido criado com sucesso.", order });
    } catch (error) {
      next(error);
    }
  }

  async getOrders(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.user?.id;
      if (!id) throw new Error("ID usuário inválido.");

      const isAdmin = req.user?.role === "ADMIN";

      const parsedPage = Number.parseInt(req.query.page as string, 10);
      const parsedLimit = Number.parseInt(req.query.limit as string, 10);
      const page =
        Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
      const limit =
        Number.isInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : 20;

      const result: OrderListResponse = await orderServices.getOrders(
        id,
        isAdmin,
        { page, limit },
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(
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

      const isAdmin = req.user?.role === "ADMIN";
      const order: OrderResponse = await orderServices.getOrderById(
        validation.data.id,
        id,
        isAdmin,
      );

      res.status(200).json({ order });
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const validationId = idParamsSchema.safeParse({ id: req.params.id });
      const validation = updateOrderStatusSchema.safeParse(req.body);

      if (!validationId.success) {
        res.status(400).json({ error: validationId.error.format() });
        return;
      }

      if (!validation.success) {
        res.status(400).json({ error: validation.error.format() });
        return;
      }

      const data: UpdateOrderStatusDTO = validation.data;

      const order: OrderResponse = await orderServices.updateOrderStatus(
        validationId.data.id,
        data.orderStatus,
      );

      res.status(200).json({ message: "Status atualizado.", order });
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(
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

      const isAdmin = req.user?.role === "ADMIN";
      const order: OrderResponse = await orderServices.cancelOrder(
        validation.data.id,
        id,
        isAdmin,
      );

      res.status(200).json({ message: "Pedido cancelado.", order });
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderControllers();
