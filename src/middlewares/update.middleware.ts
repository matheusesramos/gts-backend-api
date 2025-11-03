// src/middlewares/upload.middleware.ts
import multer from "multer";

// Usar memoryStorage ao invés de diskStorage
const storage = multer.memoryStorage();

// Filtro de tipos de arquivo
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG and WebP are allowed."));
  }
};

// Configuração do multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB por arquivo
  },
});