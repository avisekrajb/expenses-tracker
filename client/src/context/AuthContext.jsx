import React, { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../services/auth";
import { getToken, clearToken } from "../services/api";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [challenge, setChallenge] = useState(null);

  useEffect(() => {
    if (!getToken()) { setReady(true); return; }
    authApi.me().then(setUser).catch(() => clearToken()).finally(() => setReady(true));
  }, []);

  useEffect(() => {
    const out = () => { setUser(null); setChallenge(null); };
    window.addEventListener("auth:logout", out);
    return () => window.removeEventListener("auth:logout", out);
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    if (data.twoFactorRequired) {
      setChallenge({ token: data.challengeToken, email: data.email });
      return null;
    }
    setUser(data.user);
    window.history.replaceState(null, "", "/#/home");
    return data.user;
  };

  const verify2FA = async (code, backup = false) => {
    if (!challenge) throw new Error("Your verification session expired. Log in again.");
    const data = await authApi.verify2FA(challenge.token, code, backup);
    setUser(data.user);
    setChallenge(null);
    window.history.replaceState(null, "", "/#/home");
    return data.user;
  };

  const signup = (name, email, password) => authApi.signup(name, email, password);
  const logout = () => { authApi.logout(); setUser(null); setChallenge(null); window.history.replaceState(null, "", "/"); };

  return (
    <Ctx.Provider value={{ user, setUser, ready, challenge, login, signup, logout, verify2FA, cancel2FA: () => setChallenge(null) }}>
      {children}
    </Ctx.Provider>
  );
}
