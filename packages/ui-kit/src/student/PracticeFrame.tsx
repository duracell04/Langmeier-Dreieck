import * as React from "react";
import { cn } from "../utils/cn";

export interface PracticeFrameProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function PracticeFrame({ header, children, footer, className }: PracticeFrameProps) {
  return (
    <main className={cn("min-h-screen bg-bg text-foreground font-sans", className)}>
      <div
        className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-6 sm:py-8 lg:py-10"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {header ? (
          <header className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
            {header}
          </header>
        ) : null}
        <div className="flex flex-1 flex-col items-center justify-center gap-8">{children}</div>
        {footer ? <footer className="w-full">{footer}</footer> : null}
      </div>
    </main>
  );
}
