import { Card, Container, Section, SectionHeading } from "@triangle/ui-kit";
import { ArrowsIcon, LayersIcon, TriangleIcon } from "./icons";
import type { ComponentType, SVGProps } from "react";

export interface FeatureItem {
  title: string;
  description: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const FEATURES: FeatureItem[] = [
  {
    Icon: LayersIcon,
    title: "Produkte statt Reihen",
    description:
      "Das Lernen wird nach Produkten und ihren Faktorenpaaren organisiert - nicht nach isolierten Reihen. So entsteht vernetztes Wissen.",
  },
  {
    Icon: TriangleIcon,
    title: "Dreieck als Relations-Interface",
    description:
      "Das Dreieck zeigt die Beziehung zwischen Produkt und Faktoren. Kinder sehen den Zusammenhang, nicht nur eine Aufgabe.",
  },
  {
    Icon: ArrowsIcon,
    title: "Multiplikation + Division zusammen",
    description:
      "Beide Operationen teilen dieselbe Struktur. Wer multiplizieren kann, versteht auch das Dividieren - ohne neu zu lernen.",
  },
];

export interface FeatureCardProps {
  feature: FeatureItem;
  index?: number;
}

export function FeatureCard({ feature, index = 0 }: FeatureCardProps) {
  const { Icon } = feature;
  return (
    <Card
      elevated
      className="p-6 md:p-8 animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="icon-badge mb-5">
        <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
    </Card>
  );
}

export function WhyItWorks() {
  return (
    <Section id="methode" tone="subtle">
      <Container size="wide">
        <SectionHeading
          title="Warum es funktioniert"
          subtitle="Ein didaktisches Konzept, das mathematisches Verständnis fördert."
        />
        <div className="mt-12 grid md:grid-cols-3 gap-6 lg:gap-8">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
