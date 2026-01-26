import * as React from "react";
import { cn } from "../utils/cn";

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full rounded-swiss border border-grid-border bg-surface px-3 py-2 text-base text-ink",
      "placeholder:text-muted",
      "min-h-touch",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
      className
    )}
    {...props}
  />
));

TextInput.displayName = "TextInput";
