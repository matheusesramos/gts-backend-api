// src/controllers/bookings.controller.ts
// 🔄 ALTERAÇÕES:
// - Adicionado Winston logger
// - Removidos console.logs verbosos de debug
// - Logs mais estruturados com userId e bookingId
// - Trocado email para Resend
import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { uploadBookingPhoto } from "../services/storage.service";
import { resendService } from "../services/resend.service"; // 🔄 ALTERADO - usa Resend
import { logger } from "../config/logger";
import { prisma } from "../lib/prisma";

export const createBooking = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  const files = req.files as Express.Multer.File[];

  let items: any[] = [];
  let executionDate: string | undefined;
  let postcode: string | undefined;
  let address: string | undefined;
  let notes: string | undefined;

  // Parse dos dados (mantém igual)
  if (
    req.body.items &&
    typeof req.body.items === "object" &&
    !Array.isArray(req.body.items)
  ) {
    const itemsObj = req.body.items;
    const indices = Object.keys(itemsObj);

    items = indices.map((index) => ({
      serviceId: itemsObj[index].serviceId,
      notes: itemsObj[index].notes || null,
    }));

    executionDate = req.body.executionDate;
    postcode = req.body.postcode;
    address = req.body.address;
    notes = req.body.notes;
  } else if (Array.isArray(req.body.items)) {
    items = req.body.items;
    executionDate = req.body.executionDate;
    postcode = req.body.postcode;
    address = req.body.address;
    notes = req.body.notes;
  } else {
    return res.status(400).json({ message: "Invalid items format." });
  }

  if (items.length === 0) {
    return res.status(400).json({ message: "Items are required." });
  }

  // 🔄 REMOVIDO - logs verbosos de debug (items.length, executionDate, etc)

  try {
    // Criar booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        totalItems: items.length,
        executionDate: executionDate || null,
        postcode: postcode || null,
        address: address || null,
        notes: notes || null,
        items: {
          create: items.map((item: any) => ({
            serviceId: item.serviceId,
            notes: item.notes || null,
          })),
        },
      },
    });

    let photoUrls: string[] = [];

    // Upload de fotos para Supabase
    if (files && files.length > 0) {
      logger.info(`Uploading ${files.length} photos for booking ${booking.id}`); // 🔄 ALTERADO

      const uploadPromises = files.map((file) =>
        uploadBookingPhoto(file, booking.id)
      );

      photoUrls = await Promise.all(uploadPromises);

      // Salvar URLs no banco
      const photoRecords = photoUrls.map((url, index) => ({
        bookingId: booking.id,
        filename: files[index].originalname,
        url: url,
      }));

      await prisma.bookingPhoto.createMany({
        data: photoRecords,
      });

      logger.debug(
        `${files.length} photos uploaded successfully for booking ${booking.id}`
      ); // 🔄 ALTERADO
    }

    // Buscar booking completo
    const completeBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            service: {
              include: {
                category: true,
              },
            },
          },
        },
        photos: true,
      },
    });

    logger.info(`Booking created: ${booking.id} for user ${userId}`); // 🔄 ALTERADO

    // Enviar email de notificação
    try {
      await resendService.sendBookingNotification({
        // 🔄 ALTERADO - usa Resend
        bookingId: booking.id,
        customerName: completeBooking!.user.name,
        customerEmail: completeBooking!.user.email,
        customerPhone: completeBooking!.user.phone,
        executionDate: completeBooking!.executionDate,
        postcode: completeBooking!.postcode,
        address: completeBooking!.address,
        notes: completeBooking!.notes,
        services: completeBooking!.items.map((item) => ({
          name: item.service.name,
          category: item.service.category.name,
          notes: item.notes,
        })),
        createdAt: booking.createdAt.toISOString(),
      });
    } catch (emailError) {
      // Não falha o booking se o email não enviar
      logger.warn(
        `Failed to send booking email for ${booking.id}: ${emailError}`
      );
    }

    return res.status(201).json({
      message: "Booking created successfully!",
      booking: completeBooking,
    });
  } catch (error) {
    logger.error(`Error creating booking: ${error}`); // 🔄 ALTERADO
    return res.status(500).json({ message: "Error creating booking." });
  }
};

export const getUserBookings = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            service: {
              include: {
                category: true,
              },
            },
          },
        },
        photos: true,
      },
    });

    return res.status(200).json({ bookings });
  } catch (error) {
    logger.error(`Error fetching bookings for user ${userId}: ${error}`); // 🔄 ALTERADO
    return res.status(500).json({ message: "Error fetching bookings." });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        items: {
          include: {
            service: {
              include: {
                category: true,
              },
            },
          },
        },
        photos: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    return res.status(200).json({ booking });
  } catch (error) {
    logger.error(`Error fetching booking ${id}: ${error}`); // 🔄 ALTERADO
    return res.status(500).json({ message: "Error fetching booking." });
  }
};
