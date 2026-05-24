import { z } from "zod";

export const verifyEmailSchema = z.object({
  code: z
    .string("Código inválido.")
    .regex(/^\d{6}$/, "Código inválido.")
    .refine((val) => {
      const num = parseInt(val, 10);
      return num >= 100000 && num <= 999999;
    }, "Código inválido."),
});
