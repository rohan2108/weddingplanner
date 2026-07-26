"use client";
import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // Only register in production-like contexts (https or localhost) — avoids
    // noisy dev-mode caching surprises during `next dev` hot reloads.
    const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    if (window.location.protocol !== "https:" && !isLocalhost) return;

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("Service worker registration failed:", err);
      });
    });
  }, []);

  return null;
}
