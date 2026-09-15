/* Inline assets/icons-local.svg into every screen, between the
   RMX_ICONS_LOCAL markers.

   Why inline rather than <use href="icons-local.svg#name">: a published page
   is served from its own origin with external references blocked, so a
   cross-file <use> resolves to nothing and every icon disappears. check.mjs
   inlines the core sheet the same way for the same reason; this does it for
   the glyphs this prototype harvested for itself.

   Run after editing assets/icons-local.svg:  node tools/sprite.mjs           */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sprite = readFileSync(join(root, 'assets/icons-local.svg'), 'utf8').trim();
const block = sprite.replace('<svg xmlns="http://www.w3.org/2000/svg" style="display:none">',
                             '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">');

const START = '<!-- RMX_ICONS_LOCAL:START - injected from assets/icons-local.svg by tools/sprite.mjs -->';
const END   = '<!-- RMX_ICONS_LOCAL:END -->';

/* The workspace lives at the repo root (index.html) and the other screens in
   screens/, so both places are scanned — missing the root one silently left
   the newest icons out of the main screen. */
const targets = [
  ...readdirSync(root).filter(f => f.endsWith('.html')).map(f => join(root, f)),
  ...readdirSync(join(root, 'screens')).filter(f => f.endsWith('.html')).map(f => join(root, 'screens', f)),
];

let n = 0;
for (const p of targets) {
  const f = p.replace(root + '/', '');
  const src = readFileSync(p, 'utf8');
  const a = src.indexOf(START), b = src.indexOf(END);
  if (a === -1 || b === -1) { console.log(`  skipped ${f} — no RMX_ICONS_LOCAL markers`); continue; }
  const out = src.slice(0, a) + START + '\n' + block + '\n' + src.slice(b);
  if (out !== src) { writeFileSync(p, out); n++; }
  console.log(`  ${f}`);
}
console.log(`\n  inlined ${sprite.match(/<symbol/g).length} local icons into ${n} screen(s)`);
