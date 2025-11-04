// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { registerUserSchema, loginUserSchema } from "../schemas/user.schemas";
import {
  addRefreshTokenToDatabase,
  generateTokens,
  hashToken,
} from "../utils/token.utils";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { prisma } from "../lib/prisma";

export const register = async (req: Request, res: Response) => {
  const validation = registerUserSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.issues });
  }
  const {
    name,
    email,
    password,
    phone,
    postcode,
    address,
    language,
    agencyId,
  } = validation.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "E-mail já cadastrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null, // Pode ser null agora
        postcode: postcode || null,
        address: address || null,
        language: language || "EN_GB",
        agencyId: agencyId || null,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      message: "Usuário criado com sucesso!",
      user: userWithoutPassword,
    });
  } catch (error) {
    logger.error(`Registration error: ${error}`);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
};

export const login = async (req: Request, res: Response) => {
  const validation = loginUserSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.issues });
  }
  const { email, password } = validation.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    await addRefreshTokenToDatabase(user.id, refreshToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: env.REFRESH_TOKEN_EXPIRATION * 1000,
    });

    logger.info(`User logged in: ${email}`);
    return res.status(200).json({ accessToken });
  } catch (error) {
    logger.error(`Login error: ${error}`);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const refreshTokenFromCookie = req.cookies.refreshToken;

  if (!refreshTokenFromCookie) {
    return res.status(401).json({ message: "Refresh token não encontrado." });
  }

  try {
    const payload = jwt.verify(
      refreshTokenFromCookie,
      env.JWT_REFRESH_SECRET
    ) as { userId: string };

    // 2. Verificar se o token existe e não foi revogado no DB
    const hashedToken = hashToken(refreshTokenFromCookie);
    const dbToken = await prisma.refreshToken.findUnique({
      where: { hashedToken },
    });

    if (!dbToken || dbToken.revoked) {
      return res
        .status(401)
        .json({ message: "Refresh token inválido ou revogado." });
    }

    // 3. Gerar um novo access token
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado." });
    }

    const { accessToken } = generateTokens(user);

    return res.status(200).json({ accessToken });
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Refresh token inválido ou expirado." });
  }
};

// NOVA Função de Logout
export const logout = async (req: Request, res: Response) => {
  const refreshTokenFromCookie = req.cookies.refreshToken;

  if (!refreshTokenFromCookie) {
    return res.status(400).json({ message: "Nenhuma sessão para encerrar." });
  }

  try {
    const hashedToken = hashToken(refreshTokenFromCookie);

    // Invalida o token no banco de dados
    await prisma.refreshToken.update({
      where: { hashedToken },
      data: { revoked: true },
    });

    // Limpa o cookie no navegador
    res.clearCookie("refreshToken");

    return res.status(200).json({ message: "Logout realizado com sucesso." });
  } catch (error) {
    // Mesmo se o token não for encontrado no DB, limpa o cookie
    res.clearCookie("refreshToken");
    return res.status(500).json({ message: "Erro ao fazer logout." });
  }
};
