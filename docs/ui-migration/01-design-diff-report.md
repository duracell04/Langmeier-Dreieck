# Design Diff Report (Source -> Target)

## Phase A status
Complete (source scanned and documented).

## Source design system locations (to inspect in Phase A)
- `C:\GIT\langmeier-method\tailwind.config.ts` (theme/tokens)
- `C:\GIT\langmeier-method\src\index.css` (global styles, typography)
- `C:\GIT\langmeier-method\src\App.css`
- `C:\GIT\langmeier-method\src\components\` (UI components)
- `C:\GIT\langmeier-method\src\pages\` (landing sections)
- `C:\GIT\langmeier-method\src\App.tsx` (page assembly)

## Observations

### Typography
- Font family: Inter + system fallbacks (`C:\GIT\langmeier-method\src\tailwind.config.ts` fontFamily.sans)
- Heading scale via base styles:
  - h1: `text-4xl md:text-5xl lg:text-6xl` with tracking/leading (`C:\GIT\langmeier-method\src\index.css`)
  - h2: `text-2xl md:text-3xl lg:text-4xl` (`C:\GIT\langmeier-method\src\index.css`)
  - h3: `text-xl md:text-2xl` (`C:\GIT\langmeier-method\src\index.css`)
  - h4: `text-lg` (`C:\GIT\langmeier-method\src\index.css`)
- Display sizes defined for hero usage:
  - `display-lg`, `display`, `display-sm` (`C:\GIT\langmeier-method\src\tailwind.config.ts` fontSize)
- Body text uses relaxed leading (`C:\GIT\langmeier-method\src\index.css`)

### Spacing & layout
- Section rhythm: `section-padding` = `py-16 md:py-24 lg:py-32` (`C:\GIT\langmeier-method\src\index.css`)
- Containers:
  - `container-narrow` = `max-w-5xl` + responsive horizontal padding (`C:\GIT\langmeier-method\src\index.css`)
  - `container-wide` = `max-w-7xl` + responsive horizontal padding (`C:\GIT\langmeier-method\src\index.css`)
- Grid patterns:
  - Hero uses `grid lg:grid-cols-2 gap-12 lg:gap-16` (`C:\GIT\langmeier-method\src\components\HeroSection.tsx`)
  - Feature cards: `grid md:grid-cols-3 gap-6 lg:gap-8` (`C:\GIT\langmeier-method\src\components\WhyItWorksSection.tsx`)
- Base Tailwind container defaults center + 2rem padding; 2xl = 1400px (`C:\GIT\langmeier-method\src\tailwind.config.ts`)

### Colors & tokens
- HSL tokens in `:root`:
  - background/foreground, card, popover, primary/secondary, muted, accent, destructive, border/input/ring
  - triangle-product/factor/missing
  (`C:\GIT\langmeier-method\src\index.css`)
- Semantic mapping in Tailwind theme via CSS variables (e.g., `background`, `foreground`, `primary`) (`C:\GIT\langmeier-method\src\tailwind.config.ts`)

### Radius & shadows
- Radius token: `--radius: 0.5rem` and Tailwind radius mapping (`C:\GIT\langmeier-method\src\index.css`, `C:\GIT\langmeier-method\src\tailwind.config.ts`)
- Shadows:
  - `shadow-subtle`, `shadow-elevated`, `shadow-card` defined in Tailwind theme (`C:\GIT\langmeier-method\src\tailwind.config.ts`)
  - `.card-elevated` uses soft shadow mix (`C:\GIT\langmeier-method\src\index.css`)

### Triangle + structure lens
- Triangle layout:
  - `.triangle-container` = flex column, center, gap-3 (`C:\GIT\langmeier-method\src\components\TriangleVisual.tsx`)
  - `.triangle-node` = `w-14 h-14 md:w-16 md:h-16`, rounded-xl, text-lg/md:text-xl, font-semibold (`C:\GIT\langmeier-method\src\index.css`)
  - Product node: `bg-primary text-primary-foreground` (`C:\GIT\langmeier-method\src\index.css`)
  - Factor node: `bg-secondary text-secondary-foreground border border-border` (`C:\GIT\langmeier-method\src\index.css`)
  - Missing node: `bg-accent border-2 border-dashed border-primary/40 text-accent-foreground` (`C:\GIT\langmeier-method\src\index.css`)
  - Connection lines: SVG `w-24 h-6`, stroke width 1.5, `text-border` (`C:\GIT\langmeier-method\src\components\TriangleVisual.tsx`)
  - Operator labels: `text-xs text-muted-foreground`, active uses `text-primary font-medium` (`C:\GIT\langmeier-method\src\components\TriangleVisual.tsx`)
- Structure lens grid:
  - `.grid-cell` = `w-6 h-6 md:w-7 md:h-7`, rounded-sm, text-xs, font-medium (`C:\GIT\langmeier-method\src\index.css`)
  - Active cell: `bg-primary/10 text-primary` (`C:\GIT\langmeier-method\src\index.css`)
  - Inactive cell: `bg-muted/50 text-muted-foreground/50` (`C:\GIT\langmeier-method\src\index.css`)
  - Preview uses 6x6 grid with `gap-0.5` and headers (`C:\GIT\langmeier-method\src\components\StructureLensGrid.tsx`)

### Navbar / footer / sections
- Navbar: sticky, blurred background, desktop links + CTA, mobile menu toggle (`C:\GIT\langmeier-method\src\components\Navbar.tsx`)
- Footer: wordmark + nav links + subtle divider (`C:\GIT\langmeier-method\src\components\Footer.tsx`)
- Section pattern: `section-padding` + `container-wide/narrow` (`C:\GIT\langmeier-method\src\index.css`)

### Buttons / cards / inputs
- Button variants:
  - default/secondary/outline/ghost/link + hero + hero-outline, sizes up to xl (`C:\GIT\langmeier-method\src\components\ui\button.tsx`)
- Card: rounded-lg + border + background + shadow-sm (`C:\GIT\langmeier-method\src\components\ui\card.tsx`)
- Input: rounded-md + border + focus ring (`C:\GIT\langmeier-method\src\components\ui\input.tsx`)

### Landing page structure
- Page assembly order:
  - Navbar -> Hero -> WhyItWorks -> ClassroomFlow -> Credibility -> Pricing -> Footer
  (`C:\GIT\langmeier-method\src\pages\Index.tsx`)
- Hero includes dual CTA (teacher/student) + visual cards (`C:\GIT\langmeier-method\src\components\HeroSection.tsx`)
- Proof/credibility uses icon list + gentle background tint (`C:\GIT\langmeier-method\src\components\CredibilitySection.tsx`)
