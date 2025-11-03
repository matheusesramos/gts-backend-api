// src/config/env.ts
import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  ACCESS_TOKEN_EXPIRATION: z.coerce.number(),
  REFRESH_TOKEN_EXPIRATION: z.coerce.number(),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().email(),
  FRONTEND_URL: z.string().min(1),
  RESET_TOKEN_EXPIRATION: z.coerce.number().default(3600),
  SUPABASE_URL: z.string().min(1),
  SUPABASE_KEY: z.string().min(1),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
