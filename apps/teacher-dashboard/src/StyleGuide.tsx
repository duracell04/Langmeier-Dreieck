import React from "react";
import {
  Badge,
  Button,
  Card,
  DataTable,
  StaticTrianglePreview,
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

const rows = [
  { name: "Klasse 3b", sessions: "18", accuracy: "82%" },
  { name: "Klasse 4a", sessions: "12", accuracy: "79%" },
];

export function StyleGuide() {
  return (
    <main className="min-h-screen bg-bg text-ink font-sans">
      <div className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-10">
        <header className="grid gap-2">
          <p className="text-micro uppercase tracking-wide text-muted">Style Guide</p>
          <h1 className="text-3xl font-semibold text-ink">Teacher Dashboard</h1>
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
          <h2 className="text-lg font-semibold text-ink">Primitives</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primär</Button>
            <Button variant="secondary">Sekundär</Button>
            <Button variant="ghost">Ghost</Button>
            <Badge>Setup</Badge>
            <Badge tone="success">OK</Badge>
            <Badge tone="warning">Hinweis</Badge>
          </div>
        </Card>

        <Card className="grid gap-4">
          <h2 className="text-lg font-semibold text-ink">Triangle Preview</h2>
          <StaticTrianglePreview
            product={24}
            factorA={6}
            factorB={4}
            missingSlot="factorB"
            operation="div"
            lockedSlots={["factorA"]}
          />
        </Card>

        <Card className="grid gap-4">
          <h2 className="text-lg font-semibold text-ink">DataTable</h2>
          <DataTable
            columns={[
              { key: "name", label: "Klasse" },
              { key: "sessions", label: "Sessions", align: "right" },
              { key: "accuracy", label: "Genauigkeit", align: "right" },
            ]}
            rows={rows}
          />
        </Card>
      </div>
    </main>
  );
}
