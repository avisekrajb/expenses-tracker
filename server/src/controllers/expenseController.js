import mongoose from "mongoose";
import Expense from "../models/Expense.js";
import User from "../models/User.js";
import { asyncHandler, HttpError } from "../middleware/error.js";
import { comparePassword } from "../utils/hashPw.js";
import { validateExpense, isDate } from "../utils/validate.js";
import { uploadImage, destroyImage } from "../config/cloudinary.js";

const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const checkId = (id) => { if (!mongoose.isValidObjectId(id)) throw new HttpError(400, "Invalid expense id."); };

export const list = asyncHandler(async (req, res) => {
  res.json(await Expense.find({ userId: req.userId }).sort({ date: -1, _id: -1 }).limit(20000));
});

export const create = asyncHandler(async (req, res) => {
  const { error, data } = validateExpense(req.body);
  if (error) throw new HttpError(400, error);
  res.status(201).json(await Expense.create({ ...data, userId: req.userId }));
});

export const update = asyncHandler(async (req, res) => {
  checkId(req.params.id);
  const { error, data } = validateExpense(req.body);
  if (error) throw new HttpError(400, error);

  const current = await Expense.findOne({ _id: req.params.id, userId: req.userId }).select("+receiptPublicId");
  if (!current) throw new HttpError(404, "Expense not found.");

  // If the receipt was removed or replaced, delete the old Cloudinary asset.
  let publicId = current.receiptPublicId;
  if (data.receipt !== current.receipt) {
    if (current.receiptPublicId) await destroyImage(current.receiptPublicId);
    publicId = data.receipt ? data.receiptPublicId : null;
  }

  const doc = await Expense.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { ...data, receiptPublicId: publicId },
    { new: true }
  );
  res.json(doc);
});

// Deleting needs the account password.
export const remove = asyncHandler(async (req, res) => {
  checkId(req.params.id);
  const user = await User.findById(req.userId).select("+password");
  if (!user || !(await comparePassword(req.body?.password, user.password))) throw new HttpError(403, "Wrong password.");

  const doc = await Expense.findOne({ _id: req.params.id, userId: req.userId }).select("+receiptPublicId");
  if (!doc) throw new HttpError(404, "Expense not found.");
  await Expense.deleteOne({ _id: doc._id, userId: req.userId });
  if (doc.receiptPublicId) await destroyImage(doc.receiptPublicId);
  res.json({ ok: true });
});

// GET /api/expenses/summary?from=YYYY-MM-DD&to=YYYY-MM-DD
export const summary = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  if (!isDate(from) || !isDate(to) || from > to) throw new HttpError(400, "Provide valid from and to dates.");
  const match = { userId: new mongoose.Types.ObjectId(req.userId), date: { $gte: from, $lte: to } };
  const [byDate, byCategory] = await Promise.all([
    Expense.aggregate([{ $match: match }, { $group: { _id: "$date", total: { $sum: "$amount" }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    Expense.aggregate([{ $match: match }, { $group: { _id: "$category", total: { $sum: "$amount" } } }, { $sort: { total: -1 } }]),
  ]);
  res.json({
    from, to,
    total: r2(byDate.reduce((s, d) => s + d.total, 0)),
    count: byDate.reduce((s, d) => s + d.count, 0),
    byDate: byDate.map((d) => ({ date: d._id, total: r2(d.total), count: d.count })),
    byCategory: byCategory.map((c) => ({ category: c._id, total: r2(c.total) })),
  });
});
