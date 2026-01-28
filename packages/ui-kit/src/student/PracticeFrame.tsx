import * as React from "react";
import { cn } from "../utils/cn";

export interface PracticeFrameProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  footerMode?: "inline" | "fixed-mobile";
  className?: string;
}

export function PracticeFrame({
  header,
  children,
  footer,
  footerMode = "inline",
  className,
}: PracticeFrameProps) {
  const fixedMobile = footerMode === "fixed-mobile" && Boolean(footer);

  return (
    <main className={cn("h-[100dvh] min-h-screen bg-bg text-foreground font-sans", className)}>
      <div
        className={cn(
          "mx-auto flex h-full w-full max-w-5xl flex-col gap-8 px-6 [--practice-pad-y:1.5rem] sm:[--practice-pad-y:2rem] lg:[--practice-pad-y:2.5rem]",
          fixedMobile && "[--practice-footer-space:20rem] lg:[--practice-footer-space:0px]"
        )}
        style={{
          paddingTop: "calc(var(--practice-pad-y) + env(safe-area-inset-top))",
          paddingBottom:
            "calc(var(--practice-pad-y) + env(safe-area-inset-bottom) + var(--practice-footer-space, 0px))",
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
            <footer className={cn("w-full shrink-0 lg:w-96 lg:max-w-md", fixedMobile && "hidden lg:block")}>
              {footer}
            </footer>
          ) : null}
        </div>
      </div>
      {fixedMobile ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-bg/95 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
          <div className="mx-auto w-full max-w-md">{footer}</div>
        </div>
      ) : null}
    </main>
  );
}
