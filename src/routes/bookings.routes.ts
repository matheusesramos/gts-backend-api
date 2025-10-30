// src/routes/bookings.routes.ts
import { Router } from "express";
import {
  createBooking,
  getUserBookings,
  getBookingById,
} from "../controllers/bookings.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/update.middleware"; // 👈 ADD

const router = Router();

// Upload de até 10 fotos por booking
router.post(
  "/bookings",
  authMiddleware,
  upload.array("photos", 5), // 👈 ADD - aceita até 10 fotos
  createBooking
);

router.get("/bookings", authMiddleware, getUserBookings);
router.get("/bookings/:id", authMiddleware, getBookingById);

export default router;
