import dotenv from "dotenv";
dotenv.config();

const need = (key, alt) => {
  const v = process.env[key] || (alt && process.env[alt]);
  if (!v) {
    console.error(`Missing environment variable ${key}. Copy .env.example to .env and fill it in.`);
    process.exit(1);
  }
  return v;
};

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
const apiKey = process.env.CLOUDINARY_API_KEY || "";
const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 5000,
  MONGO_URI: need("MONGO_URI", "MONGODB_URI"),
  MONGODB_DB: process.env.MONGODB_DB || "",
  JWT_SECRET: need("JWT_SECRET"),
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  CLOUDINARY_CLOUD_NAME: cloudName,
  CLOUDINARY_API_KEY: apiKey,
  CLOUDINARY_API_SECRET: apiSecret,
  cloudinaryEnabled: Boolean(cloudName && apiKey && apiSecret),
};
env.isProd = env.NODE_ENV === "production";
