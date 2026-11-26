import multer from "multer";
import { HttpError } from "./error.js";

// Photos are kept in memory and streamed to Cloudinary (or stored inline in MongoDB
// as a data URL when Cloudinary is not configured).
const imageFilter = (_req, file, cb) =>
  /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)
    ? cb(null, true)
    : cb(new HttpError(400, "Only JPG, PNG, WEBP or GIF images are allowed."));

const avatarUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 }, fileFilter: imageFilter });
const receiptUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: imageFilter });

export const uploadPhoto = avatarUpload.single("photo");
export const uploadLogo = avatarUpload.single("logo");
export const uploadReceipt = receiptUpload.single("receipt");
export const uploadScreenshot = receiptUpload.single("screenshot");
