import type { Prisma } from "../generated/prisma/client";
import type {
  CreateProductDTO,
  ProductDeleteResponse,
  ProductListResponse,
  ProductResponse,
  UpdateProductDTO,
} from "../interfaces/product.interface";
import prisma from "../lib/prisma";
import { createError } from "../utils/createError";
import { generateSlug } from "../utils/generateSlug";

const productSelect = {
  id: true,
  name: true,
  mark: true,
  description: true,
  price: true,
  stock: true,
  imageUrl: true,
  slug: true,
  category: { select: { name: true, slug: true } },
} as const;

class ProductsService {
  async create(data: CreateProductDTO): Promise<ProductResponse> {
    try {
      const { categoryId, name, mark, description, price, stock, imageUrl } =
        data;

      return await prisma.product.create({
        data: {
          categoryId,
          name,
          mark,
          description,
          price,
          stock,
          imageUrl,
          slug: generateSlug(name),
        },
        select: productSelect,
      });
    } catch (error) {
      const code = (error as Prisma.PrismaClientKnownRequestError).code;
      if (code === "P2002")
        throw createError("Já existe um produto com esse nome.", 409);
      if (code === "P2003") throw createError("Categoria não encontrada.", 404);
      throw error;
    }
  }

  async update(id: string, data: UpdateProductDTO): Promise<ProductResponse> {
    const updateData: Prisma.ProductUpdateInput = { ...data };
    if (data.name) updateData.slug = generateSlug(data.name);

    try {
      return await prisma.product.update({
        where: { id },
        data: updateData,
        select: productSelect,
      });
    } catch (error) {
      const code = (error as Prisma.PrismaClientKnownRequestError).code;
      if (code === "P2025") throw createError("Produto não encontrado.", 404);
      if (code === "P2002")
        throw createError("Já existe um produto com esse nome.", 409);
      if (code === "P2003") throw createError("Categoria não encontrada.", 404);
      throw error;
    }
  }

  async delete(
    id: string,
  ): Promise<ProductDeleteResponse & { softDeleted: boolean }> {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true, isActive: true },
    });

    if (!product) throw createError("Produto não encontrado.", 404);
    if (!product.isActive) throw createError("Produto já foi removido.", 409);

    const linkedOrderItems = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (linkedOrderItems > 0) {
      const updated = await prisma.product.update({
        where: { id },
        data: { isActive: false },
        select: { id: true, name: true, slug: true },
      });
      await prisma.cartItem.deleteMany({ where: { productId: id } });
      return { ...updated, softDeleted: true };
    }

    const deleted = await prisma.product.delete({
      where: { id },
      select: { id: true, name: true, slug: true },
    });
    return { ...deleted, softDeleted: false };
  }

  async getAll({
    categorySlug,
    search,
    page = 1,
    limit = 20,
  }: {
    categorySlug?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ProductListResponse> {
    const safePage = Math.max(1, Math.trunc(page));
    const take = Math.min(Math.max(1, Math.trunc(limit)), 100);
    const skip = (safePage - 1) * take;
    const where: Prisma.ProductWhereInput = { isActive: true };

    if (categorySlug) where.category = { slug: categorySlug };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { mark: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        select: productSelect,
        orderBy: { name: "asc" },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: safePage,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async getById(id: string): Promise<ProductResponse> {
    const product = await prisma.product.findFirst({
      where: { id, isActive: true },
      select: {
        ...productSelect,
        images: { select: { id: true, url: true } },
      },
    });

    if (!product) throw createError("Produto não encontrado.", 404);

    return product;
  }
}

export default new ProductsService();
