import React from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useSEO } from "./utils/seo";
import Expenses from "./components/Expenses";
import PublicApp from "./components/PublicApp";

function Dashboard() {
  // Private dashboard should never be indexed.
  useSEO("/app");
  return <Expenses />;
}

function Root() {
  const { user, ready } = useAuth();
  if (!ready) return <div className="pub-loading"><div className="ex-logo">₨</div><p>Loading Kharcha…</p></div>;
  return user ? <Dashboard /> : <PublicApp />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </ThemeProvider>
  );
}
