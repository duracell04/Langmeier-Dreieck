import { Navbar, type NavbarLink } from "@triangle/ui-kit";
import { ClassroomFlow } from "./sections/ClassroomFlow";
import { Credibility } from "./sections/Credibility";
import { FooterSection } from "./sections/FooterSection";
import { Hero } from "./sections/Hero";
import { Pricing } from "./sections/Pricing";
import { WhyItWorks } from "./sections/WhyItWorks";
import { navigateToLanding, navigateToTeacherDashboard, scrollToId } from "./utils";

const NAV_SECTIONS = [
  { id: "methode", label: "Methode" },
  { id: "lehrpersonen", label: "Für Lehrpersonen" },
  { id: "schueler", label: "Für Schülerinnen und Schüler" },
  { id: "preise", label: "Preise" },
];

const FOOTER_SECTIONS = [
  { id: "methode", label: "Methode" },
  { id: "preise", label: "Preise" },
  { id: "kontakt", label: "Kontakt" },
];

export function Landing() {
  const navLinks: NavbarLink[] = NAV_SECTIONS.map(section => ({
    label: section.label,
    href: `#${section.id}`,
    onClick: () => scrollToId(section.id),
  }));

  const footerLinks = FOOTER_SECTIONS.map(section => ({
    label: section.label,
    href: `#${section.id}`,
    onClick: () => scrollToId(section.id),
  }));

  return (
    <div className="min-h-screen flex flex-col bg-bg text-foreground font-sans">
      <Navbar
        brand="Langmeier Dreieck-1x1"
        onBrandClick={navigateToLanding}
        links={navLinks}
        secondaryLabel="Login"
        onSecondaryClick={navigateToTeacherDashboard}
        ctaLabel="Jetzt starten"
        onCtaClick={() => scrollToId("preise")}
      />

      <main className="flex-1">
        <Hero />
        <WhyItWorks />
        <ClassroomFlow />
        <Credibility />
        <Pricing />
      </main>

      <FooterSection links={footerLinks} />
    </div>
  );
}
