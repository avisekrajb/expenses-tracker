import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { load, save } from "../utils/helpers";

// Sign up first, then log in. Login always goes straight to the dashboard.
export default function Login({ initialMode, onModeChange }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState(() => initialMode || (load("ex_acct", false) ? "login" : "signup"));
  const [f, setF] = useState({ name: "", email: "", pw: "", pw2: "" });
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);
  const isLogin = mode === "login";
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setErr(""); };

  const switchMode = (next) => {
    setMode(next);
    setErr("");
    setOk("");
    onModeChange?.(next);
  };

  const submit = async () => {
    const email = f.email
      .normalize("NFKC")
      .replace(/[\u00A0\uFEFF\u200B\u200C\u200D。]/g, (ch) => (ch === "。" ? "." : ""))
      .trim()
      .toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter a valid email address.");
    setBusy(true);
    setErr("");
    try {
      if (isLogin) {
        await login(email, f.pw);
        return;
      }
      if (!f.name.trim()) throw new Error("Enter your name.");
      if (f.pw.length < 6) throw new Error("Password needs at least 6 characters.");
      if (f.pw !== f.pw2) throw new Error("Passwords do not match.");
      await signup(f.name.trim(), email, f.pw);
      save("ex_acct", true);
      setMode("login");
      onModeChange?.("login");
      setOk("Account created. Log in to continue.");
      setF({ name: "", email, pw: "", pw2: "" });
    } catch (e) {
      setErr(e.message);
    }
    setBusy(false);
  };

  return (
    <div className="ex-login">
      <div className="ex-logo">₨</div>
      <h1>Kharcha</h1>
      <p>{isLogin ? "Welcome back" : "Sign up to track every rupee you spend in Kathmandu"}</p>
      <div className="ex-card ex-form">
        <form noValidate onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <h3>{isLogin ? "Log in" : "Create your account"}</h3>
          {ok && isLogin && <div className="ex-ok">{ok}</div>}
          {!isLogin && <input placeholder="Full name" autoComplete="name" autoCapitalize="words" aria-label="Full name" value={f.name} onChange={set("name")} />}
          <input type="email" placeholder="Email" autoComplete="email" inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck={false}
            aria-label="Email address" required value={f.email} onChange={set("email")} />
          <div className="ex-pw-wrap">
            <input type={showPw ? "text" : "password"} placeholder="Password" autoComplete={isLogin ? "current-password" : "new-password"}
              autoCapitalize="none" autoCorrect="off" spellCheck={false}
              aria-label="Password" required value={f.pw} onChange={set("pw")} />
            <button type="button" className="ex-pw-toggle" aria-label={showPw ? "Hide password" : "Show password"}
              onClick={() => setShowPw((v) => !v)}>{showPw ? "Hide" : "Show"}</button>
          </div>
          {!isLogin && (
            <input type="password" placeholder="Confirm password" autoComplete="new-password"
              autoCapitalize="none" autoCorrect="off" spellCheck={false}
              aria-label="Confirm password" required value={f.pw2} onChange={set("pw2")} />
          )}
          {err && <div className="ex-err" role="alert">{err}</div>}
          <button className="ex-btn" type="submit" disabled={busy}>{busy ? "Please wait…" : isLogin ? "Log in" : "Sign up"}</button>
        </form>
        <button type="button" className="ex-link" onClick={() => switchMode(isLogin ? "signup" : "login")}>
          {isLogin ? "New here? Sign up" : "Have an account? Log in"}
        </button>
      </div>
      <small className="ex-muted">Your data is saved securely in the cloud.</small>
    </div>
  );
}
