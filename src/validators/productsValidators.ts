import { z } from "zod";

export const productSchema = z.object({
  categoryId: z.string().uuid("CategoryId inválido."),
  name: z
    .string()
    .min(3, "Nome mínimo 3 caracteres.")
    .max(100, "Nome máximo 100 caracteres."),
  mark: z
    .string()
    .min(2, "Marca mínimo 2 caracteres.")
    .max(100, "Marca máximo 100 caracteres."),
  description: z.string().min(10, "Descrição mínimo 10 caracteres."),
  price: z.number().positive("Preço deve ser positivo."),
  stock: z.number().int().nonnegative("Estoque deve ser não-negativo."),
  imageUrl: z.string().url("URL de imagem inválida."),
});

export const updateProductSchema = productSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Nenhum campo para atualizar.",
  });
