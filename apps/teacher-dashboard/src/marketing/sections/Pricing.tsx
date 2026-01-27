import { Badge, Button, Card, Container, Section, SectionHeading } from "@triangle/ui-kit";
import { CheckIcon } from "./icons";
import { navigateToStudentJoin, navigateToTeacherDashboard } from "../utils";

const PLANS = [
  {
    name: "Einzel",
    description: "Fuer einzelne Lehrpersonen",
    features: ["Unbegrenzte Sessions", "Bis zu 30 Schuelerinnen", "Fortschrittsuebersicht", "Export-Funktionen"],
    cta: "Mehr erfahren",
    highlighted: false,
  },
  {
    name: "Schule",
    description: "Fuer Teams und Schulen",
    features: ["Alles aus Einzel", "Unbegrenzte Lehrpersonen", "Schulweite Verwaltung", "Prioritaets-Support"],
    cta: "Kontakt aufnehmen",
    highlighted: true,
  },
];

export interface PricingCtaProps {
  onTeacherClick?: () => void;
  onStudentClick?: () => void;
}

export function PricingCta({
  onTeacherClick = navigateToTeacherDashboard,
  onStudentClick = navigateToStudentJoin,
}: PricingCtaProps) {
  return (
    <Card raised className="p-8 md:p-10 mt-10" id="kontakt">
      <div className="grid gap-6 text-center">
        <Badge tone="neutral">Bereit fuer den Start?</Badge>
        <div className="grid gap-3">
          <h2>Starte eine Session in wenigen Sekunden.</h2>
          <p className="text-muted-foreground">
            Kein Login fuer Schuelerinnen und Schueler. QR-Code oder kurzer Code reicht.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button variant="hero" size="lg" onClick={onTeacherClick}>
            Lehrperson starten
          </Button>
          <Button variant="outline" size="lg" onClick={onStudentClick}>
            Schuelerinnen beitreten
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function Pricing() {
  return (
    <Section id="preise">
      <Container size="narrow">
        <SectionHeading title="Preise" subtitle="Flexible Optionen fuer jede Situation." />
        <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {PLANS.map((plan, index) => (
            <Card
              key={plan.name}
              elevated
              className={`p-6 md:p-8 animate-fade-in ${plan.highlighted ? "ring-2 ring-primary" : ""}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.highlighted ? <Badge className="mb-4">Empfohlen</Badge> : null}
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <p className="text-muted-foreground mt-1 mb-6">{plan.description}</p>

              <div className="mb-6">
                <span className="text-3xl font-bold text-foreground">-</span>
                <span className="text-muted-foreground ml-1">/ Monat</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <CheckIcon className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button variant={plan.highlighted ? "hero" : "outline"} size="lg" className="w-full">
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>
        <PricingCta />
      </Container>
    </Section>
  );
}
