"use client";
import { useEffect, useState } from "react";
import { Download, Share, X, Plus } from "lucide-react";

// Handles both install paths:
// - Android / desktop Chrome & Edge: listens for the native `beforeinstallprompt`
//   event and shows a real "Install app" button that triggers the OS prompt.
// - iOS Safari: there is no install-prompt API at all, so instead we show a
//   small dismissible banner with the manual "Share -> Add to Home Screen" steps.
export function InstallAppPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showAndroidButton, setShowAndroidButton] = useState(false);
  const [showIosBanner, setShowIosBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches || (window.navigator).standalone === true;
    if (isStandalone) return; // already installed / running as an app — nothing to show

    if (localStorage.getItem("wp-install-dismissed") === "1") {
      setDismissed(true);
      return;
    }

    function onBeforeInstallPrompt(e: any) {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowAndroidButton(true);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    const ua = window.navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
    if (isIos && isSafari) setShowIosBanner(true);

    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  function dismiss() {
    setDismissed(true);
    localStorage.setItem("wp-install-dismissed", "1");
  }

  async function handleInstallClick() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowAndroidButton(false);
  }

  if (dismissed || (!showAndroidButton && !showIosBanner)) return null;

  return (
    <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-40">
      <div className="rounded-2xl bg-white dark:bg-[#1c2420] border border-[#e7ddc4] dark:border-[#2c362f] shadow-lg p-4 flex items-start gap-3">
        {showAndroidButton && (
          <>
            <div className="w-9 h-9 rounded-xl bg-emerald/10 flex items-center justify-center shrink-0">
              <Download size={16} className="text-emerald" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Install Wedding Planner</p>
              <p className="text-xs text-[#8a8360] mt-0.5">Add it to your home screen for quick, full-screen access.</p>
              <button onClick={handleInstallClick} className="mt-2 px-3 py-1.5 rounded-lg bg-emerald text-white text-xs font-medium">
                Install app
              </button>
            </div>
          </>
        )}
        {showIosBanner && !showAndroidButton && (
          <>
            <div className="w-9 h-9 rounded-xl bg-emerald/10 flex items-center justify-center shrink-0">
              <Share size={16} className="text-emerald" />
            </div>
            <div className="flex-1 min-w-0 text-sm">
              <p className="font-medium">Install this app</p>
              <p className="text-xs text-[#8a8360] mt-1 leading-relaxed">
                Tap <Share size={12} className="inline -mt-0.5" /> <strong>Share</strong>, then{" "}
                <Plus size={12} className="inline -mt-0.5" /> <strong>Add to Home Screen</strong>.
              </p>
            </div>
          </>
        )}
        <button onClick={dismiss} className="p-1 text-[#8a8360] hover:text-[#22281f] shrink-0">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
