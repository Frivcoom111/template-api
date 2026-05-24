import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Senha mínima 8 caracteres.")
  .regex(/[A-Z]/, "Senha deve ter pelo menos uma letra maiúscula.")
  .regex(/[a-z]/, "Senha deve ter pelo menos uma letra minúscula.")
  .regex(/[0-9]/, "Senha deve ter pelo menos um número.");

export const userCreateSchema = z.object({
  name: z
    .string()
    .min(3, "Nome mínimo 3 caracteres.")
    .max(100, "Nome máximo 100 caracteres."),
  email: z.string().email("Email inválido."),
  password: passwordSchema,
  role: z.enum(["ADMIN", "USER"], "Papel inválido."),
});

export const userUpdateSchema = z
  .object({
    name: z
      .string()
      .min(3, "Nome mínimo 3 caracteres.")
      .max(100, "Nome máximo 100 caracteres.")
      .optional(),
    email: z.string().email("Email inválido.").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Nenhum campo para atualizar.",
  });

export const userUpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual obrigatória."),
  newPassword: passwordSchema,
});

export const userUpdateRoleSchema = z.object({
  role: z.enum(["ADMIN", "USER"], "Papel inválido."),
});
