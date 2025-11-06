// src/index.ts
import express from "express";
import "dotenv/config";
import { rateLimit } from "express-rate-limit";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import servicesRoutes from "./routes/services.routes";
import bookingsRoutes from "./routes/bookings.routes";
import agenciesRoutes from "./routes/agencies.routes";
import { env } from "./config/env";
import { logger, morganStream } from "./config/logger";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import { notFoundHandler, errorHandler } from "./middlewares/error.middleware";
import { prisma } from "./lib/prisma";

const app = express();
const PORT = process.env.PORT || 3000;

// Confiar no proxy (necessário para Railway/proxies reversos)
// Railway usa 1 proxy reverso, então configuramos para confiar apenas no primeiro proxy
app.set("trust proxy", 1);

// Middleware para parsear JSON
app.use(express.json());
app.use(cookieParser());

// HTTP request logging
app.use(morgan("combined", { stream: morganStream }));

const allowedOrigins = [
  env.FRONTEND_URL,
  env.API_BASE_URL, // 🆕 ADICIONE - permite a própria API
];

app.use(
  cors({
    origin: (origin, cb) => {
      // Permitir: sem origin, null, ou railway.app
      if (!origin || origin === "null" || origin.includes("railway.app")) {
        return cb(null, true);
      }

      // Permitir frontend configurado
      if (origin === env.FRONTEND_URL) {
        return cb(null, true);
      }

      console.log("❌ CORS bloqueou origin:", origin);
      return cb(new Error("CORS: origin não permitido"));
    },
    credentials: true,
  })
);

// Rate limiter APENAS em produção
if (env.NODE_ENV === "production") {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Muitas requisições deste IP, tente novamente em 15 minutos.",
    validate: {
      trustProxy: false,
      xForwardedForHeader: false,
    },
  });
  app.use(limiter);
  logger.info("Rate limiting enabled");
} else {
  logger.warn("Rate limiting DISABLED (development mode)");
}

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Rotas da API - DEVEM VIR ANTES DO express.static
app.use("/api/auth", authRoutes);
app.use("/api", servicesRoutes);
app.use("/api", bookingsRoutes);
app.use("/api", agenciesRoutes);

// Health check
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "up", timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "degraded", db: "down" });
  }
});

// Servir arquivos estáticos - DEPOIS das rotas específicas
const publicPath = path.join(process.cwd(), "public");
logger.info(`Serving static files from: ${publicPath}`);
app.use(express.static(publicPath));

// Handlers de erro devem ser os últimos
app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
});

async function gracefulShutdown(reason?: unknown) {
  logger.error("Shutting down gracefully...", { reason });
  server.close(async () => {
    try {
      await prisma.$disconnect();
      logger.info("Database connection closed");
    } finally {
      process.exit(1);
    }
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
process.on("unhandledRejection", gracefulShutdown);
process.on("uncaughtException", gracefulShutdown);
