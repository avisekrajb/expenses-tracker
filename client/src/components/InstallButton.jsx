import React, { useState } from "react";
import { useInstallPrompt, isStandalone, isIOS } from "../utils/pwa";

// On Android/Chrome the native install prompt is used. On iPhone/iPad (and other
// browsers without beforeinstallprompt) we show exact manual steps instead of
// silently hiding the button.
export default function InstallButton({ className = "pub-btn" }) {
  const { canInstall, install } = useInstallPrompt();
  const [showHelp, setShowHelp] = useState(false);
  const [done, setDone] = useState(false);
  if (isStandalone()) return null;

  const native = async () => {
    const ok = await install();
    if (ok) setDone(true);
    else setShowHelp(true);
  };

  return (
    <>
      <button className={className} type="button" onClick={() => (canInstall ? native() : setShowHelp(true))}>
        {done ? "✅ Installing…" : "⬇️ Install app"}
      </button>
      {showHelp && (
        <div className="install-backdrop" role="dialog" aria-modal="true" aria-label="Install Kharcha" onClick={() => setShowHelp(false)}>
          <div className="install-sheet" onClick={(e) => e.stopPropagation()}>
            <button className="install-close" aria-label="Close" onClick={() => setShowHelp(false)}>×</button>
            <h2>Install Kharcha</h2>
            {isIOS() ? (
              <>
                <p>On iPhone or iPad, use Safari:</p>
                <ol>
                  <li>Tap the <b>Share</b> button (square with an arrow).</li>
                  <li>Scroll down and tap <b>Add to Home Screen</b>.</li>
                  <li>Tap <b>Add</b>. Kharcha will appear on your home screen.</li>
                </ol>
              </>
            ) : (
              <>
                <p>Add Kharcha to your phone or laptop:</p>
                <ol>
                  <li>Open this site in Chrome or Edge.</li>
                  <li>Tap the <b>⋮</b> menu (on Android, the share menu may show <b>Install app</b>).</li>
                  <li>Choose <b>Install app</b> or <b>Add to Home screen</b>.</li>
                </ol>
              </>
            )}
            <small>Installing keeps the app available offline and gives it its own icon.</small>
            <button className="pub-btn tiny" onClick={() => setShowHelp(false)}>Got it</button>
          </div>
        </div>
      )}
    </>
  );
}
