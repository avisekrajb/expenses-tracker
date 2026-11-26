import User from "../models/User.js";
import FeatureRequest from "../models/FeatureRequest.js";
import FeatureOverride from "../models/FeatureOverride.js";
import Donation from "../models/Donation.js";
import ContactMessage from "../models/ContactMessage.js";
import { FEATURES } from "../config/features.js";
import { asyncHandler, HttpError } from "../middleware/error.js";
import { uploadImage, destroyImage } from "../config/cloudinary.js";
import { getSettings, updateSettings, saveLogo, donationQrPublicId, saveDonationQr } from "../services/siteSettings.js";

export const session = asyncHandler(async (req, res) => {
  res.json({ ok: true, email: req.admin.email, catalog: FEATURES });
});

export const settings = asyncHandler(async (_req, res) => res.json(await getSettings()));

export const saveSettings = asyncHandler(async (req, res) => {
  res.json(await updateSettings(req.body || {}));
});

// POST /api/admin/logo (multipart "logo"), or JSON { logoUrl }.
export const logo = asyncHandler(async (req, res) => {
  const current = await getSettings();
  let uploaded = null;
  if (req.file) {
    uploaded = await uploadImage(req.file.buffer, "kharcha/branding");
    if (!uploaded) {
      uploaded = {
        url: `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        publicId: null,
      };
    }
  } else if (typeof req.body?.logoUrl === "string") {
    const url = req.body.logoUrl.trim();
    if (!/^(https?:\/\/|data:image\/)/.test(url)) throw new HttpError(400, "Enter a valid image URL.");
    uploaded = { url: url.slice(0, 1000), publicId: null };
  } else {
    throw new HttpError(400, "Choose a logo image.");
  }
  const previousId = current.logoPublicId;
  const saved = await saveLogo(uploaded);
  if (previousId && uploaded.publicId && previousId !== uploaded.publicId) {
    await destroyImage(previousId).catch(() => {});
  }
  res.json(saved);
});

// POST /api/admin/donation-qr (multipart "qr"), or JSON { qrUrl }.
export const donationQr = asyncHandler(async (req, res) => {
  const previousId = await donationQrPublicId();
  let uploaded = null;
  if (req.file) {
    uploaded = await uploadImage(req.file.buffer, "kharcha/donations/qr");
    if (!uploaded) {
      uploaded = {
        url: `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        publicId: null,
      };
    }
  } else if (typeof req.body?.qrUrl === "string") {
    const url = req.body.qrUrl.trim();
    if (!/^(https?:\/\/|data:image\/)/.test(url)) throw new HttpError(400, "Enter a valid QR image URL.");
    uploaded = { url: url.slice(0, 100000), publicId: "" };
  } else {
    throw new HttpError(400, "Choose a QR image.");
  }
  const saved = await saveDonationQr(uploaded);
  if (previousId && uploaded.publicId && previousId !== uploaded.publicId) {
    await destroyImage(previousId).catch(() => {});
  }
  res.json(saved);
});

export const requests = asyncHandler(async (_req, res) => {
  const rows = await FeatureRequest.find()
    .populate("userId", "name email")
    .populate("reviewedBy", "name")
    .sort({ status: 1, createdAt: -1 })
    .limit(200);
  res.json(rows);
});

export const reviewRequest = asyncHandler(async (req, res) => {
  const status = String(req.body?.status || "");
  if (!["approved", "rejected"].includes(status)) throw new HttpError(400, "Invalid decision.");
  const row = await FeatureRequest.findById(req.params.id);
  if (!row) throw new HttpError(404, "Request not found.");
  row.status = status;
  row.reviewedBy = req.admin._id;
  row.reviewedAt = new Date();
  await row.save();

  if (status === "approved") {
    await FeatureOverride.findOneAndUpdate(
      { userId: row.userId, feature: row.feature },
      { $set: { enabled: true, approvedBy: req.admin._id } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  } else {
    await FeatureOverride.deleteOne({ userId: row.userId, feature: row.feature, approvedBy: req.admin._id });
  }
  res.json({ ok: true, status, request: row });
});

export const overrides = asyncHandler(async (_req, res) => {
  res.json(await FeatureOverride.find().populate("userId", "name email").sort({ createdAt: -1 }).limit(200));
});

export const revokeOverride = asyncHandler(async (req, res) => {
  const result = await FeatureOverride.deleteOne({ _id: req.params.id });
  if (!result.deletedCount) throw new HttpError(404, "Access grant not found.");
  res.json({ ok: true });
});

export const users = asyncHandler(async (_req, res) => {
  res.json(await User.find().select("name email createdAt").sort({ createdAt: -1 }).limit(300));
});

export const donations = asyncHandler(async (_req, res) => {
  const rows = await Donation.find().populate("userId", "name email").sort({ createdAt: -1 }).limit(300);
  const approved = rows.filter((d) => d.status === "approved");
  res.json({
    rows,
    approvedTotal: approved.reduce((s, d) => s + (Number(d.amount) || 0), 0),
    pendingCount: rows.filter((d) => d.status === "pending").length,
  });
});

export const reviewDonation = asyncHandler(async (req, res) => {
  const status = String(req.body?.status || "");
  if (!["approved", "rejected"].includes(status)) throw new HttpError(400, "Invalid decision.");
  const row = await Donation.findById(req.params.id);
  if (!row) throw new HttpError(404, "Donation not found.");
  row.status = status;
  row.reviewedBy = req.admin._id;
  row.reviewedAt = new Date();
  await row.save();
  res.json({ ok: true, donation: row });
});

export const messages = asyncHandler(async (_req, res) => {
  res.json(await ContactMessage.find().sort({ createdAt: -1 }).limit(300));
});

export const reviewMessage = asyncHandler(async (req, res) => {
  const status = String(req.body?.status || "");
  if (!["new", "read", "archived"].includes(status)) throw new HttpError(400, "Invalid status.");
  const row = await ContactMessage.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!row) throw new HttpError(404, "Message not found.");
  res.json(row);
});

export const deleteMessage = asyncHandler(async (req, res) => {
  await ContactMessage.deleteOne({ _id: req.params.id });
  res.json({ ok: true });
});
