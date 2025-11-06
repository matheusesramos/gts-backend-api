// src/controllers/password.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { resendService } from "../services/resend.service";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";

// Schema de validação
const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const validation = forgotPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.issues });
    }

    const { email } = validation.data;

    // Buscar usuário
    const user = await prisma.user.findUnique({ where: { email } });

    // Por segurança, sempre retorna sucesso mesmo se o email não existir
    if (!user) {
      return res.status(200).json({
        message:
          "Se o email existir, você receberá instruções para recuperação.",
      });
    }

    // Gerar token único
    const token = crypto.randomBytes(32).toString("hex");

    // Calcular expiração
    const expiresAt = new Date(Date.now() + env.RESET_TOKEN_EXPIRATION * 1000);

    // Invalidar tokens anteriores
    await prisma.resetToken.updateMany({
      where: {
        userId: user.id,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // Criar novo token
    await prisma.resetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // Enviar email
    await resendService.sendPasswordResetEmail(user.email, user.name, token); // 🔄 ALTERADO

    return res.status(200).json({
      message: "Se o email existir, você receberá instruções para recuperação.",
    });
  } catch (error) {
    console.error("Erro em forgotPassword:", error);
    return res.status(500).json({ message: "Erro ao processar solicitação." });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const validation = resetPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.issues });
    }

    const { token, password } = validation.data;

    const resetToken = await prisma.resetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return res.status(400).json({ message: "Token inválido." });
    }

    if (resetToken.used) {
      return res.status(400).json({ message: "Token já foi utilizado." });
    }

    if (resetToken.expiresAt < new Date()) {
      return res.status(400).json({ message: "Token expirado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    await prisma.resetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    await prisma.refreshToken.updateMany({
      where: { userId: resetToken.userId },
      data: { revoked: true },
    });

    return res.status(200).json({
      message: "Senha redefinida com sucesso!",
    });
  } catch (error) {
    console.error("Erro em resetPassword:", error);
    return res.status(500).json({ message: "Erro ao redefinir senha." });
  }
};
