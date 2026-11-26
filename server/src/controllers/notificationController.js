import PushSubscription from "../models/PushSubscription.js";
import { asyncHandler, HttpError } from "../middleware/error.js";
import { pushConfig, sendToUser, checkAlerts, notifyAll } from "../services/notifications.js";
import { env } from "../config/env.js";

export const config = asyncHandler(async (_req, res) => res.json(pushConfig()));

export const subscribe = asyncHandler(async (req, res) => {
  const s = req.body?.subscription || {};
  const endpoint = String(s.endpoint || "");
  const p256dh = String(s.keys?.p256dh || "");
  const auth = String(s.keys?.auth || "");
  if (!/^https?:\/\//.test(endpoint) || !p256dh || !auth) throw new HttpError(400, "Invalid push subscription.");
  await PushSubscription.findOneAndUpdate(
    { endpoint },
    { $set: { userId: req.userId, endpoint, keys: { p256dh, auth }, device: String(req.body?.device || "This device").slice(0, 80) } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json({ ok: true, enabled: env.pushEnabled });
});

export const unsubscribe = asyncHandler(async (req, res) => {
  const endpoint = String(req.body?.endpoint || "");
  await PushSubscription.deleteOne({ endpoint, userId: req.userId });
  res.json({ ok: true });
});

export const list = asyncHandler(async (req, res) => {
  const rows = await PushSubscription.find({ userId: req.userId }).select("endpoint device createdAt");
  res.json(rows);
});

export const test = asyncHandler(async (req, res) => {
  const sent = await sendToUser(req.userId, {
    title: "Kharcha test notification 🔔",
    body: "Device notifications are working. You will get budget, loan and recurring alerts here.",
    url: "/#/home",
  }, "test");
  res.json({ ok: true, sent, enabled: env.pushEnabled });
});

export const check = asyncHandler(async (req, res) => res.json(await checkAlerts(req.userId)));

export const cron = asyncHandler(async (req, res) => {
  const secret = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "") || String(req.query.secret || "");
  if (!env.CRON_SECRET || secret !== env.CRON_SECRET) throw new HttpError(401, "Invalid cron secret.");
  res.json({ ok: true, ...(await notifyAll()) });
});
