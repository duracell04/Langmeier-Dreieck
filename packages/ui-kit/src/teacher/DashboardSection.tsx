import * as React from "react";
import { cn } from "../utils/cn";

export interface DashboardSectionProps {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function DashboardSection({ title, action, children, className }: DashboardSectionProps) {
  return (
    <section className={cn("grid gap-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
