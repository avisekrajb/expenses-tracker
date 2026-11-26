import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { load, save } from "../utils/helpers";

// Sign up first, then log in with email + password.
export default function Login() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState(() => (load("ex_acct", false) ? "login" : "signup"));
  const [f, setF] = useState({ name: "", email: "", pw: "", pw2: "" });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);
  const isLogin = mode === "login";
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setErr(""); };

  const submit = async () => {
    const email = f.email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter a valid email address.");
    setBusy(true);
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
        <h3>{isLogin ? "Log in" : "Create your account"}</h3>
        {ok && isLogin && <div className="ex-ok">{ok}</div>}
        {!isLogin && <input placeholder="Full name" autoComplete="name" value={f.name} onChange={set("name")} />}
        <input type="email" placeholder="Email" autoComplete="email" value={f.email} onChange={set("email")} />
        <input type="password" placeholder="Password" autoComplete={isLogin ? "current-password" : "new-password"}
          value={f.pw} onChange={set("pw")} onKeyDown={(e) => e.key === "Enter" && isLogin && submit()} />
        {!isLogin && (
          <input type="password" placeholder="Confirm password" autoComplete="new-password" value={f.pw2} onChange={set("pw2")} />
        )}
        {err && <div className="ex-err">{err}</div>}
        <button className="ex-btn" disabled={busy} onClick={submit}>{busy ? "Please wait…" : isLogin ? "Log in" : "Sign up"}</button>
        <button className="ex-link" onClick={() => { setMode(isLogin ? "signup" : "login"); setErr(""); setOk(""); }}>
          {isLogin ? "New here? Sign up" : "Have an account? Log in"}
        </button>
      </div>
      <small className="ex-muted">Your data is saved securely in the cloud.</small>
    </div>
  );
}
