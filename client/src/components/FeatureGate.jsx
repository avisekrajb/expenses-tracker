import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSite } from "../context/SiteContext";

// Keeps the original content mounted (so no saved data is removed), but blurs
// and locks it until an admin enables the feature or approves a request.
export default function FeatureGate({ feature, label, children }) {
  const { can, requests, request } = useSite();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  if (can(feature)) return <>{children}</>;

  const pending = requests.some((r) => r.feature === feature && r.status === "pending");

  const ask = async () => {
    if (!user) { window.history.pushState(null, "", "/login"); window.dispatchEvent(new Event("routechange")); return; }
    setBusy(true);
    setMsg("");
    try { await request(feature, `Please enable ${label || feature}.`); setMsg("Request sent to the admin."); }
    catch (e) { setMsg(e.message); }
    setBusy(false);
  };

  return (
    <div className="feature-lock">
      <div className="feature-lock-blur" aria-hidden="true">{children}</div>
      <div className="feature-lock-overlay" role="status">
        <div className="feature-lock-card">
          <b>🔒 {label || feature} is off</b>
          <p>Your saved data is safe — nothing was deleted. Ask the admin to switch it back on.</p>
          {pending ? (
            <span className="feature-lock-pending">Request pending admin approval…</span>
          ) : (
            <button type="button" className="pub-btn tiny" disabled={busy} onClick={ask}>
              {busy ? "Sending…" : user ? "Request access" : "Log in to request"}
            </button>
          )}
          {msg && <small>{msg}</small>}
        </div>
      </div>
    </div>
  );
}
