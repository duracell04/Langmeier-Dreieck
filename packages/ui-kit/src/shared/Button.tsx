import * as React from "react";
import { cn } from "../utils/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "hero"
  | "hero-outline"
  | "link";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground shadow-subtle hover:shadow-card hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground shadow-subtle hover:bg-secondary/80",
  ghost: "bg-transparent text-foreground hover:bg-accent",
  outline: "border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
  hero: "rounded-xl bg-primary text-primary-foreground shadow-elevated hover:shadow-card hover:bg-primary/90",
  "hero-outline":
    "rounded-xl border-2 border-foreground/20 bg-transparent text-foreground hover:bg-foreground/5 hover:border-foreground/30",
  link: "text-primary underline-offset-4 hover:underline",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-touch px-3 py-2 text-xs",
  md: "min-h-touch px-4 py-2 text-sm",
  lg: "min-h-touch px-6 py-3 text-base",
  xl: "min-h-touch px-8 py-4 text-base font-semibold",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, disabled, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium",
        "transition-all duration-standard ease-swiss",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "disabled:pointer-events-none disabled:opacity-50",
        "motion-reduce:transition-none",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled}
      {...props}
    />
  )
);

Button.displayName = "Button";

