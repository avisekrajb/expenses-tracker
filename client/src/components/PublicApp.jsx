import React, { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useSite } from "../context/SiteContext";
import { useSEO } from "../utils/seo";
import Landing from "./Landing";
import About from "./About";
import Services from "./Services";
import Contact from "./Contact";
import Donate from "./Donate";
import AuthModal from "./AuthModal";
import InstallButton from "./InstallButton";
import FeatureGate from "./FeatureGate";

const ROUTES = ["/", "/about", "/services", "/contact", "/donate", "/login", "/signup", "/admin"];
const AUTH_ROUTES = ["/login", "/signup", "/admin"];
const isAuthRoute = (path) => AUTH_ROUTES.includes(path);
const normalize = (p) => {
  const clean = (p || "/").replace(/\/+$/, "") || "/";
  return ROUTES.includes(clean) ? clean : "/";
};

const LINKS = [
  ["/", "Home"],
  ["/about", "About"],
  ["/services", "Services"],
  ["/contact", "Contact"],
];

function Brand({ config, go }) {
  return (
    <a href="/" className="pub-brand" onClick={go("/")} aria-label="Kharcha home">
      {config?.logoUrl ? <img src={config.logoUrl} alt="Kharcha logo" /> : <span>₨</span>}
      <b>Kharcha</b>
    </a>
  );
}

export default function PublicApp() {
  const initial = normalize(window.location.pathname);
  const [route, setRoute] = useState(initial);
  // Keep the last public page behind the auth modal instead of replacing it.
  const [pageRoute, setPageRoute] = useState(isAuthRoute(initial) ? "/" : initial);
  const [open, setOpen] = useState(false);
  // The neon "snake" border switches on after 10 seconds and then keeps running.
  const [neon, setNeon] = useState(false);
  const { dark, toggle } = useTheme();
  const { user } = useAuth();
  const { config, isAdmin } = useSite();
  useSEO(route === "/admin" ? "/login" : route);

  useEffect(() => {
    const timer = window.setTimeout(() => setNeon(true), 10000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const sync = () => {
      const next = normalize(window.location.pathname);
      setRoute(next);
      setOpen(false);
      if (!isAuthRoute(next)) setPageRoute(next);
    };
    window.addEventListener("popstate", sync);
    window.addEventListener("routechange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("routechange", sync);
    };
  }, []);

  const go = (path) => (e) => {
    e?.preventDefault();
    setOpen(false);
    if (path !== window.location.pathname) window.history.pushState(null, "", path);
    setRoute(path);
    if (!isAuthRoute(path)) {
      setPageRoute(path);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.dispatchEvent(new Event("routechange"));
  };

  const closeAuth = () => go(pageRoute)();
  const authMode = route === "/signup" ? "signup" : "login";
  const switchAuthMode = (mode) => {
    const path = mode === "signup" ? "/signup" : "/login";
    if (route !== path) go(path)();
  };

  const showAdmin = Boolean(user?.isAdmin || isAdmin);
  const page = {
    "/": <Landing go={go} />,
    "/about": <About go={go} />,
    "/services": <Services go={go} />,
    "/contact": <Contact contact={config?.contact} />,
    "/donate": <Donate go={go} />,
  }[pageRoute] || <Landing go={go} />;

  return (
    <div className={"pub-root" + (dark ? " dark" : "")}>
      <header className={"pub-header" + (neon ? " neon" : "")}>
        <div className="pub-wrap pub-header-in">
          <Brand config={config} go={go} />
          <button className="pub-theme" onClick={toggle} aria-label="Switch light or dark mode">{dark ? "☀️" : "🌙"}</button>
          <button className="pub-menu-btn" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {open ? "✕" : "☰"}
          </button>
          <nav className={"pub-nav" + (open ? " open" : "")} aria-label="Main navigation">
            {LINKS.map(([path, label]) => (
              <a key={path} href={path} onClick={go(path)} className={pageRoute === path ? "on" : ""}>{label}</a>
            ))}
            <a href="/donate" onClick={go("/donate")} className={pageRoute === "/donate" ? "on" : ""}>Donate</a>
            {showAdmin && <a href="/admin" onClick={go("/admin")} className={route === "/admin" ? "on" : ""}>Admin</a>}
            <a href="/login" onClick={go("/login")} className={route === "/login" ? "on" : ""}>Login</a>
            <a href="/signup" onClick={go("/signup")} className={"pub-nav-signup" + (route === "/signup" ? " on" : "")}>Sign up</a>
            <FeatureGate feature="install" label="Installable app">
              <InstallButton className="pub-btn tiny ghost" />
            </FeatureGate>
          </nav>
        </div>
      </header>

      <main id="main">{page}</main>

      <footer className="pub-footer">
        <div className="pub-wrap pub-footer-grid">
          <div>
            <Brand config={config} go={go} />
            <p>{config?.footer?.tagline || "Made in Kathmandu for anyone who wants to know where their money went."}</p>
          </div>
          <div>
            <h3>Explore</h3>
            {LINKS.map(([path, label]) => <a key={path} href={path} onClick={go(path)}>{label}</a>)}
          </div>
          <div>
            <h3>Get involved</h3>
            <a href="/donate" onClick={go("/donate")}>Donate to a family</a>
            <a href="/services" onClick={go("/services")}>All features</a>
            <a href="/contact" onClick={go("/contact")}>Contact &amp; support</a>
            {(config?.footer?.socialLinks || []).map((l, i) => (
              <a key={i} href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a>
            ))}
          </div>
          <div>
            <h3>Install</h3>
            <p>Add Kharcha to your home screen for quick, offline access.</p>
            <FeatureGate feature="install" label="Installable app">
              <InstallButton className="pub-btn tiny" />
            </FeatureGate>
          </div>
        </div>
        <div className="pub-wrap pub-bottom">
          {config?.footer?.copyright || `© ${new Date().getFullYear()} Kharcha. Built with care in Nepal.`}
          {" · "}<a href="/sitemap.xml">Sitemap</a>
        </div>
      </footer>

      {isAuthRoute(route) && (
        <AuthModal mode={authMode} onClose={closeAuth} onModeChange={switchAuthMode} />
      )}
    </div>
  );
}
