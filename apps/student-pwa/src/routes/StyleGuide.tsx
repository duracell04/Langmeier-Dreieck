import React from "react";
import {
  Card,
  FeedbackLadder,
  Keypad,
  StructureLensGrid,
  TriangleDisplay,
  Button,
} from "@triangle/ui-kit";

const SWATCHES = [
  { label: "bg", className: "bg-bg" },
  { label: "surface", className: "bg-surface" },
  { label: "grid-bg", className: "bg-grid-bg" },
  { label: "grid-fill", className: "bg-grid-fill" },
  { label: "grid-border", className: "bg-grid-border" },
  { label: "focus", className: "bg-focus" },
  { label: "status-success", className: "bg-status-success" },
  { label: "status-warning", className: "bg-status-warning" },
  { label: "status-error", className: "bg-status-error" },
];

export function StyleGuide() {
  return (
    <main className="min-h-screen bg-bg text-ink font-sans">
      <div className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-10">
        <header className="grid gap-2">
          <p className="text-micro uppercase tracking-wide text-muted">Style Guide</p>
          <h1 className="text-3xl font-semibold text-ink">Student PWA</h1>
          <Button variant="ghost" size="sm" onClick={() => (window.location.hash = "#/")}>
            Zurück
          </Button>
        </header>

        <Card className="grid gap-4">
          <h2 className="text-lg font-semibold text-ink">Tokens</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {SWATCHES.map(swatch => (
              <div key={swatch.label} className="grid gap-2 text-sm text-muted">
                <div className={`h-12 rounded-swiss border border-grid-border ${swatch.className}`} />
                {swatch.label}
              </div>
            ))}
          </div>
        </Card>

        <Card className="grid gap-4">
          <h2 className="text-lg font-semibold text-ink">Typografie</h2>
          <div className="grid gap-2">
            <div className="text-product font-semibold text-ink">24</div>
            <div className="text-factor font-semibold text-ink-2">6</div>
            <div className="text-operator font-semibold text-muted">×</div>
            <div className="text-micro text-muted">Micro Copy</div>
          </div>
        </Card>

        <Card className="grid gap-6">
          <h2 className="text-lg font-semibold text-ink">TriangleDisplay</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <TriangleDisplay product={24} factorA={6} factorB={4} missingSlot="product" status="idle" />
            <TriangleDisplay product={24} factorA={6} factorB={4} missingSlot="product" status="success" />
            <TriangleDisplay product={24} factorA={6} factorB={4} missingSlot="factorA" status="hint" lockedSlots={["factorB"]} operation="div" />
          </div>
        </Card>

        <Card className="grid gap-6">
          <h2 className="text-lg font-semibold text-ink">Feedback Ladder</h2>
          <div className="grid gap-3">
            <FeedbackLadder state="try_again" message="Nochmal versuchen" />
            <FeedbackLadder state="structure" message="Schauen wir auf die Struktur" />
            <FeedbackLadder state="show_answer" message="Antwort: 24" detail="Aufgabe kommt wieder" />
          </div>
        </Card>

        <Card className="grid gap-6">
          <h2 className="text-lg font-semibold text-ink">Structure Lens</h2>
          <StructureLensGrid rows={6} cols={4} visible />
        </Card>

        <Card className="grid gap-6">
          <h2 className="text-lg font-semibold text-ink">Keypad</h2>
          <Keypad onKey={() => {}} />
        </Card>
      </div>
    </main>
  );
}
