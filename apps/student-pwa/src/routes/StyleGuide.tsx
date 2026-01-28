import React from "react";
import {
  Button,
  Card,
  Container,
  FeedbackLadder,
  Footer,
  Keypad,
  Navbar,
  Section,
  SectionHeading,
  StructureLensGrid,
  TextInput,
  TriangleDisplay,
} from "@triangle/ui-kit";
import { LanguageToggle } from "../ui/LanguageToggle";
import { useI18n } from "../i18n";

const SWATCHES = [
  { label: "bg", className: "bg-bg" },
  { label: "card", className: "bg-card" },
  { label: "primary", className: "bg-primary" },
  { label: "secondary", className: "bg-secondary" },
  { label: "accent", className: "bg-accent" },
  { label: "border", className: "bg-border" },
];

export function StyleGuide() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  const copyright = t("common.copyright", { year, brand: t("common.brand") });

  return (
    <div className="min-h-screen bg-bg text-foreground font-sans">
      <Navbar
        brand="Styleguide"
        links={[
          { label: "Typografie", href: "#typografie" },
          { label: "Buttons", href: "#buttons" },
          { label: "Layout", href: "#layout" },
          { label: "Student", href: "#student-instrument" },
        ]}
        ctaLabel={t("common.back")}
        onCtaClick={() => {
          window.location.hash = "#/join";
        }}
        rightSlot={<LanguageToggle />}
      />

      <main className="flex-1">
        <Section id="typografie">
          <Container size="wide">
            <SectionHeading title="Typografie" subtitle="Skalierung für Titel, Text und Hilfetexte." align="left" />
            <div className="mt-8 grid gap-4">
              <h1>Display Headline</h1>
              <h2>Zweiter Titel</h2>
              <h3>Dritter Titel</h3>
              <h4>Vierter Titel</h4>
              <p className="text-base text-muted-foreground">
                Fließtext mit ruhiger Zeilenhöhe für gute Lesbarkeit auf Tablets.
              </p>
              <p className="text-sm text-muted-foreground">Sekundärer Text für Hinweise.</p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Microcopy</p>
            </div>
          </Container>
        </Section>

        <Section id="buttons" tone="subtle">
          <Container size="wide">
            <SectionHeading title="Buttons" subtitle="Primär, sekundär, outline und hero Varianten." align="left" />
            <div className="mt-8 grid gap-6">
              <div className="flex flex-wrap gap-3">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="hero" size="xl">Hero</Button>
                <Button variant="hero-outline" size="xl">Hero Outline</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>
          </Container>
        </Section>

        <Section id="layout">
          <Container size="wide">
            <SectionHeading title="Layout und Komponenten" subtitle="Cards, Inputs und Container-Rhythmus." align="left" />
            <div className="mt-8 grid gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {SWATCHES.map(swatch => (
                  <div key={swatch.label} className="grid gap-2 text-sm text-muted-foreground">
                    <div className={`h-12 rounded-lg border border-border/50 ${swatch.className}`} />
                    {swatch.label}
                  </div>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="p-6">Default Card</Card>
                <Card elevated className="p-6">Elevated Card</Card>
                <Card raised className="p-6">Raised Card</Card>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput placeholder="Text input" />
                <TextInput placeholder="Disabled" disabled />
              </div>

              <div className="grid gap-4">
                <div className="grid gap-3">
                  <p className="text-sm text-muted-foreground">Spacing rhythm</p>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="p-4">Section padding</Card>
                    <Card className="p-4">Container widths</Card>
                    <Card className="p-4">Grid gap scale</Card>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <Section id="student-instrument" tone="subtle">
          <Container size="wide">
            <SectionHeading title="Student Instrument" subtitle="Triangle, Strukturlinse, Keypad, Feedback." align="left" />
            <div className="mt-8 grid gap-8">
              <div className="grid gap-6 md:grid-cols-3">
                <TriangleDisplay product="?" factorA="6" factorB="4" missingSlot="product" status="hint" />
                <TriangleDisplay product="24" factorA="?" factorB="4" missingSlot="factorA" status="idle" />
                <TriangleDisplay product="24" factorA="6" factorB="?" missingSlot="factorB" status="success" operation="div" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="p-4">
                  <StructureLensGrid rows={6} cols={4} visible showNumbers gridSize={6} />
                </Card>
                <Card className="p-4">
                  <StructureLensGrid rows={8} cols={5} visible gridSize={10} />
                </Card>
              </div>

              <div className="max-w-md">
                <Keypad onKey={() => {}} />
              </div>

              <div className="grid gap-3 max-w-xl">
                <FeedbackLadder state="wrong1" message="Nochmal versuchen." />
                <FeedbackLadder state="structure" message="Schauen wir auf die Struktur." detail="Antwort wird angezeigt." />
                <FeedbackLadder state="success" message="Richtig" />
              </div>
            </div>
          </Container>
        </Section>
      </main>

      <Footer
        brand={t("common.brand")}
        copyrightText={copyright}
        links={[
          { label: t("landing.footer.privacy"), href: "#/datenschutz" },
          { label: t("landing.footer.imprint"), href: "#/impressum" },
        ]}
      />
    </div>
  );
}
