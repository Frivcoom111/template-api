import type { Prisma } from "../generated/prisma/client";

export interface AddToCartDTO {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemDTO {
  quantity: number;
}

export interface CartItemProductResponse {
  id: string;
  name: string;
  mark: string;
  price: Prisma.Decimal;
  stock: number;
  imageUrl: string;
  slug: string;
}

export interface CartItemResponse {
  id: string;
  quantity: number;
  product: CartItemProductResponse;
}

export interface CartResponse {
  id: string | null;
  items: CartItemResponse[];
  total: string;
}
