"use client";
import { useEffect, useState } from "react";

export function Confetti({ trigger }: { trigger: number }) {
  const [pieces, setPieces] = useState<any[]>([]);
  useEffect(() => {
    if (!trigger) return;
    const colors = ["#c9a227", "#0b4a3a", "#e8ab1f", "#f4c542", "#7c9a4b"];
    const arr = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      color: colors[i % colors.length],
      rot: Math.random() * 360,
      dur: 2 + Math.random() * 1.5,
    }));
    setPieces(arr);
    const t = setTimeout(() => setPieces([]), 3500);
    return () => clearTimeout(t);
  }, [trigger]);

  if (!pieces.length) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute", left: p.left + "%", top: "-5%", width: 8, height: 14,
            background: p.color, borderRadius: 2,
            animation: `confettiFall ${p.dur}s ${p.delay}s ease-in forwards`,
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}
