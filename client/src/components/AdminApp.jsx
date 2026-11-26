import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSite } from "../context/SiteContext";
import { useSEO } from "../utils/seo";
import { admin } from "../services/site";

const FEATURE_LABELS = {
  expenses: "Expenses", budgets: "Budgets", loans: "Give & Take", reports: "Reports",
  receipts: "Receipt photos", tags: "Tags & search", splitBills: "Split bills",
  recurring: "Recurring", donations: "Donations", twoFactor: "Two-step verification",
  notifications: "Device notifications", install: "Installable app",
};
const DONATION_FIELDS = [
  ["esewaId", "eSewa ID"], ["esewaName", "eSewa account name"],
  ["bankName", "Bank name"], ["bankAccount", "Bank account"],
  ["bankBranch", "Bank branch"], ["bankSwift", "SWIFT / IFSC"],
  ["qrUrl", "QR image URL"], ["note", "Public note"],
];
const TABS = ["Overview", "Content", "Features", "Requests", "Donations", "Messages"];
const TAB_ICONS = {
  Overview: "⌂", Content: "✎", Features: "⚡",
  Requests: "📨", Donations: "💛", Messages: "✉️",
};

function Row({ label, children }) {
  return <label className="ad-field"><span>{label}</span>{children}</label>;
}

