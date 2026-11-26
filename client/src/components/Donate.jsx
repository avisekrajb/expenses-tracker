import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getConfig } from "../services/config";
import { stats, create } from "../services/donations";

const AMOUNTS = [100, 250, 500, 1000];
const copy = async (text) => {
  try { await navigator.clipboard.writeText(text); return true; }
  catch { return false; }
};

function CopyRow({ label, value }) {
  const [done, setDone] = useState(false);
  return (
    <div className="pub-copy-row">
      <div><small>{label}</small><b>{value || "Add in server settings"}</b></div>
      <button type="button" onClick={async () => setDone(await copy(value || ""))}>{done ? "Copied" : "Copy"}</button>
    </div>
  );
}

export default function Donate({ go }) {
  const { user } = useAuth();
  const [config, setConfig] = useState(null);
  const [impact, setImpact] = useState({ total: 0, count: 0 });
  const [amount, setAmount] = useState(500);
  const [custom, setCustom] = useState("");
  const [method, setMethod] = useState("esewa");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getConfig().then(setConfig);
    stats().then(setImpact).catch(() => {});
  }, []);

  const value = custom ? Number(custom) : amount;
  const d = config?.donations || {};
  const placeholder = String(d.note || "").toLowerCase().includes("placeholder");

  const submit = async (e) => {
    e.preventDefault();
    if (!user) { window.location.href = "/login"; return; }
    if (!(value > 0)) { setMsg("Enter an amount first."); return; }
    setBusy(true);
    try {
      await create(value, method, note);
      setMsg(`Thank you! Your Rs ${value} ${method === "esewa" ? "eSewa" : method === "bank" ? "bank" : ""} pledge was recorded.`);
      setNote("");
      setImpact((p) => ({ total: p.total + value, count: p.count + 1 }));
    } catch (err) { setMsg(err.message); }
    setBusy(false);
  };

  return (
    <>
      <section className="pub-page-hero pub-donate-hero">
        <div className="pub-wrap">
          <span className="pub-kicker">Donate</span>
          <h1>A little change,<br />a lot of difference.</h1>
          <p>Your support helps local families in Nepal cover essentials — food, school supplies and medicine. Every rupee is counted and appreciated.</p>
          <div className="pub-impact">
            <div><b>Rs {Number(impact.total || 0).toLocaleString("en-NP")}</b><small>pledged so far</small></div>
            <div><b>{impact.count || 0}</b><small>kind contributions</small></div>
          </div>
        </div>
      </section>

      <section className="pub-section">
        <div className="pub-wrap pub-donate-grid">
          <form className="pub-form pub-donate-form" onSubmit={submit}>
            <h2>Choose an amount</h2>
            <div className="pub-amounts">
              {AMOUNTS.map((a) => (
                <button type="button" key={a} className={!custom && amount === a ? "on" : ""} onClick={() => { setAmount(a); setCustom(""); }}>Rs {a}</button>
              ))}
            </div>
            <label>Other amount (NPR)<input type="number" min="1" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="e.g. 750" /></label>
            <h3>How would you like to give?</h3>
            <div className="pub-methods">
              <button type="button" className={method === "esewa" ? "on" : ""} onClick={() => setMethod("esewa")}>📱 eSewa</button>
              <button type="button" className={method === "bank" ? "on" : ""} onClick={() => setMethod("bank")}>🏦 Bank transfer</button>
              <button type="button" className={method === "other" ? "on" : ""} onClick={() => setMethod("other")}>✨ Other</button>
            </div>
            <label>Note (optional)<input value={note} onChange={(e) => setNote(e.target.value)} placeholder="A few kind words…" maxLength="200" /></label>
            <button className="pub-btn" disabled={busy} type="submit">{busy ? "Saving…" : user ? "I have donated ✓" : "Log in to record your pledge"}</button>
            {msg && <div className="pub-note">{msg}</div>}
            <small>Record your pledge after you complete the payment in your eSewa or banking app.</small>
          </form>

          <aside className="pub-donate-details">
            {placeholder && <div className="pub-warning">⚠️ These are placeholder details. Set the real DONATION_* values in the API environment before collecting money.</div>}
            {method === "esewa" && (
              <div className="pub-card">
                <h2>📱 Donate with eSewa</h2>
                <p>Send money to this ID from your eSewa app, then record your pledge here.</p>
                <CopyRow label="eSewa ID" value={d.esewaId} />
                <CopyRow label="Account name" value={d.esewaName} />
                {d.qrUrl && <img className="pub-qr" src={d.qrUrl} alt="eSewa donation QR code" />}
              </div>
            )}
            {method === "bank" && (
              <div className="pub-card">
                <h2>🏦 Bank transfer</h2>
                <p>Transfer directly and include your name in the remarks.</p>
                <CopyRow label="Bank" value={d.bankName} />
                <CopyRow label="Account number" value={d.bankAccount} />
                <CopyRow label="Branch" value={d.bankBranch} />
                <CopyRow label="SWIFT / IFSC" value={d.bankSwift} />
              </div>
            )}
            {method === "other" && (
              <div className="pub-card">
                <h2>✨ Other ways to help</h2>
                <p>Hand-deliver supplies, volunteer your time, or contact us for a custom arrangement.</p>
                <a href="/contact" onClick={(e) => { e.preventDefault(); go("/contact")(e); }} className="pub-btn ghost">Contact us →</a>
              </div>
            )}
            <div className="pub-note">Kharcha does not process payments inside the app. Payments happen in your own eSewa or banking app; we only record pledges so the community can see its impact.</div>
          </aside>
        </div>
      </section>
    </>
  );
}
