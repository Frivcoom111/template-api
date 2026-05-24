import type { NextFunction, Request, Response } from "express";
import type {
  CreateProductDTO,
  ProductListResponse,
  ProductResponse,
  UpdateProductDTO,
} from "../interfaces/product.interface";
import productsServices from "../services/productsServices";
import { idParamsSchema } from "../validators/globalValidators";
import {
  productSchema,
  updateProductSchema,
} from "../validators/productsValidators";

class ProductsControllers {
  async createProduct(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const validation = productSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({ error: validation.error.format() });
        return;
      }

      const data: CreateProductDTO = validation.data;

      const product: ProductResponse = await productsServices.create(data);

      res.status(201).json({ message: "Produto criado com sucesso.", product });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(
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

      const validation = updateProductSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({ error: validation.error.format() });
        return;
      }

      const data: UpdateProductDTO = validation.data;

      const product: ProductResponse = await productsServices.update(
        validationId.data.id,
        data,
      );

      res
        .status(200)
        .json({ message: "Produto atualizado com sucesso.", product });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(
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

      const result = await productsServices.delete(validation.data.id);
      const { softDeleted, ...product } = result;

      res.status(200).json({
        message: softDeleted
          ? "Produto desativado. Pedidos históricos foram preservados."
          : "Produto deletado com sucesso.",
        softDeleted,
        product,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProducts(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { category, search } = req.query;
      const parsedPage = Number.parseInt(req.query.page as string, 10);
      const parsedLimit = Number.parseInt(req.query.limit as string, 10);
      const page =
        Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
      const limit =
        Number.isInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : 20;

      const result: ProductListResponse = await productsServices.getAll({
        categorySlug: category as string | undefined,
        search: search as string | undefined,
        page,
        limit,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getProductById(
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

      const product: ProductResponse = await productsServices.getById(
        validation.data.id,
      );

      res.status(200).json({ product });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductsControllers();
