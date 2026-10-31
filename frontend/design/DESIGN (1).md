---
name: Precision Intelligence
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464555'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006591'
  on-secondary: '#ffffff'
  secondary-container: '#39b8fd'
  on-secondary-container: '#004666'
  tertiary: '#005522'
  on-tertiary: '#ffffff'
  tertiary-container: '#00702f'
  on-tertiary-container: '#78f591'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#c9e6ff'
  secondary-fixed-dim: '#89ceff'
  on-secondary-fixed: '#001e2f'
  on-secondary-fixed-variant: '#004c6e'
  tertiary-fixed: '#7ffc97'
  tertiary-fixed-dim: '#62df7d'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005320'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.01em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system embodies high-conviction enterprise intelligence, drawing aesthetic cues from modern technical SaaS benchmarks like Stripe, Linear, and Vercel. It is engineered for executives, customer success leads, and revenue operations teams who demand rigorous data density without cognitive friction.

The visual language follows **Corporate Modern with Hyper-Minimal Technical Precision**:
- **Clarity over ornament:** Decoration is entirely stripped away; value is communicated through structural alignment, crisp typographic contrast, and deliberate color zoning.
- **Instrument-grade feedback:** UI states evoke technical reliability. Interactions feature instant, tight micro-transitions (100–150ms ease-out) to convey platform velocity and determinism.
- **Diagnostic calm:** The platform prioritizes calm background tones so that machine-learning indicators (churn risk vectors, probability alerts, revenue deltas) instantly surface to the user's focal field.

## Colors

The palette establishes an analytical hierarchy through a cool slate background, pure white work surfaces, and purpose-driven diagnostic accents:

- **Canvas & Surfaces:** Base canvas sits at `#F8FAFC` (Slate 50). Interactive containers, modals, and metric panels anchor onto pure `#FFFFFF` surfaces defined by a hairline border (`#E2E8F0`).
- **Brand Core:** Primary actions and interactive focal points utilize `#4F46E5` (Indigo 600), shifting to `#4338CA` (Indigo 700) on active/hover states. Info-level telemetry employs `#0EA5E9` (Sky 500).
- **Typography Tokens:** Text primary is `#0F172A` (Slate 900) for uncompromised legibility, paired with `#64748B` (Slate 500) for metadata, labels, and secondary supporting copy. Muted borders and dividing rules hold firm at `#E2E8F0` (Slate 200).
- **Status & Risk Matrix:**
  - *Critical Churn Risk:* `#DC2626` (Red 600) text/border matched with `#FEF2F2` (Red 50) fill.
  - *Moderate Risk:* `#D97706` (Amber 600) text/border matched with `#FFFBEB` (Amber 50) fill.
  - *Healthy / Low Risk:* `#16A34A` (Emerald 600) text/border matched with `#F0FDF4` (Emerald 50) fill.
  - *System / Info:* `#0EA5E9` (Sky 500) paired with `#F0F9FF` (Sky 50) fill.

## Typography

The type ecosystem relies on a bifurcated structure: **Inter** handles narrative clarity and structural hierarchy, while **JetBrains Mono** governs precise telemetry data.

- **Inter Rules:** Headlines apply negative letter-spacing (`-0.01em` to `-0.025em`) to simulate high-end editorial and modern software polish. Body text maintains natural tracking for sustained reading during workflow investigations.
- **Monospace Deployment:** All customer identifiers (e.g., `cust_9921b`), financial currency values (ARR/MRR), statistical likelihoods (`84.2%`), and timestamps strictly render in JetBrains Mono. This establishes vertical column alignment in dense tabular views.

## Layout & Spacing

The architecture utilizes a desktop-first, structured 12-column fluid grid built within an absolute outer container max-width of `1600px`.

- **Breakpoints:**
  - `Desktop (Wide)`: ≥1440px (Sidebar persistent: 260px, 12-col main canvas, 32px margins).
  - `Desktop (Standard)`: 1024px–1439px (Sidebar persistent: 240px, 12-col main canvas, 24px margins).
  - `Tablet`: 768px–1023px (Collapsible rail navigation, 8-col reflow, 20px margins).
  - `Mobile`: <768px (Drawer navigation, 4-col layout, 16px margins, metrics collapse into horizontal sliding carousels or single-column stacks).
- **Rhythm:** An 8-point spatial model guides layout rhythm. Dense component clusters use `space-xs` (4px) and `space-sm` (8px). Structural card insets adopt `space-lg` (24px) to preserve clarity in data-dense layouts.

