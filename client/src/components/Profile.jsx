import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { resizePhoto } from "../utils/photo";
import { uploadPhoto, removePhoto } from "../services/upload";
import { getBudget } from "../services/budgets";
import { summary as loanSummary } from "../services/loans";
import { fmt, r2, todayStr } from "../utils/helpers";

export default function Profile({ items, goLoans }) {
  const { user, setUser, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [askOut, setAskOut] = useState(false);
  const [loans, setLoans] = useState(null);
  const [budget, setBudget] = useState(null);
  const month = todayStr().slice(0, 7);

  useEffect(() => {
    let alive = true;
    loanSummary().then((s) => alive && setLoans(s)).catch(() => alive && setLoans(null));
    getBudget(month).then((b) => alive && setBudget(b)).catch(() => alive && setBudget(null));
    return () => { alive = false; };
  }, [month]);

  const pick = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) return setErr("Choose an image file.");
    setBusy(true);
    try { setUser(await uploadPhoto(await resizePhoto(f))); setErr(""); }
    catch (x) { setErr(x.message); }
    setBusy(false);
  };
  const drop = async () => {
    try { setUser(await removePhoto()); setErr(""); } catch (x) { setErr(x.message); }
  };

  const total = r2(items.reduce((s, e) => s + e.amount, 0));
  const monthSpent = r2(items.filter((e) => e.date.startsWith(month)).reduce((s, e) => s + e.amount, 0));
  const activeDays = new Set(items.map((e) => e.date)).size;
  const biggest = r2(items.reduce((m, e) => Math.max(m, e.amount), 0));
  const since = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <div className="ex-page">
      <header><h2>Profile</h2><small>Your account at a glance</small></header>

      <div className="ex-card ex-center ex-profile-head">
        <label className="ex-avatar" style={{ opacity: busy ? 0.6 : 1 }}>
          {user?.photo ? <img src={user.photo} alt="Profile" /> : <span>{user?.name?.[0]?.toUpperCase()}</span>}
          <em>📷</em>
          <input type="file" accept="image/*" hidden onChange={pick} />
        </label>
        <h3>{user?.name}</h3>
        <small className="ex-muted">{user?.email}</small>
        {user?.photo && <button className="ex-link" onClick={drop}>Remove photo</button>}
        {err && <div className="ex-err">{err}</div>}
      </div>

      <h3>Your numbers</h3>
      <div className="ex-profile-stats">
        <div><small>Expenses</small><b>{items.length}</b></div>
        <div><small>Total spent</small><b>{fmt(total)}</b></div>
        <div><small>Active days</small><b>{activeDays}</b></div>
        <div><small>Biggest</small><b>{fmt(biggest)}</b></div>
        <div><small>This month</small><b>{fmt(monthSpent)}</b></div>
        <div><small>Month budget</small><b>{fmt(budget?.overall || 0)}</b></div>
      </div>

      <div className="ex-profile-sec">
        <h3>Friends</h3>
        <div className="ex-card">
          <div className="ex-profile-row"><small>To receive</small><b className="in">{fmt(loans?.toReceive || 0)}</b></div>
          <div className="ex-profile-row"><small>To pay</small><b className="out">{fmt(loans?.toPay || 0)}</b></div>
          <div className="ex-profile-row"><small>Net</small><b>{fmt(Math.abs(Number(loans?.net) || 0))} {Number(loans?.net) >= 0 ? "owed to you" : "you owe"}</b></div>
          <button className="ex-link" onClick={goLoans}>Open Give &amp; Take ›</button>
        </div>
      </div>

      <div className="ex-profile-sec">
        <h3>Account</h3>
        <div className="ex-card">
          <div className="ex-profile-row"><small>Name</small><span>{user?.name}</span></div>
          <div className="ex-profile-row"><small>Email</small><span>{user?.email}</span></div>
          <div className="ex-profile-row"><small>Member since</small><span>{since}</span></div>
          <div className="ex-profile-row"><small>Account ID</small><span>{String(user?.id || "").slice(0, 8)}</span></div>
        </div>
      </div>

      <div className="ex-profile-actions">
        <button className="ex-btn plain" onClick={toggle}>{dark ? "☀️ Light mode" : "🌙 Dark mode"}</button>
        <button className="ex-btn" onClick={() => setAskOut(true)}>Log out</button>
      </div>

      {askOut && (
        <div className="ex-overlay" onClick={() => setAskOut(false)}>
          <div className="ex-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="ex-handle" />
            <h3>Do you want to log out?</h3>
            <small>You will need your email and password to log in again.</small>
            <button className="ex-btn danger" onClick={logout}>Yes, log out</button>
            <button className="ex-btn plain" onClick={() => setAskOut(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
