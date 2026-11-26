import React from "react";

export default function About({ go }) {
  const link = (path) => (e) => { e.preventDefault(); go(path)(e); };
  return (
    <>
      <section className="pub-page-hero">
        <div className="pub-wrap">
          <span className="pub-kicker">About us</span>
          <h1>Built in Kathmandu,<br />for everyday budgets.</h1>
          <p>Kharcha started with a simple question: why is it still hard to know where a month’s pocket money went? We built the tool we wished we had.</p>
        </div>
      </section>
      <section className="pub-section">
        <div className="pub-wrap pub-split">
          <div>
            <h2>Our promise</h2>
            <p>Kharcha is free, fast and private. No ads, no selling your data, no complicated accounting words. Your expenses belong to you — export them any time as CSV or JSON.</p>
            <p>Every feature exists because someone asked for it: a budget that warned them before month end, a way to remember who owes them tea money, a receipt photo they could actually find again.</p>
            <a href="/services" onClick={link("/services")} className="pub-btn">Explore the features →</a>
          </div>
          <div className="pub-quote">
            <span>“</span>
            <p>I stopped guessing whether I could afford a weekend trip. Kharcha tells me exactly how much I can spend today.</p>
            <small>— A very relieved Kathmandu student</small>
          </div>
        </div>
      </section>
      <section className="pub-section pub-band">
        <div className="pub-wrap pub-values">
          <article><h3>Privacy first</h3><p>Your data is tied to your account and never sold.</p></article>
          <article><h3>Simple by design</h3><p>Works on any phone. No spreadsheet skills needed.</p></article>
          <article><h3>Community minded</h3><p>Every donation helps a local family get a little further.</p></article>
        </div>
      </section>
    </>
  );
}
