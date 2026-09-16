# Orion Assistant

**Owner:** Emma Langhammer · **Built with:** rmx-prototyping 4.0.0, tokens `39c8f4c0ebcf`

The Orion Assistant in Rent Manager Express — the AI panel you open from the app
bar, and the two places a result inside it can take you.

One rule runs through the whole thing: **Orion drafts and builds, you approve and
send.** Nothing in this prototype sends anything. That is the feature, not a
limitation of the prototype, and it is worth saying out loud in a demo.

## Screens

| Screen | What it is |
|---|---|
| `screens/my-workspace.html` | **Start here.** My Workspace with the Orion entry point in the app bar. |
| `screens/report-viewer.html` | Where **PDF** on an analyzed result lands. Reached from the assistant. |
| `screens/tenant-detail.html` | Where a **record card** in a conversation opens to. Reached from the assistant. |

`index.html` is the link to send people.

## What it does

- **Ask anything.** Type a question, or open *Browse Prompt Suggestions* and pick
  one. Answers come in three shapes — from Express Help, from your data, or as a
  ranked list of what to do next — depending on what was asked.
- **Follow-ups.** Most results offer *Ask about this result* questions that go a
  level deeper without starting over.
- **Build a tile.** Ask Orion to keep an eye on something and it builds a
  dashboard tile, which appears in its own column on My Workspace.
- **Produce a report.** *Print a report* on an analyzed result offers Print, PDF
  and Excel. PDF builds a real paginated document and opens the report viewer;
  Print opens the print dialog directly.
- **Analyze a report.** In the report viewer, *Analyze with Orion* (bottom right)
  reads the report back and can write its summary into the document.
- **History.** The clock icon lists past conversations; they can be favourited,
  reopened and deleted.
- **The panel drags and resizes** from any edge, and remembers where you put it
  for the session.

**The conversation follows you.** Open a conversation on My Workspace, click
through to a report or a tenant record, and it is still there when you arrive —
and still there when you come back. This is the one behaviour most likely to be
tested in a review, so it is worth knowing it is deliberate: the screens are
separate files and the conversation is kept in `sessionStorage`.

## What is faked

- **Every answer is scripted.** There is no model behind this. Each prompt has a
  written answer, and free text is matched to the nearest scripted prompt.
- **The data is invented but consistent.** The same tenant owes the same balance,
  and the same property has the same occupancy, on every screen they appear on.
  Names, balances and dates are unchanged from the design canvases so the two can
  be compared side by side.
- **Command Launch, the Mega Menu, Favorites, Reports and the notification bell**
  are not built. Clicking one says so rather than doing nothing.
- **The print dialog is a recreation**, not `window.print()`. It opens instantly
  over the app, the way a real Print command does, and can be closed and
  restyled. Destination / Pages / Layout are decorative.
- **My Training** shows the signed-out state only.

## Deviations, and why

**The workspace hero grey is not a token.** RMX Pages 4969:70308 sets both hero
lines to `#575353`. No Foundations variable carries that value — the text fills
in the design are literals — and the nearest token, `--text-primary`, is
`#666666`. The prototype matches the page design rather than the token, because
the page design is what this screen is copying. Worth resolving one way or the
other in Foundations.


**Icon substitutions.** Every icon is real geometry harvested from RMX
Iconography — 61 core glyphs plus 31 Express product icons in
`assets/icons-local.svg`. Nothing is drawn. Three concepts have no glyph in the
library at all, and are standing in:

| Wanted | Using | Note |
|---|---|---|
| a vehicle | `search` | **RMX Iconography has no vehicle icon** — 765 icons and not one, despite Tenant Vehicles being a real Express record with its own register. Worth raising. |
| `trending_up/down/flat` | `arrow_upward` / `arrow_downward` / `remove` | No trend glyphs in the library. |
| `insights`, `touch_app`, `list_alt`, `table_view`, `picture_as_pdf`, `fact_check` | `reports`, `info`, `list`, `grid-view`, `description`, `list` | Generic Material names with no RMX equivalent. |

One icon comes from a different library. `edit_square` — the assistant panel's
"new chat" glyph — is harvested from the **Orion Express Help design file**
(`3Ih40kVMyQyRUERvXAFIkQ`, node 2983:17248), because RMX Iconography ships
`edit` and `edit-filled` but no `edit_square`. Real geometry, just not from the
icon library, which is worth knowing if the icon set is ever re-harvested.

Everything else resolved to the *correct* Express icon rather than a generic one
— a snow-removal charge is `recurring-charges`, a parking violation is
`violations`, "create the bills" is `bills`.

**16 audit errors, all deliberate, all on two non-Express surfaces.**

- *The print dialog* (9 of them: 26px/500 title, 13px/400 labels, 14px/500
  buttons). It deliberately imitates OS print chrome — dark pane `#202124`, its
  own type scale. Snapping it to the RMX ramp would make it look like an Express
  surface, which is exactly wrong: the point is that it reads as the operating
  system, not the app.
