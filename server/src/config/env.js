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
  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || "",
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY || "",
  VAPID_SUBJECT: process.env.VAPID_SUBJECT || "mailto:hello@kharcha.app",
  CRON_SECRET: process.env.CRON_SECRET || "",
  ADMIN_EMAILS: (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
  ADMIN_BOOTSTRAP_PASSWORD: process.env.ADMIN_BOOTSTRAP_PASSWORD || "",
  donation: {
    esewaId: process.env.DONATION_ESEWA_ID || "",
    esewaName: process.env.DONATION_ESEWA_NAME || "",
    bankName: process.env.DONATION_BANK_NAME || "",
    bankAccount: process.env.DONATION_BANK_ACCOUNT || "",
    bankBranch: process.env.DONATION_BANK_BRANCH || "",
    bankSwift: process.env.DONATION_BANK_SWIFT || "",
    qrUrl: process.env.DONATION_QR_URL || "",
    note: process.env.DONATION_NOTE || "",
  },
};
env.pushEnabled = Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY);
env.isProd = env.NODE_ENV === "production";
