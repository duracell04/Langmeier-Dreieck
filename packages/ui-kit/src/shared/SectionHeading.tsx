import * as React from "react";
import { cn } from "../utils/cn";

export interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        align === "center" ? "text-center items-center" : "text-left",
        className
      )}
      {...props}
    >
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      {subtitle ? <p className="text-lg text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}

