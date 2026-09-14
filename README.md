# Orion Assistant — Rent Manager Express

A clickable prototype of the **Orion Assistant**: the AI panel you open from the
Express app bar, and the two places a result inside it can take you.

**Open `index.html`** — or, once this is on GitHub Pages, the Pages URL.

Built in the RMX design language with the `rmx-prototyping` skill (4.0.0). Every
icon is real geometry from the RMX Iconography Figma library; every colour,
space and radius resolves to an RMX Foundations token.

See **[PROTOTYPE.md](PROTOTYPE.md)** for what the prototype does, what is faked,
which icons are substitutions and why, and the handful of things worth raising
with the design system team.

## Publishing

`dist/` holds self-contained copies of each screen with the CSS, JS and icons
inlined — use those anywhere a page is served from its own origin and external
files are blocked. Regenerate them with the skill's `bundle.mjs`.

For GitHub Pages, serving the repository root works as-is: `index.html` links to
`screens/`, which load from `assets/`.
