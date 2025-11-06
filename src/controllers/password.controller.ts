import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  forgotPasswordSchema,
  verifyCodeSchema,
  resetPasswordWithCodeSchema,
} from "../schemas/user.schemas";
import { resendService } from "../services/resend.service";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";

// Gerar código de 4 dígitos
function generateCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// 1️⃣ SOLICITAR CÓDIGO (substitui forgot-password)
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const validation = forgotPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.issues });
    }

    const { email } = validation.data;

    const user = await prisma.user.findUnique({ where: { email } });

    // Sempre retorna sucesso (segurança)
    if (!user) {
      return res.status(200).json({
        message: "Se o email existir, você receberá um código de verificação.",
      });
    }

    // Gerar código
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    // Invalidar códigos anteriores
    await prisma.resetToken.updateMany({
      where: {
        userId: user.id,
        used: false,
      },
      data: { used: true },
    });

    // Criar novo código
    await prisma.resetToken.create({
      data: {
        code,
        userId: user.id,
        expiresAt,
      },
    });

    // Enviar email
    await resendService.sendPasswordResetCode(user.email, user.name, code);

    return res.status(200).json({
      message: "Se o email existir, você receberá um código de verificação.",
    });
  } catch (error) {
    console.error("Erro em requestPasswordReset:", error);
    return res.status(500).json({ message: "Erro ao processar solicitação." });
  }
};

// 2️⃣ VERIFICAR CÓDIGO
export const verifyResetCode = async (req: Request, res: Response) => {
  try {
    const validation = verifyCodeSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.issues });
    }

    const { email, code } = validation.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Código inválido." });
    }

    const resetToken = await prisma.resetToken.findFirst({
      where: {
        code,
        userId: user.id,
        used: false,
      },
    });

    if (!resetToken) {
      return res.status(400).json({ message: "Código inválido." });
    }

    if (resetToken.expiresAt < new Date()) {
      return res.status(400).json({ message: "Código expirado." });
    }

    // Marcar como verificado
    await prisma.resetToken.update({
      where: { id: resetToken.id },
      data: { verified: true },
    });

    return res.status(200).json({
      message: "Código verificado com sucesso!",
    });
  } catch (error) {
    console.error("Erro em verifyResetCode:", error);
    return res.status(500).json({ message: "Erro ao verificar código." });
  }
};

// 3️⃣ RESETAR SENHA (só funciona se código foi verificado)
export const resetPasswordWithCode = async (req: Request, res: Response) => {
  try {
    const validation = resetPasswordWithCodeSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.issues });
    }

    const { email, code, password } = validation.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Código inválido." });
    }

    const resetToken = await prisma.resetToken.findFirst({
      where: {
        code,
        userId: user.id,
        used: false,
        verified: true, // 👈 Deve ter sido verificado
      },
    });

    if (!resetToken) {
      return res
        .status(400)
        .json({ message: "Código inválido ou não verificado." });
    }

    if (resetToken.expiresAt < new Date()) {
      return res.status(400).json({ message: "Código expirado." });
    }

    // Atualizar senha
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Marcar código como usado
    await prisma.resetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    // Revogar todos refresh tokens
    await prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { revoked: true },
    });

    return res.status(200).json({
      message: "Senha redefinida com sucesso!",
    });
  } catch (error) {
    console.error("Erro em resetPasswordWithCode:", error);
    return res.status(500).json({ message: "Erro ao redefinir senha." });
  }
};
