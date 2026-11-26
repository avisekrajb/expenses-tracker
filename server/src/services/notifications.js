import { setVapidDetails, sendNotification } from "web-push";
import { env } from "../config/env.js";
import PushSubscription from "../models/PushSubscription.js";
import NotificationLog from "../models/NotificationLog.js";
import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import Loan from "../models/Loan.js";
import mongoose from "mongoose";

if (env.pushEnabled) {
  setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
}

const ymd = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const pushConfig = () => ({
  enabled: env.pushEnabled,
  publicKey: env.VAPID_PUBLIC_KEY,
});

export async function sendToUser(userId, payload, tag) {
  if (!env.pushEnabled) return 0;
  const subs = await PushSubscription.find({ userId });
  let sent = 0;
  for (const sub of subs) {
    try {
      await sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } },
        JSON.stringify({ ...payload, tag: tag || payload.tag || "kharcha", url: payload.url || "/#/home" })
      );
      sent++;
    } catch (err) {
      if ([404, 410].includes(err.statusCode)) await PushSubscription.deleteOne({ _id: sub._id });
      else console.error("push failed:", err.message);
    }
  }
  return sent;
}

async function once(userId, key, payload) {
  try {
    await NotificationLog.create({ userId, key });
  } catch {
    return 0; // already sent today / this month
  }
  return sendToUser(userId, payload, key);
}

// Computes the alerts worth sending and de-duplicates them by day/month.
export async function checkAlerts(userId) {
  if (!env.pushEnabled) return { sent: 0, disabled: true };
  const today = ymd();
  const month = today.slice(0, 7);
  const uid = new mongoose.Types.ObjectId(userId);
  let sent = 0;

  const [budget, spentRows, overdueRows] = await Promise.all([
    Budget.findOne({ userId: uid, month }).lean(),
    Expense.aggregate([
      { $match: { userId: uid, date: { $gte: `${month}-01`, $lte: `${month}-31` } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Loan.aggregate([
      { $match: { userId: uid, settled: false, dueDate: { $lt: today } } },
      { $group: { _id: null, count: { $sum: 1 }, total: { $sum: "$amount" } } },
    ]),
  ]);

  const limit = Number(budget?.overall) || 0;
  const spent = Number(spentRows[0]?.total) || 0;
  if (limit > 0 && spent >= limit) {
    sent += await once(userId, `budget:${month}:over`, {
      title: "Monthly budget exceeded 🚨",
      body: `You have spent Rs ${spent.toFixed(2)} against a Rs ${limit.toFixed(2)} budget.`,
      url: "/#/budget",
    });
  } else if (limit > 0 && spent >= limit * 0.8) {
    sent += await once(userId, `budget:${month}:80`, {
      title: "80% of your budget used",
      body: `Rs ${(limit - spent).toFixed(2)} left this month. Slow down a little.`,
      url: "/#/home",
    });
  }

  const overdue = overdueRows[0]?.count || 0;
  if (overdue > 0) {
    sent += await once(userId, `overdue:${today}`, {
      title: `${overdue} friend loan${overdue === 1 ? "" : "s"} overdue`,
      body: `Rs ${Number(overdueRows[0].total).toFixed(2)} is past its return-by date.`,
      url: "/#/loans",
    });
  }

  const recurring = await Expense.find({
    userId: uid, recurring: true, date: { $lt: `${month}-01` },
  }).lean();
  const thisMonth = await Expense.find({ userId: uid, date: { $gte: `${month}-01` } }).lean();
  const due = recurring.filter((e) => !thisMonth.some((x) =>
    x.category === e.category && Number(x.amount) === Number(e.amount) && (x.desc || "") === (e.desc || "")));
  if (due.length) {
    sent += await once(userId, `recurring:${month}`, {
      title: `${due.length} recurring expense${due.length === 1 ? "" : "s"} due`,
      body: `Add this month's repeats from Home in one tap.`,
      url: "/#/home",
    });
  }

  return { sent };
}

export async function notifyAll() {
  const subs = await PushSubscription.distinct("userId");
  let sent = 0;
  for (const userId of subs) {
    try { sent += (await checkAlerts(userId)).sent || 0; }
    catch (err) { console.error("alert check failed:", err.message); }
  }
  return { users: subs.length, sent };
}

// Admin announcements go to every device that has a saved push subscription.
// The in-app list is stored separately, so users without push still see it.
export async function broadcast(payload, tag) {
  if (!env.pushEnabled) return { users: 0, sent: 0, disabled: true };
  const users = await PushSubscription.distinct("userId");
  let sent = 0;
  for (const userId of users) {
    try { sent += await sendToUser(userId, payload, tag); }
    catch (err) { console.error("announcement push failed:", err.message); }
  }
  return { users: users.length, sent };
}
