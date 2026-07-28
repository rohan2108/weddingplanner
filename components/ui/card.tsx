import * as React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, style, ...props }: CardProps) {
  return (
    <div
      className={className}
      style={style}
      {...props}
    />
  );
}