export default function AdminApp() {
  const { user, logout } = useAuth();
  const { refreshConfig, refreshFeatures } = useSite();
  useSEO("/admin");
  const [tab, setTab] = useState("Overview");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [settings, setSettings] = useState(null);
  const [requests, setRequests] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [donations, setDonations] = useState(null);
  const [messages, setMessages] = useState([]);
  const [neon, setNeon] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setNeon(true), 10000);
    return () => window.clearTimeout(timer);
  }, []);

  const goHome = () => {
    window.history.replaceState(null, "", "/");
    window.dispatchEvent(new Event("routechange"));
  };

  const load = async () => {
    if (!user?.isAdmin) return;
    try {
      const [s, r, o, d, m] = await Promise.all([
        admin.settings(), admin.requests(), admin.overrides(), admin.donations(), admin.messages(),
      ]);
      setSettings(s); setRequests(r); setOverrides(o); setDonations(d); setMessages(m);
    } catch (e) { setMsg(e.message); }
  };

  useEffect(() => { load(); }, [user?.isAdmin]);

  const run = async (fn, success = "Saved.") => {
    setBusy(true); setMsg("");
    try {
      await fn();
      setMsg(success);
      await load();
      refreshConfig();
      refreshFeatures();
      window.dispatchEvent(new Event("features:changed"));
    } catch (e) { setMsg(e.message); }
    setBusy(false);
  };

  const saveSetting = (patch) => run(() => admin.saveSettings(patch).then(setSettings), "Settings saved.");

  if (!user) {
    return (
      <div className="ad-shell">
        <div className="ad-card">
          <h1>Admin console</h1>
          <p>Please log in with an admin account first.</p>
          <button className="pub-btn" onClick={() => {
            window.history.pushState(null, "", "/login");
            window.dispatchEvent(new Event("routechange"));
          }}>Go to login</button>
        </div>
      </div>
    );
  }
  if (!user.isAdmin) {
    return (
      <div className="ad-shell">
        <div className="ad-card">
          <h1>🔒 Admin only</h1>
          <p>This area is restricted to accounts listed in ADMIN_EMAILS.</p>
          <button className="pub-btn" onClick={goHome}>Back to site</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ad-shell">
      <header className={"ad-top" + (neon ? " neon" : "")}>
        <div className="ad-brand"><span>₨</span><b>Kharcha Admin</b></div>
        <div className="ad-top-right">
          <small>{user.email}</small>
          <button className="pub-btn tiny ghost" onClick={goHome}>View site</button>
          <button className="pub-btn tiny ghost" onClick={() => { logout(); goHome(); }}>Log out</button>
        </div>
      </header>

      <div className="ad-wrap">
        <section className="ad-mobile-hero" aria-label="Admin overview">
          <div className="ad-mobile-hero-top">
            <div>
              <small>Control center</small>
              <h1>Good to see you 👋</h1>
              <p>Tap a card to jump straight to what needs attention.</p>
            </div>
            <span className="ad-mobile-live"><i />Live</span>
          </div>
          <div className="ad-mobile-stats">
            <button onClick={() => setTab("Requests")}>
              <b>{requests.filter((r) => r.status === "pending").length}</b><small>Requests</small>
            </button>
            <button onClick={() => setTab("Features")}>
              <b>{overrides.length}</b><small>User grants</small>
            </button>
            <button onClick={() => setTab("Donations")}>
              <b>{donations?.pendingCount ?? 0}</b><small>To verify</small>
            </button>
            <button onClick={() => setTab("Messages")}>
              <b>{messages.filter((m) => m.status === "new").length}</b><small>Messages</small>
            </button>
          </div>
        </section>

        <nav className="ad-tabs" aria-label="Admin sections">
          {TABS.map((t) => (
            <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>
          ))}
        </nav>
        <nav className="ad-mobile-tabs" aria-label="Admin sections">
          {TABS.map((t) => (
            <button key={t} className={tab === t ? "on" : ""} onClick={() => {
              setTab(t);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}>
              <span>{TAB_ICONS[t]}</span><small>{t}</small>
            </button>
          ))}
        </nav>
        {msg && <div className="ad-msg">{msg}</div>}

        {tab === "Overview" && (
          <section className="ad-card">
            <h2>Overview</h2>
            <p className="ad-muted">Signed in as {user.email}. Changes here apply to the live site immediately.</p>
            <div className="ad-stats">
              <div><b>{requests.filter((r) => r.status === "pending").length}</b><small>feature requests</small></div>
              <div><b>{overrides.length}</b><small>user grants</small></div>
              <div><b>{donations?.pendingCount ?? 0}</b><small>donations to review</small></div>
              <div><b>{messages.filter((m) => m.status === "new").length}</b><small>new messages</small></div>
            </div>
          </section>
        )}

        {tab === "Content" && settings && (
          <section className="ad-card">
            <h2>Site content</h2>
            <h3>Logo</h3>
            <div className="ad-logo-row">
              {settings.logoUrl ? <img src={settings.logoUrl} alt="Current logo" /> : <span>₨</span>}
              <input type="file" accept="image/*" disabled={busy} onChange={(e) => {
                const f = e.target.files?.[0]; e.target.value = "";
                if (f) run(() => admin.saveLogo(f).then(setSettings), "Logo uploaded.");
              }} />
              <Row label="Or image URL">
                <input type="url" defaultValue={settings.logoUrl} placeholder="https://…"
                  onBlur={(e) => { if (e.target.value !== settings.logoUrl) saveSetting({ logoUrl: e.target.value }); }} />
              </Row>
            </div>

            <h3>Contact details</h3>
            <div className="ad-grid">
              {["email", "phone", "address", "responseTime"].map((key) => (
                <Row key={key} label={key}>
                  <input defaultValue={settings.contact[key]} onBlur={(e) =>
                    saveSetting({ contact: { [key]: e.target.value } })} />
                </Row>
              ))}
            </div>

            <h3>Footer</h3>
            <div className="ad-grid">
              <Row label="Tagline"><input defaultValue={settings.footer.tagline} onBlur={(e) => saveSetting({ footer: { tagline: e.target.value } })} /></Row>
              <Row label="Copyright"><input defaultValue={settings.footer.copyright} onBlur={(e) => saveSetting({ footer: { copyright: e.target.value } })} /></Row>
            </div>
            <div className="ad-socials">
              {settings.footer.socialLinks.map((link, i) => (
                <div key={i} className="ad-social-row">
                  <input defaultValue={link.label} placeholder="Label" onBlur={(e) => {
                    const socialLinks = settings.footer.socialLinks.map((l, j) => j === i ? { ...l, label: e.target.value } : l);
                    saveSetting({ footer: { socialLinks } });
                  }} />
                  <input defaultValue={link.url} placeholder="https://…" onBlur={(e) => {
                    const socialLinks = settings.footer.socialLinks.map((l, j) => j === i ? { ...l, url: e.target.value } : l);
                    saveSetting({ footer: { socialLinks } });
                  }} />
                  <button type="button" onClick={() => saveSetting({
                    footer: { socialLinks: settings.footer.socialLinks.filter((_, j) => j !== i) },
                  })}>Remove</button>
                </div>
              ))}
              <button type="button" className="pub-btn tiny ghost" onClick={() => saveSetting({
                footer: { socialLinks: [...settings.footer.socialLinks, { label: "New link", url: "https://" }] },
              })}>+ Add social link</button>
            </div>

            <h3>Donation details</h3>
            <div className="ad-grid">
              {DONATION_FIELDS.map(([key, label]) => (
                <Row key={key} label={label}>
                  <input defaultValue={settings.donations[key]} onBlur={(e) =>
                    saveSetting({ donations: { [key]: e.target.value } })} />
                </Row>
              ))}
            </div>
          </section>
        )}

        {tab === "Features" && settings && (
          <section className="ad-card">
            <h2>Feature switches</h2>
            <p className="ad-muted">Turning one off blurs it for everyone but keeps all saved data. Users can request access and you can approve it in Requests.</p>
            <div className="ad-switch-grid">
              {Object.keys(FEATURE_LABELS).map((key) => (
                <label key={key} className="ad-switch">
                  <input type="checkbox" checked={settings.features[key] !== false} disabled={busy}
                    onChange={(e) => saveSetting({ features: { [key]: e.target.checked } })} />
                  <span>{FEATURE_LABELS[key]}</span>
                  <small>{settings.features[key] === false ? "Off" : "On"}</small>
                </label>
              ))}
            </div>
            <h3>Approved user access</h3>
            {overrides.length === 0 ? <p className="ad-muted">No individual grants yet.</p> : (
              <div className="ad-list">
                {overrides.map((o) => (
                  <div key={o.id} className="ad-list-row">
                    <span><b>{o.userId?.name || o.userId?.email}</b> · {FEATURE_LABELS[o.feature] || o.feature}</span>
                    <button type="button" disabled={busy} onClick={() => run(() => admin.revokeOverride(o.id), "Access revoked.")}>Revoke</button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "Requests" && (
          <section className="ad-card">
            <h2>Feature requests</h2>
            {requests.length === 0 ? <p className="ad-muted">No requests yet.</p> : (
              <div className="ad-list">
                {requests.map((r) => (
                  <div key={r.id} className="ad-list-row">
                    <div>
                      <b>{FEATURE_LABELS[r.feature] || r.feature}</b>
                      <small>{r.userId?.name || "User"} · {r.userId?.email} · {r.status}</small>
                      {r.note && <p>{r.note}</p>}
                    </div>
                    {r.status === "pending" && (
                      <div className="ad-actions">
                        <button type="button" className="pub-btn tiny" disabled={busy}
                          onClick={() => run(() => admin.reviewRequest(r.id, "approved"), "Request approved.")}>Approve</button>
                        <button type="button" className="pub-btn tiny ghost" disabled={busy}
                          onClick={() => run(() => admin.reviewRequest(r.id, "rejected"), "Request rejected.")}>Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "Donations" && (
          <section className="ad-card">
            <h2>Donations</h2>
            <p className="ad-muted">{donations?.pendingCount || 0} awaiting review · Rs {Number(donations?.approvedTotal || 0).toLocaleString("en-NP")} approved</p>
            {(donations?.rows || []).length === 0 ? <p className="ad-muted">No pledges yet.</p> : (
              <div className="ad-list">
                {donations.rows.map((d) => (
                  <div key={d.id} className="ad-list-row">
                    <div>
                      <b>Rs {Number(d.amount).toLocaleString("en-NP")} · {d.method}</b>
                      <small>{d.userId?.name || "User"} · {d.userId?.email} · {d.status} · {new Date(d.createdAt).toLocaleDateString()}</small>
                      {d.note && <p>{d.note}</p>}
                      {d.screenshot?.url && <a href={d.screenshot.url} target="_blank" rel="noreferrer">View payment screenshot ↗</a>}
                    </div>
                    {d.status === "pending" && (
                      <div className="ad-actions">
                        <button type="button" className="pub-btn tiny" disabled={busy}
                          onClick={() => run(() => admin.reviewDonation(d.id, "approved"), "Donation approved.")}>Approve</button>
                        <button type="button" className="pub-btn tiny ghost" disabled={busy}
                          onClick={() => run(() => admin.reviewDonation(d.id, "rejected"), "Donation rejected.")}>Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "Messages" && (
          <section className="ad-card">
            <h2>Contact messages</h2>
            {messages.length === 0 ? <p className="ad-muted">No messages yet.</p> : (
              <div className="ad-list">
                {messages.map((m) => (
                  <div key={m.id} className="ad-list-row">
                    <div>
                      <b>{m.name} · {m.status}</b>
                      <small><a href={`mailto:${m.email}`}>{m.email}</a> · {new Date(m.createdAt).toLocaleDateString()}</small>
                      <p>{m.message}</p>
                    </div>
                    <div className="ad-actions">
                      {m.status !== "read" && <button type="button" disabled={busy} onClick={() => run(() => admin.reviewMessage(m.id, "read"), "Marked read.")}>Mark read</button>}
                      {m.status !== "archived" && <button type="button" disabled={busy} onClick={() => run(() => admin.reviewMessage(m.id, "archived"), "Archived.")}>Archive</button>}
                      <button type="button" disabled={busy} onClick={() => run(() => admin.deleteMessage(m.id), "Message deleted.")}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
