import * as React from "react";
import { cn } from "../utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  raised?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ elevated = false, raised = false, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-border/50 bg-card p-4 text-card-foreground",
        elevated && "shadow-subtle",
        raised && "shadow-card",
        className
      )}
      {...props}
    />
  )
);

Card.displayName = "Card";

