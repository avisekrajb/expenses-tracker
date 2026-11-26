import React, { useState } from "react";
import { CATS } from "../utils/categories";
import { r2, todayStr } from "../utils/helpers";
import { resizeImage } from "../utils/photo";
import { uploadReceipt } from "../services/upload";

// Add or edit an expense. Pass `item` to edit an existing record.
export default function AddSheet({ onClose, onSave, item }) {
  const editing = Boolean(item);
  const [amount, setAmount] = useState(item ? String(item.amount) : "");
  const [category, setCategory] = useState(item?.category || "Eating");
  const [date, setDate] = useState(item?.date || todayStr());
  const [desc, setDesc] = useState(item?.desc || "");
  const [tags, setTags] = useState((item?.tags || []).join(", "));
  const [recurring, setRecurring] = useState(item?.recurring === true);
  const [receipt, setReceipt] = useState(item?.receipt || null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(item?.receipt || null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const pick = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) return setErr("Choose an image file.");
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setErr("");
  };

  const clearReceipt = () => {
    setFile(null);
    setReceipt(null);
    setPreview(null);
  };

  const go = async () => {
    const a = parseFloat(amount);
    if (!a || a <= 0) return setErr("Enter a valid amount.");
    if (!date) return setErr("Choose a valid date.");
    setBusy(true);
    setErr("");
    try {
      let url = receipt;
      let publicId = null;
      if (file) {
        const up = await uploadReceipt(await resizeImage(file, 1400));
        url = up.url;
        publicId = up.publicId;
      }
      await onSave({
        amount: r2(a), category, date, desc: desc.trim(),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 5),
        recurring, receipt: url, receiptPublicId: publicId,
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
        <h3>{editing ? "Edit expense" : "Add expense"}</h3>
        <div className="ex-amount"><span>Rs</span>
          <input autoFocus inputMode="decimal" placeholder="0" value={amount}
            onChange={(e) => { setAmount(e.target.value.replace(/[^\d.]/g, "")); setErr(""); }} />
        </div>
        <div className="ex-pick">
          {CATS.map((c) => (
            <button key={c.n} className={category === c.n ? "on" : ""} style={category === c.n ? { background: c.c, color: "#fff" } : {}} onClick={() => setCategory(c.n)}>
              {c.i} {c.n}
            </button>
          ))}
        </div>
        <input type="date" value={date} max={todayStr()} onChange={(e) => setDate(e.target.value)} />
        <input placeholder="Description (e.g. momo at Thamel)" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <input placeholder="Tags (comma separated, e.g. lunch, friends)" value={tags}
          onChange={(e) => setTags(e.target.value)} />
        <label className="ex-check">
          <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
          <span>Repeat every month</span>
        </label>

        <div className="ex-receipt-row">
          <label className="ex-receipt-pick">
            {preview ? <img src={preview} alt="Receipt preview" /> : <span>📎 Add receipt photo</span>}
            <input type="file" accept="image/*" hidden onChange={pick} />
          </label>
          {preview && <button className="ex-link" onClick={clearReceipt} type="button">Remove</button>}
        </div>

        {err && <div className="ex-err">{err}</div>}
        <button className="ex-btn" disabled={busy} onClick={go}>
          {busy ? "Saving…" : editing ? "Save changes" : "Save expense"}
        </button>
      </div>
    </div>
  );
}
