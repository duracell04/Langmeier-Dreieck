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
import { useI18n } from "../i18n";
import { LanguageToggle } from "../ui/LanguageToggle";

export function Landing() {
  const { t, tList } = useI18n();
  const year = new Date().getFullYear();
  const copyright = t("common.copyright", { year, brand: t("common.brand") });

  const navLinks = [
    { label: t("landing.nav.method"), href: "#methode" },
    { label: t("landing.nav.teachers"), href: "#lehrpersonen" },
    { label: t("landing.nav.learners"), href: "#lernende" },
    { label: t("landing.nav.start"), href: "#start" },
  ];
  const valueProps = tList<{ title: string; description: string }>("landing.valueProps");
  const steps = tList<{ step: string; title: string; description: string }>("landing.classroom.steps");
  const proofPoints = tList<string>("landing.learning.proofPoints");

  return (
    <div className="min-h-screen bg-bg text-foreground font-sans">
      <Navbar
        brand={t("common.brand")}
        onBrandClick={() => {
          window.location.hash = "#/landing";
        }}
        links={navLinks}
        ctaLabel={t("landing.hero.ctaPrimary")}
        onCtaClick={() => {
          window.location.hash = "#/join";
        }}
        rightSlot={<LanguageToggle />}
      />

      <main className="flex-1">
        <Section>
          <Container size="wide">
            <div className="hero-grid">
              <div className="max-w-xl">
                <p className="eyebrow">{t("landing.hero.eyebrow")}</p>
                <h1>{t("landing.hero.title")}</h1>
                <p className="mt-6 text-lg text-muted-foreground">
                  {t("landing.hero.subtitle")}
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="hero"
                    size="xl"
                    onClick={() => {
                      window.location.hash = "#/join";
                    }}
                  >
                    {t("landing.hero.ctaStudent")}
                  </Button>
                  <Button
                    variant="hero-outline"
                    size="xl"
                    onClick={() => {
                      window.location.hash = "#/demo";
                    }}
                  >
                    {t("landing.hero.ctaDemo")}
                  </Button>
                </div>
                <p className="mt-6 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary/60" aria-hidden="true" />
                    {t("landing.hero.noLogin")}
                  </span>
                </p>
              </div>

              <div className="flex flex-col items-center lg:items-end gap-6">
                <Card elevated className="p-6 md:p-8">
                  <div className="text-center mb-4">
                    <span className="eyebrow">{t("landing.cards.triangleTitle")}</span>
                  </div>
                  <TriangleDisplay product={12} factorA={3} factorB={"?"} missingSlot="factorB" status="idle" />
                  <div className="mt-4 text-center text-sm text-muted-foreground">{t("landing.cards.triangleCaption")}</div>
                </Card>

                <Card elevated className="p-5">
                  <div className="text-center mb-4">
                    <span className="eyebrow">{t("landing.cards.structureTitle")}</span>
                  </div>
                  <StructureLensGrid rows={6} cols={4} visible showNumbers gridSize={6} />
                  <div className="mt-3 text-center text-xs text-muted-foreground">{t("landing.cards.structureCaption")}</div>
                </Card>
              </div>
            </div>
          </Container>
        </Section>

        <Section id="methode" tone="subtle">
          <Container size="wide">
            <SectionHeading
              title={t("landing.why.title")}
              subtitle={t("landing.why.subtitle")}
            />
            <div className="mt-12 grid md:grid-cols-3 gap-6 lg:gap-8">
              {valueProps.map((feature, index) => (
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
              title={t("landing.classroom.title")}
              subtitle={t("landing.classroom.subtitle")}
            />
            <div className="relative mt-12">
              <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-transparent" aria-hidden="true" />
              <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                {steps.map((step, index) => (
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
            <SectionHeading title={t("landing.learning.title")} align="center" />
            <div className="mt-10 grid sm:grid-cols-2 gap-4">
              {proofPoints.map((point, index) => (
                <Card key={point} className="flex items-center gap-4 p-4 bg-background" elevated>
                  <div className="icon-badge-sm">
                    <span className="text-primary font-semibold" aria-hidden="true">{index + 1}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{point}</span>
                </Card>
              ))}
            </div>
            <p className="text-center mt-8 text-sm text-muted-foreground">{t("landing.learning.tagline")}</p>
          </Container>
        </Section>

        <Section id="start">
          <Container size="narrow">
            <Card raised className="p-8 md:p-10">
              <div className="grid gap-6 text-center">
                <Badge tone="neutral">{t("landing.start.badge")}</Badge>
                <div className="grid gap-3">
                  <h2>{t("landing.start.title")}</h2>
                  <p className="text-muted-foreground">
                    {t("landing.start.subtitle")}
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
                    {t("landing.start.joinClass")}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      window.location.hash = "#/style-guide";
                    }}
                  >
                    {t("landing.start.styleGuide")}
                  </Button>
                </div>
              </div>
            </Card>
          </Container>
        </Section>
      </main>

      <Footer
        brand={t("common.brand")}
        copyrightText={copyright}
        links={[
          { label: t("landing.footer.privacy"), href: "#/datenschutz" },
          { label: t("landing.footer.imprint"), href: "#/impressum" },
          { label: t("landing.footer.contact"), href: "#/kontakt" },
        ]}
      />
    </div>
  );
}

