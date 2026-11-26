import React, { useState } from "react";
import { send } from "../services/contact";

export default function Contact({ contact }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const support = contact?.email || "hello@kharcha.app";

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setStatus("");
    try {
      await send(name, email, message);
      setStatus("Thanks! Your message is saved and the admin can read it.");
      setName(""); setEmail(""); setMessage("");
    } catch {
      // Fallback: still let the user reach the team from their email app.
      const subject = encodeURIComponent(`Kharcha feedback from ${name || "a user"}`);
      const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nReply to: ${email}`);
      window.location.href = `mailto:${support}?subject=${subject}&body=${body}`;
      setStatus("Opening your email app as a fallback…");
    }
    setBusy(false);
  };

  return (
    <>
      <section className="pub-page-hero">
        <div className="pub-wrap">
          <span className="pub-kicker">Contact</span>
          <h1>We’d love to hear from you.</h1>
          <p>Bug, idea, or just want to say the charts look nice? Send a note — a real person reads every message.</p>
        </div>
      </section>
      <section className="pub-section">
        <div className="pub-wrap pub-split">
          <form className="pub-form" onSubmit={submit}>
            <label>Your name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Bandana" required /></label>
            <label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></label>
            <label>Message<textarea rows="5" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us what’s on your mind…" required /></label>
            <button className="pub-btn" type="submit" disabled={busy}>{busy ? "Sending…" : "Send message ✉️"}</button>
            {status && <small>{status}</small>}
          </form>
          <div className="pub-contact-info">
            <article><h3>Email</h3><p>{support}</p><small>{contact?.responseTime || "Usually replied to within two days."}</small></article>
            {contact?.phone && <article><h3>Phone</h3><p>{contact.phone}</p><small>Reachable during Nepal business hours.</small></article>}
            <article><h3>Based in</h3><p>{contact?.address || "Kathmandu, Nepal 🇳🇵"}</p><small>Built for local budgets, usable anywhere.</small></article>
            <article><h3>Security</h3><p>Found a vulnerability?</p><small>Email with the subject “Security” and we’ll respond quickly.</small></article>
          </div>
        </div>
      </section>
    </>
  );
}
