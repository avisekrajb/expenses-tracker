import { CATS } from "./categories";
import { MON, rangeOf } from "./dates";
import { r2, short } from "./helpers";

export function calc(items, spec) {
  const range = rangeOf(spec);
  const days = range.length;
  const set = new Set(range);
  const inRange = items.filter((e) => set.has(e.date));
  const total = r2(inRange.reduce((s, e) => s + e.amount, 0));
  const monthly = days > 31;
  const keyOf = (d) => (monthly ? d.slice(0, 7) : d);
  const order = [], sums = {};
  range.forEach((d) => { const k = keyOf(d); if (!(k in sums)) { sums[k] = 0; order.push(k); } });
  inRange.forEach((e) => { sums[keyOf(e.date)] += e.amount; });
  const byDay = order.map((k) => ({
    full: k, total: r2(sums[k]),
    date: monthly ? `${MON[+k.slice(5, 7) - 1]} ${k.slice(2, 4)}` : short(k),
  }));
  const byCat = CATS.map((c) => ({
    name: c.n, color: c.c, icon: c.i,
    value: r2(inRange.filter((e) => e.category === c.n).reduce((s, e) => s + e.amount, 0)),
  })).filter((c) => c.value > 0);
  const top = byDay.reduce((m, d) => (d.total > m.total ? d : m), { total: 0, date: "-" });
  return { range, inRange, total, byDay, byCat, avg: r2(total / days), top, count: inRange.length, days, monthly };
}
