import { pad, todayStr, daysBack, ymd } from "./helpers";

export const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const shiftMonth = (k, n) => {
  const [y, m] = k.split("-").map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};
export const monthName = (k) => {
  const [y, m] = k.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en", { month: "long", year: "numeric" });
};

export const datesBetween = (from, to) => {
  if (!from || !to || from > to) return daysBack(1);
  const out = [];
  const d = new Date(from + "T00:00:00");
  const end = new Date(to + "T00:00:00");
  let guard = 0;
  while (d <= end && guard++ < 5000) {
    out.push(ymd(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
};

export const rangeOf = (spec) => {
  if (spec.from && spec.to) return datesBetween(spec.from, spec.to);
  if (spec.month) {
    const [y, m] = spec.month.split("-").map(Number);
    const n = new Date(y, m, 0).getDate();
    return Array.from({ length: n }, (_, i) => `${y}-${pad(m)}-${pad(i + 1)}`).filter((d) => d <= todayStr());
  }
  return daysBack(spec.days);
};

export const daysLeftInMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate() + 1;
};
