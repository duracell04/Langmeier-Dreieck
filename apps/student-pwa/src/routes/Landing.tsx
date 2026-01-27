import React from "react";
import {
  Badge,
  Button,
  Card,
  Container,
  Footer,
  Navbar,
  Section,
  SectionHeading,
  StructureLensGrid,
  TriangleDisplay,
} from "@triangle/ui-kit";

const NAV_LINKS = [
  { label: "Methode", href: "#methode" },
  { label: "Lehrpersonen", href: "#lehrpersonen" },
  { label: "Lernende", href: "#lernende" },
  { label: "Start", href: "#start" },
];

const VALUE_PROPS = [
  {
    title: "Produkte statt Reihen",
    description:
      "Das Lernen wird nach Produkten und ihren Faktorenpaaren organisiert. So entsteht vernetztes Wissen.",
  },
  {
    title: "Dreieck als Relations-Interface",
    description:
      "Das Dreieck macht Beziehungen sichtbar. Lernende verstehen Zusammenhaenge, nicht nur Aufgaben.",
  },
  {
    title: "Multiplikation und Division zusammen",
    description:
      "Beide Operationen teilen dieselbe Struktur. Wer multipliziert, versteht auch das Dividieren.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Session erstellen",
    description: "In wenigen Klicks eine Uebungssession konfigurieren.",
  },
  {
    step: "2",
    title: "QR oder Code teilen",
    description: "Lernende scannen den QR-Code oder geben einen kurzen Code ein.",
  },
  {
    step: "3",
    title: "Ueben und Auswerten",
    description: "Lernende ueben selbststaendig. Lehrpersonen sehen Fortschritte.",
  },
];

const PROOF_POINTS = [
  "Offline faehig nach dem ersten Laden",
  "Keine Schueler-Accounts noetig",
  "Ruhige, ermutigende Rueckmeldungen",
  "Lehrperson behaelt die Kontrolle",
];

export function Landing() {
  return (
    <div className="min-h-screen bg-bg text-foreground font-sans">
      <Navbar
        brand="Langmeier Dreieck-1x1"
        links={NAV_LINKS}
        ctaLabel="Jetzt starten"
        onCtaClick={() => {
          window.location.hash = "#/join";
        }}
      />

      <main className="flex-1">
        <Section>
          <Container size="wide">
            <div className="hero-grid">
              <div className="max-w-xl">
                <p className="eyebrow">Dreieck-1x1</p>
                <h1>Multiplikation und Division bis 100 - produktzentriert lernen.</h1>
                <p className="mt-6 text-lg text-muted-foreground">
                  Ein Lernwerkzeug, das Produkte ins Zentrum stellt. Faktorenfamilien erkennen, Dreiecksrelationen
                  verstehen - fuer nachhaltiges mathematisches Verstaendnis.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="hero"
                    size="xl"
                    onClick={() => {
                      window.location.hash = "#/join";
                    }}
                  >
                    Ich bin Lernende
                  </Button>
                  <Button
                    variant="hero-outline"
                    size="xl"
                    onClick={() => {
                      window.location.hash = "#/demo";
                    }}
                  >
                    Demo ansehen
                  </Button>
                </div>
                <p className="mt-6 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary/60" aria-hidden="true" />
                    Kein Login fuer Lernende. Datenschutzfreundlich.
                  </span>
                </p>
              </div>

              <div className="flex flex-col items-center lg:items-end gap-6">
                <Card elevated className="p-6 md:p-8">
                  <div className="text-center mb-4">
                    <span className="eyebrow">Dreiecks-Interface</span>
                  </div>
                  <TriangleDisplay product={12} factorA={3} factorB={"?"} missingSlot="factorB" status="idle" />
                  <div className="mt-4 text-center text-sm text-muted-foreground">12 = 3 x ?</div>
                </Card>

                <Card elevated className="p-5">
                  <div className="text-center mb-4">
                    <span className="eyebrow">Strukturlinse</span>
                  </div>
                  <StructureLensGrid rows={6} cols={4} visible showNumbers gridSize={6} />
                  <div className="mt-3 text-center text-xs text-muted-foreground">Alle Wege zu 12 sichtbar</div>
                </Card>
              </div>
            </div>
          </Container>
        </Section>

        <Section id="methode" tone="subtle">
          <Container size="wide">
            <SectionHeading
              title="Warum es funktioniert"
              subtitle="Ein didaktisches Konzept, das mathematisches Verstaendnis foerdert."
            />
            <div className="mt-12 grid md:grid-cols-3 gap-6 lg:gap-8">
              {VALUE_PROPS.map((feature, index) => (
                <Card key={feature.title} elevated className="p-6 md:p-8 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="icon-badge mb-5">
                    <span className="text-primary font-semibold" aria-hidden="true">{index + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        <Section id="lehrpersonen">
          <Container size="wide">
            <SectionHeading
              title="Einfach im Unterricht"
              subtitle="In drei Schritten zur produktiven Uebungseinheit."
            />
            <div className="relative mt-12">
              <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-border" aria-hidden="true" />
              <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                {STEPS.map((step, index) => (
                  <div
                    key={step.title}
                    className="relative flex flex-col items-center text-center animate-fade-in"
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    <div className="relative z-10 w-16 h-16 rounded-full bg-background border-2 border-primary flex items-center justify-center mb-6 shadow-subtle">
                      <span className="text-primary font-semibold">{step.step}</span>
                    </div>
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                      {step.step}
                    </span>
                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground max-w-xs">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </Section>

        <Section id="lernende" tone="subtle">
          <Container size="narrow">
            <SectionHeading title="Fuer ruhiges, fokussiertes Lernen" align="center" />
            <div className="mt-10 grid sm:grid-cols-2 gap-4">
              {PROOF_POINTS.map((point, index) => (
                <Card key={point} className="flex items-center gap-4 p-4 bg-background" elevated>
                  <div className="icon-badge-sm">
                    <span className="text-primary font-semibold" aria-hidden="true">{index + 1}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{point}</span>
                </Card>
              ))}
            </div>
            <p className="text-center mt-8 text-sm text-muted-foreground">Designed in Switzerland - Made for classrooms</p>
          </Container>
        </Section>

        <Section id="start">
          <Container size="narrow">
            <Card raised className="p-8 md:p-10">
              <div className="grid gap-6 text-center">
                <Badge tone="neutral">Bereit fuer den Start?</Badge>
                <div className="grid gap-3">
                  <h2>Starte eine Session in wenigen Sekunden.</h2>
                  <p className="text-muted-foreground">
                    Kein Login fuer Lernende. QR-Code oder kurzer Code reicht.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={() => {
                      window.location.hash = "#/join";
                    }}
                  >
                    Klasse beitreten
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      window.location.hash = "#/style-guide";
                    }}
                  >
                    Styleguide ansehen
                  </Button>
                </div>
              </div>
            </Card>
          </Container>
        </Section>
      </main>

      <Footer
        brand="Langmeier Dreieck-1x1"
        links={[
          { label: "Datenschutz", href: "#/datenschutz" },
          { label: "Impressum", href: "#/impressum" },
          { label: "Kontakt", href: "#/kontakt" },
        ]}
      />
    </div>
  );
}

