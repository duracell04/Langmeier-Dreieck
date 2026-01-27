import { Footer, type FooterLink } from "@triangle/ui-kit";

export interface FooterSectionProps {
  links?: FooterLink[];
}

export function FooterSection({ links }: FooterSectionProps) {
  return <Footer brand="Langmeier Dreieck-1x1" links={links} />;
}
