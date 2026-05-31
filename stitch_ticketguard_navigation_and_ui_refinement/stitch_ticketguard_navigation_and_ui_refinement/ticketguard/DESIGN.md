---
name: TicketGuard
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#444653'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#006d30'
  on-secondary: '#ffffff'
  secondary-container: '#92f5a4'
  on-secondary-container: '#007233'
  tertiary: '#641b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#8b2900'
  on-tertiary-container: '#ffa588'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#95f8a7'
  secondary-fixed-dim: '#79db8d'
  on-secondary-fixed: '#00210a'
  on-secondary-fixed-variant: '#005323'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59d'
  on-tertiary-fixed: '#390c00'
  on-tertiary-fixed-variant: '#832600'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Heebo
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Heebo
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Heebo
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Heebo
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Heebo
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Heebo
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Heebo
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Heebo
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Heebo
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Heebo
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  code:
    fontFamily: Heebo
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.5rem
  sm: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  gutter: 1.5rem
  margin-mobile: 1rem
  margin-desktop: 2.5rem
---

## Brand & Style

The design system is engineered to project absolute authority, precision, and transparency within the legal-tech landscape. It targets users seeking clarity and resolution during stressful legal encounters, necessitating a UI that feels both intellectually rigorous and highly accessible. 

The aesthetic follows a **Corporate / Modern** approach with a focus on functional clarity. It prioritizes information hierarchy through a structured grid and a restrained use of decorative elements. The interface should feel "buttoned-up"—utilizing clean lines, generous whitespace, and high-contrast text to ensure that complex legal data is digestible and non-intimidating.

## Colors

The palette is anchored in trust and functional signaling.
- **Primary (Legal Blue):** Used for primary branding, navigation, and high-priority actions. It conveys stability and professional expertise.
- **Success (Analysis Green):** Dedicated to positive outcomes, high appeal probabilities, and completion states.
- **Alert (Warning Orange):** Used for critical deadlines, high-risk fine details, or urgent user attention.
- **Neutrals:** A scale of cool grays that handle the heavy lifting of UI scaffolding, borders, and secondary text, maintaining a crisp "paper-like" feel.
- **Backgrounds:** Off-whites and very light grays are used to create subtle "container" layering without sacrificing readability.

## Typography

This design system utilizes **Heebo** as the primary typeface to ensure robust RTL (Hebrew/Arabic) support alongside clean Latin characters. The type scale is optimized for legibility in data-dense reports.

- **Headlines:** Use Bold and Semi-Bold weights to create a strong vertical rhythm and clear hierarchy.
- **Body:** Standard body text is kept at a comfortable 16px to ensure legal fine print remains readable for all demographics.
- **Labels:** Used for metadata, ticket numbers, and table headers; often paired with a medium or bold weight for distinction.
- **Alignment:** Full support for RTL layouts. In Hebrew contexts, text is right-aligned by default, with logical reversals of padding and margins.

## Layout & Spacing

The layout is built on a **12-column fluid grid** for desktop and a **4-column grid** for mobile. 

- **Rhythm:** An 8px/4px base unit is used for all internal component spacing to maintain mathematical consistency.
- **Margins:** Desktop margins are generous (40px) to prevent "edge-fatigue" during long reading sessions.
- **Breakpoints:**
  - Mobile: < 600px (Margins: 16px, Gutter: 16px)
  - Tablet: 600px - 1024px (Margins: 24px, Gutter: 24px)
  - Desktop: > 1024px (Margins: 40px, Gutter: 24px)
- **RTL Logic:** Spacing directionality must flip; `padding-left` becomes `padding-right` to ensure the logical "start" of the container is always preserved.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layers** and **Ambient Shadows**. 

- **Surface Levels:** The base background is the lowest level (Level 0). Cards and main content areas sit on Level 1 (White).
- **Shadow Character:** Shadows are highly diffused and low-opacity (#000000 at 5-8%). This avoids a "floating" look and instead creates a subtle lift that feels grounded and professional.
- **Interactions:** On hover, cards may increase their elevation slightly (Level 2) with a marginally deeper shadow to indicate interactivity.
- **Borders:** Subtle 1px borders in a light gray (#E2E8F0) are used in conjunction with shadows to define boundaries in high-glare environments.

## Shapes

The design system uses a **Soft** shape language. 
- **Standard Components:** Buttons and input fields use a 4px (0.25rem) radius.
- **Containers:** Large cards and report modules use an 8px (0.5rem) radius.
- **Status Indicators:** Small chips or tags for "Pending" or "Resolved" may use a 12px radius to differentiate them from functional buttons.

This moderate roundedness strikes a balance between the "hardness" of traditional legal documents and the "softness" of modern consumer apps.

## Components

### Buttons
- **Primary:** Solid Primary Blue background, white text. Bold weight. High contrast.
- **Secondary:** Outlined with Primary Blue, or light gray background for ghost actions.
- **Success:** Solid Green for "Submit Appeal" or "Payment Complete."

### Cards
- White background with `rounded-lg` corners and a subtle ambient shadow. 
- Used for ticket summaries, probability meters, and legal advice modules.

### Input Fields
- Structured with a 1px neutral border. 
- Focus states use a 2px Primary Blue border. 
- Labels must stay visible above the input area to maintain context in complex forms.

### Analysis Meters (Specific to TicketGuard)
- A "Chance of Success" gauge using a semi-circular or linear progress bar.
- Color-coded based on data: 0-30% (Neutral/Gray), 31-70% (Alert Orange), 71-100% (Success Green).

### Lists & Data Tables
- High-density rows with alternating subtle gray backgrounds (Zebra striping).
- Clear RTL alignment: Ticket ID on the right, Status on the left (for Hebrew/Arabic).