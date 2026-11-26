import React, { useState } from "react";
import { r2, todayStr } from "../utils/helpers";

// Add or edit a give/take record. Pass `item` to edit an existing record.
export default function LoanSheet({ onClose, onSave, item }) {
  const editing = Boolean(item);
  const [type, setType] = useState(item?.type || "given");
  const [friend, setFriend] = useState(item?.friend || "");
  const [amount, setAmount] = useState(item ? String(item.amount) : "");
  const [date, setDate] = useState(item?.date || todayStr());
  const [dueDate, setDueDate] = useState(item?.dueDate || "");
  const [note, setNote] = useState(item?.note || "");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const go = async () => {
    const a = parseFloat(amount);
    if (!a || a <= 0) return setErr("Enter a valid amount.");
    if (!friend.trim()) return setErr("Enter your friend's name.");
    if (!date) return setErr("Choose a valid date.");
    if (dueDate && dueDate < date) return setErr("Due date cannot be before the loan date.");
    setBusy(true);
    setErr("");
    try {
      await onSave({
        type,
        friend: friend.trim(),
        amount: r2(a),
        date,
        dueDate: dueDate || null,
        note: note.trim(),
      });
    } catch (e) {
      setErr(e.message);
      setBusy(false);
    }
  };

  return (
    <div className="ex-overlay" onClick={onClose}>
      <div className="ex-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="ex-handle" />
        <h3>{editing ? "Edit friend money" : "Give or take money"}</h3>

        <div className="ex-loan-type">
          <button className={type === "given" ? "on give" : ""} onClick={() => setType("given")}>
            🤝 I gave <small>They owe me</small>
          </button>
          <button className={type === "taken" ? "on take" : ""} onClick={() => setType("taken")}>
            🙌 I took <small>I owe them</small>
          </button>
        </div>

        <input placeholder="Friend's name" value={friend} maxLength={60} onChange={(e) => { setFriend(e.target.value); setErr(""); }} />
        <div className="ex-amount"><span>Rs</span>
          <input autoFocus inputMode="decimal" placeholder="0" value={amount}
            onChange={(e) => { setAmount(e.target.value.replace(/[^\d.]/g, "")); setErr(""); }} />
        </div>
        <div className="ex-filter-row">
          <label><small>Date</small><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
          <label><small>Return by (optional)</small><input type="date" value={dueDate} min={date} onChange={(e) => setDueDate(e.target.value)} /></label>
        </div>
        <input placeholder="Note (e.g. lunch at Baneshwar)" value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} />

        {err && <div className="ex-err">{err}</div>}
        <button className="ex-btn" disabled={busy} onClick={go}>
          {busy ? "Saving…" : editing ? "Save changes" : "Save record"}
        </button>
      </div>
    </div>
  );
}
