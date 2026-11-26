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
import Login from "./Login";
import InstallButton from "./InstallButton";
import FeatureGate from "./FeatureGate";

const ROUTES = ["/", "/about", "/services", "/contact", "/donate", "/login", "/admin"];
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
  const [route, setRoute] = useState(() => normalize(window.location.pathname));
  const [open, setOpen] = useState(false);
  const { dark, toggle } = useTheme();
  const { user } = useAuth();
  const { config, isAdmin } = useSite();
  useSEO(route === "/admin" ? "/login" : route);

  useEffect(() => {
    const sync = () => setRoute(normalize(window.location.pathname));
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
    window.dispatchEvent(new Event("routechange"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showAdmin = Boolean(user?.isAdmin || isAdmin);
  const page = {
    "/": <Landing go={go} />,
    "/about": <About go={go} />,
    "/services": <Services go={go} />,
    "/contact": <Contact contact={config?.contact} />,
    "/donate": <Donate go={go} />,
    "/login": <div className="pub-login-wrap"><Login /></div>,
    "/admin": <div className="pub-login-wrap"><Login /></div>,
  }[route];

  return (
    <div className={"pub-root" + (dark ? " dark" : "")}>
      <header className="pub-header">
        <div className="pub-wrap pub-header-in">
          <Brand config={config} go={go} />
          <button className="pub-menu-btn" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {open ? "✕" : "☰"}
          </button>
          <nav className={"pub-nav" + (open ? " open" : "")} aria-label="Main navigation">
            {LINKS.map(([path, label]) => (
              <a key={path} href={path} onClick={go(path)} className={route === path ? "on" : ""}>{label}</a>
            ))}
            <a href="/donate" onClick={go("/donate")} className={route === "/donate" ? "on" : ""}>Donate</a>
            {showAdmin && <a href="/admin" onClick={go("/admin")} className={route === "/admin" ? "on" : ""}>Admin</a>}
            <a href="/login" onClick={go("/login")} className="pub-nav-login">Login</a>
            <FeatureGate feature="install" label="Installable app">
              <InstallButton className="pub-btn tiny ghost" />
            </FeatureGate>
          </nav>
          <button className="pub-theme" onClick={toggle} aria-label="Switch light or dark mode">{dark ? "☀️" : "🌙"}</button>
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
    </div>
  );
}
