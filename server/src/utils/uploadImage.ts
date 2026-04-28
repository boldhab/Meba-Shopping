import { createHash } from "node:crypto";
import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary";
import { ApiError } from "./apiError";

function signUploadParams(params: Record<string, string>, apiSecret: string) {
  const serialized = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1").update(`${serialized}${apiSecret}`).digest("hex");
}

export async function uploadImage(input: {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
}) {
  if (!isCloudinaryConfigured()) {
    throw new ApiError(500, "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const paramsToSign: Record<string, string> = {
    folder: cloudinary.folder,
    timestamp,
  };

  const signature = signUploadParams(paramsToSign, cloudinary.apiSecret);
  const formData = new FormData();
  const fileBytes = new Uint8Array(
    input.buffer.buffer as ArrayBuffer,
    input.buffer.byteOffset,
    input.buffer.byteLength
  );

  formData.append("file", new Blob([fileBytes], { type: input.mimeType }), input.fileName);
  formData.append("api_key", cloudinary.apiKey);
  formData.append("timestamp", timestamp);
  formData.append("folder", cloudinary.folder);
  formData.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as
    | { secure_url?: string; public_id?: string; error?: { message?: string } }
    | null;

  if (!response.ok || !payload?.secure_url) {
    throw new ApiError(
      502,
      payload?.error?.message ?? "Failed to upload image to Cloudinary."
    );
  }

  return {
    url: payload.secure_url,
    publicId: payload.public_id ?? null,
  };
}
