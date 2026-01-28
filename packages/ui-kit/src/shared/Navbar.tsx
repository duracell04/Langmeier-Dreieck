import * as React from "react";
import { Button } from "./Button";
import { cn } from "../utils/cn";

export interface NavbarLink {
  label: string;
  href: string;
  onClick?: () => void;
}

export interface NavbarProps {
  brand: string;
  brandHref?: string;
  onBrandClick?: () => void;
  links?: NavbarLink[];
  secondaryLabel?: string;
  secondaryHref?: string;
  onSecondaryClick?: () => void;
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  rightSlot?: React.ReactNode;
  className?: string;
}

export function Navbar({
  brand,
  brandHref,
  onBrandClick,
  links = [],
  secondaryLabel,
  secondaryHref,
  onSecondaryClick,
  ctaLabel,
  ctaHref,
  onCtaClick,
  rightSlot,
  className,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleBrandClick = () => {
    if (onBrandClick) {
      onBrandClick();
      return;
    }
    if (brandHref) {
      window.location.assign(brandHref);
    }
  };

  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick();
      return;
    }
    if (ctaHref) {
      window.location.assign(ctaHref);
    }
  };

  const handleSecondaryClick = () => {
    if (onSecondaryClick) {
      onSecondaryClick();
      return;
    }
    if (secondaryHref) {
      window.location.assign(secondaryHref);
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur",
        "supports-[backdrop-filter]:bg-background/80",
        className
      )}
    >
      <nav className="container-wide flex h-16 items-center justify-between">
        <button
          type="button"
          onClick={handleBrandClick}
          className="flex items-center gap-2 text-lg font-semibold text-foreground transition-subtle hover:text-primary focus-ring rounded-md px-2"
          aria-label={brand}
        >
          {brand}
        </button>

        <div className="hidden md:flex md:items-center md:gap-8">
          {links.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-subtle hover:text-foreground focus-ring rounded-md px-2 py-1"
              onClick={event => {
                if (!link.onClick) return;
                event.preventDefault();
                link.onClick();
              }}
            >
              {link.label}
            </a>
          ))}
          {secondaryLabel ? (
            <button
              type="button"
              className="text-sm text-muted-foreground transition-subtle hover:text-foreground focus-ring rounded-md px-2 py-1"
              onClick={handleSecondaryClick}
            >
              {secondaryLabel}
            </button>
          ) : null}
          {ctaLabel ? (
            <Button variant="hero" size="md" onClick={handleCtaClick}>
              {ctaLabel}
            </Button>
          ) : null}
          {rightSlot ? <div className="flex items-center">{rightSlot}</div> : null}
        </div>

        <div className="md:hidden flex items-center gap-2">
          {rightSlot ? <div className="flex items-center">{rightSlot}</div> : null}
          <button
            type="button"
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground focus-ring rounded-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Menü schließen" : "Menü öffnen"}
          >
            <span className="sr-only">Menü</span>
            <span className="relative block h-5 w-6">
              <span
                className={cn(
                  "absolute left-0 top-1 block h-0.5 w-6 bg-foreground transition-all",
                  mobileMenuOpen && "top-2.5 rotate-45"
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-2.5 block h-0.5 w-6 bg-foreground transition-all",
                  mobileMenuOpen && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-4 block h-0.5 w-6 bg-foreground transition-all",
                  mobileMenuOpen && "top-2.5 -rotate-45"
                )}
              />
            </span>
          </button>
        </div>
      </nav>

      {mobileMenuOpen ? (
        <div className="md:hidden border-t border-border/40 bg-background animate-fade-in">
          <div className="container-wide py-4 space-y-3">
            {links.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="block py-2 text-base text-muted-foreground transition-subtle hover:text-foreground"
                onClick={event => {
                  if (link.onClick) {
                    event.preventDefault();
                    link.onClick();
                  }
                  setMobileMenuOpen(false);
                }}
              >
                {link.label}
              </a>
            ))}
            {secondaryLabel ? (
              <button
                type="button"
                className="block py-2 text-base text-muted-foreground transition-subtle hover:text-foreground"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSecondaryClick();
                }}
              >
                {secondaryLabel}
              </button>
            ) : null}
            {ctaLabel ? (
              <div className="pt-2">
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleCtaClick();
                  }}
                >
                  {ctaLabel}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}

