import { round2 } from "./money.js";

export const CATS = ["Travel", "Eating", "Hostel Rent", "Water", "Clothes", "Medicine", "Hair Cut", "Recharge", "Home", "Others"];
export const LOAN_TYPES = ["given", "taken"];

export const isEmail = (v) => typeof v === "string" && /^\S+@\S+\.\S+$/.test(v.trim());
export const isDate = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
export const isMonth = (v) => typeof v === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(v);

export const validateSignup = ({ name, email, password } = {}) => {
  if (typeof name !== "string" || !name.trim()) return "Enter your name.";
  if (!isEmail(email)) return "Enter a valid email address.";
  if (typeof password !== "string" || password.length < 6) return "Password needs at least 6 characters.";
  return null;
};

const cleanReceipt = (v) => {
  if (typeof v !== "string" || !v) return null;
  // Cloudinary / any https URL, or an inline image data URL (local fallback).
  if (/^https?:\/\/\S+$/i.test(v) || /^data:image\/(jpeg|png|webp|gif);base64,/i.test(v)) return v.slice(0, 3000000);
  return null;
};

const cleanPublicId = (v) => (typeof v === "string" && /^kharcha\/[A-Za-z0-9_./-]{1,240}$/.test(v) ? v : null);

const cleanTags = (v) => {
  const arr = Array.isArray(v) ? v : typeof v === "string" ? v.split(",") : [];
  const out = [];
  for (const t of arr) {
    const s = String(t || "").trim().replace(/^#/, "").slice(0, 20);
    if (s && !out.some((x) => x.toLowerCase() === s.toLowerCase())) out.push(s);
    if (out.length === 5) break;
  }
  return out;
};

export const validateExpense = (b = {}) => {
  const amount = round2(Number(b.amount));
  if (!(amount > 0) || amount > 1e9) return { error: "Enter a valid amount." };
  if (!CATS.includes(b.category)) return { error: "Choose a valid category." };
  if (!isDate(b.date)) return { error: "Choose a valid date." };
  return {
    data: {
      amount,
      category: b.category,
      date: b.date,
      desc: String(b.desc || "").trim().slice(0, 200),
      tags: cleanTags(b.tags),
      recurring: b.recurring === true,
      receipt: cleanReceipt(b.receipt),
      receiptPublicId: cleanReceipt(b.receipt) ? cleanPublicId(b.receiptPublicId) : null,
    },
  };
};

export const validateBudget = (b = {}) => {
  const overall = Number(b.overall || 0);
  if (!Number.isFinite(overall) || overall < 0 || overall > 1e9) return { error: "Enter a valid overall budget." };
  const src = b.categories && typeof b.categories === "object" ? b.categories : {};
  const categories = {};
  for (const name of CATS) {
    if (!(name in src)) continue;
    const v = Number(src[name] || 0);
    if (!Number.isFinite(v) || v < 0 || v > 1e9) return { error: `Enter a valid budget for ${name}.` };
    if (v > 0) categories[name] = round2(v);
  }
  return { data: { overall: round2(overall), categories } };
};

// Money given to a friend (they owe you) or taken from a friend (you owe them).
export const validateLoan = (b = {}) => {
  const amount = round2(Number(b.amount));
  if (!(amount > 0) || amount > 1e9) return { error: "Enter a valid amount." };
  if (!LOAN_TYPES.includes(b.type)) return { error: "Choose whether you gave or took the money." };
  const friend = String(b.friend || "").trim().slice(0, 60);
  if (!friend) return { error: "Enter your friend's name." };
  if (!isDate(b.date)) return { error: "Choose a valid date." };
  let dueDate = null;
  if (b.dueDate) {
    if (!isDate(b.dueDate)) return { error: "Choose a valid due date." };
    dueDate = b.dueDate;
  }
  const note = String(b.note || "").trim().slice(0, 200);
  return {
    data: { amount, type: b.type, friend, date: b.date, dueDate, note, settled: b.settled === true },
  };
};
