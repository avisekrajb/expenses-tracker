import { CATS } from "./categories";
import { MON, rangeOf } from "./dates";
import { r2, short } from "./helpers";
import { divMoney, sumMoney, toCents } from "./money";

export function calc(items, spec) {
  const range = rangeOf(spec);
  const days = range.length;
  const set = new Set(range);
  const inRange = items.filter((e) => set.has(e.date));
  const total = sumMoney(inRange.map((e) => e.amount));
  const monthly = Boolean(spec.month) || days > 31;
  const keyOf = (d) => (monthly ? d.slice(0, 7) : d);
  const order = [], sums = {};
  range.forEach((d) => { const k = keyOf(d); if (!(k in sums)) { sums[k] = 0; order.push(k); } });
  inRange.forEach((e) => { sums[keyOf(e.date)] += toCents(e.amount); });
  const byDay = order.map((k) => ({
    full: k, total: r2(sums[k] / 100),
    date: monthly ? `${MON[+k.slice(5, 7) - 1]} ${k.slice(2, 4)}` : short(k),
  }));
  const byCat = CATS.map((c) => ({
    name: c.n, color: c.c, icon: c.i,
    value: sumMoney(inRange.filter((e) => e.category === c.n).map((e) => e.amount)),
  })).filter((c) => c.value > 0);
  const top = byDay.reduce((m, d) => (d.total > m.total ? d : m), { total: 0, date: "-" });
  // For monthly reports "average" means per month, not per calendar day.
  const avg = monthly ? divMoney(total, order.length || 1) : divMoney(total, days);
  return { range, inRange, total, byDay, byCat, avg, top, count: inRange.length, days, monthly };
}
