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

const csvUploadMulter = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_request: Request, file, callback) => {
    const isCsvMime = /^(text\/csv|text\/plain|application\/vnd\.ms-excel|application\/csv|text\/x-csv)$/i.test(file.mimetype);
    const isCsvExt = /\.csv$/i.test(file.originalname);
    if (!isCsvMime && !isCsvExt) {
      callback(new ApiError(400, "Invalid file type. Please upload a valid CSV file (.csv)."));
      return;
    }
    callback(null, true);
  },
});

export const csvFileUpload = (req: any, res: any, next: any) => {
  csvUploadMulter.fields([
    { name: "file", maxCount: 1 },
    { name: "csv", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) return next(normalizeUploadError(err));
    if (req.files) {
      req.file = req.files["file"]?.[0] || req.files["csv"]?.[0] || req.files["image"]?.[0];
    }
    next();
  });
};

export function normalizeUploadError(error: unknown) {
  if (error instanceof MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return new ApiError(400, "File is too large. Max size is 10MB.");
    }

    return new ApiError(400, "Invalid upload payload.");
  }

  return error;
}
