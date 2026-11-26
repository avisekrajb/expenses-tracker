import { useEffect, useState } from "react";

let deferred = null;
const listeners = new Set();
const emit = (value) => listeners.forEach((fn) => fn(value));

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferred = e;
  emit(true);
});
window.addEventListener("appinstalled", () => { deferred = null; emit(false); });

export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState(Boolean(deferred));
  useEffect(() => {
    listeners.add(setCanInstall);
    return () => listeners.delete(setCanInstall);
  }, []);
  const install = async () => {
    if (!deferred) return false;
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    emit(false);
    return outcome === "accepted";
  };
  return { canInstall, install };
}

export const registerServiceWorker = () => {
  if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => { /* PWA is optional */ });
    });
  }
};
