import React from "react";
import { Button, Card } from "@triangle/ui-kit";
import type { EntitlementState } from "../services/entitlements";

export interface PaywallGuardProps {
  entitlement: EntitlementState;
  title?: string;
  description?: string;
  onUpgrade: () => void;
  children: React.ReactNode;
}

export function PaywallGuard({ entitlement, title, description, onUpgrade, children }: PaywallGuardProps) {
  if (entitlement.tier === "pro") {
    return <>{children}</>;
  }

  return (
    <Card elevated className="grid gap-4">
      <div className="text-micro uppercase tracking-wide text-muted">Pro-Funktion</div>
      <div className="text-lg font-semibold text-ink">{title ?? "Erweiterte Auswertungen"}</div>
      <p className="text-sm text-muted">
        {description ?? "Diese Funktion ist in der Demoversion gesperrt."}
      </p>
      <Button onClick={onUpgrade}>Freischalten (Demo)</Button>
    </Card>
  );
}
