import * as React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, style, ...props }: CardProps) {
  return (
    <div className={className} style={style} {...props} />
  );
}

export function SectionTitle({
  children,
  sub,
}: {
  children: React.ReactNode;
  sub?: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold">{children}</h2>
      {sub && (
        <p className="text-sm text-gray-500 mt-1">
          {sub}
        </p>
      )}
    </div>
  );
}

import { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon?: LucideIcon;
  label: string;
  value: React.ReactNode;
  accent?: string;
}) {
  return (
    <div
      className="p-4 rounded-lg border flex items-center gap-3"
      style={{ borderLeft: `4px solid ${accent || "#e5e7eb"}` }}
    >
      {Icon && (
        <div className="p-2 rounded-md bg-gray-100">
          <Icon size={18} />
        </div>
      )}

      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
}