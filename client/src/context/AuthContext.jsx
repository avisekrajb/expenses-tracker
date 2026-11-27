import React, { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../services/auth";
import { getToken, clearToken } from "../services/api";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

// Login is a modal over the current public page. If it was opened from /admin,
// keep the admin there instead of dropping the user on the normal dashboard.
const afterLoginPath = () => (/^\/admin\/?$/.test(window.location.pathname) ? "/admin" : "/#/home");

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) { setReady(true); return; }
    authApi.me().then(setUser).catch(() => clearToken()).finally(() => setReady(true));
  }, []);

  useEffect(() => {
    const out = () => setUser(null);
    window.addEventListener("auth:logout", out);
    return () => window.removeEventListener("auth:logout", out);
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    setUser(data.user);
    window.history.replaceState(null, "", afterLoginPath());
    window.dispatchEvent(new Event("routechange"));
    return data.user;
  };

  const signup = (name, email, password) => authApi.signup(name, email, password);
  const logout = () => {
    authApi.logout();
    setUser(null);
    window.history.replaceState(null, "", "/");
    window.dispatchEvent(new Event("routechange"));
  };

  return (
    <Ctx.Provider value={{ user, setUser, ready, login, signup, logout }}>
      {children}
    </Ctx.Provider>
  );
}
