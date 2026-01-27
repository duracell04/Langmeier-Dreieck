# Component Mapping (Source -> Target)

| Source component/pattern | Source file | Target component/variant | Notes |
| --- | --- | --- | --- |
| Navbar | `C:\GIT\langmeier-method\src\components\Navbar.tsx` | `@triangle/ui-kit` `Navbar` | Sticky, blurred header with CTA + mobile menu |
| Footer | `C:\GIT\langmeier-method\src\components\Footer.tsx` | `@triangle/ui-kit` `Footer` | Wordmark + link row + divider |
| Hero CTA buttons | `C:\GIT\langmeier-method\src\components\ui\button.tsx` | `Button` variants `hero` + `hero-outline` | Rounded, elevated hover, xl size |
| Standard buttons | `C:\GIT\langmeier-method\src\components\ui\button.tsx` | `Button` variants `primary/secondary/ghost/outline` | Token-based focus ring |
| Cards | `C:\GIT\langmeier-method\src\components\ui\card.tsx` | `Card` with `elevated` | Soft border + shadow |
| Inputs | `C:\GIT\langmeier-method\src\components\ui\input.tsx` | `TextInput` | Rounded, focus ring, muted placeholder |
| Section padding | `C:\GIT\langmeier-method\src\index.css` `.section-padding` | `Section` / `section-padding` class | Vertical rhythm |
| Containers | `C:\GIT\langmeier-method\src\index.css` `.container-*` | `Container` component | `wide` + `narrow` sizes |
| Value props grid | `C:\GIT\langmeier-method\src\components\WhyItWorksSection.tsx` | `Landing` sections using `Card` | 3-up grid, icon badge |
| How it works | `C:\GIT\langmeier-method\src\components\ClassroomFlowSection.tsx` | `Landing` steps section | Step badges + connector line |
| Credibility list | `C:\GIT\langmeier-method\src\components\CredibilitySection.tsx` | `Landing` proof section | Icon list on muted surface |
| CTA / pricing | `C:\GIT\langmeier-method\src\components\PricingSection.tsx` | `Landing` CTA section | Highlighted card with primary button |

