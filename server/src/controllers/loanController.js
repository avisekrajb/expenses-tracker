import mongoose from "mongoose";
import Loan from "../models/Loan.js";
import { asyncHandler, HttpError } from "../middleware/error.js";
import { validateLoan } from "../utils/validate.js";
import { round2 } from "../utils/money.js";

const r2 = round2;
const ymdLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const checkId = (id) => { if (!mongoose.isValidObjectId(id)) throw new HttpError(400, "Invalid loan id."); };

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const list = asyncHandler(async (req, res) => {
  const match = { userId: req.userId };
  if (req.query.type === "given" || req.query.type === "taken") match.type = req.query.type;
  if (req.query.settled === "true" || req.query.settled === "false") match.settled = req.query.settled === "true";
  if (typeof req.query.q === "string" && req.query.q.trim()) {
    const re = new RegExp(escapeRegex(req.query.q.trim()), "i");
    match.$or = [{ friend: re }, { note: re }];
  }
  // Open records first, then newest first.
  res.json(await Loan.find(match).sort({ settled: 1, date: -1, _id: -1 }).limit(20000));
});

export const summary = asyncHandler(async (req, res) => {
  const uid = new mongoose.Types.ObjectId(req.userId);
  const [rows, overdue] = await Promise.all([
    Loan.aggregate([
      { $match: { userId: uid } },
      {
        $group: {
          _id: { type: "$type", settled: "$settled" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),
    Loan.aggregate([
      { $match: { userId: uid, settled: false, dueDate: { $lt: ymdLocal() } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
  ]);
  const find = (type, settled) => rows.find((x) => x._id.type === type && x._id.settled === settled);
  const value = (type, settled) => find(type, settled)?.total || 0;
  const count = (type, settled) => find(type, settled)?.count || 0;
  const toReceive = r2(value("given", false));
  const toPay = r2(value("taken", false));
  res.json({
    toReceive,
    toPay,
    net: r2(toReceive - toPay),
    received: r2(value("given", true)),
    paid: r2(value("taken", true)),
    overdue: overdue[0]?.count || 0,
    overdueAmount: r2(overdue[0]?.total || 0),
    counts: {
      toReceive: count("given", false),
      toPay: count("taken", false),
      settled: count("given", true) + count("taken", true),
    },
  });
});

export const create = asyncHandler(async (req, res) => {
  const { error, data } = validateLoan(req.body);
  if (error) throw new HttpError(400, error);
  res.status(201).json(await Loan.create({ ...data, userId: req.userId }));
});

export const update = asyncHandler(async (req, res) => {
  checkId(req.params.id);
  const { error, data } = validateLoan(req.body);
  if (error) throw new HttpError(400, error);
  const current = await Loan.findOne({ _id: req.params.id, userId: req.userId });
  if (!current) throw new HttpError(404, "Loan not found.");
  const set = { ...data };
  if (set.settled !== current.settled) set.settledAt = set.settled ? new Date() : null;
  res.json(await Loan.findByIdAndUpdate(req.params.id, { $set: set }, { new: true, runValidators: true }));
});

export const settle = asyncHandler(async (req, res) => {
  checkId(req.params.id);
  const settled = req.body?.settled !== false;
  const current = await Loan.findOne({ _id: req.params.id, userId: req.userId });
  if (!current) throw new HttpError(404, "Loan not found.");
  res.json(await Loan.findByIdAndUpdate(
    req.params.id,
    { $set: { settled, settledAt: settled ? new Date() : null } },
    { new: true }
  ));
});

export const remove = asyncHandler(async (req, res) => {
  checkId(req.params.id);
  const doc = await Loan.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!doc) throw new HttpError(404, "Loan not found.");
  res.json({ ok: true });
});
