import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";

export const cloudinaryEnabled = env.cloudinaryEnabled;

if (cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

// Upload an in-memory image buffer. Returns null when Cloudinary is not configured
// so callers can fall back to an inline data URL (useful for local development).
export function uploadImage(buffer, folder = "kharcha") {
  if (!cloudinaryEnabled) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ width: 1400, height: 1400, crop: "limit", quality: "auto", fetch_format: "auto" }],
      },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

export async function destroyImage(publicId) {
  if (!cloudinaryEnabled || !publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (e) {
    console.error("Cloudinary destroy failed:", e.message);
  }
}
