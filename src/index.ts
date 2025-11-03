// src/index.ts
import express from "express";
import "dotenv/config";
import { rateLimit } from "express-rate-limit";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import servicesRoutes from "./routes/services.routes";
import bookingsRoutes from "./routes/bookings.routes";
import agenciesRoutes from "./routes/agencies.routes";
import { env } from "./config/env";
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

const allowedOrigins = [env.FRONTEND_URL];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // mobile RN/server-to-server
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("CORS: origin não permitido"));
  },
  credentials: true, // só se usar cookies na web
}));

// Servir arquivos estáticos
const publicPath = path.join(process.cwd(), "public");
console.log(`📁 Serving static files from: ${publicPath}`);
app.use(express.static(publicPath));

// Rate limiter APENAS em produção
if (env.NODE_ENV === "production") {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Muitas requisições deste IP, tente novamente em 15 minutos.",
    // Desabilitar validação de trust proxy em produção quando sabemos que estamos atrás de um proxy confiável (Railway)
    validate: {
      trustProxy: false,
      xForwardedForHeader: false,
    },
  });
  app.use(limiter);
} else {
  console.log("⚠️  Rate limiting DISABLED (development mode)");
}

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Rotas da API
app.use("/api/auth", authRoutes);
app.use("/api", servicesRoutes);
app.use("/api", bookingsRoutes);
app.use("/api", agenciesRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "up", timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "degraded", db: "down" });
  }
});

app.get("/reset-password", (req, res) => {
  res.sendFile(path.join(process.cwd(), "../public/reset-password.html"));
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${env.NODE_ENV}`);
});

async function gracefulShutdown(reason?: unknown) {
  console.error("Shutting down gracefully...", reason);
  server.close(async () => {
    try {
      await prisma.$disconnect();
    } finally {
      process.exit(1);
    }
  });
  // Fallback: se não fechar em 10s, força saída
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
process.on("unhandledRejection", gracefulShutdown);
process.on("uncaughtException", gracefulShutdown);
