import type { OrderStatus, Prisma } from "../generated/prisma/client";
import type { AddressResponse } from "./address.interface";

export interface CreateOrderDTO {
  addressId: string;
}

export interface UpdateOrderStatusDTO {
  orderStatus: OrderStatus;
}

export interface OrderItemProductResponse {
  id: string;
  name: string;
  imageUrl: string;
  slug: string;
}

export interface OrderItemResponse {
  id: string;
  productId: string;
  quantity: number;
  priceAtTime: Prisma.Decimal;
  product: OrderItemProductResponse;
}

export interface OrderResponse {
  id: string;
  userId: string;
  addressId: string;
  orderStatus: OrderStatus;
  total: Prisma.Decimal;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItemResponse[];
  address: AddressResponse;
}

export interface OrderListResponse {
  data: OrderResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
