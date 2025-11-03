// src/middlewares/error.middleware.ts
import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";

export function notFoundHandler(req: Request, res: Response) {
  return res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "Rota não encontrada." },
  });
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const isProd = process.env.NODE_ENV === "production";
  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: { code: "CONFLICT", message: "Registro duplicado." },
      });
    }
  }

  const status = err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;

  type ErrorPayload = {
    success: false;
    error: { code: string; message: string };
    debug?: { message: string; stack?: string };
  };

  const payload: ErrorPayload = {
    success: false,
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: err.publicMessage || "Erro interno no servidor.",
    },
  };

  if (!isProd) payload.debug = { message: err.message, stack: err.stack };
  return res.status(status).json(payload);
}