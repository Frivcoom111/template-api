import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Senha mínima 8 caracteres.")
  .regex(/[A-Z]/, "Senha deve ter pelo menos uma letra maiúscula.")
  .regex(/[a-z]/, "Senha deve ter pelo menos uma letra minúscula.")
  .regex(/[0-9]/, "Senha deve ter pelo menos um número.");

export const registerSchema = z.object({
  name: z
    .string()
    .min(3, "Nome mínimo 3 caracteres.")
    .max(100, "Nome máximo 100 caracteres."),
  email: z.string().email("Email inválido."),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido."),
  password: z.string().min(1, "Senha atual obrigatória."),
});
