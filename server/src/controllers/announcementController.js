import mongoose from "mongoose";
import Announcement from "../models/Announcement.js";
import { asyncHandler, HttpError } from "../middleware/error.js";
import { uploadImage, destroyImage } from "../config/cloudinary.js";
import { broadcast } from "../services/notifications.js";

const validId = (id) => mongoose.isValidObjectId(id);

function serialize(row, userId = null, admin = false) {
  const r = row.toObject ? row.toObject() : row;
  const readBy = r.readBy || [];
  const out = {
    id: r._id.toString(),
    title: r.title || "Kharcha update",
    message: r.message || "",
    image: { url: r.image?.url || "" },
    url: r.url || "/#/notifications",
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    read: Boolean(userId && readBy.some((id) => String(id) === String(userId))),
  };
  if (admin) {
    out.readCount = readBy.length;
    out.createdBy = r.createdBy && typeof r.createdBy === "object"
      ? { name: r.createdBy.name, email: r.createdBy.email }
      : null;
  }
  return out;
}

export const listMine = asyncHandler(async (req, res) => {
  const rows = await Announcement.find({ audience: "all" }).sort({ createdAt: -1 }).limit(100).lean();
  res.json(rows.map((row) => serialize(row, req.userId)));
});

export const unreadCount = asyncHandler(async (req, res) => {
  const count = await Announcement.countDocuments({ audience: "all", readBy: { $ne: req.userId } });
  res.json({ count });
});

export const markRead = asyncHandler(async (req, res) => {
  if (!validId(req.params.id)) throw new HttpError(404, "Notification not found.");
  const row = await Announcement.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { readBy: req.userId } },
    { new: true }
  );
  if (!row) throw new HttpError(404, "Notification not found.");
  res.json({ ok: true, ...serialize(row, req.userId) });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Announcement.updateMany(
    { audience: "all", readBy: { $ne: req.userId } },
    { $addToSet: { readBy: req.userId } }
  );
  res.json({ ok: true });
});

export const adminList = asyncHandler(async (_req, res) => {
  const rows = await Announcement.find()
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .limit(200);
  res.json(rows.map((row) => serialize(row, null, true)));
});

export const create = asyncHandler(async (req, res) => {
  const title = String(req.body?.title || "").trim().slice(0, 120) || "Kharcha update";
  const message = String(req.body?.message || "").trim().slice(0, 2000);
  let url = "";
  let publicId = "";

  if (req.file) {
    const uploaded = await uploadImage(req.file.buffer, "kharcha/notifications");
    if (uploaded) {
      url = uploaded.url;
      publicId = uploaded.publicId || "";
    } else {
      url = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }
  } else if (typeof req.body?.imageUrl === "string" && req.body.imageUrl.trim()) {
    const candidate = req.body.imageUrl.trim().slice(0, 1000);
    if (!/^(https?:\/\/|data:image\/(jpeg|png|webp|gif);base64,)/.test(candidate)) {
      throw new HttpError(400, "Enter a valid image URL or choose an image file.");
    }
    url = candidate;
  }

  if (!message && !url) throw new HttpError(400, "Add a message, a photo, or both.");
  const row = await Announcement.create({
    title, message, image: { url, publicId }, url: "/#/notifications",
    audience: "all", createdBy: req.admin._id,
  });

  // Web Push payloads are small: send text and a link, never an inline data URL.
  const payload = {
    title,
    body: message || "New photo update from Kharcha 📸",
    url: "/#/notifications",
    image: /^https?:\/\//.test(url) && url.length < 800 ? url : undefined,
  };
  const push = await broadcast(payload, `announcement:${row.id}`);
  res.status(201).json({
    ...serialize(row, null, true),
    sent: push.sent,
    users: push.users,
    disabled: Boolean(push.disabled),
  });
});

export const remove = asyncHandler(async (req, res) => {
  if (!validId(req.params.id)) throw new HttpError(404, "Notification not found.");
  const row = await Announcement.findByIdAndDelete(req.params.id);
  if (!row) throw new HttpError(404, "Notification not found.");
  if (row.image?.publicId) await destroyImage(row.image.publicId);
  res.json({ ok: true });
});
