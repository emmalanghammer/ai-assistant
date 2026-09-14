# Rent Manager Design System

> **Internal design system for Rent Manager** — LCS's property-management platform — anchored in the figma file the team labels **"RMX"** (Rent Manager Express). Token names use the `--rmx-*` prefix to match.

This system was reconstructed from two Figma sources:

- **RMX Components.fig** — `~134` top-level frames across 17 pages (Navigation, Actions/Controls, Inputs/Dropdowns, Pop-Ups/Overlays, Feedback/Status, Cards/Tiles, Registers/Data, Date/Time, Specialized, Orion, Tools, Changelog, Contribution-Model, Under-Construction, Deprecated, Testing). This is the canonical kit.
- **RMX Pages.fig** — `~104` top-level frames covering screens (Register-Pages, Detail-Pages, General-Pages, Boards, Overlays, Admin-Pages, Navigation-Menu, etc.). Used as application context.

> ⚠️ Only one of the two .fig files was reachable in the mounted virtual filesystem at build time (the Components file). Page-level screen JSX was not available — the UI kit `index.html` therefore replicates a **plausible** Rent Manager page using the canonical components, not a 1:1 recreation of a known Pages frame. Re-mount the Pages file and we can refine.

The Figma wordmark reads "Rent Manager" (see `assets/logo-rentmanager-*.svg`). Two company codes appeared in the application headers: **`lcs-rmexpress`** (LCS Rent Manager Express) and **`pmc`** — consistent with a multi-tenant property-management platform branded per customer.

---

## Index

| File | What it is |
|---|---|
| [`README.md`](./README.md) | This document — context, content, visual foundations, iconography. |
| [`SKILL.md`](./SKILL.md) | Agent skill front-matter — load this when working on Rent Manager. |
| [`colors_and_type.css`](./colors_and_type.css) | All CSS custom properties + `.rmx` semantic defaults. **Import this in every artifact.** |
| [`assets/`](./assets/) | Logos (dark / white / brand-blue), illustrations, raster brand. |
| [`preview/`](./preview/) | One HTML card per design-system concept — feeds the Design System tab. |
| [`ui_kits/rentmanager-app/`](./ui_kits/rentmanager-app/) | Live, click-thru recreation of the Rent Manager web app with reusable JSX components. |

