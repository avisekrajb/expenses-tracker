import Budget from "../models/Budget.js";
import { asyncHandler, HttpError } from "../middleware/error.js";
import { isMonth, validateBudget } from "../utils/validate.js";

const empty = (month) => ({ month, overall: 0, categories: {} });

export const getBudget = asyncHandler(async (req, res) => {
  const { month } = req.params;
  if (!isMonth(month)) throw new HttpError(400, "Month must look like YYYY-MM.");
  const doc = await Budget.findOne({ userId: req.userId, month });
  res.json(doc || empty(month));
});

export const saveBudget = asyncHandler(async (req, res) => {
  const { month } = req.params;
  if (!isMonth(month)) throw new HttpError(400, "Month must look like YYYY-MM.");
  const { error, data } = validateBudget(req.body);
  if (error) throw new HttpError(400, error);

  const doc = await Budget.findOneAndUpdate(
    { userId: req.userId, month },
    { $set: { ...data, userId: req.userId, month } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json(doc);
});

export const deleteBudget = asyncHandler(async (req, res) => {
  const { month } = req.params;
  if (!isMonth(month)) throw new HttpError(400, "Month must look like YYYY-MM.");
  await Budget.deleteOne({ userId: req.userId, month });
  res.json({ ok: true });
});
