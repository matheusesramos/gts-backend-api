// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env";

interface JwtPayload {
  userId: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // 1. Pega o cabeçalho de autorização
  const authHeader = req.headers.authorization;

  // 2. Verifica se o cabeçalho existe e se está no formato 'Bearer <token>'
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Acesso negado. Nenhum token fornecido." });
  }

  // 3. Extrai o token do cabeçalho
  const token = authHeader.split(" ")[1];

  try {
    // 4. Verifica e decodifica o token usando o segredo do ACCESS TOKEN
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

    // 5. Adiciona o payload decodificado (com o userId) ao objeto da requisição
    req.user = decoded;

    // 6. Passa para o próximo handler (o controller da rota)
    next();
  } catch (error) {
    // Se o token for inválido (expirado, malformado, etc.), retorna erro 401
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }
};
