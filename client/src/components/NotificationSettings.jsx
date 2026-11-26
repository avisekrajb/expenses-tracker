import React, { useEffect, useState } from "react";
import * as push from "../services/notifications";

const permission = () => (typeof Notification === "undefined" ? "unsupported" : Notification.permission);

export default function NotificationSettings() {
  const [cfg, setCfg] = useState({ enabled: false, publicKey: "" });
  const [perm, setPerm] = useState(permission());
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const config = await push.getConfig();
        let hasSub = false;
        if ("serviceWorker" in navigator && "PushManager" in window) {
          const reg = await navigator.serviceWorker.ready;
          hasSub = Boolean(await reg.pushManager.getSubscription());
        }
        if (alive) { setCfg(config); setSubscribed(hasSub); }
      } catch { /* keep defaults */ }
    })();
    return () => { alive = false; };
  }, []);

  const registration = async () => {
    if (!("serviceWorker" in navigator)) throw new Error("This browser does not support service workers.");
    return navigator.serviceWorker.ready;
  };

  const enable = async () => {
    setBusy(true); setMsg("");
    try {
      if (perm === "unsupported") throw new Error("This browser does not support notifications.");
      let p = Notification.permission;
      if (p === "default") p = await Notification.requestPermission();
      setPerm(p);
      if (p !== "granted") throw new Error("Notification permission was not granted.");
      if (!cfg.enabled || !cfg.publicKey) throw new Error("Push notifications are not configured on the server.");
      const reg = await registration();
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: push.urlBase64ToUint8Array(cfg.publicKey),
      });
      await push.subscribe(sub.toJSON(), navigator.userAgent.slice(0, 80));
      setSubscribed(true);
      setMsg("This device is subscribed. A test notification is on its way.");
      await push.test();
    } catch (e) { setMsg(e.message); }
    setBusy(false);
  };

  const disable = async () => {
    setBusy(true);
    try {
      const reg = await registration();
      const sub = await reg.pushManager.getSubscription();
      if (sub) { await push.unsubscribe(sub.endpoint); await sub.unsubscribe(); }
      setSubscribed(false);
      setMsg("Notifications turned off on this device.");
    } catch (e) { setMsg(e.message); }
    setBusy(false);
  };

  const test = async () => {
    setBusy(true);
    try {
      const r = await push.test();
      setMsg(r.sent ? `Test notification sent to ${r.sent} device(s).` : "No active subscription found on this device.");
    } catch (e) { setMsg(e.message); }
    setBusy(false);
  };

  return (
    <div className="ex-card ex-notify">
      <div className="ex-between">
        <b>🔔 Device notifications</b>
        <span className={"ex-badge" + (subscribed ? " ok" : "")}>{subscribed ? "On" : "Off"}</span>
      </div>
      <small>Get budget alerts, overdue loan reminders and recurring expense nudges — even when this tab is closed.</small>
      <div className="ex-notify-status">
        <span>Browser permission</span><b>{perm}</b>
      </div>
      <div className="ex-notify-actions">
        <button className="ex-btn plain" disabled={busy || subscribed} onClick={enable}>{busy ? "…" : subscribed ? "Enabled on this device" : "Enable notifications"}</button>
        {subscribed && <button className="ex-btn plain" disabled={busy} onClick={test}>Send test</button>}
        {subscribed && <button className="ex-link" disabled={busy} onClick={disable}>Turn off on this device</button>}
      </div>
      {msg && <div className="ex-ok">{msg}</div>}
    </div>
  );
}
