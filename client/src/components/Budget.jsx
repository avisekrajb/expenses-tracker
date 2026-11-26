import React, { useEffect, useMemo, useState } from "react";
import { CATS } from "../utils/categories";
import { getBudget, saveBudget, deleteBudget } from "../services/budgets";
import { shiftMonth, monthName } from "../utils/dates";
import { fmt, r2, todayStr } from "../utils/helpers";

export default function Budget({ items }) {
  const thisMonth = todayStr().slice(0, 7);
  const [month, setMonth] = useState(thisMonth);
  const [overall, setOverall] = useState("");
  const [cats, setCats] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setMsg("");
    setErr("");
    getBudget(month)
      .then((b) => {
        if (!alive) return;
        setOverall(b.overall ? String(b.overall) : "");
        setCats(b.categories || {});
      })
      .catch((e) => alive && setErr(e.message))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [month]);

  const monthItems = useMemo(() => items.filter((e) => e.date.startsWith(month)), [items, month]);
  const spent = r2(monthItems.reduce((s, e) => s + e.amount, 0));
  const spentBy = (name) => r2(monthItems.filter((e) => e.category === name).reduce((s, e) => s + e.amount, 0));

  const overallNum = Number(overall) || 0;
  const pct = overallNum > 0 ? Math.min(100, (spent / overallNum) * 100) : 0;
  const remaining = r2(overallNum - spent);
  const allocated = r2(CATS.reduce((s, c) => s + (Number(cats[c.n]) || 0), 0));
  const hasBudget = overallNum > 0 || allocated > 0;

  const setCat = (name, v) => setCats((p) => ({ ...p, [name]: v }));

  const save = async () => {
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      const body = {
        overall: Number(overall) || 0,
        categories: Object.fromEntries(CATS.map((c) => [c.n, Number(cats[c.n]) || 0])),
      };
      const b = await saveBudget(month, body);
      setOverall(b.overall ? String(b.overall) : "");
      setCats(b.categories || {});
      setMsg("Budget saved.");
    } catch (e) {
      setErr(e.message);
    }
    setBusy(false);
  };

  const clear = async () => {
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      await deleteBudget(month);
      setOverall("");
      setCats({});
      setMsg("Budget cleared for this month.");
    } catch (e) {
      setErr(e.message);
    }
    setBusy(false);
  };

  return (
    <div className="ex-page">
      <header><h2>Budget</h2><small>Plan your month and get alerts</small></header>

      <div className="ex-mnav">
        <button onClick={() => setMonth(shiftMonth(month, -1))}>‹</button>
        <b>{monthName(month)}</b>
        <button disabled={month >= thisMonth} onClick={() => setMonth(shiftMonth(month, 1))}>›</button>
      </div>

      {loading ? (
        <div className="ex-empty">Loading budget…</div>
      ) : (
        <>
          <div className="ex-card ex-budget-summary">
            <div className="ex-between"><small>Overall monthly budget</small><b>{overallNum ? fmt(overallNum) : "Not set"}</b></div>
            <input inputMode="decimal" placeholder="Set overall monthly budget"
              value={overall} onChange={(e) => { setOverall(e.target.value.replace(/[^\d.]/g, "")); setMsg(""); }} />
            {overallNum > 0 && (
              <>
                <div className={"ex-progress" + (spent > overallNum ? " over" : "")}>
                  <i style={{ width: pct + "%", background: spent > overallNum ? "#ef4444" : pct > 80 ? "#f59e0b" : "#22c55e" }} />
                </div>
                <div className="ex-between">
                  <small>{fmt(spent)} spent</small>
                  <small>{remaining >= 0 ? `${fmt(remaining)} left` : `${fmt(-remaining)} over`}</small>
                </div>
                {spent > overallNum && <div className="ex-alert">⚠️ You are over budget by {fmt(spent - overallNum)}.</div>}
                {spent <= overallNum && pct >= 80 && <div className="ex-alert warn">⚠️ You have used {Math.round(pct)}% of this month's budget.</div>}
              </>
            )}
          </div>

          <h3>Category limits</h3>
          <div className="ex-card">
            {CATS.map((c) => {
              const lim = Number(cats[c.n]) || 0;
              const s = spentBy(c.n);
              const p = lim > 0 ? Math.min(100, (s / lim) * 100) : 0;
              return (
                <div className="ex-budget-row" key={c.n}>
                  <span style={{ background: c.c + "25" }}>{c.i}</span>
                  <div className="ex-budget-main">
                    <div className="ex-between"><b>{c.n}</b><small>{fmt(s)}{lim > 0 ? ` / ${fmt(lim)}` : ""}</small></div>
                    {lim > 0 && (
                      <div className="ex-progress small">
                        <i style={{ width: p + "%", background: s > lim ? "#ef4444" : c.c }} />
                      </div>
                    )}
                  </div>
                  <input className="ex-budget-input" inputMode="decimal" placeholder="—"
                    value={cats[c.n] ?? ""} onChange={(e) => { setCat(c.n, e.target.value.replace(/[^\d.]/g, "")); setMsg(""); }} />
                </div>
              );
            })}
            <div className="ex-between ex-trow"><span>Total category limits</span><b>{fmt(allocated)}</b></div>
          </div>

          {overallNum > 0 && allocated > overallNum && (
            <div className="ex-alert">⚠️ Category limits are {fmt(allocated - overallNum)} higher than your overall budget.</div>
          )}
          {msg && <div className="ex-ok">{msg}</div>}
          {err && <div className="ex-err">{err}</div>}

          <button className="ex-btn" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save budget"}</button>
          {hasBudget && <button className="ex-btn plain" disabled={busy} onClick={clear}>Clear this month's budget</button>}
        </>
      )}
    </div>
  );
}
