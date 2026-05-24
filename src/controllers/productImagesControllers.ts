import type { NextFunction, Request, Response } from "express";
import type {
  AddProductImageDTO,
  ProductImageResponse,
} from "../interfaces/product.interface";
import productImagesServices from "../services/productImagesServices";
import { idParamsSchema } from "../validators/globalValidators";
import { productImageSchema } from "../validators/productImagesValidators";

class ProductImagesControllers {
  async getImages(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { productId } = req.params;

      const validation = idParamsSchema.safeParse({ id: productId });
      if (!validation.success) {
        res.status(400).json({ error: validation.error.format() });
        return;
      }

      const images = await productImagesServices.getByProduct(
        validation.data.id,
      );

      res.status(200).json(images);
    } catch (error) {
      next(error);
    }
  }

  async addImage(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { productId } = req.params;

      const validationId = idParamsSchema.safeParse({ id: productId });
      if (!validationId.success) {
        res.status(400).json({ error: validationId.error.format() });
        return;
      }

      const validation = productImageSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.format() });
        return;
      }

      const data: AddProductImageDTO = validation.data;

      const image: ProductImageResponse = await productImagesServices.add(
        validationId.data.id,
        data.url,
      );

      res
        .status(201)
        .json({ message: "Imagem adicionada com sucesso.", image });
    } catch (error) {
      next(error);
    }
  }

  async removeImage(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { productId, imageId } = req.params;

      const validationProductId = idParamsSchema.safeParse({ id: productId });
      const validationImageId = idParamsSchema.safeParse({ id: imageId });

      if (!validationProductId.success) {
        res.status(400).json({ error: validationProductId.error.format() });
        return;
      }

      if (!validationImageId.success) {
        res.status(400).json({ error: validationImageId.error.format() });
        return;
      }

      const image: ProductImageResponse = await productImagesServices.remove(
        validationProductId.data.id,
        validationImageId.data.id,
      );

      res.status(200).json({ message: "Imagem removida com sucesso.", image });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductImagesControllers();
