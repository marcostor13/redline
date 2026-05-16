---
name: Redline Industrial Grid
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#5d3f3c'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#926f6b'
  outline-variant: '#e7bdb8'
  surface-tint: '#c00014'
  primary: '#ba0013'
  on-primary: '#ffffff'
  primary-container: '#e31e24'
  on-primary-container: '#fffafa'
  inverse-primary: '#ffb4ab'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2e1'
  on-secondary-container: '#656464'
  tertiary: '#5b5b5b'
  on-tertiary: '#ffffff'
  tertiary-container: '#747474'
  on-tertiary-container: '#fdfbfb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb4ab'
  on-primary-fixed: '#410002'
  on-primary-fixed-variant: '#93000d'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#e4e2e2'
  tertiary-fixed-dim: '#c7c6c6'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#464747'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 56px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  max-width: 1280px
---

## Brand & Style
This design system is built on the principles of **Modern Industrialism**. It reflects the grit and precision of the Chicago industrial landscape through a "Blue-Collar Luxury" lens—where functionality is the highest form of aesthetic. 

The brand personality is authoritative, seasoned, and unwavering. The UI evokes a sense of "Safety First" and "Structural Integrity" by utilizing heavy-weight typography, a disciplined grid, and a high-contrast palette. We avoid decorative flourishes in favor of utilitarian clarity, ensuring that the interface feels as reliable as the rack systems and material handling solutions the company installs.

## Colors
The palette is rooted in industrial safety and raw materials. 

*   **Primary (Safety Red):** Used for primary actions, critical alerts, and brand accents. It represents energy, urgency, and the "Redline" commitment.
*   **Secondary (Iron Black):** Used for typography and structural elements. It provides the "heavy" grounding required for an industrial feel.
*   **Tertiary (Steel Gray):** Used for borders, secondary icons, and disabled states.
*   **Background (Concrete/Paper):** A very light gray is used to reduce eye strain and provide a clean canvas for technical diagrams and specs.

## Typography
The typography system prioritizes legibility under any condition. 

**Hanken Grotesk** is the primary display face. It should be used in Bold or Extra Bold weights for headlines to mimic architectural lettering and industrial signage. Headlines should frequently use "Sentence case," though "ALL CAPS" is permitted for short labels and navigation to emphasize authority.

**Inter** serves as the workhorse for all body copy and UI elements. Its neutral, systematic design ensures that technical specifications and installation details remain readable and professional.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model. Content is contained within a 12-column grid on desktop with a maximum width of 1280px to maintain a cinematic, professional feel.

*   **Desktop:** 12-column grid, 24px gutters, 64px outside margins.
*   **Tablet:** 8-column grid, 16px gutters, 32px outside margins.
*   **Mobile:** 4-column grid, 16px gutters, 16px outside margins.

Spacing follows a strict 8px linear scale. Elements should be grouped using "tight" units (8px, 16px) for related information and "loose" units (48px, 64px) to separate major sections, creating a clear visual hierarchy of "work zones."

## Elevation & Depth
In keeping with the "Structural" theme, this design system avoids soft shadows and "floaty" elements. Instead, it uses **Tonal Layering** and **High-Contrast Outlines**.

*   **Surface Hierarchy:** Background is #F4F4F4. Cards and Containers are #FFFFFF. 
*   **Borders:** Use 1px or 2px solid borders (#D1D1D1) to define sections. This mimics the lines found on technical blueprints.
*   **Active States:** Rather than lifting an element with a shadow, an active or hovered element should change its border color to the Primary Red or increase border thickness.
*   **Depth:** Only used for critical overlays (modals). In those cases, use a hard 4px offset shadow in #000000 with 10% opacity, rather than a diffused blur.

## Shapes
We utilize **Soft** (0.25rem) corners. This level of roundedness is inspired by machined steel and heavy equipment—where edges are broken for safety but the overall form remains geometric and "hard." 

*   **Buttons & Inputs:** 4px radius.
*   **Cards:** 8px radius.
*   **Icons:** Use "Sharp" or "Minimal Rounding" icon sets to match the structural language of the typography.

## Components
Consistent component styling reinforces the "Doing it the right way" brand value.

*   **Buttons:** Rectangular with a 4px radius. Primary buttons are solid Primary Red with White text. Secondary buttons use a 2px Iron Black border with no fill.
*   **Input Fields:** High-contrast borders (1px solid #121212). Labels are always visible above the field in `label-sm` style.
*   **Cards:** White background, 1px Gray border. For "featured" services or safety highlights, use a Primary Red top-border (3px thickness) to draw the eye.
*   **Lists:** Technical data should be displayed in structured lists with subtle horizontal dividers. Use "check" icons in Primary Red to denote safety compliance or completed service features.
*   **Status Chips:** Use a "Tag" style. Rectangular, using background tints of Red (Alert), Green (Safe/Complete), or Gray (Pending).
*   **Data Tables:** Essential for specs. Use a heavy Iron Black header row with white `label-sm` text for maximum contrast.