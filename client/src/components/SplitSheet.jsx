import React, { useMemo, useState } from "react";
import * as loanApi from "../services/loans";
import { fmt, todayStr } from "../utils/helpers";
import { round2, splitMoney, sumMoney } from "../utils/money";

// Split an expense: every friend's share becomes a loan where they owe you.
export default function SplitSheet({ item, friends = [], onClose, onDone }) {
  const [text, setText] = useState("");
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const suggestions = useMemo(() => [...new Set(friends.filter(Boolean))].slice(0, 20), [friends]);
  const names = useMemo(() => text.split(",").map((s) => s.trim()).filter(Boolean), [text]);
  const assigned = sumMoney(rows.map((r) => r.amount));
  const youKeep = round2(item.amount - assigned);

  const splitEqually = () => {
    if (!names.length) return setErr("Enter at least one friend name.");
    // Include yourself as one participant; friends pay their shares only.
    const shares = splitMoney(item.amount, names.length + 1).slice(0, names.length);
    setRows(names.map((friend, i) => ({ friend, amount: shares[i] })));
    setErr("");
  };

  const setRow = (i, key, value) => setRows((p) => p.map((r, j) => (i === j ? { ...r, [key]: value } : r)));

  const save = async () => {
    if (!rows.length) return setErr("Add at least one friend to split with.");
    if (rows.some((r) => !r.friend.trim())) return setErr("Every friend needs a name.");
    if (rows.some((r) => !(Number(r.amount) > 0))) return setErr("Every share must be more than zero.");
    if (youKeep < 0) return setErr("Shares add up to more than the expense.");
    setBusy(true);
    setErr("");
    try {
      for (const r of rows) {
        await loanApi.create({
          type: "given",
          friend: r.friend.trim(),
          amount: round2(Number(r.amount)),
          date: item.date || todayStr(),
          note: `Split of ${item.category}${item.desc ? ` · ${item.desc}` : ""}`,
        });
      }
      onDone(rows.length, fmt(assigned));
    } catch (e) {
      setErr(e.message);
      setBusy(false);
    }
  };

  return (
    <div className="ex-overlay" onClick={onClose}>
      <div className="ex-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="ex-handle" />
        <h3>Split this expense</h3>
        <small>{item.category} · {fmt(item.amount)}</small>

        <input list="kharcha-friends" placeholder="Friend names, separated by commas"
          value={text} onChange={(e) => { setText(e.target.value); setErr(""); }} />
        <datalist id="kharcha-friends">
          {suggestions.map((f) => <option key={f} value={f} />)}
        </datalist>
        <button className="ex-btn plain ex-split-auto" onClick={splitEqually}>⚖️ Split equally (you keep a share)</button>

        {rows.map((r, i) => (
          <div className="ex-split-row" key={i}>
            <input placeholder="Friend" value={r.friend} onChange={(e) => setRow(i, "friend", e.target.value)} />
            <input inputMode="decimal" placeholder="Amount" value={r.amount}
              onChange={(e) => setRow(i, "amount", e.target.value.replace(/[^\d.]/g, ""))} />
            <button className="ex-link" onClick={() => setRows((p) => p.filter((_, j) => j !== i))}>✕</button>
          </div>
        ))}
        <button className="ex-link" onClick={() => setRows((p) => [...p, { friend: "", amount: "" }])}>＋ Add friend</button>

        <div className="ex-between ex-split-total">
          <span>Friends owe</span><b>{fmt(assigned)}</b>
        </div>
        <div className="ex-between ex-split-total">
          <span>Your share</span><b className={youKeep < 0 ? "ex-bad" : ""}>{fmt(youKeep)}</b>
        </div>

        {err && <div className="ex-err">{err}</div>}
        <button className="ex-btn" disabled={busy} onClick={save}>{busy ? "Saving…" : "Create friend loans"}</button>
      </div>
    </div>
  );
}
