import { env } from "../config/env.js";
import { pushConfig } from "../services/notifications.js";
import { asyncHandler } from "../middleware/error.js";
import { getSettings } from "../services/siteSettings.js";

// Public, cache-friendly settings for the landing page, admin UI and the PWA.
export const publicConfig = asyncHandler(async (_req, res) => {
  const settings = await getSettings();
  // Admin edits must appear immediately; the payload is tiny.
  res.set("Cache-Control", "no-store");
  res.json({
    app: "Kharcha",
    version: "2.2.0",
    url: "https://kharcha-expense-tracker-ashen.vercel.app",
    siteName: "Kharcha – Kathmandu Expense Tracker",
    push: pushConfig(),
    logoUrl: settings.logoUrl,
    contact: settings.contact,
    footer: settings.footer,
    donations: settings.donations,
    features: settings.features,
  });
});
