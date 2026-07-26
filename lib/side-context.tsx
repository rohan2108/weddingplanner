"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { Side } from "@/lib/types";

const SideContext = createContext<{ side: Side; setSide: (s: Side) => void }>({
  side: "Both",
  setSide: () => {},
});

export function SideProvider({ children }: { children: React.ReactNode }) {
  const [side, setSideState] = useState<Side>("Both");

  useEffect(() => {
    const stored = localStorage.getItem("wp-side") as Side | null;
    if (stored === "Bride" || stored === "Groom" || stored === "Both") setSideState(stored);
  }, []);

  function setSide(s: Side) {
    setSideState(s);
    localStorage.setItem("wp-side", s);
  }

  return <SideContext.Provider value={{ side, setSide }}>{children}</SideContext.Provider>;
}

export function useSide() {
  return useContext(SideContext);
}

// Shared filter helper: an item is visible if we're viewing "Both", or the
// item itself is tagged "Both", or it matches the currently selected side.
export function matchesSide<T extends { side?: string }>(item: T, currentSide: Side): boolean {
  if (currentSide === "Both") return true;
  return item.side === "Both" || item.side === currentSide;
}
