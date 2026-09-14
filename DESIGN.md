# RMX Design Language — DESIGN.md

RMX is the design system for **Rent Manager Express** ("Express"), LCS's property-management web app. Its stated mission: "A central collection of design guidelines, resources and best practices that energize our product teams to create unified experiences in Rent Manager Express."

This document captures the system well enough to build faithful UI without opening Figma. Values were measured from the RMX Foundations, Components, Iconography, Documentation, and Pages Figma libraries (source file: RMX Components). Where a number is given, it came from a production spec — use it as written, not as a rough guide.

## How to use this with Claude Code

Drop this file in your project root (or `docs/DESIGN.md`) and commit it to source control. Then add a pointer in your `CLAUDE.md`:

```
## Design System
Check DESIGN.md before writing or editing any UI code. Use its exact values for
color, spacing, radius, and typography — never approximate or round a listed
number (e.g. use `padding: 16px`, not "roughly 16px" or a Tailwind class that's
close but not exact). If a component isn't covered here, extend in the system's
spirit per §10, not by inventing new values.
```

This is the fix for drift on font weight, spacing, and padding specifically: those are the values Claude is most likely to "eyeball" from a screenshot instead of reading exactly, so calling them out explicitly in `CLAUDE.md` matters more than for color or layout.

---

## 1. Visual DNA — read this first

If you remember nothing else, build to these six rules. They are what makes a screen look like Express:

1. **Light, cool, blue-led.** White surfaces on a pale blue-gray page (`#F3F4F8`). One brand color — RMX Blue `#008DD5` — carries *all* interactivity: primary buttons, links, active borders, selected states, interactive icons.
2. **Borders over shadows.** Structure is drawn with 1px hairlines in light steel blue `#CEDBE7`. Shadows are soft and low-contrast, reserved for genuinely floating things (toasts, overlays, popovers).
3. **Softly squared, never pill.** 4px radius on virtually everything — buttons, inputs, tiles, toasts, lozenges. Full-round is only for radios, avatars, and small counter pills. If you're writing `border-radius: 8px` or more on a control, stop.
4. **Compact enterprise density.** 36px standard control height, 14px default text, a 4px spacing grid (4/8/12/16 dominate). This is a data-heavy B2B tool, not a marketing site.
5. **One typeface: Roboto.** Regular for body, Medium for headings, SemiBold for emphasis and values. *Italic gray means placeholder text* and nothing else.
6. **Navy for content, gray for chrome.** Headings and values are navy `#13314C`; labels and secondary text are gray `#666666`; anything interactive is blue.

---

## 2. Color

### 2.1 Primitive palette (the nine documented anchors, all WCAG-graded)

| Name | Hex | Role |
|---|---|---|
| Brand/500 "RMX Blue" | `#008DD5` | The brand. Links, primary buttons, active/selected, interactive icons |
| Dark Blue/500 | `#13314C` | Headings, values, dark bars |
| Light Blue/500 | `#CEDBE7` | Hairline borders |
| Green/500 | `#6EB744` | Success |
| Red/500 | `#EB343C` | Error |
| Orange/500 | `#F58220` | Attention |
| Yellow/500 | `#FAA61C` | Notice |
| Neutrals/0 | `#FFFFFF` | Surfaces |
| Neutrals/1000 | `#000000` | (rare) |

> RMX says **"attention"** (orange) and **"notice"** (yellow) — never "warning" or "info". Use this vocabulary in UI copy, class names, and conversation.

### 2.2 Semantic tokens (light mode)

**Text** — `text-primary` `#666666` (default body/label gray) · `text-secondary` `#13314C` (headings, entered values) · `text-link` / `text-label` `#008DD5` (clickable / static labels above inputs) · `text-disabled` `#B3B3B3` (also placeholder, which is additionally *italic*) · `text-inverse` / `text-OnDark` `#FFFFFF` · `text-error` `#EB343C` · `text-success` `#6EB744`

