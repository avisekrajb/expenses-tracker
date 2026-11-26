/* Per-route SEO for this single-page app. Google reads the updated tags after JS runs;
   the same defaults are also present statically in index.html. */
import { useEffect } from "react";

const ORIGIN = "https://kharcha-expense-tracker-ashen.vercel.app";
const IMAGE = `${ORIGIN}/og-cover.png`;

export const PAGES = {
  "/": {
    title: "Kharcha – Kathmandu Expense Tracker | Track Every Rupee",
    description: "Free, private expense tracker for Kathmandu students and households. Budgets, receipts, friend loans, reports and device alerts in Nepali rupees.",
    keywords: "expense tracker Kathmandu, Kharcha, budget app Nepal, spending tracker Nepali rupees, free expense manager",
    schema: "WebSite",
  },
  "/about": {
    title: "About Kharcha | Built for Kathmandu Budgets",
    description: "Learn why Kharcha exists: a simple, private place to track daily spending, manage budgets and settle friend loans without spreadsheets.",
    keywords: "about Kharcha, expense tracker Nepal, Kathmandu budgeting app",
    schema: "AboutPage",
  },
  "/services": {
    title: "Features & Services | Kharcha Expense Tracker",
    description: "Monthly budgets, receipt photos, tags, split bills, recurring expenses, give/take loans, reports, JSON backup, 2FA and push notifications.",
    keywords: "budget app features, split bill Nepal, recurring expense tracker, loan tracker friends",
    schema: "WebPage",
  },
  "/contact": {
    title: "Contact Kharcha | Questions, Feedback & Support",
    description: "Get in touch with the Kharcha team for feedback, feature requests or help with your expense tracker account.",
    keywords: "contact Kharcha, expense tracker support Nepal",
    schema: "ContactPage",
  },
  "/donate": {
    title: "Donate to Help Poor Families in Nepal | Kharcha",
    description: "Support local families in need through Kharcha. Donate securely with eSewa or bank transfer and see your impact.",
    keywords: "donate Nepal, eSewa donation, help poor families Kathmandu, charity Nepal",
    schema: "DonateAction",
  },
  "/login": {
    title: "Log in to Kharcha | Your Expenses, Synced",
    description: "Log in to your Kharcha account to see budgets, reports, receipts and friend loans.",
    keywords: "Kharcha login, expense tracker login",
    schema: "WebPage",
    noindex: true,
  },
  "/signup": {
    title: "Create your Kharcha account | Free Expense Tracker",
    description: "Sign up for Kharcha to track Kathmandu expenses, budgets, receipts and friend loans in Nepali rupees.",
    keywords: "Kharcha signup, free expense tracker Nepal",
    schema: "WebPage",
    noindex: true,
  },
  "/app": {
    title: "Dashboard | Kharcha",
    description: "Your private Kharcha dashboard.",
    keywords: "",
    schema: "WebPage",
    noindex: true,
  },
  "/admin": {
    title: "Admin console | Kharcha",
    description: "Private administration area for Kharcha site settings and approvals.",
    keywords: "",
    schema: "WebPage",
    noindex: true,
  },
};

const setMeta = (attr, key, content) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

export function applySEO(path = "/") {
  const page = PAGES[path] || PAGES["/"];
  const url = ORIGIN + (path === "/app" ? "/#/home" : path);
  document.title = page.title;
  document.documentElement.lang = "en";
  setMeta("name", "description", page.description);
  setMeta("name", "keywords", page.keywords);
  setMeta("name", "robots", page.noindex ? "noindex,nofollow" : "index,follow,max-snippet:-1,max-image-preview:large");
  setMeta("property", "og:type", page.schema === "WebSite" ? "website" : "website");
  setMeta("property", "og:site_name", "Kharcha – Kathmandu Expense Tracker");
  setMeta("property", "og:title", page.title);
  setMeta("property", "og:description", page.description);
  setMeta("property", "og:url", url);
  setMeta("property", "og:image", IMAGE);
  setMeta("property", "og:locale", "en_US");
  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", page.title);
  setMeta("name", "twitter:description", page.description);
  setMeta("name", "twitter:image", IMAGE);

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = url;

  let ld = document.getElementById("kharcha-jsonld");
  if (!ld) {
    ld = document.createElement("script");
    ld.id = "kharcha-jsonld";
    ld.type = "application/ld+json";
    document.head.appendChild(ld);
  }
  ld.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": page.schema,
    name: "Kharcha",
    url: ORIGIN,
    description: page.description,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web, iOS, Android",
    offers: { "@type": "Offer", price: "0", priceCurrency: "NPR" },
    areaServed: { "@type": "Country", name: "Nepal" },
  });
}

export function useSEO(path) {
  useEffect(() => { applySEO(path); }, [path]);
}
