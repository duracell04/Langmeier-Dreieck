import {
  Button,
  Card,
  Container,
  Section,
  StaticTrianglePreview,
  StructureLensGrid,
} from "@triangle/ui-kit";
import { navigateToStudentJoin, navigateToTeacherDashboard } from "../utils";

export interface HeroProps {
  onTeacherClick?: () => void;
  onStudentClick?: () => void;
}

export function Hero({
  onTeacherClick = navigateToTeacherDashboard,
  onStudentClick = navigateToStudentJoin,
}: HeroProps) {
  return (
    <Section>
      <Container size="wide">
        <div className="hero-grid">
          <div className="max-w-xl">
            <p className="eyebrow">Dreieck-1x1</p>
            <h1 className="animate-fade-in">
              Multiplikation und Division bis 100 - produktzentriert lernen.
            </h1>
            <p
              className="mt-6 text-lg text-muted-foreground leading-relaxed animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              Ein Lernwerkzeug, das Produkte ins Zentrum stellt. Faktorenfamilien erkennen, Dreiecksrelationen
              verstehen - für nachhaltiges mathematisches Verständnis.
            </p>
            <div
              className="mt-8 flex flex-col sm:flex-row gap-4 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <Button variant="hero" size="xl" onClick={onTeacherClick}>
                Ich bin Lehrperson
              </Button>
              <Button variant="hero-outline" size="xl" onClick={onStudentClick}>
                Ich bin Schülerin oder Schüler
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary/60" aria-hidden="true" />
                Kein Login für Schülerinnen und Schüler. Datenschutzfreundlich.
              </span>
            </p>
          </div>

          <div className="flex flex-col items-center lg:items-end gap-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Card elevated className="p-6 md:p-8">
              <div className="text-center mb-4">
                <span className="eyebrow">Dreiecks-Interface</span>
              </div>
              <StaticTrianglePreview
                size="md"
                product={12}
                factorA={3}
                factorB={"?"}
                missingSlot="factorB"
                operation="mul"
              />
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
  );
}
