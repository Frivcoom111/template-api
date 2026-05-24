import type { Prisma } from "../generated/prisma/client";

export interface CreateProductDTO {
  categoryId: string;
  name: string;
  mark: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
}

export interface UpdateProductDTO {
  categoryId?: string;
  name?: string;
  mark?: string;
  description?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
}

export interface ProductImageResponse {
  id: string;
  url: string;
}

export interface AddProductImageDTO {
  url: string;
}

export interface ProductDeleteResponse {
  id: string;
  name: string;
  slug: string;
}

export interface ProductResponse {
  id: string;
  name: string;
  mark: string;
  description: string;
  price: Prisma.Decimal;
  stock: number;
  imageUrl: string;
  slug: string;
  category: {
    name: string;
    slug: string;
  };
  images?: ProductImageResponse[];
}

export interface ProductListResponse {
  data: ProductResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
