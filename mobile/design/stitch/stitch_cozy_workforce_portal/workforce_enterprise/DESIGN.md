---
name: Workforce Enterprise
colors:
  surface: '#f8f9ff'
  surface-dim: '#d1daec'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff3ff'
  surface-container: '#e6eeff'
  surface-container-high: '#e0e9fb'
  surface-container-highest: '#dae3f5'
  on-surface: '#131c29'
  on-surface-variant: '#424750'
  inverse-surface: '#28313e'
  inverse-on-surface: '#ebf1ff'
  outline: '#737781'
  outline-variant: '#c3c6d1'
  surface-tint: '#315f9c'
  primary: '#00376b'
  on-primary: '#ffffff'
  primary-container: '#1b4e8a'
  on-primary-container: '#9ac1ff'
  inverse-primary: '#a7c8ff'
  secondary: '#7e5700'
  on-secondary: '#ffffff'
  secondary-container: '#fdbe50'
  on-secondary-container: '#714d00'
  tertiary: '#003768'
  on-tertiary: '#ffffff'
  tertiary-container: '#004e8f'
  on-tertiary-container: '#96c1ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#a7c8ff'
  on-primary-fixed: '#001c3b'
  on-primary-fixed-variant: '#104783'
  secondary-fixed: '#ffdeac'
  secondary-fixed-dim: '#fabc4e'
  on-secondary-fixed: '#281900'
  on-secondary-fixed-variant: '#604100'
  tertiary-fixed: '#d4e3ff'
  tertiary-fixed-dim: '#a4c9ff'
  on-tertiary-fixed: '#001c39'
  on-tertiary-fixed-variant: '#004884'
  background: '#f8f9ff'
  on-background: '#131c29'
  surface-variant: '#dae3f5'
typography:
  headline-xl:
    fontFamily: Inter Tight
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter Tight
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter Tight
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter Tight
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-screen: 20px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  section-gap: 32px
---

## Brand & Style

The design system is engineered for a premium, banking-grade employee management experience. It embodies a **Corporate / Modern** aesthetic that draws inspiration from high-end fintech and productivity tools. The brand personality is calm, authoritative, and precise, designed to instill trust in Indonesian banking users while maintaining the fluidity of a modern SaaS platform.

The visual language focuses on clarity, high-quality typography, and subtle depth. It avoids unnecessary decoration, favoring functional elegance and a spacious layout that reduces cognitive load for complex administrative tasks. The emotional response should be one of stability and "quiet power"—an interface that feels as reliable as a financial institution but as intuitive as a premier workspace.

## Colors

This design system utilizes a sophisticated palette centered on a deep "Trust Blue" and a refined "Sovereign Gold." The primary palette is designed for high legibility in professional environments. 

In **Light Mode**, surfaces are crisp and airy, using soft blue-greys for borders to maintain a clean appearance without the harshness of pure black/white. In **Dark Mode**, the system shifts to a deep navy foundation (`#0D131C`) to maintain brand identity while reducing eye strain. 

Interactive elements leverage a primary gradient for a sense of movement and depth. Semantic colors follow international banking standards to ensure that success, warning, and error states are instantly recognizable. Use Tabular figures for all numerical data to ensure alignment in balance sheets and payroll tables.

## Typography

The typography system relies on the **Inter** family to bridge the gap between technical precision and modern interface design. 

**Inter Tight** is reserved for headlines to create a sophisticated, editorial feel with slightly condensed letter-spacing. **Inter** (Standard) is used for all body text, UI labels, and inputs to ensure maximum readability at small sizes. 

For mobile devices, `headline-xl` and `headline-lg` should scale down by 20% to avoid awkward line breaks. For any numerical representation—specifically payroll, dates, or ID numbers—the `data-mono` role (using tabular figures) must be used to ensure vertical alignment in tables and lists.

## Layout & Spacing

The layout follows a strict **Fluid Grid** approach for mobile, using a consistent 20px outer margin to provide breathing room on modern narrow handsets. 

Internal spacing is based on an 8px scale, ensuring mathematical harmony across all components. Content within cards should typically use 16px or 20px padding to match the external margins. For desktop views, the content should transition to a max-width container of 1280px with a 12-column grid, while mobile maintains a flexible 4-column structure.

## Elevation & Depth

This design system uses **Tonal Layers** combined with **Ambient Shadows** to define hierarchy. 

1.  **Level 0 (Background):** The base canvas (`#F8FAFB`).
2.  **Level 1 (Surface):** Cards and primary containers. In light mode, these use a very soft, diffused shadow (0px 4px 20px rgba(27, 78, 138, 0.04)) to appear lifted.
3.  **Level 2 (Interactive/Floating):** Modals, dropdowns, and floating buttons. These use a more pronounced shadow with a subtle tint of the primary blue to maintain color harmony.

Borders are used sparingly to define structure on Level 1 surfaces, keeping the UI feeling open and modern rather than boxed-in.

## Shapes

The shape language is "Calculated Softness." 

- **Cards & Containers:** 16px radius (Rounded-LG) creates a premium, approachable frame for content.
- **Buttons & Inputs:** 12px radius provides a distinct interactive shape that feels sturdy yet modern.
- **Pills & Badges:** Use the "full" rounded setting (999px) for status indicators, chips, and tags to differentiate them from structural elements.
- **Icons:** All icons must use **Material Symbols Rounded** with a 2px stroke weight to match the softened edges of the UI components.

## Components

### Buttons
- **Primary:** Filled with the Primary Gradient. Features a "soft glow" effect created by a drop shadow that matches the primary blue hue (15% opacity).
- **Secondary:** Outline style using the primary border color. Text and icon use the primary blue.
- **Ghost:** No border or background. Used for secondary actions in headers or within lists.

### Inputs & Fields
- Height should be 48px or 56px for touch-friendliness.
- Borders use the standard border color, thickening and changing to Primary on focus.
- Labels are `label-md`, positioned above the field.

### Cards
- Use 16px corner radius.
- Background: `#FFFFFF` (Light) / `#141C27` (Dark).
- Should include a 1px border in dark mode to assist with visibility against the background.

### Navigation
- **Bottom Nav:** 5-tab layout with 24px icons and `label-md` text. The active state uses the Primary Blue color.
- **Header:** Minimalist. Title aligned left or center, with a single Bell icon (notification) and an Avatar on the opposite side.

### Avatars
- Use 40px or 48px circles.
- For users without photos, use a gradient background (Primary to Tertiary) with initials in white, using `body-sm` bold.

### Lists
- Each list item should have a minimum height of 72px.
- Use a 1px divider that stops 20px short of the left/right edges to maintain the screen margin.