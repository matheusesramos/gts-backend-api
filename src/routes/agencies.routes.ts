// src/routes/agencies.routes.ts
import { Router } from "express";
import {
  createAgency,
  getAgencies,
  getAgencyById,
  updateAgency,
  deactivateAgency,
  reactivateAgency,
  assignUserToAgency,
  removeUserFromAgency,
} from "../controllers/agencies.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorize-roles.middleware";
import { Role } from "@prisma/client";

const router = Router();

// Rotas públicas/protegidas por autenticação simples
router.get("/agencies", authMiddleware, getAgencies);
router.get("/agencies/:id", authMiddleware, getAgencyById);

// Rotas restritas a ADMIN
router.post(
  "/agencies",
  authMiddleware,
  authorizeRoles([Role.ADMIN]),
  createAgency
);

router.put(
  "/agencies/:id",
  authMiddleware,
  authorizeRoles([Role.ADMIN]),
  updateAgency
);

router.patch(
  "/agencies/:id/deactivate",
  authMiddleware,
  authorizeRoles([Role.ADMIN]),
  deactivateAgency
);

router.patch(
  "/agencies/:id/reactivate",
  authMiddleware,
  authorizeRoles([Role.ADMIN]),
  reactivateAgency
);

router.post(
  "/agencies/assign-user",
  authMiddleware,
  authorizeRoles([Role.ADMIN]),
  assignUserToAgency
);

router.delete(
  "/agencies/users/:userId",
  authMiddleware,
  authorizeRoles([Role.ADMIN]),
  removeUserFromAgency
);

export default router;
