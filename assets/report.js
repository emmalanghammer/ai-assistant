/* ============================================================
   Printed report — the document builder
   ------------------------------------------------------------
   Turns a report id into paginated .rpt-page documents, laid out per the
   Rent Manager Reports Guide (Figma "Reports Guide", Report with Sections).
   A report is a DOCUMENT, not an Express screen: it keeps the report
   engine's own type scale and colour, which is why proto.css holds those
   values as literals rather than RMX tokens.

   Loaded on every screen, because the Orion panel shows report metadata
   and page counts inline in a conversation, and the print dialog renders
   these same pages — neither of which requires the report viewer itself.
   ============================================================ */

/* ============================================================
   Report generation + the report viewer
   ------------------------------------------------------------
   PDF on a result Orion analyzed builds the report and opens it
   on screen — the same move the Orion Report Analysis prototype
   makes, where Orion writes a summary and it becomes a page of
   the report you are reading. Here the summary already exists,
   because the conversation is what produced it, so it is page 1.
   Print skips straight to the print overlay instead (see output()
   and openPrintOverlay(), below the report data builders).

   The pages are .rpt-page documents: the Reports Guide template
   above, rendered from the same records the chat answer showed.
   Nothing here is an exported image — the thumbnail rail and the
   print overlay both hold live clones of the same pages.

   Only q1 has a hand-built page (buildOccupancySummaryReport).
   Every other result is laid out by the generic builder below,
   which fills each sheet by measuring an off-screen page rather
   than estimating heights — see rptLayout.
   ============================================================ */
const RV_ZOOMS = [50, 75, 100, 125, 150, 200];
const RV_THUMB_SCALE = 120/816;  /* thumbnail box width over page width */
let RPT = { id:null, meta:null, count:1, page:1, zoom:2, reopenOrion:false, summaryPos:null, summaryHtml:null };

function rptMeta(id){
  const p = PROMPTS[id] || {};
  return {
    id: id,
    name: p.reportName || p.tileName || 'Result Summary',
    source: p.reportSource || 'Custom · built from this result',
    options: (p.reportSource || 'Custom · built from this result') + ' — 10 properties selected · class60',
    dateRange: 'As of Aug 28, 2026',
    params: [
      ['Report', p.reportSource || 'Custom · built from this result'],
      ['Properties', '10 selected · class60'],
      ['As of', 'Aug 28, 2026 · day 18 of period'],
      ['Layout', 'Summary with detail rows, portrait, letter'],
    ],
    builtFrom: p.label || 'this result',
  };
}

