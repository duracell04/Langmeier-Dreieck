import * as React from "react";
import { cn } from "../utils/cn";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  tone?: "default" | "subtle";
  as?: "section" | "div";
}

export function Section({
  tone = "default",
  as = "section",
  className,
  ...props
}: SectionProps) {
  const Comp = as;
  return (
    <Comp
      className={cn(
        "section-padding",
        tone === "subtle" && "bg-secondary/30",
        className
      )}
      {...props}
    />
  );
}

