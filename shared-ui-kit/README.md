# RMX Shared UI Kit

Real, working React components — not a description of them. This exists so a new
project never has to *rebuild* Header, Nav Menu, Button, Dropdown, DatePicker, etc.
from a design spec (which is where drift and mistakes creep in). Instead, copy this
folder in and import directly.

**Source of truth:** VendorPay (`src/components/AppHeader.tsx`, `src/components/NavMenu.tsx`,
`src/components/ui/`, `src/index.css`, `DESIGN.md`). This folder is a synced export of
those files, flattened for portability. If a component needs a real fix, fix it in
VendorPay first, then re-copy — don't patch the copy in a downstream project and let
it drift.

## What's in here

- `components/AppHeader.tsx` + `components/NavMenu.tsx` — the 48px navy app header
  and the full-screen mega-menu it opens. **Decoupled from VendorPay's app state**
  (see "Decoupling" below) — this version takes plain props instead of reading
  VendorPay's `WizardContext`. Requires `react-router-dom` (a `<Router>` somewhere
  above it in your tree) since both use `useNavigate`.
- `components/` (the rest) — Button, Controls, Field, Dropdown, MultiSelectDropdown,
  DatePicker, InfoTooltip. All React + TypeScript, styled with Tailwind utility
  classes.
- `assets/` — every icon SVG these components import: flat icons for the `ui/`
  components, plus `assets/shell/` (header icons) and `assets/nav-menu/` (menu
  icons), matching the folder names the components expect.
- `tokens.css` — the Tailwind v4 `@theme` block defining every color/spacing/radius
  variable the components rely on (`--color-brand-blue`, `--spacing-md`, etc.).
- `DESIGN.md` — the full written spec (for anything not yet componentized, or for
  extending the system consistently).

## Decoupling: AppHeader / NavMenu

The real VendorPay versions call `useWizard()` from that app's own `WizardContext`
for two things: resetting wizard state when the logo is clicked, and hiding one menu
item ("VendorPay Batches") until enrollment is complete. Neither of those is generic
UI — they're VendorPay's own business state — so the shared copies swap them for
plain optional props instead:

- `AppHeader({ companyCode?, userInitials?, onLogoClick?, disabledMenuLabels? })` —
  omit `onLogoClick` and it just navigates to `/`.
- `NavMenu({ onClose, categories?, disabledLabels?, defaultCategoryKey? })` — omit
  `disabledLabels` and nothing is hidden; pass your own `categories` to replace the
  menu content entirely, or leave the default (Rent Manager Express's real nav
  content — Rental Info, Accounting, Receivables, Payables, Owners, Services,
  Communication) if your project should show the same menu.

## How to use this in a new project

1. Requires: `react`, `react-dom`, `react-router-dom`, `clsx`, `tailwindcss` v4,
   `@tailwindcss/vite`.
2. Copy `components/` and `assets/` into your project, e.g. `src/components/` and
   `src/assets/`, preserving the `assets/shell/` and `assets/nav-menu/` subfolders.
3. Copy the contents of `tokens.css` into your project's root CSS file, right
   after `@import "tailwindcss";`.
4. Copy `DESIGN.md` into your project root.
5. Wrap your app in a `<BrowserRouter>` (or equivalent) if it isn't already —
   AppHeader/NavMenu need router context.
6. Add the block below to your project's `CLAUDE.md` (create one if it doesn't
   exist).

## CLAUDE.md block to add in the new project

```
## Shared UI components — import, never rebuild
`src/components/` contains the canonical RMX components: AppHeader, NavMenu,
and (in `ui/`) Button, Dropdown, DatePicker, Field, Controls,
MultiSelectDropdown, InfoTooltip. These are already correct and already match
the design system exactly.

- Always import from here for anything these components cover. Never
  redefine a header, nav menu, button, dropdown, date picker, etc. inline or
  from scratch.
- Do not edit files in this folder to fix a one-off visual issue. If something
  here is actually wrong, say so explicitly and fix it deliberately — don't
  quietly rewrite it while building an unrelated feature.
- AppHeader and NavMenu take plain props for anything app-specific (see their
  JSDoc comments) — configure via props, don't fork the component to add
  app-specific behavior.
- If a needed component doesn't exist yet, check DESIGN.md and build it to
  match §10 (extending the system), then it can be promoted back to the
  shared kit later.
```

## Keeping this in sync

This folder is a snapshot, not a live link — if VendorPay's components change,
re-run the copy (or ask Claude to "re-sync shared-ui-kit from src/components").
Remember: AppHeader/NavMenu are re-copied *and* re-decoupled by hand each time —
diff against the VendorPay originals for any change beyond the WizardContext
swap before overwriting the shared versions.