/* ---------- The rest: parameters and whatever the result was ---------- */
function rptDataBlocks(p, m){
  const B = [];
  const band = label => B.push({ t:'band', label:label });
  const isMoney = s => /^-?\$[\d,]+(\.\d+)?$/.test(String(s == null ? '' : s).trim());
  const toNum = s => parseFloat(String(s).replace(/[$,]/g, ''));
  const asMoney = n => (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 });

  /* A detail grid, closed with the total a printed report is expected to
     carry and the chat answer never showed. */
  function detail(label, head, rows){
    if (!rows || !rows.length) return;
    const wide = rows[0].length > 2;
    const g = wide ? '1.45fr 1.45fr .6fr' : '1fr 1fr';
    band(label);
    B.push({ t:'cols', grid:g, cells: wide ? head : head.slice(0,2), amounts: wide ? [2] : [] });
    rows.forEach(r => B.push({ t:'row', grid:g, amounts: wide ? [2] : [],
      cells: wide ? [r[0], r[1], r[2]] : [r[0], r[1]],
      tone:r[3], toneCol:2, muted:[1],
      wrap: String(r[0]).length + String(r[1]).length > 74 }));
    const count = rows.length + (rows.length === 1 ? ' record' : ' records');
    B.push({ t:'total', grid:g, amounts: wide ? [2] : [],
      cells: wide
        ? [count, '', rows.every(r => isMoney(r[2])) ? asMoney(rows.reduce((s,r)=>s + toNum(r[2]), 0)) : '']
        : [count, ''] });
  }

  band('Report Parameters');
  m.params.forEach(r => B.push({ t:'kv', l:r[0], v:r[1] }));
  B.push({ t:'kv', l:'Built by', v:'Orion Assistant · from “' + m.builtFrom + '”' });

  if (p.plan){
    band(p.plan.title);
    p.plan.rows.forEach(r => B.push({ t:'kv', l:r[0], v:r[1] }));
    if (p.plan.warn) B.push({ t:'para', text:'Exception: ' + p.plan.warn });
  }

  if (p.report){
    const g = '1.7fr .85fr .85fr .5fr';
    band(p.report.title);
    B.push({ t:'cols', grid:g, cells:['Account'].concat(p.report.cols), amounts:[1,2,3] });
    p.report.rows.forEach(r => {
      if (r.kind === 'head'){ B.push({ t:'sect', grid:g, cells:[r.a, '', '', ''] }); return; }
      B.push({ t: r.kind === 'total' ? 'total' : 'row', grid:g, cells:[r.a, r.b, r.c, r.d], amounts:[1,2,3],
        tone: r.dir === 'bad' ? RED : r.dir === 'up' ? GREEN : GRAY, toneCol:3 });
    });
  }

  if (p.tenants && p.tenants.length){
    const g = '1fr 1.15fr 1.6fr .6fr';
    band('Vehicle Register');
    B.push({ t:'cols', grid:g, cells:['Tenant','Unit','Vehicle on file','Match'] });
    p.tenants.forEach(t => B.push({ t:'row', grid:g, muted:[1,2],
      cells:[t.name, t.unit, t.vehicle, t.match === 'exact' ? 'Exact' : 'Partial'],
      tone: t.match === 'exact' ? GREEN : GRAY, toneCol:3 }));
    B.push({ t:'total', grid:g, cells:[p.tenants.length + ' vehicles on file', '', '', ''] });
  }

  if (p.unitList){
    const g = '1.35fr .6fr .7fr .7fr';
    band('Units Vacating · Next 30 Days');
    B.push({ t:'cols', grid:g, cells:['Unit','Vacant','Applications','Interest'], amounts:[2,3] });
    UNITS.forEach(u => B.push({ t:'row', grid:g, amounts:[2,3], muted:[1],
      cells:[u.unit + ' · ' + u.property, u.vacant, u.apps === 0 ? 'None' : u.apps + ' pending',
             u.interest === 0 ? 'None' : u.interest + ' interested'],
      tone: u.interest === 0 ? RED : u.interest < 3 ? ORANGE : GREEN, toneCol:3 }));
    B.push({ t:'total', grid:g, amounts:[2,3],
      cells:[UNITS.length + ' units vacating', '', UNITS.reduce((s,u)=>s+u.apps,0) + ' pending', UNITS.reduce((s,u)=>s+u.interest,0) + ' interested'] });
  } else {
    /* tileRows are the dashboard tile's summary of the same numbers, so they
       only stand in as the detail grid when there is no table and no statement. */
    detail('Detail', p.tileHead || ['Record','Detail','Value'], p.table || (p.report ? null : p.tileRows));
  }

  if (p.posted){
    band('Posting Results');
    B.push({ t:'para', text:p.posted.text });
    if (p.posted.stats) B.push({ t:'stats', items:p.posted.stats });
    if (p.posted.table) detail('Posted Records', ['Record','Reference','Amount'], p.posted.table);
    if (p.posted.note) B.push({ t:'para', text:p.posted.note });
  }

  return B;
}

/* ---------- Rendering, in the Reports Guide's own markup ---------- */
function rptToneClass(t){ return t === RED ? 'tone-red' : t === ORANGE ? 'tone-amber' : t === GREEN ? 'tone-green' : ''; }

function rptCells(b){
  const amounts = b.amounts || [], muted = b.muted || [];
  return b.cells.map((c,i) => {
    const cls = ['rpt-cell'];
    if (amounts.indexOf(i) >= 0) cls.push('amount');
    if (muted.indexOf(i) >= 0) cls.push('muted');
    if (b.tone && b.toneCol === i){ const tc = rptToneClass(b.tone); if (tc) cls.push(tc); }
    return `<div class="${cls.join(' ')}">${esc(c)}</div>`;
  }).join('');
}

