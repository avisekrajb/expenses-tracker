import React, { useEffect, useMemo, useState } from "react";
import * as loanApi from "../services/loans";
import LoanSheet from "./LoanSheet";
import { fmt, r2, todayStr } from "../utils/helpers";

const FILTERS = [
  ["all", "All"],
  ["given", "To receive"],
  ["taken", "To pay"],
  ["overdue", "Overdue"],
  ["settled", "Settled"],
];

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [sum, setSum] = useState({ toReceive: 0, toPay: 0, net: 0, counts: {} });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [sheet, setSheet] = useState(null);
  const [delId, setDelId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const fetchAll = async () => {
    const [rows, s] = await Promise.all([loanApi.list(), loanApi.summary()]);
    setLoans(rows);
    setSum(s);
  };

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([loanApi.list(), loanApi.summary()])
      .then(([rows, s]) => { if (alive) { setLoans(rows); setSum(s); } })
      .catch((e) => alive && setErr(e.message))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return loans
      .filter((l) => filter === "all" ||
        (filter === "settled" ? l.settled :
          filter === "overdue" ? (!l.settled && Boolean(l.dueDate) && l.dueDate < todayStr()) :
            l.type === filter && !l.settled))
      .filter((l) => !term || `${l.friend} ${l.note || ""}`.toLowerCase().includes(term));
  }, [loans, q, filter]);

  const save = async (body) => {
    if (sheet?.item) await loanApi.update(sheet.item.id, body);
    else await loanApi.create(body);
    await fetchAll();
    setSheet(null);
  };

  const toggleSettle = async (l) => {
    setBusyId(l.id);
    setErr("");
    try {
      await loanApi.settle(l.id, !l.settled);
      await fetchAll();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const removeRecord = async () => {
    setErr("");
    try {
      await loanApi.remove(delId);
      await fetchAll();
      setDelId(null);
    } catch (e) {
      setErr(e.message);
    }
  };

  const net = r2(Math.abs(Number(sum.net) || 0));

  return (
    <div className="ex-page">
      <header className="ex-between">
        <div><h2>Give &amp; Take</h2><small>Money with friends{sum.overdue ? ` · ⚠️ ${sum.overdue} overdue` : ""}</small></div>
        <button className="ex-loan-add" onClick={() => setSheet({})}>＋ Add</button>
      </header>

      <div className="ex-loan-cards">
        <div className="receive">
          <small>To receive</small>
          <b>{fmt(sum.toReceive)}</b>
          <span>{sum.counts?.toReceive || 0} open</span>
        </div>
        <div className="pay">
          <small>To pay</small>
          <b>{fmt(sum.toPay)}</b>
          <span>{sum.counts?.toPay || 0} open</span>
        </div>
        <div className="net">
          <small>Net</small>
          <b>{fmt(net)}</b>
          <span>{Number(sum.net) >= 0 ? "you're owed" : "you owe"}</span>
        </div>
      </div>

      <div className="ex-search">
        <input placeholder="🔍 Search friend or note" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="ex-chips">
        {FILTERS.map(([k, label]) => (
          <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>{label}</button>
        ))}
      </div>

      {err && <div className="ex-err">{err}</div>}
      {loading && <div className="ex-empty">Loading…</div>}
      {!loading && !shown.length && (
        <div className="ex-empty">No give/take records yet.<br />Tap ＋ Add to lend or borrow money.</div>
      )}

      {shown.map((l) => {
        const overdue = !l.settled && l.dueDate && l.dueDate < todayStr();
        return (
          <div className="ex-item" key={l.id}>
            <span style={{ background: l.type === "given" ? "#16a34a22" : "#f59e0b22" }}>
              {l.type === "given" ? "🤝" : "🙌"}
            </span>
            <div className="ex-item-main">
              <b>
                {l.friend}
                {l.settled && <em className="ex-loan-done">Settled</em>}
              </b>
              <small>
                {l.type === "given" ? "Gave" : "Borrowed"} · {l.date}
                {l.dueDate ? ` · due ${l.dueDate}` : ""}
              </small>
              {l.note && <small>{l.note}</small>}
              {overdue && <small className="ex-loan-overdue">⚠️ Overdue</small>}
              <div className="ex-item-actions">
                <button disabled={busyId === l.id} onClick={() => toggleSettle(l)}>
                  {busyId === l.id ? "…" : l.settled ? "↩ Undo" : "✓ Settle"}
                </button>
                <button onClick={() => setSheet({ item: l })}>✏️ Edit</button>
                <button className="danger" onClick={() => setDelId(l.id)}>Delete</button>
              </div>
            </div>
            <div className="ex-amt">
              <b className={l.type === "given" ? "in" : "out"}>
                {l.type === "given" ? "+" : "−"}{fmt(l.amount)}
              </b>
            </div>
          </div>
        );
      })}

      {sheet && (
        <LoanSheet
          item={sheet.item}
          onClose={() => setSheet(null)}
          onSave={save}
        />
      )}

      {delId && (
        <div className="ex-overlay" onClick={() => setDelId(null)}>
          <div className="ex-card ex-loan-confirm" onClick={(e) => e.stopPropagation()}>
            <h3>Delete this record?</h3>
            <small>This cannot be undone.</small>
            <div className="ex-row">
              <button className="ex-btn plain" onClick={() => setDelId(null)}>Cancel</button>
              <button className="ex-btn danger" onClick={removeRecord}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