**Icon** — `icon-primary` / `icon-brand` `#008DD5` · `icon-tertiary` `#666666` (muted) · `icon-quaternary` `#13314C` · `icon-success` `#6EB744` · `icon-error` `#EB343C` · `icon-attention` `#F58220` · `icon-notice` `#FAA61C` · `icon-disabled` `#B3B3B3` · `icon-OnDark` `#FFFFFF`

**Border** — `border-primary` `#CEDBE7` (the default hairline) · `border-secondary` `#008DD5` (active/selected/focus, tile header underline) · `border-disabled` `#EBF1F5` (register row hairlines) · `border-attention` `#F58220` (active tab underline) · `border-scoreboard` `#425A70` · `border-tertiary` `#666666` · `border-quaternary` `#13314C`

**Background & container** — page `#F3F4F8` · surface / `Container/primary` `#FFFFFF` · subtle `Container/tertiary` `#F5F8FA` (also the input fill) · pale brand tint `#CCE8F7` · hover tint `#EBF1F5` · disabled `#F2F2F2`

**Component tokens** — main header `#13314C` · command launch `#425A70` (slate; header search + icon buttons) · context header `#008DD5` · register header row `#737373` · register row `#FFFFFF` with `#EBF1F5` hairlines · tile surface `#FFFFFF` · action bar rail `#13314C` · scoreboard color bar `#425A70` · lozenge backgrounds success `#E2F1DA`, error `#FBD6D8`, brand `#CCE8F7`, notice `#FEEDD2` · toast success `#6EB744`, toast/callout help `#13314C` · solid alert chip `#BC2A30` · primary button `#008DD5` (hover `#0071AA`, disabled `rgba(0,141,213,.5)`) · secondary button hover `#EBF1F5` · marketing orange `#F79B4D` (hover `#F9B479`)

### 2.3 Dark mode (exists, secondary)

A full dark mode is defined: `text-primary` → `#EFF0F0`, links lighten to `#4FACDB`, surfaces go `#2F3031`, hairlines `#61686E`. Prototype in light mode unless asked.

### 2.4 Reserved color

Pink/teal/purple backgrounds exist **exclusively for signature fields in Signable Documents**. Semi-transparent fills are for kanban Swim Lane columns. Don't repurpose either.

---

## 3. Typography

**Roboto only** (Google Fonts; weights 400, 500, 600 + italic). Style naming: `Web/{Display|Heading|Paragraph|Label}/{S|M|L|XL}/{Regular|Medium|SemiBold|Italic}`.

| Style | Spec | Use |
|---|---|---|
| Display/XL | 96/400 | Splash / onboarding only |
| Display/S/SemiBold | 40/600, LH 48 | Splash eyebrows and titles |
| Heading/L | 24px (400 or 500), LH 32 | Page titles |
| Heading/M | 20px (400 or 500), LH 28 | Section titles |
| Heading/S | 18px 400, LH 24 | Context bar page title |
| Paragraph/L | 16px (400/600), LH 24 | Larger body, scoreboard figures |
| **Paragraph/S** | **14px 400, LH 20** | **Default body — "body text for most use cases"** |
| Label/M | 14px (400/600), LH 1 | Buttons, input labels, tile titles |
| Label/S/Medium | 12.6px 500, +1.1px tracking, Title Case | Register headers — this style and no other |
| Label/S/Italic | 12–14px italic `#B3B3B3` | Placeholder text — the only use of italic gray |

Emphasis is SemiBold, not bold. Links underline on hover only. Headings navy, labels gray.

---

## 4. Space, radius, elevation

**Spacing (px)**: xxxs 2 · xxs 4 · xs 8 · sm 12 · md 16 · lg 20 · xl 24 · 2xl 32 · 3xl 40 · 5xl 56 · 6xl 64 · 9xl 96. Most UI uses 4/8/12/16. Tile padding 16; control padding 8; icon-to-label gap 8; page margins 24; gaps between page sections and tiles 20.

**Radius (px)**: xs 2 (checkbox boxes) · **sm 4 — the default, used on nearly everything** · md 8 (larger surfaces) · lg 12 (counter pills) · round (radios, avatars).

**Shadows** (neutral `#4C4C4C` at 5–15%, layered and soft):