function rptBlockHtml(b){
  switch (b.t){
    case 'orion': return `<div class="rptx-orion">${orionMark(16)}<span class="t">Written by Orion Assistant on Aug 28, 2026 from the result it analyzed. AI may be inaccurate — verify before distributing.</span></div>`;
    case 'para':  return `<p class="rptx-para">${esc(b.text)}</p>`;
    case 'stats': return `<div class="rptx-stats">${b.items.map(s=>`<div class="rptx-stat"><div class="v">${esc(s[0])}</div><div class="l">${esc(s[1])}</div></div>`).join('')}</div>`;
    case 'li':    return `<div class="rptx-li"><span class="n">${b.bullet ? '&bull;' : esc(b.n + '.')}</span><span class="t">${esc(b.text)}</span></div>`;
    case 'kv':    return `<div class="rpt-row" style="grid-template-columns:170px 1fr"><div class="rpt-cell muted">${esc(b.l)}</div><div class="rpt-cell">${esc(b.v)}</div></div>`;
    case 'cols':  return `<div class="rpt-row rpt-headrow" style="grid-template-columns:${b.grid}">${rptCells(b)}</div>`;
    case 'row':   return `<div class="rpt-row" style="grid-template-columns:${b.grid}">${rptCells(b)}</div>`;
    case 'total': return `<div class="rpt-row rpt-total" style="grid-template-columns:${b.grid}">${rptCells(b)}</div>`;
    case 'sect':  return `<div class="rpt-row rptx-sub" style="grid-template-columns:${b.grid}">${rptCells(b)}</div>`;
  }
  return '';
}

/* The sheet itself: the Reports Guide page, wrapped around already-laid-out
   section markup. */
function rptPageShell(bodyHtml, n, total, m){
  return `<div class="rpt-page" data-rpt-page="${n}">
    <div class="rpt-header">
      <div class="rpt-title-row"><span class="rpt-title">${esc(m.name)}</span><span class="rpt-daterange">${esc(m.dateRange)}</span></div>
      <div class="rpt-options">${esc(m.options)}</div>
    </div>
    <div class="rpt-body">${bodyHtml}</div>
    <div class="rpt-footer">
      <div class="rpt-foot-left">
        <svg class="rmx-icon rpt-foot-ico"><use href="#properties"></use></svg>
        <span>RentManager.com</span><span>08/28/26</span><span>7:14 AM</span>
      </div>
      <div class="rpt-foot-page">${n} of ${total}</div>
    </div>
  </div>`;
}

/* ---------- Layout: measured, not estimated ----------
   Blocks are appended to a real off-screen page whose body is pinned to the
   height a letter sheet actually leaves, and a block that pushes past it moves
   to the next sheet. So the page count, the thumbnail rail and the printed
   document agree by construction — there is no cost table to keep in sync with
   the CSS, and nothing reflows after the fact.

   Two typographic rules are enforced while filling:
   - a section label alone at the foot of a sheet is carried to the next one
     rather than left as a widow;
   - a table that crosses a sheet repeats its section label as "(continued)"
     and its column header, the way a printed report does. */
function rptMeasureHost(){
  let host = document.getElementById('rptMeasure');
  if (!host){
    host = document.createElement('div');
    host.id = 'rptMeasure';
    host.setAttribute('aria-hidden', 'true');
    host.style.cssText = 'position:absolute;left:-99999px;top:0;width:816px;pointer-events:none;';
    document.body.appendChild(host);
  }
  return host;
}

