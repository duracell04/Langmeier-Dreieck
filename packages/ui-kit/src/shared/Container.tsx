import * as React from "react";
import { cn } from "../utils/cn";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "wide" | "narrow";
}

const sizeClasses: Record<NonNullable<ContainerProps["size"]>, string> = {
  wide: "container-wide",
  narrow: "container-narrow",
};

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = "wide", className, ...props }, ref) => (
    <div ref={ref} className={cn(sizeClasses[size], className)} {...props} />
  )
);

Container.displayName = "Container";

