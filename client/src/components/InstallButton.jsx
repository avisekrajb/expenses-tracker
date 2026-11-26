import React, { useState } from "react";
import { useInstallPrompt } from "../utils/pwa";

export default function InstallButton({ className = "pub-btn" }) {
  const { canInstall, install } = useInstallPrompt();
  const [done, setDone] = useState(false);
  if (!canInstall) return null;
  return (
    <button className={className} onClick={async () => {
      const ok = await install();
      if (ok) setDone(true);
    }}>
      {done ? "✅ Installing…" : "⬇️ Install app"}
    </button>
  );
}
