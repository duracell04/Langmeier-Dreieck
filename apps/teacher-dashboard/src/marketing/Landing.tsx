import React from "react";
import { Navbar, type NavbarLink } from "@triangle/ui-kit";
import { ClassroomFlow } from "./sections/ClassroomFlow";
import { Credibility } from "./sections/Credibility";
import { FooterSection } from "./sections/FooterSection";
import { Hero } from "./sections/Hero";
import { Pricing } from "./sections/Pricing";
import { WhyItWorks } from "./sections/WhyItWorks";
import { supabase } from "../services/supabaseClient";
import { navigateToLanding, navigateToStudentDemo, navigateToTeacherDashboard, scrollToId } from "./utils";

const NAV_SECTIONS = [
  { id: "methode", label: "Method" },
  { id: "lehrpersonen", label: "Setup" },
  { id: "schueler", label: "Promise" },
];

const FOOTER_SECTIONS = [
  { id: "methode", label: "Methode" },
  { id: "preise", label: "Preise" },
  { id: "kontakt", label: "Kontakt" },
];

export function Landing() {
  const [hasSession, setHasSession] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setHasSession(Boolean(data.session));
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setHasSession(Boolean(session));
    });
    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

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

  const teacherLabel = hasSession ? "Continue to dashboard" : "Create session";
  const studentLabel = "View demo";

  return (
    <div className="min-h-screen flex flex-col bg-bg text-foreground font-sans">
      <Navbar
        brand="Langmeier Dreieck-1x1"
        onBrandClick={navigateToLanding}
        links={navLinks}
        secondaryLabel={studentLabel}
        onSecondaryClick={navigateToStudentDemo}
        ctaLabel="Start now"
        onCtaClick={navigateToTeacherDashboard}
      />

      <main className="flex-1">
        <Hero
          teacherLabel={teacherLabel}
          studentLabel={studentLabel}
          onTeacherClick={navigateToTeacherDashboard}
          onStudentClick={navigateToStudentDemo}
        />
        <WhyItWorks />
        <ClassroomFlow />
        <Credibility />
        <Pricing />
      </main>

      <FooterSection links={footerLinks} />
    </div>
  );
}
