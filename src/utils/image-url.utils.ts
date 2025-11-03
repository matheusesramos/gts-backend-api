// src/utils/image-url.utils.ts
import { getServiceImageUrl as getSupabaseImageUrl } from "../services/storage.service";

/**
 * Gera URL completa para imagem de serviço do Supabase
 */
export function getServiceImageUrl(filename: string | null): string {
  if (!filename) {
    return "https://via.placeholder.com/400x300/4FB3D9/FFFFFF?text=Service";
  }

  return getSupabaseImageUrl(filename);
}

/**
 * Extrai apenas o nome do arquivo da URL
 */
export function extractFilename(url: string): string {
  if (!url) return "";
  if (!url.includes("/")) return url;
  return url.split("/").pop() || "";
}