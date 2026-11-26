import React, { useEffect, useRef } from "react";
import Login from "./Login";

// /login and /signup open the auth form as a dismissible overlay, not a page.
export default function AuthModal({ mode = "login", onClose, onModeChange }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="pub-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pub-modal" role="dialog" aria-modal="true" aria-label={mode === "signup" ? "Create your Kharcha account" : "Log in to Kharcha"}>
        <button ref={closeRef} className="pub-modal-close" onClick={onClose} aria-label="Close login form">×</button>
        <div className="pub-modal-body">
          <Login key={mode} initialMode={mode} onModeChange={onModeChange} />
        </div>
      </div>
    </div>
  );
}
