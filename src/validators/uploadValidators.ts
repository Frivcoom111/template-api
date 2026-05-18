import { z } from "zod";

export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
export const allowedImageMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;

export const uploadImageSchema = z.object({
  mimetype: z.enum(allowedImageMimeTypes, {
    message: "Tipo de arquivo inválido. Apenas JPEG, PNG ou WEBP.",
  }),
  size: z.number().max(MAX_UPLOAD_SIZE, {
    message: "Arquivo deve ter no máximo 5MB.",
  }),
});
