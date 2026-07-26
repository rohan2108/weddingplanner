"use client";
import { useSide } from "@/lib/side-context";
import { SIDE_COLORS } from "@/lib/utils";
import type { Side } from "@/lib/types";

const OPTIONS: { label: string; shortLabel: string; value: Side }[] = [
  { label: "Anushka", shortLabel: "A", value: "Bride" },
  { label: "Both", shortLabel: "Both", value: "Both" },
  { label: "Rohan", shortLabel: "R", value: "Groom" },
];

export function SideSwitch() {
  const { side, setSide } = useSide();

  return (
    <div className="flex items-center rounded-xl bg-[#f4efe0] dark:bg-[#1c2420] p-1 gap-1 shrink-0">
      {OPTIONS.map((opt) => {
        const active = side === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setSide(opt.value)}
            className="px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
            style={
              active
                ? { background: SIDE_COLORS[opt.value], color: "white" }
                : { color: "#8a8360" }
            }
          >
            <span className="sm:hidden">{opt.shortLabel}</span>
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
