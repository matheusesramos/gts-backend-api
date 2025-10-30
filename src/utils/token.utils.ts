// src/utils/token.utils.ts
import jwt, { SignOptions } from "jsonwebtoken"; // Importe SignOptions
import { PrismaClient, User } from "@prisma/client";
import crypto from "crypto";
import { env } from "../config/env";

const prisma = new PrismaClient();

export function generateTokens(user: User) {
  const payload = { userId: user.id, role: user.role };

  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRATION,
  });

  const refreshToken = jwt.sign({ userId: user.id }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRATION,
  });

  return { accessToken, refreshToken };
}

export async function addRefreshTokenToDatabase(userId: string, token: string) {
  const hashedToken = hashToken(token);
  return prisma.refreshToken.create({
    data: {
      userId,
      hashedToken,
    },
  });
}

export function hashToken(token: string) {
  return crypto.createHash("sha512").update(token).digest("hex");
}
