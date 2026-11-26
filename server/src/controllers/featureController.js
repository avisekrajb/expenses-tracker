import FeatureRequest from "../models/FeatureRequest.js";
import User from "../models/User.js";
import { FEATURE_KEYS, FEATURES } from "../config/features.js";
import { asyncHandler, HttpError } from "../middleware/error.js";
import { effectiveFeatures, isAdminEmail } from "../services/admin.js";

export const mine = asyncHandler(async (req, res) => {
  const [features, requests, user] = await Promise.all([
    effectiveFeatures(req.userId),
    FeatureRequest.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(30),
    User.findById(req.userId).select("email"),
  ]);
  res.json({
    features,
    requests,
    isAdmin: isAdminEmail(user?.email),
    catalog: FEATURES,
  });
});

export const requestFeature = asyncHandler(async (req, res) => {
  const feature = String(req.body?.feature || "");
  if (!FEATURE_KEYS.includes(feature)) throw new HttpError(400, "Choose a valid feature.");
  const note = String(req.body?.note || "").trim().slice(0, 300);

  const pending = await FeatureRequest.findOne({ userId: req.userId, feature, status: "pending" });
  if (pending) return res.json({ ok: true, request: pending, alreadyPending: true });

  const request = await FeatureRequest.create({ userId: req.userId, feature, note });
  res.status(201).json({ ok: true, request });
});

export const cancelRequest = asyncHandler(async (req, res) => {
  const result = await FeatureRequest.deleteOne({ _id: req.params.id, userId: req.userId, status: "pending" });
  if (!result.deletedCount) throw new HttpError(404, "Pending request not found.");
  res.json({ ok: true });
});
