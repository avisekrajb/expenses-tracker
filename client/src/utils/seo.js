/* Per-route SEO for this single-page app. Google reads the updated tags after JS runs;
   the same defaults are also present statically in index.html. */
import { useEffect } from "react";

const ORIGIN = "https://kharcha-expense-tracker-ashen.vercel.app";
export const IMAGE = `${ORIGIN}/og-cover.png`;

// Shared by the visible FAQ section and the FAQPage structured data.
export const SERVICE_FAQS = [
  {
    q: "What is the best free expense tracker for Kathmandu students?",
    a: "Kharcha is a free, private expense tracker built around Nepali rupees. It combines daily spending, monthly budgets, receipt photos, tags, split bills and friend loans in one simple app.",
  },
  {
    q: "Can I track a household budget in Nepali rupees?",
    a: "Yes. Set an overall monthly budget and per-category limits, see your daily allowance, and follow progress with clear charts. All amounts use NPR formatting.",
  },
  {
    q: "Does Kharcha work offline or as a phone app?",
    a: "Kharcha is installable on Android and iOS. Add it to your home screen and use the cached app shell offline; your data syncs when you are back online.",
  },
  {
    q: "Can I split a bill with friends and track who owes whom?",
    a: "Yes. Split an expense and Kharcha creates a Give/Take entry automatically, with overdue reminders so shared bills are easy to settle.",
  },
  {
    q: "How are donations verified?",
    a: "Supporters upload a payment screenshot, and an admin verifies it before the pledge is counted in the public impact total.",
  },
];

const FEATURE_LIST = [
  "Daily expense tracking in NPR",
  "Monthly budgets and daily allowance",
  "Receipt photo storage",
  "Tags, search and custom date ranges",
  "Give and take friend loans with overdue alerts",
  "Split bills",
  "Recurring expenses",
  "Reports with bar, line and pie charts",
  "Web push notifications",
  "Installable PWA for Android and iOS",
  "JSON and CSV data export",
];

export const PAGES = {
  "/": {
    title: "Kharcha – Kathmandu Expense Tracker | Track Every Rupee",
    description: "Free, private expense tracker for Kathmandu students, households and freelancers. Track daily spending in Nepali rupees with budgets, receipts, loans, reports and reminders.",
    keywords: "expense tracker Kathmandu, Kharcha, budget app Nepal, spending tracker Nepali rupees, free expense manager, daily expense tracker NPR, student budget app Nepal, household budget Kathmandu, receipt tracker app, offline expense tracker PWA",
    schema: "WebSite",
  },
  "/about": {
    title: "About Kharcha | Built for Kathmandu Budgets",
    description: "Learn why Kharcha exists: a simple, private place to track daily spending, manage NPR budgets, save receipts and settle friend loans without spreadsheets.",
    keywords: "about Kharcha, expense tracker Nepal, Kathmandu budgeting app, why use an expense tracker, private budget app Nepal",
    schema: "AboutPage",
  },
  "/services": {
    title: "Expense Tracker Features | Budgets, Receipts, Loans & Reports | Kharcha",
    description: "Explore Kharcha features: monthly budgets, receipt photos, tags, split bills, recurring expenses, give/take loans, reports, JSON export and push notifications.",
    keywords: "budget app features, split bill Nepal, recurring expense tracker, friend loan tracker, receipt photo app, expense report charts, offline budget app, push notification expense tracker, installable PWA Nepal",
    schema: "FAQPage",
  },
  "/contact": {
    title: "Contact Kharcha | Questions, Feedback & Support",
    description: "Get in touch with the Kharcha team for feedback, feature requests, donation questions or help with your expense tracker account.",
    keywords: "contact Kharcha, expense tracker support Nepal, budget app feedback, Kharcha help desk",
    schema: "ContactPage",
  },
  "/donate": {
    title: "Donate to Help Families in Nepal | eSewa, UPI & Bank | Kharcha",
    description: "Support local families in Nepal through Kharcha. Give with eSewa, UPI, a scanned QR or bank transfer, then see your verified impact.",
    keywords: "donate Nepal, eSewa donation, UPI donation Nepal, QR donation Kathmandu, help poor families Nepal, charity Nepal, verified donation tracker",
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

const schemaFor = (page) => {
  if (page.schema === "FAQPage") {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: SERVICE_FAQS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    };
  }
  return {
    "@context": "https://schema.org",
    "@type": page.schema,
    name: "Kharcha",
    url: ORIGIN,
    description: page.description,
    inLanguage: "en",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web, iOS, Android",
    featureList: FEATURE_LIST.join(", "),
    offers: { "@type": "Offer", price: "0", priceCurrency: "NPR" },
    areaServed: { "@type": "Country", name: "Nepal" },
    publisher: { "@type": "Organization", name: "Kharcha" },
  };
};

export function applySEO(path = "/") {
  const page = PAGES[path] || PAGES["/"];
  const url = ORIGIN + (path === "/app" ? "/#/home" : path);
  document.title = page.title;
  document.documentElement.lang = "en";
  setMeta("name", "description", page.description);
  setMeta("name", "keywords", page.keywords);
  setMeta("name", "robots", page.noindex ? "noindex,nofollow" : "index,follow,max-snippet:-1,max-image-preview:large");
  setMeta("name", "author", "Kharcha");
  setMeta("property", "og:type", "website");
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
  ld.textContent = JSON.stringify(schemaFor(page));
}

export function useSEO(path) {
  useEffect(() => { applySEO(path); }, [path]);
}