> **Token prefix.** All CSS variables are namespaced `--rmx-*` (matching the figma file's "RMX" label). The HTML class hook is `.rmx`.

---

## CONTENT FUNDAMENTALS

Voice is **flat, neutral, enterprise-pragmatic**. The product is utility software for property managers and operators — the copy never tries to be witty.

- **Casing.** Title Case for navigation, page titles, and button labels (`Pin Selection Tool`, `Manage Favorites`, `Command Launch`). Sentence case for descriptions and helper text (`Quickly add pins to mark where your units are.`).
- **Person.** **You / your.** ("Draw your units on the map…", "your units"). Never first-person plural ("we").
- **Tense.** Present tense, imperative for actions (`Add`, `Save`, `Cancel`, `Confirm`), declarative for descriptions.
- **Length.** Short. One-line button labels (`Button`, `Cancel`, `Refresh`). One-sentence card descriptions. Form labels are 1–3 words.
- **"Units"** in this context means rental units — apartments, suites, lots — not vehicles or fleet. The selector-tool copy ("Quickly add pins to mark where your units are") refers to a map view of properties.
- **Required fields** are marked with a red asterisk (`*`), color `--rmx-error` (#eb343c).
- **Placeholders** are *italic* and muted gray (`color: #b3b3b3`, `font-style: italic`) — see "Text Style=Italic Disabled" component (257 instances). Example: *"Command Launch"*.
- **Tone.** Operational. No exclamation points. No emoji. No marketing words ("amazing", "delight"). Avoid contractions in chrome; allow them in body copy.
- **Numbers / data.** Tabular figures in monospaced contexts (log entries, registers). 2-decimal places for currency, no thousands separators in IDs.

**Specific copy samples (verbatim from Figma):**
- `Command Launch` (search bar placeholder)
- `Company Code` / `lcs-rmexpress` (header)
- `Pin Selection Tool` &middot; `Shape Selection Tool`
- `Quickly add pins to mark where your units are.`
- `Draw your units on the map using shapes.`
- `Manage Favorites` &middot; `Mega Menu` &middot; `Reports`

---

## VISUAL FOUNDATIONS

### Color
Two anchors carry the system: brand blue **`#008dd5`** (2,534 uses — primary CTA, links, focused states, selected card border) and dark navy **`#13314c`** (2,019 uses — header background, page titles, primary ink). Everything else supports.

- **Surface stack:** white `#fff` → subtle field fill `#f5f8fa` → pale brand wash `#ebf1f5` (selected state) → light divider `#cedbe7` (the canonical 1px border).
- **Body text** is `#666` (Roboto Regular 14/20) — never pure black except for top-level form headings.
- **Disabled / placeholder** is `#b3b3b3` italic.
- **Semantic:** error red `#eb343c`, success green `#6eb744` (with `#e2f1da` surface), warning orange `#f58220`, magenta accent `#e54c7a`.
- **Component spec borders** (the dashed outlines around component examples) are `#9747ff` purple — these are **figma-only** annotation styling. Do **not** ship purple in production.

### Type
**Roboto** is the system font (3,348 weighted instances vs 102 for Inter, 50 for DM Sans — Inter and DM Sans are figma library leakage, treat as deprecated). Italics are reserved for disabled/placeholder text. Title hierarchy uses Roboto Bold at 56/40/32 for page-frame titles, with body copy locked to 14/20. Mono (`Roboto Mono`) appears only in log-entry components.

### Spacing
8-pixel grid, with 4px increments inside small components. Page gutters in figma frames are **64px**. Component-block padding is consistently 16px or 20px. Vertical rhythm between component sections is 32px.

### Backgrounds
Almost always **flat white** or `#f5f8fa`. **No** gradients, **no** repeating patterns, **no** hand-drawn illustration. Imagery, when present, is photographic — operational shots (cropped square, no filters). The only "atmospheric" surface is the dark navy header bar.

### Animation
Not authored in the figma source. Default to **150ms ease-out** for hover/press color transitions, **200ms ease-in-out** for opening menus and popovers. No bounces, no parallax. Loading states use a subtle horizontal progress strip (a `Progress-Indicators` page exists).

### Hover & press states
- **Buttons:** primary fills darken from `#008dd5` → `#0071aa` on hover. Action-text buttons stay the same color but underline (or get a subtle background tint).
- **Press:** further darkening to `#195ca4`. No size shrink — the system is a desktop-first enterprise app, taps are not the dominant interaction.
- **Focus:** 4px translucent brand halo (`box-shadow: 0 0 0 4px rgba(0,141,213,0.20)`) — confirmed on radio components.

### Borders
1px solid `#cedbe7` is the universal component edge. 2px solid `#008dd5` for selected radios/cards. Dashed `#9747ff` is **figma annotation only**.

### Shadows
Two real shadows in the system:
- **Card / hover:** `0 4px 12px rgba(0,0,0,0.10)` — appears on selected radio cards.
- **Popover:** `0 3px 6px rgba(0,0,0,0.10)` — menus and pop-ups.

Tiny, subtle. No giant ambient glows. No inner shadows.

### Radii
- `2px` on dividers and tight chips.
- **`4px`** on buttons, inputs, cards (the dominant value).
- `5px` on container blocks.
- `999px` (pill) on user avatars and notification bubbles.

### Layout rules
- Fixed top bar (`Header`, 48px tall, `#13314c`).
- Fixed left rail or full-width page chrome depending on surface.
- Forms top-align labels above their fields.
- Selector cards lay out side-by-side (2 across) at 407×275 with 20px gap — see `Radio-Selector-Modal`.

### Transparency / blur
Used sparingly. Only the focus halo uses translucent overlays. No backdrop blur in the source.

### Imagery
Cool / desaturated. Real-world property photography (buildings, units, maps). Treated as content, not decoration.

### Card anatomy
- Default: white surface, 1px `#cedbe7` border, 4px radius, no shadow.
- Hover/selected: 1px `#008dd5` border, `#ebf1f5` background, `0 4px 12px rgba(0,0,0,0.1)` shadow.

### Layout patterns (specific)
- **Page header pattern.** A vertical-text "Header" rotated 90° on the left edge of every component-frame in figma — this is **figma documentation chrome**, not a real product UI element. Ignore in production.
- **Section divider.** Full-width 1px `#cedbe7` line, 8px tall slot with 4/2px padding.
- **Selector modal.** 2-column grid of large radio cards. Selection promotes a card to brand-tint background + brand border + drop shadow.

---

## ICONOGRAPHY

The system uses **two parallel icon families**, mirrored 1:1:

1. **Material** (`Icon Set=Material`) — the production icon set, sourced from Google's Material Symbols. Sizes: Small (16), Medium (20), Large (24), XLarge (32). Colors: Default `#666`, Brand `#008dd5`, White (with 30/100% alpha), Error `#eb343c`, Disabled `#b3b3b3`, DarkBlue `#13314c`.
2. **Express** (`Icon Set=Express`) — a parallel set used in legacy/Express-styled flows (a holdover from a pre-Material era; "Express" lines up with Rent Manager Express). Same size/color matrix.

Components reference icons by name slot (e.g. `prop="/external-shared/Search5/Search5.jsx"`, `prop="/external-shared/AddCircle5/AddCircle5.jsx"`, `prop="/external-shared/ArrowDropDown5/ArrowDropDown5.jsx"`). Common names seen: `Search`, `Add`, `AddCircle`, `ArrowDropDown`, `KeyboardArrowDown`, `MoreVert`, `Notifications`, `Refresh`, `Filter`, `Edit`, `Delete`.

**This system uses CDN Material Symbols** — load with:
```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Symbols+Outlined" rel="stylesheet">
```
Then `<span class="material-symbols-outlined">search</span>`. This is a **substitution** for the figma's `IconSetMaterialSize*` components — flagged for review. The original raster/SVG sprites were not extracted.

**Emoji.** Not used. Avoid in artifacts.

**Unicode glyphs as icons.** Not used either, except the figma annotation arrows `↵` `↳` which mark "leading icon" / "trailing icon" slots — these are **figma-only** and must not appear in production.

**Logos** (in `assets/`):
- `logo-rentmanager-dark.svg` — navy on transparent (default for light surfaces).
- `logo-rentmanager-white.svg` — white on transparent (for the navy header).
- `logo-rentmanager-brand.svg` — full brand-blue.

A **"Rent Manager"** wordmark sits beside an iconographic mark resembling a stylized building silhouette with a matrix of unit slots — consistent with a property-management product.

---

## Caveats & open questions

1. **Pages file not extracted.** Screen-level pseudocode wasn't reachable. UI kit screens are reconstructed from component context, not page source.
2. **Icon sprites substituted.** Original Material/Express SVG sprites were not extracted — Material Symbols CDN is used as the closest match. Some icons render as their text label in `html-to-image`-rendered preview screenshots (a tooling limitation; native browsers resolve the OpenType ligatures correctly).
3. **Inter, DM Sans, Open Sans, SF Pro, Lato, Martel** all appear in the figma — but in trace amounts (≤53 instances each). I treat them as library leakage and **standardize on Roboto**.
4. **Animation specs** are not in the source — defaults provided are educated guesses.
5. The dashed `#9747ff` purple borders in figma are **annotation chrome**, not a brand color. Excluded from the production palette but kept as a token (`--rmx-purple`) for reference.
