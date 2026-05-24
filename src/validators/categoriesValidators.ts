import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z
    .string()
    .min(3, "Nome mínimo 3 caracteres.")
    .max(100, "Nome máximo 100 caracteres."),
});

export const categoryUpdateSchema = categoryCreateSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Nenhum campo para atualizar.",
  });
