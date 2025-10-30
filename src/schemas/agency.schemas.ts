// src/schemas/agency.schemas.ts
import { z } from "zod";

export const createAgencySchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(10),
  email: z.string().email(),
  postcode: z.string().min(1),
  address: z.string().min(5),
});

export const updateAgencySchema = createAgencySchema.partial();
