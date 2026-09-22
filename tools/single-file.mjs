/* Builds dist/ai-assistant.html — the whole prototype, all three screens, in
   one file you can email or open from disk.
   
   The three screens already share everything but one script apiece, and the
   only element ids they have in common are the app bar's, which is identical
   on all three. So this merges rather than embeds: one head, one icon sprite,
   one app bar, and each screen's context bar + main wrapped in a section that
   the router shows or hides. Nothing is duplicated and no ids collide.

   Cross-screen navigation is four functions in orion.js, all of which set
   location.href. Here they set a hash instead and re-run the target screen's
   boot. Run: node tools/single-file.mjs
   ============================================================ */
import { readFileSync, writeFileSync } from 'node:fs';

const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const between = (s, open, close) => {
  const a = s.indexOf(open);
  const b = s.indexOf(close, a);
  if (a < 0 || b < 0) throw new Error('missing ' + open);
  return s.slice(a, b + close.length);
};

const SCREENS = [
  { id: 'home',   file: 'index.html',                   script: 'assets/workspace.js',   boot: null },
  { id: 'report', file: 'screens/report-viewer.html',   script: 'assets/report-view.js', boot: '__bootReport' },
  { id: 'tenant', file: 'screens/tenant-detail.html',   script: 'assets/tenant.js',      boot: '__bootTenant' },
];

const src = Object.fromEntries(SCREENS.map(s => [s.id, read(s.file)]));

/* --- head: the six local stylesheets, inlined once --- */
const css = ['tokens','type','rmx','proto','responsive','orion']
  .map(n => `/* ===== assets/${n}.css ===== */\n` + read(`assets/${n}.css`)).join('\n\n');

/* --- the two icon sprites, taken from one screen (they are identical) --- */
const sprites = (() => {
  const s = src.home;
  const out = [];
  let from = 0;
  for (let i = 0; i < 2; i++){
    const a = s.indexOf('<svg xmlns="http://www.w3.org/2000/svg" style="display:none"', from);
    const b = s.indexOf('</svg>', a);
    out.push(s.slice(a, b + 6));
    from = b;
  }
  return out.join('\n');
})();

const appBar = between(src.home, '<header class="rmx-appbar"', '</header>');

/* --- each screen's own content: context bar + main --- */
const sections = SCREENS.map(s => {
  const doc = src[s.id];
  const bar  = between(doc, '<div class="rmx-contextbar"', '</div>\n</div>');
  const main = between(doc, '<main ', '</main>');
  return `<section class="sf-screen" id="sf-${s.id}" hidden>\n${bar}\n${main}\n</section>`;
}).join('\n\n');

/* --- scripts: the shared four once, then one per screen --- */
const shared = ['assets/icon-names.js','assets/app.js','assets/report.js','assets/orion.js']
  .map(p => `/* ===== ${p} ===== */\n` + read(p)).join('\n;\n');

/* The two screens that read ?r= / ?t= boot in an anonymous IIFE. Name them so
   the router can re-run one when you navigate to it, and point their query
   read at the router's params rather than the address bar's. */
function nameBoot(code, fnName, param){
  const needle = `(function () {\n  const id = new URLSearchParams(location.search).get('${param}')`;
  if (!code.includes(needle)) throw new Error('boot IIFE not found for ?' + param);
  code = code.replace(needle, `function ${fnName}() {\n  const id = sfParam('${param}')`);
  /* close the named function where the IIFE closed, and do not self-invoke */
  const tail = code.indexOf('})();', code.indexOf(fnName));
  return code.slice(0, tail) + '}' + code.slice(tail + 5);
}

const perScreen = SCREENS.map(s => {
  let code = read(s.script);
  if (s.boot) code = nameBoot(code, s.boot, s.id === 'report' ? 'r' : 't');
  return `/* ===== ${s.script} ===== */\n` + code;
}).join('\n;\n');

const router = `
/* ============================================================
   Single-file router. Screens are sections in one document; the hash says
   which one is showing and carries what ?r=/?t= used to.
   ============================================================ */
let __sfParams = new URLSearchParams();
function sfParam(name){ return __sfParams.get(name); }

function sfShow(screen, params){
  __sfParams = new URLSearchParams(params || '');
  for (const el of document.querySelectorAll('.sf-screen')) el.hidden = (el.id !== 'sf-' + screen);
  document.body.dataset.sfScreen = screen;
  if (screen === 'report') __bootReport();
  if (screen === 'tenant') __bootTenant();
  window.scrollTo(0, 0);
}

function sfGo(screen, params, hashTarget){
  if (typeof saveConversation === 'function') saveConversation();
  location.hash = '/' + screen + (params ? '?' + params : '');
  sfShow(screen, params);
  if (typeof restoreConversation === 'function') restoreConversation();
  if (hashTarget){
    const el = document.getElementById(hashTarget);
    if (el) el.scrollIntoView();
  }
}

/* The four ways the prototype moves between screens. */
openTenantPage = tid => sfGo('tenant', 't=' + encodeURIComponent(tid));
openReport     = id  => sfGo('report', 'r=' + encodeURIComponent(id));
showDashboard  = ()  => sfGo('home');
onLinkClick    = e   => { e.preventDefault(); sfGo('home', '', 'orionTilesCol'); };

function sfFromHash(){
  const m = /^#\\/([a-z]+)(?:\\?(.*))?$/.exec(location.hash || '');
  return m ? { screen: m[1], params: m[2] || '' } : { screen: 'home', params: '' };
}
window.addEventListener('hashchange', () => { const r = sfFromHash(); sfShow(r.screen, r.params); });

/* Boot. The screens' own scripts already ran; this just reveals the right
   one and gives the two data-driven screens their parameters. */
(function(){ const r = sfFromHash(); sfShow(r.screen, r.params); })();
`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AI Assistant</title>
${between(src.home, '<link rel="icon"', '>')}
<link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap" rel="stylesheet">
<style>
${css}
/* Single-file shell: one screen visible at a time. */
.sf-screen[hidden] { display: none !important; }
</style>
</head>
<body class="rmx">
${sprites}
${appBar}
${sections}
<script>
${shared}
;
${perScreen}
;
${router}
<\/script>
</body>
</html>
`;

/* Two references only make sense across separate files. */
const patched = html
  /* The logo is an <a> to the home document; here home is a route. */
  .replace(/href="(?:\.\.\/)?index\.html"/g, 'href="#/home"')
  /* app.js points one <use> at the sprite as a sibling file. Same missing
     symbol either way — #chevron-down is not in icons.svg, which the audit
     has always reported — but in one file there is no sibling to reach for. */
  .replace(/\.\.\/assets\/icons\.svg#/g, '#');

writeFileSync(new URL('../dist/ai-assistant.html', import.meta.url), patched);
console.log('dist/ai-assistant.html  ' + (patched.length / 1024).toFixed(0) + ' KB');
