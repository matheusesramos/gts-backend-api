// src/routes/auth.routes.ts
import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  logout,
} from "../controllers/auth.controller";
import {
  requestPasswordReset,
  verifyResetCode,
  resetPasswordWithCode,
} from "../controllers/password.controller";
import { deleteAccount } from "../controllers/delete-account.controller";
import { getProfile, updateProfile } from "../controllers/profile.controller";
import { authMiddleware, AuthRequest } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorize-roles.middleware";
import { Role } from "@prisma/client";

const router = Router();

// --- Rotas Públicas ---
router.post("/register", register);
router.post("/login", login);
router.post("/refresh_token", refreshToken);
router.post("/logout", logout);

// Recuperação de senha
router.post("/request-password-reset", requestPasswordReset); // Solicitar código
router.post("/verify-reset-code", verifyResetCode); // Verificar código
router.post("/reset-password", resetPasswordWithCode); // Resetar senha

// --- Rotas Protegidas ---
// Perfil do usuário
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.delete("/account", authMiddleware, deleteAccount);

// Dashboard (apenas EMPLOYEE e ADMIN)
router.get(
  "/dashboard",
  authMiddleware,
  authorizeRoles([Role.EMPLOYEE, Role.ADMIN]),
  (req, res) => {
    res.json({
      message: "Acesso ao dashboard concedido.",
      timestamp: new Date().toISOString(),
    });
  }
);

// Admin (apenas ADMIN)
router.get(
  "/admin/users",
  authMiddleware,
  authorizeRoles([Role.ADMIN]),
  (req, res) => {
    res.json({ message: "Acesso à área de administração concedido." });
  }
);

export default router;
