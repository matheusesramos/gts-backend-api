// src/services/storage.service.ts
import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

/**
 * Faz upload de foto de booking
 */
export async function uploadBookingPhoto(
  file: Express.Multer.File,
  bookingId: string
): Promise<string> {
  const filename = `${bookingId}/${Date.now()}-${file.originalname}`;

  const { data, error } = await supabase.storage
    .from("booking-photos")
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    console.error("Error uploading to Supabase:", error);
    throw new Error("Failed to upload photo");
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("booking-photos").getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Deleta foto de booking
 */
export async function deleteBookingPhoto(url: string): Promise<void> {
  // Extrai o path da URL
  const path = url.split("/booking-photos/")[1];

  if (!path) return;

  const { error } = await supabase.storage
    .from("booking-photos")
    .remove([path]);

  if (error) {
    console.error("Error deleting from Supabase:", error);
  }
}

/**
 * Retorna URL pública de imagem de serviço
 */
export function getServiceImageUrl(filename: string): string {
  const {
    data: { publicUrl },
  } = supabase.storage.from("service-images").getPublicUrl(filename);

  return publicUrl;
}