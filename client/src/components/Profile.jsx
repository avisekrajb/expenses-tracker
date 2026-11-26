import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { resizePhoto } from "../utils/photo";
import { uploadPhoto, removePhoto } from "../services/upload";

export default function Profile({ items }) {
  const { user, setUser, logout } = useAuth();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [askOut, setAskOut] = useState(false);

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

  return (
    <div className="ex-page">
      <header><h2>Profile</h2></header>
      <div className="ex-card ex-center">
        <label className="ex-avatar" style={{ opacity: busy ? 0.6 : 1 }}>
          {user?.photo ? <img src={user.photo} alt="Profile" /> : <span>{user?.name?.[0]?.toUpperCase()}</span>}
          <em>📷</em>
          <input type="file" accept="image/*" hidden onChange={pick} />
        </label>
        <h3>{user?.name}</h3>
        <small className="ex-muted">{user?.email}</small>
        <small className="ex-muted">Kathmandu, Nepal · {items.length} expenses saved</small>
        {user?.photo && <button className="ex-link" onClick={drop}>Remove photo</button>}
        {err && <div className="ex-err">{err}</div>}
      </div>
      <button className="ex-btn" onClick={() => setAskOut(true)}>Log out</button>

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
