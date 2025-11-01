// src/controllers/services.controller.ts
import { Request, Response } from "express";
import { getServiceImageUrl } from "../utils/image-url.utils";
import { prisma } from "../lib/prisma";

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        order: true,
      },
    });

    return res.status(200).json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ message: "Error fetching categories." });
  }
};

export const getServices = async (req: Request, res: Response) => {
  try {
    const { categorySlug } = req.query;

    const where: any = { isActive: true };

    if (categorySlug && categorySlug !== "all") {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug as string },
      });

      if (category) {
        where.categoryId = category.id;
      }
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Adicionar URL completa para imagens
    const servicesWithFullUrls = services.map((service) => ({
      ...service,
      imageUrl: getServiceImageUrl(service.imageUrl),
    }));

    return res.status(200).json({ services: servicesWithFullUrls });
  } catch (error) {
    console.error("Error fetching services:", error);
    return res.status(500).json({ message: "Error fetching services." });
  }
};

export const getServiceBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const service = await prisma.service.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found." });
    }

    // Adicionar URL completa para imagem
    const serviceWithFullUrl = {
      ...service,
      imageUrl: getServiceImageUrl(service.imageUrl),
    };

    return res.status(200).json({ service: serviceWithFullUrl });
  } catch (error) {
    console.error("Error fetching service:", error);
    return res.status(500).json({ message: "Error fetching service." });
  }
};
