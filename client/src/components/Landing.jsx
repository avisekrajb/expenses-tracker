import React from "react";
import InstallButton from "./InstallButton";

const FEATURES = [
  ["🎯", "Monthly budgets", "Set overall and category limits, then see exactly how many days your money can last."],
  ["🧾", "Receipts that stay put", "Attach a photo to any expense. Stored safely in the cloud, never lost in your gallery."],
  ["🤝", "Give & Take", "Track who owes you and what you owe, with due dates, settlement and overdue reminders."],
  ["📊", "Reports that make sense", "Daily to ten-year charts, month navigation, custom ranges and a six-month comparison."],
  ["✂️", "Split a bill", "Split dinner or rent with friends and create their IOUs in one tap."],
  ["🔔", "Device reminders", "Get push alerts for budget limits, overdue loans and recurring expenses."],
];

export default function Landing({ go }) {
  const link = (path) => (e) => { e.preventDefault(); go(path)(e); };
  return (
    <>
      <section className="pub-hero">
        <div className="pub-wrap pub-hero-grid">
          <div className="pub-hero-copy">
            <span className="pub-pill">Free · Private · Made in Nepal</span>
            <h1>Track every rupee.<br /><em>Reach every goal.</em></h1>
            <p>Kharcha is the simplest way for Kathmandu students, families and freelancers to understand their spending — without spreadsheets or judgment.</p>
            <div className="pub-cta">
              <a href="/login" onClick={link("/login")} className="pub-btn">Start tracking free →</a>
              <a href="/services" onClick={link("/services")} className="pub-btn ghost">See features</a>
            </div>
            <InstallButton className="pub-btn ghost" />
            <div className="pub-proof">
              <span><b>10</b> spending categories</span>
              <span><b>0</b> ads, ever</span>
              <span><b>100%</b> your data</span>
            </div>
          </div>
          <div className="pub-hero-art" aria-hidden="true">
            <div className="pub-phone">
              <div className="pub-phone-top"><span>₨ Kharcha</span><span>Thu, Nov 26</span></div>
              <div className="pub-phone-card">
                <small>Spent this month</small>
                <strong>Rs 12,480</strong>
                <div className="pub-phone-bar"><i /></div>
                <small>Rs 7,520 left · 4 days left</small>
              </div>
              <div className="pub-phone-row"><span>🍜 Eating</span><b>Rs 320</b></div>
              <div className="pub-phone-row"><span>🚌 Travel</span><b>Rs 80</b></div>
              <div className="pub-phone-row"><span>🏠 Rent share</span><b>Rs 8,000</b></div>
              <div className="pub-phone-nav"><span>🏠</span><span>🧾</span><span>🎯</span><span>🤝</span><span>📊</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="pub-section" id="about">
        <div className="pub-wrap">
          <span className="pub-kicker">Why Kharcha</span>
          <h2>Money is stressful enough.<br />Your tracker shouldn’t be.</h2>
          <p className="pub-lead">Most budgeting apps are built for salaries, credit cards and big banks. Kharcha is built for real life in Kathmandu — pocket money, hostel rent, momo runs and friends who split the bill.</p>
          <div className="pub-cards">
            {FEATURES.map(([icon, title, text]) => (
              <article className="pub-card" key={title}>
                <span className="pub-card-icon">{icon}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pub-section pub-band">
        <div className="pub-wrap pub-band-grid">
          <div>
            <span className="pub-kicker">How it works</span>
            <h2>Three steps. Zero fuss.</h2>
          </div>
          <ol className="pub-steps">
            <li><b>1</b><div><h3>Create your account</h3><p>Email, password and you’re in — no extra code to type.</p></div></li>
            <li><b>2</b><div><h3>Log what you spend</h3><p>Pick a category, type the amount, add a receipt. Takes five seconds.</p></div></li>
            <li><b>3</b><div><h3>See the full picture</h3><p>Budgets, charts, friend balances and reminders keep you on track.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="pub-section pub-cta-band">
        <div className="pub-wrap pub-cta-in">
          <div>
            <h2>Your future self will thank you.</h2>
            <p>Install the app, set a budget, and start today. It takes less than a minute.</p>
          </div>
          <div className="pub-cta">
            <a href="/login" onClick={link("/login")} className="pub-btn">Open your dashboard →</a>
            <a href="/donate" onClick={link("/donate")} className="pub-btn ghost">Support a family</a>
          </div>
        </div>
      </section>
    </>
  );
}
