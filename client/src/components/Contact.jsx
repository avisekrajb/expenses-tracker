import React, { useState } from "react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const send = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Kharcha feedback from ${name || "a user"}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nReply to: ${email}`);
    window.location.href = `mailto:hello@kharcha.app?subject=${subject}&body=${body}`;
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
          <form className="pub-form" onSubmit={send}>
            <label>Your name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Bandana" required /></label>
            <label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></label>
            <label>Message<textarea rows="5" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us what’s on your mind…" required /></label>
            <button className="pub-btn" type="submit">Send message ✉️</button>
            <small>Opens your email app with the message ready to send.</small>
          </form>
          <div className="pub-contact-info">
            <article><h3>Email</h3><p>hello@kharcha.app</p><small>Usually replied to within two days.</small></article>
            <article><h3>Based in</h3><p>Kathmandu, Nepal 🇳🇵</p><small>Built for local budgets, usable anywhere.</small></article>
            <article><h3>Security</h3><p>Found a vulnerability?</p><small>Email with the subject “Security” and we’ll respond quickly.</small></article>
          </div>
        </div>
      </section>
    </>
  );
}
