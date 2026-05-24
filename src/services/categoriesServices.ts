import type { Prisma } from "../generated/prisma/client";
import type {
  CategoryResponse,
  UpdateCategoryDTO,
} from "../interfaces/category.interface";
import prisma from "../lib/prisma";
import { createError } from "../utils/createError";
import { generateSlug } from "../utils/generateSlug";

const categorySelect = {
  id: true,
  name: true,
  slug: true,
} as const;

class CategoriesService {
  async create(name: string): Promise<CategoryResponse> {
    try {
      const categorySlug = generateSlug(name);

      const createdCategory = await prisma.category.create({
        data: {
          name: name,
          slug: categorySlug,
        },
        select: categorySelect,
      });

      return createdCategory;
    } catch (error) {
      if ((error as Prisma.PrismaClientKnownRequestError).code === "P2002") {
        throw createError("Categoria já existe.", 409);
      }
      throw error;
    }
  }

  async update(id: string, data: UpdateCategoryDTO): Promise<CategoryResponse> {
    const updateData: Prisma.CategoryUpdateInput = { ...data };
    if (data.name) updateData.slug = generateSlug(data.name);

    try {
      const updatedCategory = await prisma.category.update({
        where: { id: id },
        data: updateData,
        select: categorySelect,
      });

      return updatedCategory;
    } catch (error) {
      const code = (error as Prisma.PrismaClientKnownRequestError).code;
      if (code === "P2025") throw createError("Categoria não encontrada.", 404);
      if (code === "P2002") throw createError("Categoria já existe.", 409);
      throw error;
    }
  }

  async delete(id: string): Promise<CategoryResponse> {
    try {
      const deletedCategory = await prisma.category.delete({
        where: { id: id },
        select: categorySelect,
      });

      return deletedCategory;
    } catch (error) {
      const code = (error as Prisma.PrismaClientKnownRequestError).code;
      if (code === "P2025") throw createError("Categoria não encontrada.", 404);
      if (code === "P2003")
        throw createError("Categoria possui produtos vinculados.", 409);
      throw error;
    }
  }

  async get({
    slug,
  }: {
    slug?: string;
  } = {}): Promise<CategoryResponse | CategoryResponse[]> {
    if (slug) {
      const category = await prisma.category.findUnique({
        where: { slug: slug },
        select: categorySelect,
      });

      if (!category) throw createError("Categoria não encontrada.", 404);

      return category;
    }

    return await prisma.category.findMany({
      select: categorySelect,
      orderBy: {
        name: "asc",
      },
    });
  }
}

export default new CategoriesService();
