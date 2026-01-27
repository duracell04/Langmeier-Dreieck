import { Card, Container, Section, SectionHeading } from "@triangle/ui-kit";
import { CheckIcon } from "./icons";

const PROOF_POINTS = [
  "Offline-faehig nach dem ersten Laden",
  "Keine Schuelerinnen-Accounts noetig",
  "Ruhige, ermutigende Rueckmeldungen",
  "Lehrperson behaelt die Kontrolle",
];

export function Credibility() {
  return (
    <Section id="schueler" tone="subtle">
      <Container size="narrow">
        <SectionHeading title="Fuer ruhiges, fokussiertes Lernen" />
        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          {PROOF_POINTS.map((point, index) => (
            <Card
              key={point}
              className="flex items-center gap-4 p-4 bg-background animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              elevated
            >
              <div className="icon-badge-sm">
                <CheckIcon className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <span className="text-sm font-medium text-foreground">{point}</span>
            </Card>
          ))}
        </div>
        <p className="text-center mt-8 text-sm text-muted-foreground">Designed in Switzerland - Made for classrooms</p>
      </Container>
    </Section>
  );
}
