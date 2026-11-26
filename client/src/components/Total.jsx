import React, { useState, useMemo } from "react";
import { BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Pie3, { Tip } from "./Pie3";
import { PERIODS } from "../utils/periods";
import { calc } from "../utils/calc";
import { shiftMonth, monthName } from "../utils/dates";
import { fmt, todayStr } from "../utils/helpers";

export default function Total({ items, days, setDays }) {
  const [month, setMonth] = useState(null);
  const p = useMemo(() => calc(items, month ? { month } : { days }), [items, days, month]);
  const thisMonth = todayStr().slice(0, 7);
  const barData = p.days === 1 ? p.byCat.map((c) => ({ date: c.name, total: c.value })) : p.byDay;
  const unit = p.monthly ? "month" : "day";
  return (
    <div className="ex-page">
      <header><h2>Total</h2><small>{p.monthly ? "Month-wise" : "Date-wise"} report</small></header>
      <div className="ex-chips">
        <button className={month ? "on" : ""} onClick={() => setMonth(month ? null : thisMonth)}>📅 By Month</button>
        {PERIODS.map(([l, d]) => (
          <button key={d} className={!month && days === d ? "on" : ""} onClick={() => { setMonth(null); setDays(d); }}>{l}</button>
        ))}
      </div>
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
          <div><small>Avg / day</small><b>{fmt(p.avg)}</b></div>
          <div><small>Highest {unit}</small><b>{fmt(p.top.total)}</b></div>
          <div><small>Entries</small><b>{p.count}</b></div>
        </div>
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
            <div className="ex-between"><span>{c.icon} {c.name}</span><b>{fmt(c.value)} · {Math.round((c.value / p.total) * 100)}%</b></div>
            <i><u style={{ width: (c.value / p.total) * 100 + "%", background: c.color }} /></i>
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
