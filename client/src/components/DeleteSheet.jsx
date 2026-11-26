import React, { useState } from "react";
import { catOf } from "../utils/categories";
import { fmt } from "../utils/helpers";
import { remove } from "../services/expenses";

// Delete confirmation – the account password is checked on the server.
export default function DeleteSheet({ item, onClose, onConfirm }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const c = catOf(item.category);

  const go = async () => {
    if (!pw) return setErr("Enter your password.");
    setBusy(true);
    try { await remove(item.id, pw); onConfirm(); }
    catch (e) { setErr(e.message); setBusy(false); }
  };

  return (
    <div className="ex-overlay" onClick={onClose}>
      <div className="ex-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="ex-handle" />
        <h3>Do you want to delete this expense?</h3>
        <div className="ex-item" style={{ margin: 0 }}>
          <span style={{ background: c.c + "25" }}>{c.i}</span>
          <div><b>{item.category}</b><small>{item.desc || "No description"} · {item.date}</small></div>
          <div className="ex-amt"><b>{fmt(item.amount)}</b></div>
        </div>
        <input type="password" autoFocus placeholder="Enter your password to confirm" value={pw}
          onChange={(e) => { setPw(e.target.value); setErr(""); }} onKeyDown={(e) => e.key === "Enter" && go()} />
        {err && <div className="ex-err">{err}</div>}
        <button className="ex-btn danger" disabled={busy} onClick={go}>{busy ? "Deleting…" : "Yes, delete"}</button>
        <button className="ex-btn plain" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