- `dropshadow-sm` "subtle separation" — `2px 2px 12px -5px rgba(76,76,76,.08), 0 4px 15px -5px rgba(76,76,76,.08)` · used by the Scoreboard
- `dropshadow-md` "most commonly used" — `1px 2px 12px 1px rgba(76,76,76,.10), 0 4px 10px -10px rgba(76,76,76,.10), 0 -2px 20px -5px rgba(76,76,76,.08)` · floating panels
- `dropshadow-lg` — `1px 2px 12px 1px rgba(76,76,76,.14), 0 10px 10px -5px rgba(76,76,76,.15)` · My Workspace dashboard tiles and overlays
- Toast — `0 3px 6px rgba(0,0,0,.25)`
- `dropshadow-orion-light` — RMX Blue at 20%, a glow instead of a shadow · **Orion only**

**Gradients are reserved, never decorative**: `RMX_1` (Wizard progress bar only) · `Orion_1` (light blue → RMX blue, vertical, Orion backgrounds) · `Orion_2` (RMX blue → green, horizontal — the signature AI gradient).

---

## 5. Iconography

- **Material Icons** for all generic actions and status, using verbatim Google glyph names (`arrow_drop_down`, `more_vert`, `check_circle`, `search`, `calendar_today`, `close`, `add_circle`, `open_in_new`, `chevron_right`…). Filled states are separate `-filled` variants, not a weight axis.
- **Express Icons** — a custom set for domain objects (tenants, owners, properties, units, leases, payments, maintenance). In HTML, substitute the closest Material glyph (`home` property, `apartment` unit, `person`/`group` tenants, `payments` payments, `build` maintenance) and note the substitution in a comment.
- **Sizes**: 16 inline with text · 20 in buttons, inputs, and rails · 24 toolbar/standalone/callouts · 32 toasts and feature moments.
- In HTML use **Material Symbols Outlined** with `font-variation-settings: 'FILL' 1` for filled variants.
- Interactive icons are blue; muted/decorative icons `#666666`; icons on navy or colored bars are white.
- Brand: the `rmx` logo has Brand Logo / Full Color / House Logo variants — a "Rent Manager" wordmark stands in for prototypes. The **Orion logo marks every "Smart"/AI product**.

---

## 6. Page anatomy

Every full-page prototype starts with the same two bars, then follows one of two page patterns. Measured at 1920px wide.

### 6.1 Header (app bar) — 48px, `#13314C`

16px side / 8px vertical padding, three equal zones:

- **Left**: "Rent Manager" white wordmark (~175×32).
- **Center — the Command Launch cluster**: three attached 32px icon buttons (fill `#425A70`, 20px white icons, outer corners r4) then, 8px later, a **454×32 search bar** (fill `#425A70`, r4, 24px white `search` icon, placeholder "Command Launch" in 12px *italic* white).
- **Right** (32px gaps): Company Code block (12px label over 14px value, white), 20px white `notifications` bell, **32px avatar** (blue circle, white 14px initials).

### 6.2 Context Bar — 40px, `#008DD5`

16px side padding, 12px item gaps, leading and trailing slots.

- **Leading**: the page title in **18px Roboto Regular white**. On a detail page it continues with an entity-name field (248×32), a record pager (`chevron_left` "125 of 255" `chevron_right`), and an orange "1 Filters Applied" chip with a trailing `close`.
- **Trailing**: 20px white Material icons (`print`, `autorenew`, `help`).
- The Orion tag lives here on AI-enabled pages.

### 6.3 Register page

Content on white with 24px page margins:

```
[optional Callout lane]
Filter row       56px   blue labels over 248px-wide 36px fields;
                        leading Bulk Actions secondary button;
                        trailing primary Add buttons with add_circle
   12–16px gap
Register                gray 28px header + 36px rows
Totals line      14px   right-aligned "34 of 112 Tenants"
```

A compact 36px filter-row variant drops the labels. "Show Quick Filters" is an action-text button with a 20px `visibility` icon.

### 6.4 Entity detail page

Content on white, 24px margins, **20px gaps throughout**, plus the 40px navy Action Bar rail pinned to the right edge of the page:

```
Scoreboard Header   ~112px
Layout Tab Row        48px    orange underline on the active tab
Callout(s)            40px    each, stacked
Tile row 1                    3 tiles across (or 2 wide ones), 20px gaps
Tile row 2 …                  rows of equal-height tiles
```

Tiles hold read-only field grids, embedded registers, contact cards, editable forms, or their own internal tabs.

---

## 7. Component recipes

All controls: Roboto, 36px standard height (24px compact), 4px radius, 14px labels.

### 7.1 Controls

**Button** — types Primary, Secondary, Action text, Split, Marketing, Tab. ~16px effective side padding; 20×20 icons (16 compact); trailing icon is usually `arrow_drop_down`.

| Type | Fill | Border | Label |
|---|---|---|---|
| Primary | `#008DD5` → hover `#0071AA` → disabled 50% alpha | none | white |
| Secondary | white → hover `#EBF1F5` | 1px `#008DD5` (disabled `#EBF1F5`) | `#008DD5` (disabled `#B3B3B3`) |
| Action text | transparent → hover `rgba(0,0,0,.05)` | none | `#008DD5`; the 16px XL size only when it's the page's primary menu affordance |
| Split | two `#008DD5` segments with a 1px white divider; right segment is a 20px `arrow_drop_down` | none | white |
| Marketing | `#F79B4D` → hover `#F9B479`, fixed 296×48 | none | 16px Medium navy + `arrow_right_alt`. The only non-blue CTA — marketing moments only |
| Tab (attached) | `#008DD5`, h24, top corners only r4 | none | white 14px |

**Input Field** — label above (14px, 4px gap), then the field: h36, fill `#F5F8FA`, 1px `#CEDBE7`, r4, 8px padding. Placeholder 14px *italic* `#B3B3B3`; entered text 14px navy. Optional 20px leading icon (`search`) or trailing icon (`keyboard_arrow_down` = dropdown, `calendar_today` = date picker — those triggers *are* this control). Focus: border `#008DD5`. Multi-line = Text Box, same skin. Label color is gray in forms, **blue `#008DD5` for the filter fields above registers**.

**Dropdowns and floating panels — never native selects.** No `<select>` or default browser controls anywhere. The trigger is the Input Field above; the open panel (dropdown menu, popover, in-place editor) is white, r4, 16px padding, `dropshadow-md`, with an optional 13px caret pointing at the trigger. List items ~36px, 8px padding, 14px Regular, hover `#EBF1F5`, selected `#EBF1F5` + blue text. In-place editing marks its target with a **1px dashed `#008DD5`** outline.

**Checkbox** — 20×20 box, r2, 2px border, 8px gap to a 14px gray label. Unchecked: white with `#B3B3B3` border. **Checked is orange `#F79B4D`** with a white check. The one exception: the select-all checkbox that sits above a Register beside the Quick Filters checks in **blue `#008DD5`** (the Register variant, which also turns its label blue). Everywhere else, including inside register rows, use orange. Disabled: `#F2F2F2` fill, `#B3B3B3` border and label.

**Radio** — 20×20 circle, 2px border: unselected `#B3B3B3`, selected `#008DD5` with a centered 10px blue dot. **Radio Selector** = a selectable card (r4, 1px border): unselected white/`#CEDBE7`, selected `#EBF1F5` + `#008DD5` border + `dropshadow-md`.

**Toggles** — *Toggle Switch* is a segmented 2-option control: two 66×36 joined segments, selected = `#EBF1F5` fill + `#008DD5` border + SemiBold label, unselected = white + `#CEDBE7` + Regular. *Toggle Slider* is the Material-style on/off pill for boolean settings.

**Tabs** — 8px horizontal / 16px vertical padding (48px tall), label **14px SemiBold**. **Active: 2px `#F58220` orange bottom border** with navy text — not blue. Inactive: no border, gray text. Used as the page-level layout switcher under the Scoreboard and inside Tiles.

### 7.2 Status and data display

