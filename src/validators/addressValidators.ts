import { z } from "zod";

const CEP_REGEX = /^\d{5}-\d{3}$/;
const STATE_REGEX = /^[A-Z]{2}$/;

export const createAddressSchema = z.object({
  street: z.string().min(1).max(100),
  number: z.number().int().positive("Número inválido."),
  complement: z.string().max(100).optional(),
  city: z.string().min(1).max(100),
  state: z
    .string()
    .regex(STATE_REGEX, "Estado deve ter 2 letras maiúsculas (ex: SP)."),
  zipCode: z
    .string()
    .regex(CEP_REGEX, "CEP inválido. Use o formato XXXXX-XXX."),
});

export const updateAddressSchema = createAddressSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Nenhum campo para atualizar.",
  });
