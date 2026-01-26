import * as React from "react";
import { TriangleDisplay, TriangleDisplayProps } from "../student/TriangleDisplay";
import { cn } from "../utils/cn";

export interface StaticTrianglePreviewProps extends TriangleDisplayProps {
  size?: "sm" | "md";
}

export function StaticTrianglePreview({ size = "sm", className, ...props }: StaticTrianglePreviewProps) {
  return (
    <TriangleDisplay
      {...props}
      className={cn(size === "sm" ? "max-w-40" : "max-w-56", className)}
    />
  );
}