**Lozenge** — h24, 8px/4px padding, **r4 (not a pill)**, 8×8 status dot + 14px navy text. Backgrounds: success `#E2F1DA` (dot `#6EB744`), error `#FBD6D8` (`#EB343C`), brand `#CCE8F7` (`#008DD5`), notice `#FEEDD2` (`#FAA61C`). A transparent variant (no background, *italic* text) is used in register Status columns; an h32 variant appears in the Scoreboard.

**Pill (counter)** — fully rounded r12, h20–24, white or pale fill, small icon + 14px text. For counts and deltas ("+1") — distinct from a Lozenge.

**Solid alert chip** — fill `#BC2A30`, white 14px text, h24, r4, no dot. Sits inline after a name in a register ("Notice").

**Avatar** — solid-color circle (status palette), white uppercase initials, ~2.5:1 circle-to-text ratio (32px circle / 14px text in the header).

**Register (data table)** — Express calls tables *Registers*. **Two header skins, chosen by context:**

- **Full-page register**: header row **28px, fill `#737373`, white text** — Roboto Medium 12.6px, +1.1px tracking, Title Case, 8px padding, ellipsis. Column resizer = 0.5px white hairline at each column's right edge. No sort icons. The far-right 40px utility column carries a white columns icon.
- **Embedded in a Tile**: header row **32px, white fill, 1px `#CEDBE7` top and bottom borders, navy text** — same 12.6px Medium Title Case type. Expandable rows get a leading 20px `chevron_right` in a 32px first column.

Both share the body: **rows 36px, white, 1px `#EBF1F5` top and bottom hairlines**, no vertical borders, 8px cell padding. Cell content: plain text 14px Regular navy with ellipsis · links 14px blue · transparent italic status lozenge · solid alert chip · counter pill · a **10px-wide full-height color-indicator bar** in the first 32–40px column · checkboxes · a 20px blue `more_vert` kebab in the last column. **No numbered pagination** — end with a right-aligned totals line, "34 of 112 Tenants" in 12px `#B3B3B3` (multiple totals sit side by side, 32px gaps).

### 7.3 Surfaces

**Tile — the building block of detail pages.** "Compact blocks used to display related content, data views, or other key information."

- Container: white, **1px `#CEDBE7` border**, r4. Tiles are border-led; only My Workspace dashboard tiles use `dropshadow-lg`.
- **Header**: min-height 36px, 8px padding, **2px `#008DD5` bottom border** — the signature blue underline. Title **14px SemiBold navy**. Right-aligned: action-text links (14px Regular blue — "Move Out", "Renew", "Add Note"), an optional 20px `more_vert`, then a 20px `open_in_new` that opens the entity full-page.
- Body: 16px padding, 16px gaps.
- **Read-only field grid** (the most common content): columns 24px apart, fields 16px apart. Each field is a label above a value — label 14px Regular gray, value **14px SemiBold**, **blue when it's an entity reference** (property code, unit number) and **navy for plain values** (dates, terms). Empty fields show the label alone.

**Scoreboard Header — the entity snapshot.** "Used to give a quick overview of a chosen entity's details." Sits directly under the context bar on every detail page.

- Container: white, 1px `#CEDBE7`, r4, `dropshadow-sm`, min-height 64px (~112px in practice), full content width.
- **Left color bar: 16px wide, full height, `#425A70`** — the signature scoreboard marker.
- Leading content (column, 16px gap): row 1 at **40px gaps** — entity name **16px SemiBold navy**, account block **16px *italic* navy** ("Account #: 516"), status **Lozenge at h32**; row 2 at **32px gaps** — repeated 20px icon + 14px Regular navy items (property, unit, email, phone).
- Trailing content (32px gap): a figures column (20px gaps, right-aligned; each row "Balance Due:" + value in 16px Regular navy, 24px gap, value right-aligned in an 86px box), then a button column (8px gap) of **Split Buttons, 153×36**.

**Container** (non-tile, for form sections) — header (16px SemiBold navy title + optional right-aligned compact actions) above a white body with 1px `#CEDBE7`, r4, 8–16px padding, internal rows separated by hairlines. Form sections may instead use an underlined header (14px SemiBold navy over a `#CEDBE7` bottom border).

