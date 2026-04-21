import multer, { MulterError } from "multer";
import type { Request } from "express";
import { ApiError } from "../utils/apiError";

const maxFileSizeBytes = 5 * 1024 * 1024;
const allowedMimeTypePattern = /^image\/(jpeg|jpg|png|webp|gif|avif)$/i;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxFileSizeBytes,
  },
  fileFilter: (_request: Request, file, callback) => {
    if (!allowedMimeTypePattern.test(file.mimetype)) {
      callback(new ApiError(400, "Invalid image type. Use JPG, PNG, WEBP, GIF, or AVIF."));
      return;
    }

    callback(null, true);
  },
});

export const productImageUpload = upload.single("image");

export function normalizeUploadError(error: unknown) {
  if (error instanceof MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return new ApiError(400, "Image file is too large. Max size is 5MB.");
    }

    return new ApiError(400, "Invalid upload payload.");
  }

  return error;
}
