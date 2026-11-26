import React, { useEffect, useMemo, useState } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Chips from "./Chips";
import Pie3, { Tip } from "./Pie3";
import Insights from "./Insights";
import { CATS } from "../utils/categories";
import { calc } from "../utils/calc";
import { fmt, r2, pad, todayStr } from "../utils/helpers";
import { daysLeftInMonth } from "../utils/dates";
import { pct, round2 } from "../utils/money";
import { getBudget } from "../services/budgets";
import { summary as loanSummary } from "../services/loans";

export default function Home({ user, items, days, setDays, goBudget, goLoans, quickAdd, addRecurring }) {
  const t = calc(items, { days: 1 });
  const w = calc(items, { days: 7 });
  const now = new Date();
  const monthKey = todayStr().slice(0, 7);
  const monthItems = items.filter((e) => e.date.startsWith(`${now.getFullYear()}-${pad(now.getMonth() + 1)}`));
  const monthTotal = r2(monthItems.reduce((s, e) => s + e.amount, 0));
  const p = calc(items, { days });
  const hr = now.getHours();

  const [budget, setBudget] = useState(null);
  useEffect(() => {
    let alive = true;
    getBudget(monthKey).then((b) => alive && setBudget(b)).catch(() => alive && setBudget(null));
    return () => { alive = false; };
  }, [monthKey]);

  const [loanSum, setLoanSum] = useState(null);
  useEffect(() => {
    let alive = true;
    loanSummary().then((s) => alive && setLoanSum(s)).catch(() => alive && setLoanSum(null));
    return () => { alive = false; };
  }, []);

  const limit = Number(budget?.overall) || 0;
  const left = r2(limit - monthTotal);
  const budgetPct = limit > 0 ? Math.min(100, (monthTotal / limit) * 100) : 0;
  const overCats = budget
    ? CATS.filter((c) => {
        const lim = Number(budget.categories?.[c.n]) || 0;
        if (!lim) return false;
        const spent = monthItems.filter((e) => e.category === c.n).reduce((s, e) => s + e.amount, 0);
        return spent > lim;
      })
    : [];

  // Daily allowance, pace and quick-add favourites (derived from your own history).
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = daysLeftInMonth();
  const allowance = left > 0 ? round2(left / daysLeft) : 0;
  const expected = limit > 0 ? round2(limit * (now.getDate() / daysInMonth)) : 0;
  const pace = round2(monthTotal - expected);

  const favorites = useMemo(() => {
    const map = new Map();
    items.forEach((e) => {
      const cur = map.get(e.category) || { count: 0, date: "", amount: e.amount };
      cur.count += 1;
      if (e.date >= cur.date) { cur.date = e.date; cur.amount = e.amount; }
      map.set(e.category, cur);
    });
    return [...map.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 3)
      .map(([category, v]) => ({ category, amount: v.amount, count: v.count }));
  }, [items]);

  const recurringDue = useMemo(() => {
    const thisMonth = `${monthKey}-`;
    const recurring = items.filter((e) => e.recurring && e.date < thisMonth);
    return recurring.filter((e) => !items.some((x) =>
      x.date.startsWith(thisMonth) && x.category === e.category &&
      x.amount === e.amount && (x.desc || "") === (e.desc || "")));
  }, [items, monthKey]);

  return (
    <div className="ex-page">
      <header>
        <small>{hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening"} 👋</small>
        <h2>{user?.name}</h2>
      </header>
      <div className="ex-hero">
        <small>Spent this month</small>
        <h1>{fmt(monthTotal)}</h1>
        <div className="ex-row">
          <div><small>Today</small><b>{fmt(t.total)}</b></div>
          <div><small>Last 7 days</small><b>{fmt(w.total)}</b></div>
        </div>
      </div>

      {budget && limit > 0 && (
        <div className={"ex-card ex-budget-banner" + (monthTotal > limit ? " over" : "")}>
          <div className="ex-between">
            <b>Monthly budget</b>
            <small>{fmt(monthTotal)} / {fmt(limit)}</small>
          </div>
          <div className={"ex-progress" + (monthTotal > limit ? " over" : "")}>
            <i style={{ width: budgetPct + "%", background: monthTotal > limit ? "#ef4444" : budgetPct > 80 ? "#f59e0b" : "#22c55e" }} />
          </div>
          <div className="ex-between">
            <small>{monthTotal > limit ? `Over by ${fmt(-left)}` : `${fmt(left)} remaining`}</small>
            <small>{pct(monthTotal, limit)}%</small>
          </div>
          {monthTotal <= limit && (
            <div className="ex-between ex-pace">
              <small>{fmt(allowance)}/day for {daysLeft} days left</small>
              <small className={pace > 0 ? "ex-bad" : "ex-good"}>
                {pace > 0 ? `${fmt(pace)} ahead of pace` : `${fmt(-pace)} under pace`}
              </small>
            </div>
          )}
          {overCats.length > 0 && (
            <div className="ex-alert">⚠️ Over category limit: {overCats.map((c) => c.i + " " + c.n).join(", ")}</div>
          )}
        </div>
      )}
      {budget && limit === 0 && (
        <button className="ex-budget-cta" onClick={goBudget}>
          🎯 Set a monthly budget and get alerts <span>›</span>
        </button>
      )}
      {loanSum && (Number(loanSum.toReceive) > 0 || Number(loanSum.toPay) > 0 || Number(loanSum.overdue) > 0) && (
        <button className="ex-budget-cta ex-loan-cta" onClick={goLoans}>
          🤝 Friends · {fmt(loanSum.toReceive)} to receive / {fmt(loanSum.toPay)} to pay
          {Number(loanSum.overdue) > 0 ? ` · ⚠️ ${loanSum.overdue} overdue` : ""} <span>›</span>
        </button>
      )}

      {favorites.length > 0 && (
        <>
          <h3>Quick add</h3>
          <div className="ex-quick">
            {favorites.map((f) => (
              <button key={f.category} onClick={() => quickAdd(f)}>
                <b>＋ {f.category}</b><small>{fmt(f.amount)} · used {f.count}×</small>
              </button>
            ))}
          </div>
        </>
      )}

      {recurringDue.length > 0 && (
        <div className="ex-card ex-rec-card">
          <div className="ex-between"><b>↻ Recurring this month</b><small>{recurringDue.length} due</small></div>
          <small>Add your monthly repeats in one tap.</small>
          {recurringDue.slice(0, 4).map((e) => (
            <div className="ex-between ex-rec-row" key={e.id}>
              <span>{e.category} · {fmt(e.amount)}</span>
              <small>{e.desc || "monthly"}</small>
            </div>
          ))}
          <button className="ex-btn" onClick={() => addRecurring(recurringDue)}>Add all for this month</button>
        </div>
      )}

      <Insights items={items} />

      <h3>Spending trend</h3>
      <Chips days={days} setDays={setDays} />
      <div className="ex-card">
        <div className="ex-between"><span>Total</span><b>{fmt(p.total)}</b></div>
        {days === 1 ? <Pie3 data={p.byCat} /> : (
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={p.byDay} margin={{ left: -20, right: 8, top: 10 }}>
              <CartesianGrid stroke="#eef0f6" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<Tip />} />
              <Line type="monotone" dataKey="total" stroke="#6d5dfc" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      <h3>Categories</h3>
      <div className="ex-grid">
        {CATS.map((c) => {
          const v = p.byCat.find((x) => x.name === c.n)?.value || 0;
          return (
            <div key={c.n} className="ex-cat" style={{ background: c.c + "18" }}>
              <span style={{ background: c.c + "30" }}>{c.i}</span>
              <small>{c.n}</small><b>{fmt(v)}</b>
            </div>
          );
        })}
      </div>
    </div>
  );
}
