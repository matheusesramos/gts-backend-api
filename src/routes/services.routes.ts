// src/routes/services.routes.ts
import { Router } from "express";
import {
  getCategories,
  getServices,
  getServiceBySlug,
} from "../controllers/services.controller";
import { authMiddleware } from "../middlewares/auth.middleware"; // 👈 Importar

const router = Router();

// Rotas protegidas (requerem autenticação)
router.get("/categories", authMiddleware, getCategories); // 👈 Adicionar middleware
router.get("/services", authMiddleware, getServices); // 👈 Adicionar middleware
router.get("/services/:slug", authMiddleware, getServiceBySlug); // 👈 Adicionar middleware

export default router;
