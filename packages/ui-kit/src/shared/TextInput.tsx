import * as React from "react";
import { cn } from "../utils/cn";

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground",
      "placeholder:text-muted-foreground",
      "min-h-touch",
      "transition-subtle",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
      "disabled:cursor-not-allowed disabled:opacity-60",
      className
    )}
    {...props}
  />
));

TextInput.displayName = "TextInput";

