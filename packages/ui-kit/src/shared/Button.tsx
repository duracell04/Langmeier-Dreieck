import * as React from "react";
import { cn } from "../utils/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-focus text-surface border border-focus",
  secondary: "bg-surface text-ink border border-grid-border",
  ghost: "bg-transparent text-ink border border-transparent",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-sm min-h-touch",
  md: "px-4 py-3 text-base min-h-touch",
  lg: "px-5 py-4 text-lg min-h-touch",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, disabled, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex min-w-touch items-center justify-center rounded-swiss font-semibold",
        "transition duration-fast ease-swiss",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "disabled:opacity-50 disabled:cursor-not-allowed",
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
