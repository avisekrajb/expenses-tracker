import React from "react";
import { CATS } from "../utils/categories";
import { pad, r2, fmt, ymd } from "../utils/helpers";
import { shiftMonth } from "../utils/dates";

export default function Insights({ items }) {
  const now = new Date();
  const month = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  const lastMonth = shiftMonth(month, -1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();

  const thisItems = items.filter((e) => e.date.startsWith(month));
  const lastItems = items.filter((e) => e.date.startsWith(lastMonth));
  const total = r2(thisItems.reduce((s, e) => s + e.amount, 0));
  const lastTotal = r2(lastItems.reduce((s, e) => s + e.amount, 0));
  const delta = lastTotal > 0 ? Math.round(((total - lastTotal) / lastTotal) * 100) : null;

  const byCat = CATS.map((c) => ({
    ...c,
    value: r2(thisItems.filter((e) => e.category === c.n).reduce((s, e) => s + e.amount, 0)),
  }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);
  const top = byCat[0];

  const biggest = thisItems.reduce((m, e) => (e.amount > m.amount ? e : m), { amount: 0, category: "—" });
  const activeDays = new Set(thisItems.map((e) => e.date)).size;
  const avg = r2(total / dayOfMonth);
  const projected = r2(avg * daysInMonth);

  const dates = new Set(items.map((e) => e.date));
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (!dates.has(ymd(d))) break;
    streak++;
  }

  const tip = top
    ? `${top.i} ${top.n} is your biggest category this month — ${fmt(top.value)} (${Math.round((top.value / (total || 1)) * 100)}% of spending).`
    : "Add a few expenses to unlock personalised insights.";

  return (
    <>
      <h3>Insights</h3>
      <div className="ex-card">
        <div className="ex-insights">
          <div className="ex-insight">
            <small>vs last month</small>
            <b className={delta === null ? "" : delta > 0 ? "bad" : "good"}>
              {delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta}%`}
            </b>
          </div>
          <div className="ex-insight">
            <small>Daily average</small>
            <b>{fmt(avg)}</b>
          </div>
          <div className="ex-insight">
            <small>Projected month</small>
            <b>{fmt(projected)}</b>
          </div>
          <div className="ex-insight">
            <small>Biggest expense</small>
            <b>{fmt(biggest.amount)}</b>
          </div>
          <div className="ex-insight">
            <small>Active days</small>
            <b>{activeDays}/{dayOfMonth}</b>
          </div>
          <div className="ex-insight">
            <small>Add streak</small>
            <b>{streak ? `🔥 ${streak}d` : "—"}</b>
          </div>
        </div>
        <div className="ex-note">💡 {tip}</div>
      </div>
    </>
  );
}
