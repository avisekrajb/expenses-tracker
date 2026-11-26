import Donation from "../models/Donation.js";
import { asyncHandler, HttpError } from "../middleware/error.js";
import { round2 } from "../utils/money.js";
import { uploadImage } from "../config/cloudinary.js";

const METHODS = ["esewa", "bank", "other"];

// A payment screenshot is required so the pledge can be verified by an admin.
// Accepts multipart ("screenshot") or JSON { screenshotUrl } from a prior upload.
export const create = asyncHandler(async (req, res) => {
  const amount = round2(Number(req.body?.amount));
  if (!(amount > 0) || amount > 1e7) throw new HttpError(400, "Enter a valid donation amount.");
  const method = METHODS.includes(req.body?.method) ? req.body.method : "esewa";
  const note = String(req.body?.note || "").trim().slice(0, 200);

  let screenshot = null;
  if (req.file) {
    screenshot = await uploadImage(req.file.buffer, "kharcha/donations");
    if (!screenshot) {
      screenshot = {
        url: `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        publicId: null,
      };
    }
  } else {
    const url = String(req.body?.screenshotUrl || "").trim();
    if (!/^(https?:\/\/|data:image\/)/.test(url)) {
      throw new HttpError(400, "Upload a screenshot of your payment to record the pledge.");
    }
    screenshot = { url: url.slice(0, 100000), publicId: String(req.body?.screenshotPublicId || "").slice(0, 200) };
  }

  const doc = await Donation.create({
    userId: req.userId,
    amount,
    method,
    note,
    screenshot,
  });
  res.status(201).json(doc);
});

export const mine = asyncHandler(async (req, res) => {
  const rows = await Donation.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(100);
  const approved = rows.filter((d) => d.status === "approved");
  res.json({
    rows,
    total: round2(rows.reduce((s, d) => s + (Number(d.amount) || 0), 0)),
    approvedTotal: round2(approved.reduce((s, d) => s + (Number(d.amount) || 0), 0)),
    count: rows.length,
  });
});

// Public impact counter only includes pledges verified by an admin.
export const stats = asyncHandler(async (_req, res) => {
  const [result] = await Donation.aggregate([
    { $match: { status: "approved" } },
    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);
  res.set("Cache-Control", "public, max-age=30");
  res.json({ total: round2(result?.total || 0), count: result?.count || 0 });
});
