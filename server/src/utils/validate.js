export const CATS = ["Travel", "Eating", "Hostel Rent", "Water", "Clothes", "Medicine", "Hair Cut", "Recharge", "Home", "Others"];

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

export const validateExpense = (b = {}) => {
  const amount = Math.round(Number(b.amount) * 100) / 100;
  if (!(amount > 0) || amount > 1e9) return { error: "Enter a valid amount." };
  if (!CATS.includes(b.category)) return { error: "Choose a valid category." };
  if (!isDate(b.date)) return { error: "Choose a valid date." };
  return {
    data: {
      amount,
      category: b.category,
      date: b.date,
      desc: String(b.desc || "").trim().slice(0, 200),
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
    if (v > 0) categories[name] = Math.round(v * 100) / 100;
  }
  return { data: { overall: Math.round(overall * 100) / 100, categories } };
};
