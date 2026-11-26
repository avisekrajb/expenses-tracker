import React, { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useSEO } from "../utils/seo";
import Landing from "./Landing";
import About from "./About";
import Services from "./Services";
import Contact from "./Contact";
import Donate from "./Donate";
import Login from "./Login";
import InstallButton from "./InstallButton";

const ROUTES = ["/", "/about", "/services", "/contact", "/donate", "/login"];
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

export default function PublicApp() {
  const [route, setRoute] = useState(() => normalize(window.location.pathname));
  const [open, setOpen] = useState(false);
  const { dark, toggle } = useTheme();
  useSEO(route);

  useEffect(() => {
    const sync = () => setRoute(normalize(window.location.pathname));
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const go = (path) => (e) => {
    e?.preventDefault();
    setOpen(false);
    if (path !== window.location.pathname) window.history.pushState(null, "", path);
    setRoute(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const page = {
    "/": <Landing go={go} />,
    "/about": <About go={go} />,
    "/services": <Services go={go} />,
    "/contact": <Contact />,
    "/donate": <Donate go={go} />,
    "/login": <div className="pub-login-wrap"><Login /></div>,
  }[route];

  return (
    <div className={"pub-root" + (dark ? " dark" : "")}>
      <header className="pub-header">
        <div className="pub-wrap pub-header-in">
          <a href="/" className="pub-brand" onClick={go("/")} aria-label="Kharcha home">
            <span>₨</span><b>Kharcha</b>
          </a>
          <button className="pub-menu-btn" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {open ? "✕" : "☰"}
          </button>
          <nav className={"pub-nav" + (open ? " open" : "")} aria-label="Main navigation">
            {LINKS.map(([path, label]) => (
              <a key={path} href={path} onClick={go(path)} className={route === path ? "on" : ""}>{label}</a>
            ))}
            <a href="/donate" onClick={go("/donate")} className={route === "/donate" ? "on" : ""}>Donate</a>
            <a href="/login" onClick={go("/login")} className="pub-nav-login">Login</a>
            <InstallButton className="pub-btn tiny ghost" />
          </nav>
          <button className="pub-theme" onClick={toggle} aria-label="Switch light or dark mode">{dark ? "☀️" : "🌙"}</button>
        </div>
      </header>

      <main id="main">{page}</main>

      <footer className="pub-footer">
        <div className="pub-wrap pub-footer-grid">
          <div>
            <a href="/" className="pub-brand" onClick={go("/")}><span>₨</span><b>Kharcha</b></a>
            <p>Made in Kathmandu for anyone who wants to know where their money went.</p>
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
          </div>
          <div>
            <h3>Install</h3>
            <p>Add Kharcha to your home screen for quick, offline access.</p>
            <InstallButton className="pub-btn tiny" />
          </div>
        </div>
        <div className="pub-wrap pub-bottom">© {new Date().getFullYear()} Kharcha. Built with care in Nepal. · <a href="/sitemap.xml">Sitemap</a></div>
      </footer>
    </div>
  );
}
