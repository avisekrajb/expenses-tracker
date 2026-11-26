import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { resizePhoto } from "../utils/photo";
import { uploadPhoto, removePhoto } from "../services/upload";
import { getBudget } from "../services/budgets";
import { summary as loanSummary, list as loanList } from "../services/loans";
import { fmt, r2, todayStr } from "../utils/helpers";
import { sumMoney } from "../utils/money";
import { CATS } from "../utils/categories";
import { useSite } from "../context/SiteContext";
import TwoFactorSettings from "./TwoFactorSettings";
import NotificationSettings from "./NotificationSettings";
import InstallButton from "./InstallButton";
import FeatureGate from "./FeatureGate";

export default function Profile({ items, goLoans }) {
  const { user, setUser, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const { isAdmin } = useSite();
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

  const total = sumMoney(items.map((e) => e.amount));
  const monthSpent = sumMoney(items.filter((e) => e.date.startsWith(month)).map((e) => e.amount));
  const activeDays = new Set(items.map((e) => e.date)).size;
  const biggest = r2(items.reduce((m, e) => Math.max(m, e.amount), 0));
  const since = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  // Independent cross-checks: day totals, category totals and loan net must reconcile.
  const expenseTotal = sumMoney(items.map((e) => e.amount));
  const byCategory = sumMoney(items.filter((e) => CATS.some((c) => c.n === e.category)).map((e) => e.amount));
  const byDay = sumMoney([...new Set(items.map((e) => e.date))]
    .map((d) => sumMoney(items.filter((e) => e.date === d).map((e) => e.amount))));
  const loanNet = sumMoney([Number(loans?.toReceive) || 0, -(Number(loans?.toPay) || 0)]);
  const mathOk = expenseTotal === byCategory && expenseTotal === byDay &&
    Math.abs(loanNet - (Number(loans?.net) || 0)) < 0.005;

  const downloadBackup = async () => {
    setBusy(true);
    setErr("");
    try {
      const [friends, thisBudget] = await Promise.all([loanList(), getBudget(month)]);
      const payload = {
        app: "Kharcha", version: "1.4.0", exportedAt: new Date().toISOString(),
        user: { name: user?.name, email: user?.email, photo: user?.photo },
        expenses: items, loans: friends, budget: thisBudget,
        mathCheck: { expenseTotal, byCategory, byDay, loanNet, ok: mathOk },
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `kharcha-backup-${todayStr()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } catch (e) {
      setErr(e.message);
    }
    setBusy(false);
  };

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
        <h3>Math check</h3>
        <div className={"ex-card ex-math" + (mathOk ? " ok" : " bad")}>
          <b>{mathOk ? "✅ All totals reconcile" : "⚠️ Totals need a look"}</b>
          <small>Expenses {fmt(expenseTotal)} · by day {fmt(byDay)} · by category {fmt(byCategory)}</small>
          <small>Friend net {fmt(loanNet)} · to receive − to pay</small>
        </div>
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

      <div className="ex-profile-sec">
        <h3>Security</h3>
        <FeatureGate feature="twoFactor" label="Two-step verification">
          <TwoFactorSettings />
        </FeatureGate>
      </div>

      <div className="ex-profile-sec">
        <h3>Alerts</h3>
        <FeatureGate feature="notifications" label="Device notifications">
          <NotificationSettings />
        </FeatureGate>
      </div>

      <div className="ex-profile-sec">
        <h3>Kharcha app</h3>
        <div className="ex-card ex-app-card">
          <FeatureGate feature="install" label="Installable app">
            <InstallButton className="ex-btn plain" />
          </FeatureGate>
          <FeatureGate feature="donations" label="Donations">
            <button className="ex-btn plain" onClick={() => { window.history.pushState(null, "", "/donate"); window.dispatchEvent(new Event("routechange")); }}>💛 Support a family in need</button>
          </FeatureGate>
          {(user?.isAdmin || isAdmin) && (
            <button className="ex-btn plain" onClick={() => { window.history.pushState(null, "", "/admin"); window.dispatchEvent(new Event("routechange")); }}>🛠️ Admin console</button>
          )}
        </div>
      </div>

      <div className="ex-profile-actions">
        <button className="ex-btn plain" disabled={busy} onClick={downloadBackup}>{busy ? "…" : "⬇️ Backup JSON"}</button>
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
