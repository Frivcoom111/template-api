import transporter from "../lib/mailer";
import prisma from "../lib/prisma";
import redis from "../lib/redis";
import { compareHash } from "../utils/compareHash";
import { createError } from "../utils/createError";
import { generateHash } from "../utils/generateHash";
import { getRequiredEnv } from "../utils/getRequiredEnv";

class EmailService {
  async sendEmail(id: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        name: true,
        email: true,
        verifiedEmail: true,
      },
    });

    if (!user) throw createError("Usuário não encontrado.", 404);

    if (user.verifiedEmail) throw createError("E-mail já verificado.", 400);

    const key = `verify:email:${user.email}`;

    // Gera um número entre 100000 e 999999
    const code: number = Math.floor(100000 + Math.random() * 900000);

    const hash: string = await generateHash(String(code));

    // Armazena no redis por 5 minutos apenas se ainda não existir um código ativo
    const reserved = await redis.set(key, hash, "EX", 300, "NX");

    if (reserved !== "OK") {
      throw createError("E-mail de verificação já encaminhado.", 400);
    }

    try {
      await transporter.sendMail({
        from: `"No Reply" <${getRequiredEnv("MAIL_USER")}>`,
        to: user.email,
        subject: "Verificação de e-mail",
        html: `
                <h2>Olá, ${user.name}!</h2>
                <p>Seu código de verificação é:</p>
                <h1 style="letter-spacing: 8px;">${code}</h1>
                <p>Este código expira em <strong>5 minutos</strong>.</p>
            `,
      });
    } catch (err) {
      await redis.del(key);
      throw err;
    }
  }

  async verifyEmail(id: string, code: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        name: true,
        email: true,
        verifiedEmail: true,
      },
    });

    if (!user) throw createError("Usuário não encontrado.", 404);
    if (user.verifiedEmail) throw createError("E-mail já verificado.", 400);

    const key = `verify:email:${user.email}`;

    const savedCode = await redis.get(key);

    if (!savedCode)
      throw createError("Código expirado ou não solicitado.", 400);

    const isMatch: boolean = await compareHash(code, savedCode);

    if (!isMatch) throw createError("Código digitado inválido.", 400);

    await prisma.user.update({
      where: { id: id },
      data: { verifiedEmail: true },
    });

    await redis.del(key);
  }
}

export default new EmailService();
