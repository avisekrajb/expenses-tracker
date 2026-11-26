import React, { useEffect, useState } from "react";
import * as push from "../services/notifications";
import NotificationSettings from "./NotificationSettings";

const when = (value) => {
  if (!value) return "";
  const d = new Date(value);
  return d.toLocaleString("en", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
};

// Signed-in users can read admin announcements here even if device push is off.
export default function NotificationPage({ onChange }) {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try { setRows(await push.announcements()); }
    catch (e) { setMsg(e.message); }
  };

  useEffect(() => {
    load();
    const onChanged = () => load();
    window.addEventListener("announcements:changed", onChanged);
    return () => window.removeEventListener("announcements:changed", onChanged);
  }, []);

  const changed = () => {
    onChange?.();
    window.dispatchEvent(new Event("announcements:changed"));
  };

  const pick = async (row) => {
    setOpen((id) => (id === row.id ? null : row.id));
    if (row.read) return;
    try {
      await push.markRead(row.id);
      setRows((list) => list.map((x) => (x.id === row.id ? { ...x, read: true } : x)));
      changed();
    } catch (e) { setMsg(e.message); }
  };

  const readAll = async () => {
    setBusy(true); setMsg("");
    try {
      await push.markAllRead();
      setRows((list) => list.map((x) => ({ ...x, read: true })));
      changed();
      setMsg("All notifications marked as read.");
    } catch (e) { setMsg(e.message); }
    setBusy(false);
  };

  const unread = rows.filter((x) => !x.read).length;

  return (
    <div className="ex-page nt-page">
      <header className="nt-head">
        <div>
          <h2>Notifications</h2>
          <small>Updates from Kharcha, in one place</small>
        </div>
        {unread > 0 && <button className="ex-btn plain" disabled={busy} onClick={readAll}>Mark all read</button>}
      </header>

      {msg && <div className="ex-ok nt-msg">{msg}</div>}

      <div className="nt-push">
        <NotificationSettings />
      </div>

      {rows.length === 0 ? (
        <div className="ex-card nt-empty">
          <span>🔔</span>
          <b>You’re all caught up</b>
          <small>Admin updates and photo announcements will appear here.</small>
        </div>
      ) : (
        <div className="nt-list">
          {rows.map((row) => (
            <article key={row.id} className={"nt-card" + (row.read ? "" : " unread")}>
              <button className="nt-card-main" onClick={() => pick(row)} aria-expanded={open === row.id}>
                <span className="nt-icon">{row.image?.url ? "📸" : "📢"}</span>
                <span className="nt-body">
                  <b>{row.title}</b>
                  <small>{when(row.createdAt)}</small>
                  <p>{row.message || "Photo update from the Kharcha team"}</p>
                </span>
                {!row.read && <i className="nt-dot" aria-label="Unread" />}
                <span className="nt-chevron">{open === row.id ? "−" : "+"}</span>
              </button>
              {open === row.id && row.image?.url && (
                <img className="nt-photo" src={row.image.url} alt={row.title || "Notification photo"} />
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