function rptLayout(blocks, m){
  const host = rptMeasureHost();
  host.innerHTML = rptPageShell('', 1, 1, m);
  const page = host.firstElementChild;
  page.style.height = '1056px';
  const body = page.querySelector('.rpt-body');
  const avail = body.clientHeight;      /* what the sheet leaves after chrome */
  body.style.flex = 'none';
  body.style.height = avail + 'px';
  body.style.overflow = 'hidden';

  const newSection = () => {
    const el = document.createElement('div');
    el.className = 'rpt-section';
    body.appendChild(el);
    return el;
  };
  let section = null, lastBand = null, lastCols = null;
  const sheets = [];
  const overflows = () => body.scrollHeight > body.clientHeight + 1;

  function place(b){
    if (b.t === 'band'){
      const el = newSection();
      el.innerHTML = `<div class="rpt-section-label"><span class="lbl">${esc(b.label)}${b.cont ? ' (continued)' : ''}</span></div>`;
      section = el;
      return el;
    }
    if (!section) section = newSection();
    const holder = document.createElement('div');
    holder.innerHTML = rptBlockHtml(b);
    const el = holder.firstElementChild;
    if (el) section.appendChild(el);
    return el;
  }

  function commit(){
    Array.from(body.querySelectorAll('.rpt-section')).forEach(sec => { if (!sec.children.length) sec.remove(); });
    if (body.children.length) sheets.push(body.innerHTML);
    body.innerHTML = '';
    section = null;
  }

  blocks.forEach(b => {
    if (b.t === 'band'){ lastBand = b; lastCols = null; }
    if (b.t === 'cols'){ lastCols = b; }

    const prevSection = section;
    const added = place(b);
    if (!overflows()) return;

    /* Roll the block back off this sheet. */
    if (added && added.parentNode) added.parentNode.removeChild(added);
    if (b.t === 'band') section = prevSection;

    /* A label with nothing under it travels to the next sheet instead. */
    let carry = null;
    if (section && section.children.length === 1 && section.firstElementChild.classList.contains('rpt-section-label')){
      carry = section;
      if (carry.parentNode) carry.parentNode.removeChild(carry);
      section = null;
    }

    /* One block taller than a whole sheet: keep it and let it be tall. */
    if (!body.querySelector('.rpt-section > *')){
      if (carry) { body.appendChild(carry); section = carry; }
      place(b);
      return;
    }

    commit();
    if (carry){ body.appendChild(carry); section = carry; }
    else {
      if (b.t !== 'band' && lastBand) place({ t:'band', label:lastBand.label, cont:true });
      if (b.t !== 'cols' && lastCols) place(lastCols);
    }
    place(b);
  });
  commit();

  host.innerHTML = '';
  return sheets.length ? sheets : [''];
}

/* A hand-built page carries its own "1 of 1" — renumber it for the sheet it
   actually lands on, and tag it so the viewer can find it. */
function rptStampPage(html, n, total){
  return html
    .replace(/(class="rpt-foot-page"[^>]*>)[^<]*(<)/, '$1' + n + ' of ' + total + '$2')
    .replace(/class="rpt-page"/, `class="rpt-page" data-rpt-page="${n}"`);
}

/* The whole report, one HTML string per sheet. */
function rptPages(id){
  const p = PROMPTS[id] || {}, m = rptMeta(id);
  const sheets = [];
  const bespoke = PRINT_REPORTS[id];
  if (bespoke){
    const built = bespoke();
    (Array.isArray(built) ? built : [built]).forEach(html => sheets.push({ whole: html }));
  }
  else rptLayout(rptDataBlocks(p, m), m).forEach(html => sheets.push({ body:html }));

  /* Not a default page anymore — only present once Add to Report has been
     used (see addToReport()), and only at the position chosen there. */
  if (RPT.id === id && RPT.summaryPos){
    const summaryBody = `<div class="rpt-section"><div class="rpt-section-label"><span class="lbl">Executive Summary</span></div><div class="rv-analysis-page">${RPT.summaryHtml}</div></div>`;
    if (RPT.summaryPos === 'first') sheets.unshift({ body:summaryBody });
    else sheets.push({ body:summaryBody });
  }

  const total = sheets.length;
  return sheets.map((s,i) => s.whole ? rptStampPage(s.whole, i+1, total) : rptPageShell(s.body, i+1, total, m));
}

function rptPageCount(id){ return rptPages(id).length; }

/* ---------- The viewer ---------- */