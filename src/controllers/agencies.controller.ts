// src/controllers/agencies.controller.ts
import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  createAgencySchema,
  updateAgencySchema,
} from "../schemas/agency.schemas";
import { prisma } from "../lib/prisma";

// Criar nova agência (apenas ADMIN)
export const createAgency = async (req: AuthRequest, res: Response) => {
  const validation = createAgencySchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.issues });
  }

  const { name, phone, email, postcode, address } = validation.data;

  try {
    const existingAgency = await prisma.agency.findUnique({
      where: { email },
    });

    if (existingAgency) {
      return res
        .status(409)
        .json({ message: "Agency with this email already exists." });
    }

    const agency = await prisma.agency.create({
      data: {
        name,
        phone,
        email,
        postcode,
        address,
      },
    });

    return res.status(201).json({
      message: "Agency created successfully!",
      agency,
    });
  } catch (error) {
    console.error("Error creating agency:", error);
    return res.status(500).json({ message: "Error creating agency." });
  }
};

// Listar todas as agências ativas
export const getAgencies = async (req: Request, res: Response) => {
  try {
    const { includeInactive } = req.query;

    const where: any = {};

    // Se não for solicitado incluir inativas, filtra apenas ativas
    if (includeInactive !== "true") {
      where.isActive = true;
    }

    const agencies = await prisma.agency.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    return res.status(200).json({ agencies });
  } catch (error) {
    console.error("Error fetching agencies:", error);
    return res.status(500).json({ message: "Error fetching agencies." });
  }
};

// Buscar agência por ID
export const getAgencyById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const agency = await prisma.agency.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    });

    if (!agency) {
      return res.status(404).json({ message: "Agency not found." });
    }

    return res.status(200).json({ agency });
  } catch (error) {
    console.error("Error fetching agency:", error);
    return res.status(500).json({ message: "Error fetching agency." });
  }
};

// Atualizar agência (apenas ADMIN)
export const updateAgency = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const validation = updateAgencySchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.issues });
  }

  try {
    const agency = await prisma.agency.findUnique({ where: { id } });

    if (!agency) {
      return res.status(404).json({ message: "Agency not found." });
    }

    // Se está alterando o email, verificar se não existe outra agência com esse email
    if (validation.data.email && validation.data.email !== agency.email) {
      const existingAgency = await prisma.agency.findUnique({
        where: { email: validation.data.email },
      });

      if (existingAgency) {
        return res
          .status(409)
          .json({ message: "Another agency with this email already exists." });
      }
    }

    const updatedAgency = await prisma.agency.update({
      where: { id },
      data: validation.data,
    });

    return res.status(200).json({
      message: "Agency updated successfully!",
      agency: updatedAgency,
    });
  } catch (error) {
    console.error("Error updating agency:", error);
    return res.status(500).json({ message: "Error updating agency." });
  }
};

// Desativar agência (soft delete) (apenas ADMIN)
export const deactivateAgency = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const agency = await prisma.agency.findUnique({ where: { id } });

    if (!agency) {
      return res.status(404).json({ message: "Agency not found." });
    }

    const updatedAgency = await prisma.agency.update({
      where: { id },
      data: { isActive: false },
    });

    return res.status(200).json({
      message: "Agency deactivated successfully!",
      agency: updatedAgency,
    });
  } catch (error) {
    console.error("Error deactivating agency:", error);
    return res.status(500).json({ message: "Error deactivating agency." });
  }
};

// Reativar agência (apenas ADMIN)
export const reactivateAgency = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const agency = await prisma.agency.findUnique({ where: { id } });

    if (!agency) {
      return res.status(404).json({ message: "Agency not found." });
    }

    const updatedAgency = await prisma.agency.update({
      where: { id },
      data: { isActive: true },
    });

    return res.status(200).json({
      message: "Agency reactivated successfully!",
      agency: updatedAgency,
    });
  } catch (error) {
    console.error("Error reactivating agency:", error);
    return res.status(500).json({ message: "Error reactivating agency." });
  }
};

// Vincular usuário a uma agência (apenas ADMIN)
export const assignUserToAgency = async (req: AuthRequest, res: Response) => {
  const { userId, agencyId } = req.body;

  if (!userId || !agencyId) {
    return res
      .status(400)
      .json({ message: "userId and agencyId are required." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const agency = await prisma.agency.findUnique({ where: { id: agencyId } });
    if (!agency) {
      return res.status(404).json({ message: "Agency not found." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { agencyId },
      include: {
        agency: true,
      },
    });

    return res.status(200).json({
      message: "User assigned to agency successfully!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error assigning user to agency:", error);
    return res.status(500).json({ message: "Error assigning user to agency." });
  }
};

// Desvincular usuário de uma agência (apenas ADMIN)
export const removeUserFromAgency = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { agencyId: null },
    });

    return res.status(200).json({
      message: "User removed from agency successfully!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error removing user from agency:", error);
    return res
      .status(500)
      .json({ message: "Error removing user from agency." });
  }
};
