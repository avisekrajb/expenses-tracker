import React from "react";

const GROUPS = [
  {
    icon: "💸", title: "Know your money",
    items: [
      ["Daily, weekly and yearly reports", "Switch periods in one tap, from today to ten years."],
      ["Custom date ranges", "Pick any from/to window and compare the last six months."],
      ["Bar, line and pie charts", "See categories, trends and your biggest spending days."],
      ["Insights", "Month-over-month change, daily average and projected spend."],
    ],
  },
  {
    icon: "🎯", title: "Stay on track",
    items: [
      ["Monthly budgets", "Overall and per-category limits with progress bars."],
      ["Daily allowance", "See how much you can safely spend for the rest of the month."],
      ["Tags & search", "Label expenses and find them by note, category or tag."],
      ["Recurring expenses", "Add all this month’s repeats with one tap."],
    ],
  },
  {
    icon: "🤝", title: "Money with people",
    items: [
      ["Give & Take", "Track what friends owe you and what you owe them."],
      ["Split a bill", "Share an expense and create each friend’s IOU automatically."],
      ["Overdue alerts", "Know who is late, with push reminders."],
      ["Receipt photos", "Attach proof of payment, stored on Cloudinary."],
    ],
  },
  {
    icon: "🔐", title: "Safe and available",
    items: [
      ["Two-step verification", "Authenticator app codes plus backup codes."],
      ["Device notifications", "Web Push works even when the tab is closed."],
      ["Installable app", "Add Kharcha to your home screen and use it offline."],
      ["JSON & CSV export", "Your data is always yours to take."],
    ],
  },
];

export default function Services({ go }) {
  const link = (path) => (e) => { e.preventDefault(); go(path)(e); };
  return (
    <>
      <section className="pub-page-hero">
        <div className="pub-wrap">
          <span className="pub-kicker">Features</span>
          <h1>Everything you need.<br />Nothing you don’t.</h1>
          <p>A single, calm place for budgets, receipts, shared bills and the numbers that actually matter.</p>
          <a href="/login" onClick={link("/login")} className="pub-btn">Try it free →</a>
        </div>
      </section>
      <section className="pub-section">
        <div className="pub-wrap pub-service-grid">
          {GROUPS.map((g) => (
            <article className="pub-service" key={g.title}>
              <span>{g.icon}</span>
              <h2>{g.title}</h2>
              {g.items.map(([title, text]) => (
                <div className="pub-service-item" key={title}>
                  <h3>{title}</h3><p>{text}</p>
                </div>
              ))}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