- *The printed report* (7 of them: 24px/300, 14px/300, 10px and 12px sizes). A
  report is a **document**, styled per the Rent Manager Reports Guide, not an
  Express screen. It keeps the report engine's own type scale and its blue
  `#2a75b8`.

Both are marked as such in `assets/orion.css`. Everything on an actual Express
surface resolves to a named Foundations style.

## A deliberate departure from the skill

**No `data-rmx-todo`.** The skill says an affordance you are not building
should carry it, so a stakeholder clicking learns that rather than assuming it
is broken. All 18 were removed, along with the report viewer's own four "not
built" notices and the print dialog's settings notice.

The reason: only confirmations toast now. A demo that answers every stray
click with "not built in this prototype" spends its credibility telling people
what is missing. The unbuilt controls — Mega Menu, Reports, Favorites, Command
Launch, My Dashboard, the viewer's Download and More menus, the print
settings — are simply inert.

The trade is real and worth knowing: a reviewer clicking Command Launch now
gets nothing at all and may report it as a bug. That is the call, and it is
reversible — the attributes are one `git revert` away.

## Worth raising with Emma

1. **`Header (app bar)` has no Orion variant and no slot.** The design puts the
   Orion entry point in the app bar, between Command Launch and the account
   block, which the component cannot express. It is built here as a documented
   extension (`.orion-entry` in `assets/orion.css`), but the real answer is a
   Header variant in the library. The notification **count badge** is the same
   story — the bell is in the component, the counter is not.

2. **Links: no underline, and not browser-blue.** ~~Open~~ — **fixed in
   rmx-prototyping 4.1.0**, prepared at `~/claude/_skill/`. `rmx.css` 4.0.0
   underlined `.rmx-btn--text:hover` and `.rmx-text--link:hover`, and set no
   colour at all on a bare `<a>`, so any anchor without `.rmx-text--link` came
   out underlined and `#0000EE`. On the app-bar logo — `fill: currentColor` —
   that rendered the wordmark bright blue on the navy bar. 4.1.0 sets
   `a { color: var(--text-link); text-decoration: none }` and drops both hover
   underlines, and adds `link-underlined` / `link-browser-blue` audit rules so
   it cannot regress.

3. **An unchecked `.rmx-check` renders a grey tick.** ~~Open~~ — **fixed in
   4.1.0**. The glyph was coloured white when checked but never hidden when
   unchecked.

   **Both overrides are still in `assets/orion.css`** and stay until 4.1.0 is
   published, because until then `check.mjs --fix` reinstates the 4.0.0
   stylesheet and the bugs come back. Once the prototype is on 4.1.0 the block
   marked *"Corrections to the shipped foundation"* can be deleted — verified
   against a 4.1.0 copy: same 16 deliberate errors, no new findings.

4. **No primary-button hover token.** DESIGN.md §7.1 specifies `#0071AA`;
   Foundations ships no token and `rmx.css` defines no primary hover at all.
   Held locally as `--proto-brand-hover`.

5. **Shadow tokens are missing from `tokens.css`.** DESIGN.md §4 gives measured
   values for `dropshadow-sm/md/lg` and the toast shadow; `tokens.css` carries
   only the two Orion glows. Held locally.

6. **`proto.css` is skill-owned.** `check.mjs --fix` refreshes it from the skill,
   so anything written into it is lost on the next check. This prototype's own
   styles live in `assets/orion.css`, loaded after it. Worth saying in the skill
   docs — it is not obvious, and it silently ate a stylesheet here once.

7. **`bundle.mjs` reports a broken icon that is not there.** Every bundle says
   `icon #chevron-down is not in icons.svg` for every screen. The only
   occurrence of that name is inside a *comment* in the skill's own
   `assets/app.js`, where it is used as the documentation example — and
   `chevron-down` is not a symbol in the skill's own `icons.svg` either. The
   bundler scans comments, so it flags its own doc string. Bundled pages render
   correctly; verified. Harmless, but it will cry wolf on every prototype.

8. **There is no Register component.** `data-rmx-component="Register"` fails the
   audit; Express assembles a register from `Header (register)` + `Cell`. Correct,
   but the name people reach for is the one that does not exist.

## Layout

```
index.html              the link you send people
screens/*.html          one screen per file
assets/
  tokens|type|rmx|proto|responsive.css, app.js, icons.svg   the skill's foundation — do not edit
  orion.css             this prototype's styles
  icons-local.svg       31 Express icons harvested for this prototype
  icon-names.js         Material name -> sprite id, for data-driven icons
  orion.js              the assistant: data, rendering, behaviour, print dialog
  report.js             builds the printed report document
  report-view.js        the report viewer (report screen only)
  tenant.js             populates the tenant record (tenant screen only)
  workspace.js          workspace tabs + the Orion tiles column
tools/sprite.mjs        inlines icons-local.svg into the screens
.design-source/         the Claude Design canvases this was built from
```

`.design-source/` is a dot-folder on purpose: `check.mjs` skips dot-folders, and
without that it stamps and icon-injects the source canvases as if they were
screens. The canvases include three "Dashboard Tile Ideas" explorations that are
**not** built here — this prototype is the assistant, not the tile set.
