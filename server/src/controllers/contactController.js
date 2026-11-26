import ContactMessage from "../models/ContactMessage.js";
import { asyncHandler, HttpError } from "../middleware/error.js";
import { getSettings } from "../services/siteSettings.js";

export const details = asyncHandler(async (_req, res) => {
  const settings = await getSettings();
  res.json(settings.contact);
});

export const submit = asyncHandler(async (req, res) => {
  const name = String(req.body?.name || "").trim().slice(0, 80);
  const email = String(req.body?.email || "").trim().toLowerCase().slice(0, 160);
  const message = String(req.body?.message || "").trim().slice(0, 2000);
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || message.length < 5) {
    throw new HttpError(400, "Enter your name, a valid email and a short message.");
  }
  await ContactMessage.create({ name, email, message });
  res.status(201).json({ ok: true });
});
