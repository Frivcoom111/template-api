import type { ProductImageResponse } from "../interfaces/product.interface";
import prisma from "../lib/prisma";
import { createError } from "../utils/createError";

class ProductImagesService {
  async add(productId: string, url: string): Promise<ProductImageResponse> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product || !product.isActive)
      throw createError("Produto não encontrado.", 404);

    return await prisma.productImage.create({
      data: { productId, url },
      select: { id: true, url: true },
    });
  }

  async remove(
    productId: string,
    imageId: string,
  ): Promise<ProductImageResponse> {
    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });

    if (!image) throw createError("Imagem não encontrada.", 404);

    return await prisma.productImage.delete({
      where: { id: imageId },
      select: { id: true, url: true },
    });
  }

  async getByProduct(
    productId: string,
  ): Promise<{ images: ProductImageResponse[] }> {
    const product = await prisma.product.findFirst({
      where: { id: productId, isActive: true },
      select: { images: { select: { id: true, url: true } } },
    });

    if (!product) throw createError("Produto não encontrado.", 404);

    return product;
  }
}

export default new ProductImagesService();
