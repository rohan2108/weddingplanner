export function CountdownRing({ pctElapsed, daysLeft }: { pctElapsed: number; daysLeft: number }) {
  const r = 64;
  const c = 2 * Math.PI * r;
  const off = c - (pctElapsed / 100) * c;
  return (
    <div className="relative w-40 h-40 shrink-0">
      <svg viewBox="0 0 160 160" className="w-40 h-40 -rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0b4a3a" />
            <stop offset="100%" stopColor="#c9a227" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={r} fill="none" stroke="currentColor" className="text-[#e7ddc4] dark:text-[#2c362f]" strokeWidth="10" />
        <circle
          cx="80" cy="80" r={r} fill="none" stroke="url(#ringGrad)" strokeWidth="10"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        {Array.from({ length: 12 }).map((_, i) => {
          const ang = (i / 12) * Math.PI * 2;
          const x = 80 + r * Math.cos(ang);
          const y = 80 + r * Math.sin(ang);
          return <circle key={i} cx={x} cy={y} r={1.6} fill="#c9a227" opacity={0.5} />;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-3xl text-emerald dark:text-[#e9dfc0] leading-none">{daysLeft}</div>
        <div className="text-[11px] uppercase tracking-wide text-[#8a8360] mt-1">days to go</div>
      </div>
    </div>
  );
}
