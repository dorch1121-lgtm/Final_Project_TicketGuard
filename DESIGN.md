# TicketGuard / טיקט גארד Design System

## App Name
TicketGuard / טיקט גארד

## Visual Direction
The current UI is based on the integrated Google Stitch design. The visual direction is professional, legal-tech, trustworthy, and clean SaaS: strong legal blue branding, quiet off-white surfaces, structured cards, clear navigation, and readable Hebrew RTL typography.

Do not redesign the app without a clear product reason. Preserve the Stitch layout, spacing, colors, typography, cards, gradients, and navigation style.

## Color Palette
Defined in `src/styles/globals.css`:

- Background: `#f8f9ff`
- Surface: `#ffffff`
- Surface low: `#eff4ff`
- Surface container: `#e5eeff`
- Surface high: `#dce9ff`
- Surface highest: `#d3e4fe`
- Text: `#0b1c30`
- Muted text: `#444653`
- Border / outline variant: `#c4c5d5`
- Outline: `#757684`
- Primary legal blue: `#00288e`
- Primary hover: `#1e40af`
- Primary soft: `#dde1ff`
- Success green: `#007233`
- Success strong: `#006d30`
- Success soft: `#92f5a4`
- Warning: `#8b2900`
- Warning soft: `#ffdbd0`
- Error red: `#ba1a1a`
- Error soft: `#ffdad6`

## Typography
- Primary font: Heebo.
- Typography variables are defined in `src/styles/globals.css` as `--font-family-base`, `--font-size-body`, `--font-size-body-lg`, `--font-size-label`, and `--font-size-nav`.
- The app is Hebrew-first and RTL.
- Large page titles use bold display-style Heebo, matching the Stitch screens.
- Body text should remain readable, generally 16px or larger.
- Metadata, labels, case IDs, and buttons use heavier weights for clarity.

## Spacing
- The design follows a 4px/8px rhythm.
- Main page margin: `2.5rem` desktop, `1.5rem` tablet, `1rem` mobile.
- Section gaps use `1.5rem` to `3rem`.
- Cards use consistent internal padding and stack on narrow screens.

## Border Radius
- Small controls: `4px`
- Buttons and medium controls: `8px`
- Cards and panels: `12px`
- Badges and chips: pill radius

## Buttons
- Primary: solid legal blue with white text.
- Secondary: white background with legal blue border and text.
- Ghost: text-style action for low-priority navigation.
- Buttons have visible focus states and comfortable tap height.

## Cards
- White surface, subtle border, restrained shadow.
- Used for upload panels, result modules, admin rows, dashboard cases, stats, forms, and empty states.
- Admin review uses row-style cards to match the Stitch management screen.

## Inputs and Forms
- Inputs and textareas have visible labels.
- Fields use white background, neutral border, and inherited focus outline.
- Upload is PDF-only and keeps visible Hebrew error states:
  - `יש להעלות קובץ PDF לפני תחילת הבדיקה`
  - `ניתן להעלות קובץ PDF בלבד`

## Navigation
- Shared top navbar appears across all routes.
- Brand appears as `TicketGuard`.
- Navigation links are centered and use active underline styling.
- Internal links use React Router.

Routes:
- `/` LandingPage
- `/upload` UploadReportPage
- `/missing-details` MissingDetailsPage
- `/result` AnalysisResultPage
- `/dashboard` UserDashboardPage
- `/admin` AdminReviewPage
- `/login` LoginPage
- `*` NotFoundPage

## Alerts and Disclaimers
Legal/disclaimer bands use the highest tonal surface with a clear border.

Required legal disclaimer:
`המערכת מספקת הערכה בלבד ואינה מהווה ייעוץ משפטי. אין באפליקציה התחייבות לביטול הדוח.`

This disclaimer must appear clearly on the landing page and result page.

## RTL Rules
- `index.html` uses `lang="he"` and `dir="rtl"`.
- Layout, forms, cards, and metadata align naturally for Hebrew.
- Mixed numeric/legal IDs remain readable in context.

## Accessibility Rules
- Keep semantic landmarks: header, nav, main, footer.
- Maintain high contrast between text and surface.
- Keep visible focus states.
- Upload validation errors use `role="alert"`.
- Loading state uses `aria-live`.
- Do not rely on color alone for status; include text labels, icons, or both.

## Responsive Design
- Mobile target: 375px width.
- Navbar must not create horizontal overflow.
- Cards stack to one column on mobile.
- Buttons become full width where needed.
- Upload panel and admin rows must remain readable without clipped text.
