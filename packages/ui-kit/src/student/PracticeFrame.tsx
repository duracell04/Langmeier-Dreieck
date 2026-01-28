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
    <main className={cn("h-[100dvh] min-h-screen bg-bg text-foreground font-sans", className)}>
      <div
        className="mx-auto flex h-full w-full max-w-5xl flex-col gap-8 px-6 [--practice-pad-y:1.5rem] sm:[--practice-pad-y:2rem] lg:[--practice-pad-y:2.5rem]"
        style={{
          paddingTop: "calc(var(--practice-pad-y) + env(safe-area-inset-top))",
          paddingBottom: "calc(var(--practice-pad-y) + env(safe-area-inset-bottom))",
        }}
      >
        {header ? (
          <header className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
            {header}
          </header>
        ) : null}
        <div className="flex min-h-0 flex-1 flex-col gap-8 lg:flex-row lg:items-center lg:justify-center lg:gap-12">
          <div className="flex min-h-0 flex-1 flex-col items-center justify-start gap-6 overflow-y-auto pt-2 sm:pt-4 lg:justify-center lg:pt-0 lg:overflow-visible">
            {children}
          </div>
          {footer ? (
            <footer className="w-full shrink-0 lg:w-80 lg:max-w-sm">
              {footer}
            </footer>
          ) : null}
        </div>
      </div>
    </main>
  );
}