## Elevation & Depth

Visual hierarchy uses a refined hybrid approach: **low-contrast architectural outlines combined with ambient, diffused micro-shadows**.

- **Surface Demarcation:** Pure `#FFFFFF` surfaces do not float aggressively; their separation from the `#F8FAFC` base is mediated by a structural `1px solid #E2E8F0` hairline boundary.
- **Micro-Shadows:**
  - *Standard Card / Data Panel:* `0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)`.
  - *Dropdown / Popover / Tooltip:* `0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`.
  - *Modal / Flight Panel Sheet:* `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.06)`.
- **Layer Stacking:** Interactive cards on hover subtly lift by tinting the border to `#CBD5E1` and expanding the shadow to a light ambient spread (`0 4px 12px 0 rgba(15, 23, 42, 0.06)`), never changing physical scale.

## Shapes

The interface embraces a **Soft (Level 1)** geometric standard. This geometry produces a crisp, engineered personality common to developer and financial infrastructure.

- **Micro Components (0.25rem / 4px):** Checkboxes, status dots, small inline tags, and badges.
- **Standard Controls (0.375rem / 6px to 0.5rem / 8px):** Form fields, input controls, segmented tab buttons, and primary actions.
- **Containers & Surfaces (0.5rem / 8px to 0.75rem / 12px):** Metric panels, analytics cards, tabular card frames, and dialog viewports.
- **Pill Exception:** Pure pill radiuses (`9999px`) are reserved exclusively for status badges and categorical risk tags.

## Components

### Buttons
- **Primary:** Filled `#4F46E5`, text `#FFFFFF`, font-weight 500. Hover: `#4338CA`. Active: slight inset shadow.
- **Secondary / Outline:** Background `#FFFFFF`, border `1px solid #E2E8F0`, text `#0F172A`. Hover: background `#F8FAFC`, border `#CBD5E1`.
- **Ghost:** Transparent background, text `#64748B`. Hover: background `#F1F5F9`, text `#0F172A`.
- Height standards: Small (32px), Medium (38px), Large (44px). Horizontal padding is proportional (12px, 16px, 20px).

### Risk Badges & Status Chips
- Pill-shaped (`rounded-full`), padding `2px 8px`, typography `label-sm`.
- **Critical Risk:** Background `#FEF2F2`, text `#DC2626`, border `1px solid #FECACA`. Contains a 6px solid `#DC2626` leading circle.
- **Medium Risk:** Background `#FFFBEB`, text `#D97706`, border `1px solid #FDE68A`. Leading circle `#D97706`.
- **Healthy:** Background `#F0FDF4`, text `#16A34A`, border `1px solid #BBF7D0`. Leading circle `#16A34A`.

### Tables & Data Grids
- **Header:** Background `#F8FAFC`, border-bottom `1px solid #E2E8F0`, typography `label-md`, uppercase, tracking `0.05em`, color `#64748B`.
- **Rows:** Background `#FFFFFF`, height `52px`, border-bottom `1px solid #F1F5F9`. Hover state shifts to `#F8FAFC/60`.
- **Cells:** Numeric and machine values right-aligned and rendered in JetBrains Mono. Primary descriptive text left-aligned in Inter `body-md`.

### Input Fields & Controls
- **Text Inputs:** Height 38px, border `1px solid #E2E8F0`, background `#FFFFFF`, text `#0F172A`, placeholder `#94A3B8`. Focus: border `#4F46E5`, box-shadow `0 0 0 1px #4F46E5`.
- **Checkboxes & Radios:** 16px size. Border `#CBD5E1`. Checked state: filled `#4F46E5` with `#FFFFFF` glyph.

### Cards & Metric Panels
- Base card: `#FFFFFF`, border `1px solid #E2E8F0`, elevation shadow-sm. Internal padding `20px` or `24px`.
- Metric header layout: Title in `label-md` (`#64748B`) paired with top-right trend badge. Stat number rendered in `headline-lg` (`#0F172A`) with JetBrains Mono tracking. Subtitle provides cohort benchmark context in `body-sm`.

### Tab Navigation
- Segmented sub-navigation: `#F1F5F9` background track with 4px padding. Active tab sits as a raised `#FFFFFF` card with `shadow-sm` and `#0F172A` text weight. Inactive tabs display `#64748B` text with transparent backgrounds.