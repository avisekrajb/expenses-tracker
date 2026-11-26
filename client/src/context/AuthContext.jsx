import React, { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../services/auth";
import { getToken, clearToken } from "../services/api";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

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

  const login = async (email, password) => setUser(await authApi.login(email, password));
  const signup = (name, email, password) => authApi.signup(name, email, password);
  const logout = () => { authApi.logout(); setUser(null); };

  return <Ctx.Provider value={{ user, setUser, ready, login, signup, logout }}>{children}</Ctx.Provider>;
}
