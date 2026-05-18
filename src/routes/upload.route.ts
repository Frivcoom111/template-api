import type { NextFunction, Request, Response } from "express";
import express from "express";
import multer from "multer";
import cloudinaryService from "../services/cloudinary.service";
import { createError } from "../utils/createError";
import { MAX_UPLOAD_SIZE, uploadImageSchema } from "../validators/uploadValidators";

const routes = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_SIZE },
});

const uploadSingle = (req: Request, res: Response, next: NextFunction) => {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        next(createError("Arquivo deve ter no máximo 5MB.", 400));
        return;
      }
      next(createError("Erro ao processar o upload do arquivo.", 400));
      return;
    }

    if (err) {
      next(err);
      return;
    }

    next();
  });
};

type RequestWithFile = Request & { file?: Express.Multer.File };

routes.post("/", uploadSingle, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = (req as RequestWithFile).file;

    if (!file) {
      res.status(400).json({ error: { file: { _errors: ["Arquivo é obrigatório."] } } });
      return;
    }

    const validation = uploadImageSchema.safeParse(file);

    if (!validation.success) {
      res.status(400).json({ error: validation.error.format() });
      return;
    }

    const uploadResult = await cloudinaryService.uploadImage(file.buffer);

    res.status(201).json({ url: uploadResult.url, public_id: uploadResult.public_id });
  } catch (error) {
    next(error);
  }
});

export default routes;
