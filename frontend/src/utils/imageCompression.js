import imageCompression from "browser-image-compression";

const MB = 1024 * 1024;

export const MAX_IMAGE_INPUT_SIZE = 12 * MB;
export const MAX_IMAGE_INPUT_LABEL = "12MB";
export const TARGET_IMAGE_UPLOAD_SIZE_MB = 4.5;
export const TARGET_IMAGE_UPLOAD_SIZE = TARGET_IMAGE_UPLOAD_SIZE_MB * MB;
export const TARGET_IMAGE_UPLOAD_LABEL = "4.5MB";
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const isAllowedImageType = (file) => Boolean(file && ALLOWED_IMAGE_TYPES.includes(file.type));

const getCompressedFileName = (name = "foto") => {
  const baseName = name.replace(/\.[^/.]+$/, "") || "foto";
  return `${baseName}.jpg`;
};

export async function compressImageForUpload(file, options = {}) {
  if (!file || file.size <= TARGET_IMAGE_UPLOAD_SIZE) return file;

  const compressed = await imageCompression(file, {
    maxSizeMB: options.maxSizeMB || TARGET_IMAGE_UPLOAD_SIZE_MB,
    maxWidthOrHeight: options.maxWidthOrHeight || 1600,
    initialQuality: options.initialQuality || 0.82,
    useWebWorker: true,
    fileType: "image/jpeg",
  });

  if (!compressed || compressed.size >= file.size) return file;

  return new File([compressed], getCompressedFileName(file.name), {
    type: compressed.type || "image/jpeg",
    lastModified: Date.now(),
  });
}
