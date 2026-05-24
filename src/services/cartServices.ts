import { Prisma } from "../generated/prisma/client";
import type { CartResponse } from "../interfaces/cart.interface";
import prisma from "../lib/prisma";
import { createError } from "../utils/createError";

class CartService {
  async #getOrCreateCart(userId: string) {
    return await prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  async getCart(userId: string): Promise<CartResponse> {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      select: {
        id: true,
        items: {
          select: {
            id: true,
            quantity: true,
            product: {
              select: {
                id: true,
                name: true,
                mark: true,
                price: true,
                stock: true,
                imageUrl: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!cart) return { id: null, items: [], total: "0.00" };

    const total = cart.items
      .reduce(
        (sum, item) => sum.add(item.product.price.mul(item.quantity)),
        new Prisma.Decimal(0),
      )
      .toFixed(2);

    return { ...cart, total };
  }

  async addItem(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<CartResponse> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive)
      throw createError("Produto não encontrado.", 404);
    if (quantity <= 0) throw createError("Quantidade inválida.", 400);
    if (product.stock < quantity)
      throw createError("Estoque insuficiente.", 409);

    const cart = await this.#getOrCreateCart(userId);

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existingItem?.quantity === quantity)
      throw createError("Quantidade igual a do carrinho.", 409);

    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { quantity },
      create: { cartId: cart.id, productId, quantity },
    });

    return this.getCart(userId);
  }

  async updateItem(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<CartResponse> {
    const cart = await prisma.cart.findUnique({ where: { userId } });

    if (!cart) throw createError("Carrinho não encontrado.", 404);

    const item = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (!item) throw createError("Item não encontrado no carrinho.", 404);

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive)
      throw createError("Produto não encontrado.", 404);
    if (quantity <= 0) throw createError("Quantidade inválida.", 400);
    if (product.stock < quantity)
      throw createError("Estoque insuficiente.", 409);

    await prisma.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId } },
      data: { quantity },
    });

    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: string): Promise<CartResponse> {
    const cart = await prisma.cart.findUnique({ where: { userId } });

    if (!cart) throw createError("Carrinho não encontrado.", 404);

    const item = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (!item) throw createError("Item não encontrado no carrinho.", 404);

    await prisma.cartItem.delete({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<CartResponse> {
    const cart = await prisma.cart.findUnique({ where: { userId } });

    if (!cart) throw createError("Carrinho não encontrado.", 404);

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return this.getCart(userId);
  }
}

export default new CartService();
