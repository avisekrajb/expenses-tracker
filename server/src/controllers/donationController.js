import Donation from "../models/Donation.js";
import { asyncHandler, HttpError } from "../middleware/error.js";
import { round2 } from "../utils/money.js";

const METHODS = ["esewa", "bank", "other"];

export const create = asyncHandler(async (req, res) => {
  const amount = round2(Number(req.body?.amount));
  if (!(amount > 0) || amount > 1e7) throw new HttpError(400, "Enter a valid donation amount.");
  const method = METHODS.includes(req.body?.method) ? req.body.method : "esewa";
  const note = String(req.body?.note || "").trim().slice(0, 200);
  const doc = await Donation.create({ userId: req.userId, amount, method, note });
  res.status(201).json(doc);
});

export const mine = asyncHandler(async (req, res) => {
  const rows = await Donation.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(100);
  const total = round2(rows.reduce((s, d) => s + Number(d.amount) || 0, 0));
  res.json({ rows, total, count: rows.length });
});

export const stats = asyncHandler(async (_req, res) => {
  const [result] = await Donation.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);
  res.set("Cache-Control", "public, max-age=300");
  res.json({ total: round2(result?.total || 0), count: result?.count || 0 });
});
