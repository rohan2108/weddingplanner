import { cn } from "@/lib/utils";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white/90 dark:bg-[#1c2420] border border-[#e7ddc4] dark:border-[#2c362f]",
        "shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(201,162,39,0.18)]",
        "hover:border-gold/60 transition-all duration-300",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-2xl md:text-3xl text-emerald dark:text-[#e9dfc0]">{children}</h2>
      {sub && <p className="text-sm text-[#6b7a6d] dark:text-[#9caa9d] mt-0.5">{sub}</p>}
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: any;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <Card className="p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: accent + "1a" }}>
        <Icon size={18} style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <div className="text-lg font-semibold leading-tight">{value}</div>
        <div className="text-xs text-[#8a8360] truncate">{label}</div>
      </div>
    </Card>
  );
}
