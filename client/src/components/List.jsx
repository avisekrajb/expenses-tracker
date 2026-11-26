import React, { useMemo, useState } from "react";
import Empty from "./Empty";
import { CATS, catOf } from "../utils/categories";
import { fmt, r2, todayStr } from "../utils/helpers";

const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export default function List({ items, del, edit, split }) {
  const [q, setQ] = useState("");
  const [f, setF] = useState("All");
  const [tag, setTag] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [openFilters, setOpenFilters] = useState(false);
  const [view, setView] = useState(null);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    const lo = min === "" ? null : Number(min);
    const hi = max === "" ? null : Number(max);
    return items
      .filter((e) => f === "All" || e.category === f)
      .filter((e) => !tag || (e.tags || []).includes(tag))
      .filter((e) => !from || e.date >= from)
      .filter((e) => !to || e.date <= to)
      .filter((e) => lo === null || !Number.isFinite(lo) || e.amount >= lo)
      .filter((e) => hi === null || !Number.isFinite(hi) || e.amount <= hi)
      .filter((e) => !term || `${e.category} ${e.desc || ""} ${(e.tags || []).join(" ")}`.toLowerCase().includes(term))
      .sort((a, b) => b.date.localeCompare(a.date) || String(b.id).localeCompare(String(a.id)));
  }, [items, q, f, tag, from, to, min, max]);

  const total = r2(shown.reduce((s, e) => s + e.amount, 0));
  const filtered = Boolean(q || f !== "All" || tag || from || to || min || max);
  const allTags = [...new Set(items.flatMap((e) => e.tags || []))].sort();

  const groups = {};
  shown.forEach((e) => (groups[e.date] = groups[e.date] || []).push(e));

  const clearAll = () => { setQ(""); setF("All"); setTag(""); setFrom(""); setTo(""); setMin(""); setMax(""); };

  const exportCsv = () => {
    if (!shown.length) return;
    const rows = [
      ["Date", "Category", "Amount (Rs)", "Description", "Tags", "Recurring", "Receipt"].map(csvCell).join(","),
      ...shown.map((e) => [e.date, e.category, e.amount, e.desc, (e.tags || []).join(" "), e.recurring ? "yes" : "", e.receipt || ""].map(csvCell).join(",")),
    ];
    const blob = new Blob(["\ufeff" + rows.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `kharcha-expenses-${todayStr()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  return (
    <div className="ex-page">
      <header><h2>Expenses</h2><small>{shown.length} records · {fmt(total)}</small></header>

      <div className="ex-search">
        <input placeholder="🔍 Search description or category" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="ex-tools">
        <button className={"ex-tool" + (openFilters ? " on" : "")} onClick={() => setOpenFilters((v) => !v)}>
          ⚙️ Filters{filtered ? " •" : ""}
        </button>
        <button className="ex-tool" onClick={exportCsv} disabled={!shown.length}>⬇️ Export CSV</button>
        {filtered && <button className="ex-tool clear" onClick={clearAll}>Clear</button>}
      </div>

      {openFilters && (
        <div className="ex-card ex-filters">
          <div className="ex-filter-row">
            <label><small>From</small><input type="date" value={from} max={to || todayStr()} onChange={(e) => setFrom(e.target.value)} /></label>
            <label><small>To</small><input type="date" value={to} min={from} max={todayStr()} onChange={(e) => setTo(e.target.value)} /></label>
          </div>
          <div className="ex-filter-row">
            <label><small>Min amount</small><input inputMode="decimal" placeholder="0" value={min} onChange={(e) => setMin(e.target.value.replace(/[^\d.]/g, ""))} /></label>
            <label><small>Max amount</small><input inputMode="decimal" placeholder="Any" value={max} onChange={(e) => setMax(e.target.value.replace(/[^\d.]/g, ""))} /></label>
          </div>
        </div>
      )}

      <div className="ex-chips">
        {["All", ...CATS.map((c) => c.n)].map((n) => (
          <button key={n} className={f === n ? "on" : ""} onClick={() => setF(n)}>{n}</button>
        ))}
      </div>
      {allTags.length > 0 && (
        <div className="ex-chips ex-tag-chips">
          <button className={!tag ? "on" : ""} onClick={() => setTag("")}>All tags</button>
          {allTags.map((t) => (
            <button key={t} className={tag === t ? "on" : ""} onClick={() => setTag(t)}>#{t}</button>
          ))}
        </div>
      )}

      {!shown.length && <Empty />}
      {Object.keys(groups).map((d) => (
        <div key={d}>
          <div className="ex-between ex-day">
            <span>{d === todayStr() ? "Today" : new Date(d + "T00:00").toDateString()}</span>
            <b>{fmt(r2(groups[d].reduce((s, e) => s + e.amount, 0)))}</b>
          </div>
          {groups[d].map((e) => {
            const c = catOf(e.category);
            return (
              <div className="ex-item" key={e.id}>
                <span style={{ background: c.c + "25" }}>{c.i}</span>
                <div className="ex-item-main">
                  <b>{e.category}{e.recurring && <em className="ex-rec"> ↻ monthly</em>}</b>
                  <small>{e.desc || "No description"}</small>
                  {(e.tags || []).length > 0 && (
                    <div className="ex-tags">{e.tags.map((t) => <em key={t}>#{t}</em>)}</div>
                  )}
                  <div className="ex-item-actions">
                    <button onClick={() => split(e)}>✂️ Split</button>
                    <button onClick={() => edit(e)}>✏️ Edit</button>
                    <button className="danger" onClick={() => del(e.id)}>Delete</button>
                  </div>
                </div>
                <div className="ex-amt">
                  <b>{fmt(e.amount)}</b>
                  {e.receipt && (
                    <button className="ex-receipt-thumb" onClick={() => setView(e.receipt)} aria-label="View receipt">
                      <img src={e.receipt} alt="Receipt" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {view && (
        <div className="ex-overlay ex-receipt-view" onClick={() => setView(null)}>
          <img src={view} alt="Receipt" onClick={(e) => e.stopPropagation()} />
          <button className="ex-btn plain" onClick={() => setView(null)}>Close</button>
        </div>
      )}
    </div>
  );
}
