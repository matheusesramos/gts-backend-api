// src/schemas/user.schemas.ts
import { z } from "zod";

export const registerUserSchema = z.object({
  name: z.string().min(3, "O nome precisa ter no mínimo 3 caracteres."),
  email: z.string().email("Formato de e-mail inválido."),
  password: z.string().min(8, "A senha precisa ter no mínimo 8 caracteres."),
  phone: z
    .string()
    .min(10, "Telefone deve ter no mínimo 10 dígitos.")
    .optional(),
  postcode: z.string().optional(),
  address: z.string().optional(),
  language: z.enum(["EN_GB", "PT_BR"]).default("EN_GB"),
  agencyId: z.string().uuid().optional(),
});

export const loginUserSchema = z.object({
  email: z.string().email("Formato de e-mail inválido."),
  password: z.string().min(1, "A senha é obrigatória."),
});

// Schema para atualizar perfil
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(3, "O nome precisa ter no mínimo 3 caracteres.")
    .optional(),
  phone: z
    .string()
    .min(10, "Telefone deve ter no mínimo 10 dígitos.")
    .optional(),
  postcode: z.string().optional(),
  address: z.string().optional(),
  language: z.enum(["EN_GB", "PT_BR"]).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const verifyCodeSchema = z.object({
  email: z.string().email("Email inválido"),
  code: z.string().length(4, "Código deve ter 4 dígitos"),
});

export const resetPasswordWithCodeSchema = z.object({
  email: z.string().email("Email inválido"),
  code: z.string().length(4, "Código deve ter 4 dígitos"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});
