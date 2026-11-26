import { env } from "../config/env.js";
import { pushConfig } from "../services/notifications.js";
import { asyncHandler } from "../middleware/error.js";

// Public, cache-friendly settings for the landing page and the PWA.
export const publicConfig = asyncHandler(async (_req, res) => {
  res.set("Cache-Control", "public, max-age=300");
  res.json({
    app: "Kharcha",
    version: "2.0.0",
    url: "https://kharcha-expense-tracker-ashen.vercel.app",
    siteName: "Kharcha – Kathmandu Expense Tracker",
    push: pushConfig(),
    donations: env.donation,
  });
});
