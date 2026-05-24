import { z } from "zod";

export const createOrderSchema = z.object({
  addressId: z.string().uuid("addressId inválido."),
});

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(
    ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"],
    {
      error: () => "Status inválido.",
    },
  ),
});
