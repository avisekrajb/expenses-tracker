import React, { useState, useMemo } from "react";
import { BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Pie3, { Tip } from "./Pie3";
import { PERIODS } from "../utils/periods";
import { calc } from "../utils/calc";
import { shiftMonth, monthName } from "../utils/dates";
import { fmt, todayStr } from "../utils/helpers";
import { deltaPct, pct, sumMoney } from "../utils/money";

export default function Total({ items, days, setDays }) {
  const [month, setMonth] = useState(null);
  const [custom, setCustom] = useState(null);
  const [showCustom, setShowCustom] = useState(false);
  const p = useMemo(() => calc(items, custom || (month ? { month } : { days })), [items, days, month, custom]);
  const thisMonth = todayStr().slice(0, 7);
  const barData = p.days === 1 ? p.byCat.map((c) => ({ date: c.name, total: c.value })) : p.byDay;
  const unit = p.monthly ? "month" : "day";

  const comparison = useMemo(() => {
    const out = [];
    let prev = null;
    for (let i = 5; i >= 0; i--) {
      const m = shiftMonth(thisMonth, -i);
      const total = sumMoney(items.filter((e) => e.date.startsWith(m)).map((e) => e.amount));
      out.push({ month: m, total, delta: prev === null ? null : deltaPct(total, prev) });
      prev = total;
    }
    return out;
  }, [items, thisMonth]);
  return (
    <div className="ex-page">
      <header><h2>Total</h2><small>{p.monthly ? "Month-wise" : "Date-wise"} report</small></header>
      <div className="ex-chips">
        <button className={month ? "on" : ""} onClick={() => { setCustom(null); setShowCustom(false); setMonth(month ? null : thisMonth); }}>📅 By Month</button>
        {PERIODS.map(([l, d]) => (
          <button key={d} className={!month && !custom && days === d ? "on" : ""}
            onClick={() => { setMonth(null); setCustom(null); setShowCustom(false); setDays(d); }}>{l}</button>
        ))}
        <button className={custom ? "on" : ""} onClick={() => setShowCustom((v) => !v)}>🧮 Custom</button>
      </div>
      {showCustom && (
        <div className="ex-card ex-custom-range">
          <div className="ex-filter-row">
            <label><small>From</small><input type="date" max={custom?.to || todayStr()}
              value={custom?.from || ""} onChange={(e) => setCustom({ from: e.target.value, to: custom?.to || "" })} /></label>
            <label><small>To</small><input type="date" max={todayStr()}
              value={custom?.to || ""} onChange={(e) => setCustom({ from: custom?.from || "", to: e.target.value })} /></label>
          </div>
          {custom && <button className="ex-link" onClick={() => setCustom(null)}>Clear custom range</button>}
        </div>
      )}
      {month && (
        <div className="ex-mnav">
          <button onClick={() => setMonth(shiftMonth(month, -1))}>‹</button>
          <b>{monthName(month)}</b>
          <button disabled={month >= thisMonth} onClick={() => setMonth(shiftMonth(month, 1))}>›</button>
        </div>
      )}
      <div className="ex-hero small">
        <small>Total spent</small><h1>{fmt(p.total)}</h1>
        <div className="ex-row">
          <div><small>{p.monthly ? "Avg / month" : "Avg / day"}</small><b>{fmt(p.avg)}</b></div>
          <div><small>Highest {unit}</small><b>{fmt(p.top.total)}</b></div>
          <div><small>Entries</small><b>{p.count}</b></div>
        </div>
      </div>

      <h3>Last 6 months</h3>
      <div className="ex-card ex-compare">
        {comparison.map((row) => (
          <div className="ex-between ex-trow" key={row.month}>
            <span>{monthName(row.month)}</span>
            <span>
              <b>{fmt(row.total)}</b>
              {row.delta !== null && <small className={row.delta > 0 ? "ex-bad" : "ex-good"}>
                {row.delta > 0 ? "+" : ""}{row.delta}%
              </small>}
            </span>
          </div>
        ))}
      </div>

      <h3>Bar graph</h3>
      <div className="ex-card">
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={barData} margin={{ left: -20, right: 8, top: 10 }}>
            <CartesianGrid stroke="#eef0f6" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip content={<Tip />} />
            <Bar dataKey="total" fill="#6d5dfc" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h3>Line graph</h3>
      <div className="ex-card">
        <ResponsiveContainer width="100%" height={190}>
          <LineChart data={p.days === 1 ? [{ date: "Today", total: p.total }] : p.byDay} margin={{ left: -20, right: 12, top: 10 }}>
            <CartesianGrid stroke="#eef0f6" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip content={<Tip />} />
            <Line type="monotone" dataKey="total" stroke="#f43f8e" strokeWidth={3} dot={p.byDay.length < 40} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h3>Pie chart</h3>
      <div className="ex-card">
        <Pie3 data={p.byCat} />
        {[...p.byCat].sort((a, b) => b.value - a.value).map((c) => (
          <div key={c.name} className="ex-bar">
            <div className="ex-between"><span>{c.icon} {c.name}</span><b>{fmt(c.value)} · {pct(c.value, p.total)}%</b></div>
            <i><u style={{ width: pct(c.value, p.total) + "%", background: c.color }} /></i>
          </div>
        ))}
      </div>

      <h3>{p.monthly ? "Month-wise" : "Date-wise"}</h3>
      <div className="ex-card">
        {[...p.byDay].reverse().map((d) => (
          <div key={d.full} className="ex-between ex-trow">
            <span>{p.monthly ? monthName(d.full) : new Date(d.full + "T00:00").toDateString()}</span>
            <b style={{ opacity: d.total ? 1 : 0.4 }}>{fmt(d.total)}</b>
          </div>
        ))}
        <div className="ex-between ex-trow ex-sum"><span>Grand total</span><b>{fmt(p.total)}</b></div>
      </div>
    </div>
  );
}
