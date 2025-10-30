// src/controllers/profile.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { updateProfileSchema } from "../schemas/user.schemas";
import { AuthRequest } from "../middlewares/auth.middleware";

const prisma = new PrismaClient();

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Usuário não autenticado." });
  }

  const validation = updateProfileSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.issues });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validation.data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        postcode: true,
        address: true,
        language: true,
        role: true,
        agencyId: true,
        agency: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            postcode: true,
            address: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      message: "Perfil atualizado com sucesso!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return res.status(500).json({ message: "Erro ao atualizar perfil." });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Usuário não autenticado." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        postcode: true,
        address: true,
        language: true,
        role: true,
        agencyId: true,
        agency: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            postcode: true,
            address: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return res.status(500).json({ message: "Erro ao buscar perfil." });
  }
};
