---
version: "alpha"
name: "Fluid Gradient Hero"
description: "Fluid Gradient Pricing Section is designed for comparing plans and supporting conversion decisions. Key features include plan comparison blocks and conversion-oriented actions. It is suitable for subscription pricing pages and plan comparison experiences."
colors:
  primary: "#4B4BA0"
  secondary: "#FFFFFF"
  tertiary: "#8F47AE"
  neutral: "#FFFFFF"
  background: "#FFFFFF"
  surface: "#FFFFFF"
  text-primary: "#FFFFFF"
  text-secondary: "#09090B"
  border: "#FFFFFF"
  accent: "#4B4BA0"
typography:
  display-lg:
    fontFamily: "Inter"
    fontSize: "72px"
    fontWeight: 500
    lineHeight: "72px"
    letterSpacing: "-0.025em"
  body-md:
    fontFamily: "Inter"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  label-md:
    fontFamily: "Inter"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "20px"
    letterSpacing: "-0.35px"
rounded:
  md: "0px"
  full: "9999px"
spacing:
  base: "6px"
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "24px"
  gap: "8px"
  card-padding: "48px"
  section-padding: "48px"
components:
  button-primary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "6px"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "10px"
  button-link:
    textColor: "{colors.secondary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "0px"
---

## Overview

- **Composition cues:**
  - Layout: Flex
  - Content Width: Full Bleed
  - Framing: Glassy
  - Grid: Minimal

## Colors

The color system uses dark mode with #4B4BA0 as the main accent and #FFFFFF as the neutral foundation.

- **Primary (#4B4BA0):** Main accent and emphasis color.
- **Secondary (#FFFFFF):** Supporting accent for secondary emphasis.
- **Tertiary (#8F47AE):** Reserved accent for supporting contrast moments.
- **Neutral (#FFFFFF):** Neutral foundation for backgrounds, surfaces, and supporting chrome.

- **Usage:** Background: #FFFFFF; Surface: #FFFFFF; Text Primary: #FFFFFF; Text Secondary: #09090B; Border: #FFFFFF; Accent: #4B4BA0

## Typography

Typography relies on Inter across display, body, and utility text.

- **Display (`display-lg`):** Inter, 72px, weight 500, line-height 72px, letter-spacing -0.025em.
- **Body (`body-md`):** Inter, 14px, weight 400, line-height 20px.
- **Labels (`label-md`):** Inter, 14px, weight 500, line-height 20px, letter-spacing -0.35px.

## Layout

Layout follows a flex composition with reusable spacing tokens. Preserve the flex, full bleed structural frame before changing ornament or component styling. Use 6px as the base rhythm and let larger gaps step up from that cadence instead of introducing unrelated spacing values.

Treat the page as a flex / full bleed composition, and keep that framing stable when adding or remixing sections.

- **Layout type:** Flex
- **Content width:** Full Bleed
- **Base unit:** 6px
- **Scale:** 6px, 10px, 16px, 24px, 40px, 48px, 50px, 96px
- **Section padding:** 48px
- **Card padding:** 48px
- **Gaps:** 8px, 16px, 20px, 32px

## Elevation & Depth

Depth is communicated through glass, border contrast, and reusable shadow or blur treatments. Keep those recipes consistent across hero panels, cards, and controls so the page reads as one material system.

Surfaces should read as glass first, with borders, shadows, and blur only reinforcing that material choice.

- **Surface style:** Glass
- **Borders:** 0.8px #FFFFFF
- **Blur:** 4px

## Shapes

Shapes rely on a tight radius system anchored by 9999px and scaled across cards, buttons, and supporting surfaces. Icon geometry should stay compatible with that soft-to-controlled silhouette.

Use the radius family intentionally: larger surfaces can open up, but controls and badges should stay within the same rounded DNA instead of inventing sharper or pill-only exceptions.

- **Corner radii:** 9999px
- **Icon treatment:** Linear
- **Icon sets:** Solar

## Components

Anchor interactions to the detected button styles.

### Buttons
- **Primary:** background #FFFFFF, text #09090B, radius 9999px, padding 6px, border 0px solid rgb(229, 231, 235).
- **Secondary:** background #FFFFFF, text #FFFFFF, radius 9999px, padding 10px, border 0.8px solid rgba(255, 255, 255, 0.2).
- **Links:** text #FFFFFF, radius 0px, padding 0px, border 0px solid rgb(229, 231, 235).

### Iconography
- **Treatment:** Linear.
- **Sets:** Solar.

## Do's and Don'ts

Use these constraints to keep future generations aligned with the current system instead of drifting into adjacent styles.

### Do
- Do use the primary palette as the main accent for emphasis and action states.
- Do keep spacing aligned to the detected 6px rhythm.
- Do reuse the Glass surface treatment consistently across cards and controls.
- Do keep corner radii within the detected 9999px family.

### Don't
- Don't introduce extra accent colors outside the core palette roles unless the page needs a new semantic state.
- Don't mix unrelated shadow or blur recipes that break the current depth system.
- Don't exceed the detected minimal motion intensity without a deliberate reason.

## Motion

Motion stays restrained and interface-led across text, layout, and scroll transitions. Timing clusters around 150ms. Easing favors ease and cubic-bezier(0.4. Hover behavior focuses on text and color changes.

**Motion Level:** minimal

**Durations:** 150ms

**Easings:** ease, cubic-bezier(0.4, 0, 0.2, 1)

**Hover Patterns:** text, color

## WebGL

Reconstruct the graphics as a full-bleed background field using webgl, custom shaders. The effect should read as technical, meditative, and atmospheric: fluid wave field with black and sparse spacing. Build it from shader field so the effect reads clearly. Animate it as slow breathing pulse. Interaction can react to the pointer, but only as a subtle drift. Preserve dom fallback.

**Id:** webgl

**Label:** WebGL

**Stack:** WebGL

**Insights:**
  - **Scene:**
    - **Value:** Full-bleed background field
  - **Effect:**
    - **Value:** Fluid wave field
  - **Primitives:**
    - **Value:** Shader field
  - **Motion:**
    - **Value:** Slow breathing pulse
  - **Interaction:**
    - **Value:** Pointer-reactive drift
  - **Render:**
    - **Value:** WebGL, custom shaders

**Techniques:** Breathing pulse, Pointer parallax, Shader gradients, Noise fields, DOM fallback

**Code Evidence:**
  - **HTML reference:**
    - **Language:** html
    - **Snippet:**
      ```html
      <!-- WebGL Canvas Background -->
      <canvas id="glcanvas" class="absolute inset-0 h-full w-full object-cover -z-10"></canvas>

      <!-- UI Overlay -->
      ```
  - **JS reference:**
    - **Language:** js
    - **Snippet:**
      ```
      const canvas = document.getElementById('glcanvas');
      const gl = canvas.getContext('webgl');

      if (!gl) {
          console.error('WebGL not supported');
      }
      ```
  - **Draw call:**
    - **Language:** js
    - **Snippet:**
      ```
      // Fragment Shader - Generates the smooth fluid gradient
      const fsSource = `
          precision highp float;
          uniform vec2 u_resolution;
          uniform float u_time;

          // Simplex 2D Noise function
          vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      ```
