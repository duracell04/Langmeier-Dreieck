import { Container, Section, SectionHeading } from "@triangle/ui-kit";
import { BarChartIcon, PlusIcon, QrIcon } from "./icons";

const STEPS = [
  {
    Icon: PlusIcon,
    step: "1",
    title: "Session erstellen",
    description: "In wenigen Klicks eine Übungssession mit passenden Produktbereichen konfigurieren.",
  },
  {
    Icon: QrIcon,
    step: "2",
    title: "QR oder Code teilen",
    description: "Schülerinnen und Schüler scannen den QR-Code oder geben einen kurzen Code ein.",
  },
  {
    Icon: BarChartIcon,
    step: "3",
    title: "Üben + Resultate",
    description: "Schülerinnen und Schüler üben selbstständig. Lehrpersonen sehen Fortschritte.",
  },
];

export function ClassroomFlow() {
  return (
    <Section id="lehrpersonen">
      <Container size="wide">
        <SectionHeading
          title="Einfach im Unterricht"
          subtitle="In drei Schritten zur produktiven Übungseinheit."
        />
        <div className="relative mt-12">
          <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-transparent" aria-hidden="true" />
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {STEPS.map((step, index) => {
              const Icon = step.Icon;
              return (
                <div
                  key={step.title}
                  className="relative flex flex-col items-center text-center animate-fade-in"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="relative z-10 w-16 h-16 rounded-full bg-background border-2 border-primary flex items-center justify-center mb-6 shadow-subtle">
                    <Icon className="w-7 h-7 text-primary" aria-hidden="true" />
                  </div>
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                    {step.step}
                  </span>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground max-w-xs">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}
