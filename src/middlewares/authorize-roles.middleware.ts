// src/middlewares/authorize-roles.middleware.ts
import { Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { AuthRequest } from "./auth.middleware"; // Importe a interface atualizada

// Esta é uma "função fábrica": ela retorna a função de middleware real.
// Isso nos permite passar as roles permitidas como um argumento.
export const authorizeRoles = (allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    // Se não houver usuário (authMiddleware falhou) ou a role não estiver presente
    if (!user || !user.role) {
      return res
        .status(403)
        .json({ message: "Acesso proibido: informações de usuário ausentes." });
    }

    // Verifica se a role do usuário está na lista de roles permitidas
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        message:
          "Acesso proibido: você não tem permissão para acessar este recurso.",
      });
    }

    // Se a verificação passar, continue para a próxima função (o controller)
    next();
  };
};
