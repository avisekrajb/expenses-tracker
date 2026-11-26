import { pad, todayStr, daysBack } from "./helpers";

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
export const rangeOf = (spec) => {
  if (spec.month) {
    const [y, m] = spec.month.split("-").map(Number);
    const n = new Date(y, m, 0).getDate();
    return Array.from({ length: n }, (_, i) => `${y}-${pad(m)}-${pad(i + 1)}`).filter((d) => d <= todayStr());
  }
  return daysBack(spec.days);
};
