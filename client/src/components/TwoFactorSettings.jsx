import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import * as twoFactor from "../services/twoFactor";

export default function TwoFactorSettings() {
  const { user, setUser } = useAuth();
  const enabled = Boolean(user?.twoFactor?.enabled);
  const [busy, setBusy] = useState(false);
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState("");
  const [backups, setBackups] = useState([]);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const start = async () => {
    setBusy(true); setErr("");
    try { setSetup(await twoFactor.setup()); }
    catch (e) { setErr(e.message); }
    setBusy(false);
  };

  const confirm = async () => {
    setBusy(true); setErr("");
    try {
      const data = await twoFactor.enable(code.trim());
      setUser(data.user);
      setBackups(data.backupCodes || []);
      setSetup(null);
      setCode("");
      setMsg("Two-step verification is on. Save your backup codes now.");
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  const turnOff = async () => {
    setBusy(true); setErr("");
    try {
      const data = await twoFactor.disable(password, code.trim());
      setUser(data.user);
      setPassword(""); setCode("");
      setMsg("Two-step verification is off.");
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  const saveBackups = () => {
    const blob = new Blob([backups.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "kharcha-backup-codes.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  if (enabled && !backups.length) {
    return (
      <div className="ex-card ex-2fa">
        <div className="ex-between"><b>🔐 Two-step verification</b><span className="ex-badge ok">On</span></div>
        <small>Your account asks for an authenticator code after your password.</small>
        <div className="ex-2fa-off">
          <input type="password" placeholder="Account password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input inputMode="numeric" placeholder="Authenticator or backup code" value={code} onChange={(e) => setCode(e.target.value)} />
          <button className="ex-btn plain" disabled={busy} onClick={turnOff}>{busy ? "…" : "Turn off 2FA"}</button>
        </div>
        {err && <div className="ex-err">{err}</div>}
        {msg && <div className="ex-ok">{msg}</div>}
      </div>
    );
  }

  return (
    <div className="ex-card ex-2fa">
      <div className="ex-between"><b>🔐 Two-step verification</b><span className={"ex-badge" + (enabled ? " ok" : "")}>{enabled ? "On" : "Off"}</span></div>
      <small>Add an authenticator app (Google Authenticator, Authy, 1Password…) for extra security.</small>
      {!setup && !backups.length && <button className="ex-btn plain" disabled={busy} onClick={start}>{busy ? "…" : "Set up 2FA"}</button>}
      {setup && (
        <div className="ex-2fa-setup">
          <img src={setup.qr} alt="Scan this QR code in your authenticator app" />
          <small>Scan the QR, or enter this key manually:</small>
          <code>{setup.secret}</code>
          <input inputMode="numeric" placeholder="6-digit code from the app" value={code} onChange={(e) => setCode(e.target.value)} />
          <button className="ex-btn" disabled={busy} onClick={confirm}>{busy ? "…" : "Enable 2FA"}</button>
        </div>
      )}
      {backups.length > 0 && (
        <div className="ex-backups">
          <b>Save these backup codes</b>
          <small>Each works once if you lose your phone. Store them somewhere safe.</small>
          <div className="ex-backup-grid">{backups.map((c) => <code key={c}>{c}</code>)}</div>
          <button className="ex-btn plain" onClick={saveBackups}>⬇️ Download codes</button>
          <button className="ex-link" onClick={() => setBackups([])}>I saved them</button>
        </div>
      )}
      {err && <div className="ex-err">{err}</div>}
      {msg && <div className="ex-ok">{msg}</div>}
    </div>
  );
}
