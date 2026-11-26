import React, { useEffect, useState } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SiteProvider } from "./context/SiteContext";
import { useSEO } from "./utils/seo";
import Expenses from "./components/Expenses";
import PublicApp from "./components/PublicApp";
import AdminApp from "./components/AdminApp";

function Dashboard() {
  // Private dashboard should never be indexed.
  useSEO("/app");
  return <Expenses />;
}

function Root() {
  const { user, ready } = useAuth();
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const sync = () => setPath(window.location.pathname);
    window.addEventListener("popstate", sync);
    window.addEventListener("routechange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("routechange", sync);
    };
  }, []);

  if (!ready) return <div className="pub-loading"><div className="ex-logo">₨</div><p>Loading Kharcha…</p></div>;
  if (path === "/admin") return user ? <AdminApp /> : <PublicApp />;
  // Signed-in users still need public pages (notably Donate, to attach a receipt).
  const publicPage = ["/about", "/services", "/contact", "/donate", "/login"].includes(path);
  if (user && publicPage) return <PublicApp />;
  return user ? <Dashboard /> : <PublicApp />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SiteProvider>
          <Root />
        </SiteProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
