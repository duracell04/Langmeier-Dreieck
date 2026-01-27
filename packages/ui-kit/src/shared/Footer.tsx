import * as React from "react";
import { cn } from "../utils/cn";

export interface FooterLink {
  label: string;
  href: string;
  onClick?: () => void;
}

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  brand: string;
  links?: FooterLink[];
}

export function Footer({ brand, links = [], className, ...props }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn("border-t border-border/40 bg-secondary/20", className)} {...props}>
      <div className="container-wide py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="text-lg font-semibold text-foreground">{brand}</div>
          <nav className="flex flex-wrap gap-6">
            {links.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-subtle hover:text-foreground focus-ring rounded-md"
                onClick={event => {
                  if (!link.onClick) return;
                  event.preventDefault();
                  link.onClick();
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="mt-8 pt-6 border-t border-border/30">
          <p className="text-xs text-muted-foreground">Copyright {currentYear} {brand}. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
}

