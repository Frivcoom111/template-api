import type { NextFunction, Request, Response } from "express";
import type {
  CategoryResponse,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from "../interfaces/category.interface";
import categoriesServices from "../services/categoriesServices";
import {
  categoryCreateSchema,
  categoryUpdateSchema,
} from "../validators/categoriesValidators";
import { idParamsSchema } from "../validators/globalValidators";

class CategoriesControllers {
  async createCategory(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const validation = categoryCreateSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({ error: validation.error.format() });
        return;
      }

      const data: CreateCategoryDTO = validation.data;

      const createdCategory: CategoryResponse = await categoriesServices.create(
        data.name,
      );

      res
        .status(201)
        .json({ message: "Categoria criada com sucesso.", createdCategory });
    } catch (error) {
      next(error);
    }
  }

  async updatedCategory(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;

      const validationId = idParamsSchema.safeParse({ id });

      if (!validationId.success) {
        res.status(400).json({ error: validationId.error.format() });
        return;
      }

      const validation = categoryUpdateSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({ error: validation.error.format() });
        return;
      }

      const data: UpdateCategoryDTO = validation.data;

      const updatedCategory: CategoryResponse = await categoriesServices.update(
        validationId.data.id,
        data,
      );

      res.status(200).json({
        message: "Categoria atualizada com sucesso.",
        updatedCategory,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;

      const validation = idParamsSchema.safeParse({ id });

      if (!validation.success) {
        res.status(400).json({ error: validation.error.format() });
        return;
      }

      const deletedCategory: CategoryResponse = await categoriesServices.delete(
        validation.data.id,
      );

      res
        .status(200)
        .json({ message: "Categoria deletada com sucesso.", deletedCategory });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { slug } = req.query;

      const categories: CategoryResponse | CategoryResponse[] =
        await categoriesServices.get({
          slug: slug as string | undefined,
        });

      res.status(200).json({ categories });
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoriesControllers();
