import React from "react";
import { Button, Card } from "@triangle/ui-kit";

export interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  onUnlock: () => void;
}

export function PaywallModal({ open, onClose, onUnlock }: PaywallModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 px-4">
      <Card elevated className="w-full max-w-md p-6">
        <div className="grid gap-4">
          <div className="text-micro uppercase tracking-wide text-muted">Pro-Funktion</div>
          <h2 className="text-2xl font-semibold text-ink">Demoversion freischalten</h2>
          <p className="text-sm text-muted">
            Dies ist ein Platzhalter für die spätere Zahlungsintegration. Kein echtes Bezahlen nötig.
          </p>
          <div className="grid gap-2">
            <Button onClick={onUnlock}>Freischalten (Demo)</Button>
            <Button variant="secondary" onClick={onClose}>Abbrechen</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