**Action Bar** — a **40px-wide navy `#13314C` rail pinned to the right edge**, full page height: 8px horizontal / 16px vertical padding, 16px gaps, 20px white icons (list, multi-add, mail, reports, delete). Detail pages have it; registers generally don't.

**Board card (kanban)** — 272×224, white, r4, soft layered shadow, **8px-wide full-height color-indicator bar on the left edge**, 24px `more_vert` top-right. Name row: 14px SemiBold blue link + 16px `call` icon. Property/unit rows: 16px domain icons + 14px Regular. Data rows: 12px Medium +1.44px tracking label / 12px Regular value, ~22px pitch, 1px divider mid-card. Cards sit in Swim Lanes (semi-transparent column fills).

### 7.4 Feedback and overlays

**Toast** — solid status-color bar (success `#6EB744`; help/info is **navy `#13314C`**), 16px padding, r4, toast shadow, 32px white icon + 16px SemiBold white message. Corner, auto-dismissing.

**Callout** — "a dismissible banner that highlights important or contextual information." Two skins:

- *Filled* (mode banners on registers): fill `#13314C`, r4, 8px padding, hugging its content, centered above the filter row — 24px white icon + 14px white message + a trailing white Secondary "Exit" button.
- *Outlined* (detail pages): **white, 1px border, r4, 8px padding, 40px tall, full width** — 24px `info` icon + **14px SemiBold navy** text. Border color carries status: blue for info, orange `#F58220` for attention. May also hold inline label/value pairs, a Lozenge, and a right-aligned action link.

**Overlays** — *Pop Up* is the confirm-style modal for changes that must be acknowledged. *Dialog Overlay* is a large task surface (~1396px on a 14" reference, 16px padding) used to redirect attention — not for errors. Both: white, r4, `dropshadow-lg`, with an Overlay Header and an Overlay Footer holding right-aligned Secondary + Primary buttons.

**Progress and notification** — Progress Indicator (journey steps), Progress Bar/Circle, Loading Spinner, Bell Notification + menu, Info Tooltip, Tour Flyout (feature intro with a progress arc).

---

## 8. Orion — the AI sub-brand

Orion brands every AI/"Smart" feature in Express. It layers on RMX; it never replaces it:

- **Signature gradient** (`Orion_2`): RMX Blue → Green, horizontal — Orion buttons and accents.
- **Background gradient** (`Orion_1`): Light Blue → RMX Blue, vertical.
- **Glow**: soft RMX-Blue-at-20% instead of a gray shadow.
- **Marks**: the Orion logo on all Smart products, sparkle iconography, and animated loaders (jumping dots, logo loader, "is typing") to signal AI activity.
- **Components**: Orion Action Bar (the prompt input), Chat Bubble, Tag (static brand chip), Lozenge (interactive, unlike the plain one), Overlay + Header/Footer, and Summarize / Help / History buttons.

If a prototype includes an AI feature, use these cues. A plain blue button on an AI action reads as off-brand — and generic purple/violet "AI styling" is exactly what Orion exists to replace.

---

## 9. Domain vocabulary

Use Express's language in UI copy: **Registers** (data tables) · **Boards** with **Swim Lanes** and **Stages** (Prospect Board, Maintenance Board) · Prospects, Tenants, Owners, Vendors, Properties, Units, Leases · **Leasing Center**, **Lease Renewals** · **Bird's Eye View (BEV)** (map/floorplan tool) · **Script Builder** · **Signable Documents** · **My Workspace** (dashboard tiles) · **Mega Menu** / Admin Menu · **Command Launch** (global search) · **Orion** (AI). States are **attention** and **notice**, never warning or info.

---

## 10. Extending beyond the system

When a prototype needs something RMX doesn't define, extend in its spirit rather than importing another system's look: white surface, 1px `#CEDBE7` border, 4px radius, 14px Roboto, 4px-grid spacing, blue for the interactive parts, and restraint — no new colors, no large radii, no heavy shadows, no gradients unless it's Orion. When in doubt, make the new thing look like a Register or a Tile.
