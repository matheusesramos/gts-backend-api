// src/controllers/bookings.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middlewares/auth.middleware";
import { env } from "../config/env";

const prisma = new PrismaClient();

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

  // Se veio como FormData (com fotos)
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

    // Extrair campos adicionais
    executionDate = req.body.executionDate;
    postcode = req.body.postcode;
    address = req.body.address;
    notes = req.body.notes;
  }
  // Se veio como JSON (sem fotos)
  else if (Array.isArray(req.body.items)) {
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

  console.log("📦 Processing booking with items:", items.length);
  console.log("📅 Execution date:", executionDate);
  console.log("📍 Address:", postcode, address);
  console.log("📝 Notes:", notes);
  console.log("📸 Photos received:", files?.length || 0);

  try {
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

    // Upload de fotos (se houver)
    if (files && files.length > 0) {
      const baseUrl =
        env.NODE_ENV === "production"
          ? process.env.PRODUCTION_URL || "https://api.gts.com"
          : process.env.API_BASE_URL || `http://localhost:${env.PORT}`;

      const photoRecords = files.map((file) => ({
        bookingId: booking.id,
        filename: file.filename,
        url: `${baseUrl}/images/bookings/${file.filename}`,
      }));

      await prisma.bookingPhoto.createMany({
        data: photoRecords,
      });

      console.log(
        `✅ ${files.length} photos uploaded for booking ${booking.id}`
      );
    }

    const completeBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
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

    console.log("✅ Booking created:", booking.id);

    return res.status(201).json({
      message: "Booking created successfully!",
      booking: completeBooking,
    });
  } catch (error) {
    console.error("❌ Error creating booking:", error);
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
    console.error("Error fetching bookings:", error);
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
        userId, // Garantir que o usuário só veja seus próprios bookings
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
    console.error("Error fetching booking:", error);
    return res.status(500).json({ message: "Error fetching booking." });
  }
};
