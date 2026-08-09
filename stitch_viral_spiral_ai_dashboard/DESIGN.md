---
name: Viral Spiral AI
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#ffb2b7'
  on-secondary: '#67001b'
  secondary-container: '#b50036'
  on-secondary-container: '#ffc2c4'
  tertiary: '#d0bcff'
  on-tertiary: '#3c0091'
  tertiary-container: '#b090ff'
  on-tertiary-container: '#4600a7'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#ffdadb'
  secondary-fixed-dim: '#ffb2b7'
  on-secondary-fixed: '#40000d'
  on-secondary-fixed-variant: '#92002a'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-xl:
    fontFamily: Space Grotesk
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  score-display:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 48px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  max-width: 1200px
---

## Brand & Style

The design system is built on a "Digital Arcade" aesthetic—a high-energy, neubrutalist approach tailored for Gen Z media literacy. It rejects the sterile, clinical nature of traditional AI tools in favor of a streetwear-inspired interface that feels reactive, urgent, and gamified. 

The style utilizes heavy strokes, vibrant accents against deep backgrounds, and a deliberate "glitch-stable" balance. It prioritizes rapid information processing and pattern recognition, mimicking the high-speed environment of social media feeds while providing the structural "grounding" of a technical analysis tool.

## Colors

The palette is anchored by a deep charcoal-navy base to reduce eye strain and provide a canvas for high-chroma accents.

- **Primary (Electric Teal):** Represents "Resilience." Used for verified facts, successful AI detection, and positive progress indicators.
- **Secondary (Coral Magenta):** Represents "Virality/Warning." Used for misinformation alerts, high-risk scores, and urgent attention areas.
- **Tertiary (Vivid Violet):** Used for AI-generated insights and synthesis features to distinguish machine logic from human facts.
- **Neutral:** A dark navy scale is used for surface layering, preventing the interface from feeling "flat" while maintaining the midnight arcade vibe.

## Typography

This design system uses a dual-font strategy to balance impact with technical clarity.

- **Headlines:** Space Grotesk provides a geometric, futuristic feel with quirky "ink traps" that resonate with tech and gaming culture. Use for all major titles and large numeric scores.
- **Body:** Inter is used for descriptions and long-form analysis to ensure maximum readability against dark backgrounds.
- **Labels & Data:** JetBrains Mono is utilized for all metadata, "AI Confidence" scores, and technical tags to evoke a "code-level" transparency.

## Layout & Spacing

The layout follows a strict 8px rhythmic grid to maintain a "modular" arcade feel. 

- **Grid:** Use a 12-column fluid grid for desktop and a 4-column grid for mobile.
- **Consistency:** Elements should feel "stacked" like cards in a deck. Use consistent 16px padding inside all containers.
- **Responsive Behavior:** On mobile, side-by-side components reflow into a vertical "feed" style to mimic the social media environments the app analyzes.

## Elevation & Depth

This system avoids realistic lighting. Instead, it uses **Neubrutalist stacking**:

- **Borders:** Every interactive element and primary container must have a 2px solid border. Border color should be a lighter tint of the surface (e.g., `#1E293B`) or the primary accent color.
- **Hard Shadows:** Use "Block Shadows"—non-blurred, offset shadows (e.g., 4px 4px 0px) to give elements a physical, 2.5D appearance.
- **Tonal Layers:** Deepen background colors for "sunken" fields and lighten them for "raised" cards. Do not use blurs or gradients for depth.

## Shapes

The shape language is "Soft Brutalism." While the borders are heavy and the colors are loud, the corners are rounded to 8px (`rounded-md`) to maintain a friendly, youth-oriented feel. 

- **Interactive Pills:** Action items and category tags should use full pill-shaped rounding (e.g., 100px) to distinguish them from structural content blocks.
- **Indicators:** Use sharp geometric shapes (circles, triangles) within labels to indicate status (up/down virality trends).

## Components

- **Buttons:** Use "Sticker Buttons." 2px black or dark navy borders with a 4px hard offset shadow. On hover, the shadow disappears and the button "depresses" (translates +2px, +2px).
- **Interactive Pills:** High-contrast tags used for virality levels. Example: A "High Risk" pill is Magenta with white Mono text.
- **Analysis Cards:** Cards should feature a header area using JetBrains Mono for the "ID" of the post being analyzed, with a primary 2px border.
- **Input Fields:** Inset appearance using a darker background than the surface, with a 2px Teal border appearing only on focus.
- **Progress Bars:** Blocky, segmented bars rather than smooth fills, echoing retro health bars in gaming.
- **Score Gauges:** Large, bold Space Grotesk numbers with a hard-stroke circular border indicating the "Spiral Factor" (virality score).