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

const app = express();
const PORT = process.env.PORT || 3000;

// Confiar no proxy (necessário para Railway/proxies reversos)
app.set("trust proxy", true);

// Middleware para parsear JSON
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(process.cwd(), "../public")));

// Rate limiter APENAS em produção
if (env.NODE_ENV === "production") {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Muitas requisições deste IP, tente novamente em 15 minutos.",
  });
  app.use(limiter);
} else {
  console.log("⚠️  Rate limiting DISABLED (development mode)");
}

// Rotas da API
app.use("/api/auth", authRoutes);
app.use("/api", servicesRoutes);
app.use("/api", bookingsRoutes);
app.use("/api", agenciesRoutes);

app.get("/api/health", (req, res) => {
  console.log("🏥 Health check recebido");
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/reset-password", (req, res) => {
  res.sendFile(path.join(process.cwd(), "../public/reset-password.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${env.NODE_ENV}`);
});
