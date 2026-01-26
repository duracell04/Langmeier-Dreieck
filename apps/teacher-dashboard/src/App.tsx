import React from "react";
import {
  Badge,
  Button,
  Card,
  DashboardSection,
  DataTable,
  StaticTrianglePreview,
} from "@triangle/ui-kit";

const bottlenecks = [
  { family: "24 (6×4)", accuracy: "62%", note: "Division Rollen" },
  { family: "36 (9×4)", accuracy: "64%", note: "Faktor‑Familie" },
  { family: "42 (6×7)", accuracy: "66%", note: "Teilen mit 6" },
];

const confusions = [
  { from: "24", to: "42", count: "7×" },
  { from: "16", to: "18", count: "5×" },
  { from: "27", to: "21", count: "4×" },
];

const groups = [
  { group: "A", focus: "Division Rollen", size: "7" },
  { group: "B", focus: "Kern‑Multiplikation", size: "9" },
  { group: "C", focus: "Testbereit", size: "6" },
];

export function App() {
  return (
    <main className="min-h-screen bg-bg text-ink font-sans">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="grid gap-1">
            <p className="text-micro uppercase tracking-wide text-muted">Dreieck‑1×1</p>
            <h1 className="text-3xl font-semibold text-ink">Übersicht</h1>
            <div className="flex flex-wrap gap-2 text-sm text-muted">
              <Badge>Setup 1/3</Badge>
              <span>Klasse 3b · Mathe</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">QR erstellen</Button>
            <Button>Klasse erstellen</Button>
          </div>
        </header>

        <DashboardSection title="Übersicht">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Sessions/Woche", value: "18" },
              { label: "Ø Genauigkeit", value: "82%" },
              { label: "Ø Zeit", value: "2:14" },
            ].map(item => (
              <Card key={item.label} elevated>
                <div className="text-micro uppercase tracking-wide text-muted">{item.label}</div>
                <div className="mt-2 text-2xl font-semibold text-ink">{item.value}</div>
              </Card>
            ))}
          </div>
        </DashboardSection>

        <DashboardSection title="Bottlenecks" action={<Button variant="ghost" size="sm">Alle anzeigen</Button>}>
          <Card elevated className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm text-muted">Top 3 Familien</div>
              <StaticTrianglePreview
                product={24}
                factorA={6}
                factorB={4}
                missingSlot="factorB"
                operation="div"
                lockedSlots={["factorA"]}
              />
            </div>
            <DataTable
              columns={[
                { key: "family", label: "Familie" },
                { key: "accuracy", label: "Genauigkeit", align: "right" },
                { key: "note", label: "Hinweis" },
              ]}
              rows={bottlenecks}
            />
          </Card>
        </DashboardSection>

        <DashboardSection title="Verwechslungen">
          <Card elevated>
            <DataTable
              columns={[
                { key: "from", label: "Von" },
                { key: "to", label: "Mit" },
                { key: "count", label: "Häufigkeit", align: "right" },
              ]}
              rows={confusions}
            />
          </Card>
        </DashboardSection>

        <DashboardSection title="Gruppen">
          <div className="grid gap-4 sm:grid-cols-3">
            {groups.map(group => (
              <Card key={group.group} elevated className="grid gap-2">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold text-ink">Gruppe {group.group}</div>
                  <Badge tone="info">{group.size}</Badge>
                </div>
                <div className="text-sm text-muted">{group.focus}</div>
                <Button variant="secondary" size="sm">
                  Zuweisen
                </Button>
              </Card>
            ))}
          </div>
        </DashboardSection>

        <DashboardSection title="Zuweisen" action={<Button>QR erstellen</Button>}>
          <Card elevated className="grid gap-3">
            <div className="text-sm text-muted">Set wählen</div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm">
                Core
              </Button>
              <Button variant="secondary" size="sm">
                Squares
              </Button>
              <Button variant="secondary" size="sm">
                Division
              </Button>
            </div>
            <div className="text-sm text-muted">Dauer</div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm">
                5 min/Tag
              </Button>
              <Button variant="ghost" size="sm">
                8 min/Tag
              </Button>
              <Button variant="ghost" size="sm">
                10 min/Tag
              </Button>
            </div>
          </Card>
        </DashboardSection>
      </div>
    </main>
  );
}
