import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSite } from "../context/SiteContext";
import { stats, create, mine } from "../services/donations";
import FeatureGate from "./FeatureGate";

const AMOUNTS = [100, 250, 500, 1000];
const copy = async (text) => {
  try { await navigator.clipboard.writeText(text); return true; }
  catch { return false; }
};

function CopyRow({ label, value }) {
  const [done, setDone] = useState(false);
  return (
    <div className="pub-copy-row">
      <div><small>{label}</small><b>{value || "Add in admin settings"}</b></div>
      <button type="button" onClick={async () => setDone(await copy(value || ""))}>{done ? "Copied" : "Copy"}</button>
    </div>
  );
}

export default function Donate({ go }) {
  const { user } = useAuth();
  const { config } = useSite();
  const [impact, setImpact] = useState({ total: 0, count: 0 });
  const [pledges, setPledges] = useState([]);
  const [amount, setAmount] = useState(500);
  const [custom, setCustom] = useState("");
  const [method, setMethod] = useState("esewa");
  const [note, setNote] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    stats().then(setImpact).catch(() => {});
  }, []);
  useEffect(() => {
    if (user) mine().then((r) => setPledges(r.rows || [])).catch(() => {});
    else setPledges([]);
  }, [user]);

  const value = custom ? Number(custom) : amount;
  const d = config?.donations || {};
  const placeholder = String(d.note || "").toLowerCase().includes("placeholder");

  const submit = async (e) => {
    e.preventDefault();
    if (!user) { window.location.href = "/login"; return; }
    if (!(value > 0)) { setMsg("Enter an amount first."); return; }
    if (!screenshot) { setMsg("Upload a screenshot of your payment first."); return; }
    setBusy(true);
    setMsg("");
    try {
      await create(value, method, note, screenshot);
      setMsg("Thank you! Your pledge is saved and waiting for admin verification.");
      setNote(""); setScreenshot(null);
      e.target.reset();
      setPledges((await mine()).rows || []);
    } catch (err) { setMsg(err.message); }
    setBusy(false);
  };

  return (
    <>
      <section className="pub-page-hero pub-donate-hero">
        <div className="pub-wrap">
          <span className="pub-kicker">Donate</span>
          <h1>A little change,<br />a lot of difference.</h1>
          <p>Your support helps local families in Nepal cover essentials — food, school supplies and medicine. Every verified rupee is counted and appreciated.</p>
          <div className="pub-impact">
            <div><b>Rs {Number(impact.total || 0).toLocaleString("en-NP")}</b><small>verified so far</small></div>
            <div><b>{impact.count || 0}</b><small>kind contributions</small></div>
          </div>
        </div>
      </section>

      <section className="pub-section">
        <FeatureGate feature="donations" label="Donations">
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
                <button type="button" className={method === "upi" ? "on" : ""} onClick={() => setMethod("upi")}>💳 UPI</button>
                <button type="button" className={method === "bank" ? "on" : ""} onClick={() => setMethod("bank")}>🏦 Bank transfer</button>
                <button type="button" className={method === "other" ? "on" : ""} onClick={() => setMethod("other")}>✨ Other</button>
              </div>
              <label>Payment screenshot (required)<input type="file" accept="image/*" required onChange={(e) => setScreenshot(e.target.files?.[0] || null)} /></label>
              {screenshot && <small>Selected: {screenshot.name}</small>}
              <label>Note (optional)<input value={note} onChange={(e) => setNote(e.target.value)} placeholder="A few kind words…" maxLength="200" /></label>
              <button className="pub-btn" disabled={busy} type="submit">{busy ? "Saving…" : user ? "Record my pledge ✓" : "Log in to record your pledge"}</button>
              {msg && <div className="pub-note">{msg}</div>}
              <small>Complete the payment in your eSewa, UPI or banking app, take a screenshot, then record it here. An admin verifies it before it appears in the public total.</small>

              {user && pledges.length > 0 && (
                <div className="pub-pledges">
                  <h3>Your pledges</h3>
                  {pledges.map((p) => (
                    <div key={p.id} className="pub-copy-row">
                      <div><small>{new Date(p.createdAt).toLocaleDateString()}</small><b>Rs {Number(p.amount).toLocaleString("en-NP")} · {p.status}</b></div>
                      {p.screenshot?.url && <a href={p.screenshot.url} target="_blank" rel="noreferrer">Receipt ↗</a>}
                    </div>
                  ))}
                </div>
              )}
            </form>

            <aside className="pub-donate-details">
              {placeholder && <div className="pub-warning">⚠️ These are placeholder details. The admin can set the real payment values and upload a QR in the admin console before collecting money.</div>}
              {d.qrUrl && (
                <div className="pub-card pub-qr-card">
                  <h2>🔳 Scan & pay</h2>
                  <p>Open your payment app, scan this QR, then record your pledge below.</p>
                  <img className="pub-qr" src={d.qrUrl} alt="Kharcha donation QR code" />
                </div>
              )}
              {method === "esewa" && (
                <div className="pub-card">
                  <h2>📱 Donate with eSewa</h2>
                  <p>Send money to this ID from your eSewa app, then record your pledge here.</p>
                  <CopyRow label="eSewa ID" value={d.esewaId} />
                  <CopyRow label="Account name" value={d.esewaName} />
                </div>
              )}
              {method === "upi" && (
                <div className="pub-card">
                  <h2>💳 Donate with UPI</h2>
                  <p>Pay from any UPI app, then record your pledge here.</p>
                  <CopyRow label="UPI ID" value={d.upiId} />
                  <CopyRow label="Payment contact" value={d.phone} />
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
                  <CopyRow label="Payment contact" value={d.phone} />
                </div>
              )}
              {method === "other" && (
                <div className="pub-card">
                  <h2>✨ Other ways to help</h2>
                  <p>Hand-deliver supplies, volunteer your time, or contact us for a custom arrangement.</p>
                  <CopyRow label="Payment contact" value={d.phone} />
                  <a href="/contact" onClick={(e) => { e.preventDefault(); go("/contact")(e); }} className="pub-btn ghost">Contact us →</a>
                </div>
              )}
              <div className="pub-note">Kharcha does not process payments inside the app. Payments happen in your own payment app; we only record and verify pledges.</div>
            </aside>
          </div>
        </FeatureGate>
      </section>
    </>
  );
}
