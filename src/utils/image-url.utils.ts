// src/utils/image-url.utils.ts
import { env } from "../config/env";

/**
 * Gera URL completa para imagem de serviço
 */
export function getServiceImageUrl(filename: string | null): string {
  if (!filename) {
    return "https://via.placeholder.com/400x300/4FB3D9/FFFFFF?text=Service";
  }

  const baseUrl = process.env.API_BASE_URL || `http://localhost:${env.PORT}`;

  return `${baseUrl}/images/services/${filename}`;
}

/**
 * Extrai apenas o nome do arquivo da URL
 */
export function extractFilename(url: string): string {
  if (!url) return "";
  if (!url.includes("/")) return url;
  return url.split("/").pop() || "";
}
