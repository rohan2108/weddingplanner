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

export function StatCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="p-4 border rounded-lg">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}