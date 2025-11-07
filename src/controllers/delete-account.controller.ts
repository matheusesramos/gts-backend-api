import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../lib/prisma";
import { logger } from "../config/logger";

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Usuário não autenticado." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    if (!user.isActive) {
      return res.status(400).json({ message: "Conta já foi deletada." });
    }

    // Soft delete - manter dados mas desativar conta
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        deletedAt: new Date(),
        // Anonimizar email para liberar o endereço
        email: `deleted_${userId}@deleted.local`,
      },
    });

    // Revogar todos os tokens de autenticação
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });

    // Invalidar tokens de reset
    await prisma.resetToken.updateMany({
      where: { userId },
      data: { used: true },
    });

    logger.info(`User account deleted: ${userId}`);

    return res.status(200).json({
      message:
        "Conta deletada com sucesso. Seus dados de histórico foram preservados.",
    });
  } catch (error) {
    logger.error(`Error deleting account: ${error}`);
    return res.status(500).json({ message: "Erro ao deletar conta." });
  }
};
