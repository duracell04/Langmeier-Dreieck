import * as React from "react";
import { cn } from "../utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ elevated = false, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-swiss border border-grid-border bg-surface p-4",
        elevated && "shadow-sm",
        className
      )}
      {...props}
    />
  )
);

Card.displayName = "Card";
