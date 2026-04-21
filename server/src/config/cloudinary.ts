export const cloudinary = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  apiKey: process.env.CLOUDINARY_API_KEY ?? "",
  apiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
  folder: process.env.CLOUDINARY_UPLOAD_FOLDER ?? "products"
};

export function isCloudinaryConfigured() {
  return Boolean(cloudinary.cloudName && cloudinary.apiKey && cloudinary.apiSecret);
}
