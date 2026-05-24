import type { NextFunction, Request, Response } from "express";
import emailService from "../services/emailService";
import { verifyEmailSchema } from "../validators/emailValidators";

class EmailController {
  async sendEmail(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.user?.id;

      if (!id) {
        res.status(401).json({ error: "ID usuário inválido." });
        return;
      }

      await emailService.sendEmail(id);

      res
        .status(200)
        .json({ message: "Código de verificação enviado com sucesso." });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.user?.id;
      const { code } = req.body;

      const validation = verifyEmailSchema.safeParse({ code });

      if (!id) {
        res.status(401).json({ error: "ID usuário inválido." });
        return;
      }

      if (!validation.success) {
        res.status(400).json({ error: validation.error.format() });
        return;
      }

      await emailService.verifyEmail(id, validation.data.code);

      res.status(200).json({ message: "E-mail validado com sucesso." });
    } catch (error) {
      next(error);
    }
  }
}

export default new EmailController();
