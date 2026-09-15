/* ============================================================
   Report viewer + Analyze with Orion
   ------------------------------------------------------------
   Only loaded by screens/report-viewer.html. The viewer chrome is not RMX
   chrome — Express embeds a document reader, and this imitates that
   reader, so its toolbar and thumbnail rail are deliberately their own
   thing rather than an Express surface.
   ============================================================ */

function renderReport_view(id){
  RPT.summaryPos = null; RPT.summaryHtml = null;
  const m = rptMeta(id);
  const pages = rptPages(id);
  RPT.id = id; RPT.meta = m; RPT.count = pages.length; RPT.page = 1; RPT.zoom = RV_ZOOMS.indexOf(100);

  document.getElementById('rptTitle').textContent = m.name;
  document.getElementById('rptContextTitle').textContent = 'Reports: ' + m.name;
  document.getElementById('rptTotal').textContent = pages.length;
  document.getElementById('rptCurrent').textContent = 1;
  document.getElementById('rptPages').innerHTML = pages.join('');
  rvApplyZoom();
  rvBuildThumbs();

  /* A fresh look at whichever report this is — Analyze with Orion starts
     over (bubble showing, card closed, conversation cleared) rather than
     carrying over the previous report's analysis. */
  RPT_CHAT.messages = [];
  RPT_CHAT.thinking = null;
  lastRptMsgCount = 0;
  pnlFollowUpUsed = false;
  pnlTypeToken++;
  document.getElementById('rvOrionChat').hidden = true;
  document.getElementById('rptOrionBtn').hidden = false;

  /* The conversation is kept, not archived — the panel comes back with the
     report still linked in it when you head back to the workspace. */
  RPT.reopenOrion = state.orionOpen;
  if (state.orionOpen){
    state.orionOpen = false;
    document.getElementById('orionPanel').hidden = true;
    document.getElementById('orionEntry').classList.remove('open');
  }
  document.getElementById('rptStage').scrollTop = 0;
  window.scrollTo(0, 0);
}

function closeReport(){ showDashboard(); }


function rvBuildThumbs(){
  const rail = document.getElementById('rptThumbs');
  rail.innerHTML = '';
  Array.from(document.querySelectorAll('#rptPages .rpt-page')).forEach((page, i) => {
    const n = i + 1;
    const btn = document.createElement('button');
    btn.className = 'rv-thumb';
    btn.setAttribute('aria-current', String(n === RPT.page));
    btn.dataset.rvThumb = n;
    btn.onclick = () => rvGoto(n);
    const box = document.createElement('span');
    box.className = 'rv-thumbbox';
    const scaler = document.createElement('span');
    scaler.className = 'rv-thumbscale';
    scaler.style.transform = `scale(${RV_THUMB_SCALE})`;
    /* A real clone of the page, shrunk — not a picture of it. */
    const clone = page.cloneNode(true);
    clone.removeAttribute('data-rpt-page');
    scaler.appendChild(clone);
    box.appendChild(scaler);
    btn.appendChild(box);
    const label = document.createElement('span');
    label.className = 'n';
    label.textContent = n;
    btn.appendChild(label);
    rail.appendChild(btn);
  });
}

function rvSetPage(n){
  if (n === RPT.page) return;
  RPT.page = n;
  document.getElementById('rptCurrent').textContent = n;
  document.querySelectorAll('#rptThumbs .rv-thumb').forEach(t => t.setAttribute('aria-current', String(Number(t.dataset.rvThumb) === n)));
}

function rvGoto(n){
  const page = document.querySelector(`#rptPages .rpt-page[data-rpt-page="${n}"]`);
  if (!page) return;
  rvSetPage(n);
  page.scrollIntoView({ behavior:'smooth', block:'start' });
}

/* The page chip follows the scroller: whichever sheet covers the top third of
   the stage is the one you are reading. */
function rvOnScroll(){
  const stage = document.getElementById('rptStage');
  const mark = stage.getBoundingClientRect().top + stage.clientHeight / 3;
  let n = 1;
  document.querySelectorAll('#rptPages .rpt-page').forEach(p => {
    if (p.getBoundingClientRect().top <= mark) n = Number(p.dataset.rptPage);
  });
  rvSetPage(n);
}

function rvApplyZoom(){
  document.getElementById('rptZoomLabel').textContent = RV_ZOOMS[RPT.zoom] + '%';
  document.getElementById('rptPages').style.transform = `scale(${RV_ZOOMS[RPT.zoom] / 100})`;
}
function rvZoom(dir){
  RPT.zoom = Math.max(0, Math.min(RV_ZOOMS.length - 1, RPT.zoom + dir));
  rvApplyZoom();
}
function rvToggleThumbs(){
  const rail = document.getElementById('rptThumbs');
  rail.hidden = !rail.hidden;
}

/* The print overlay opens on the pages you are looking at, so the document
   in the mock print dialog is the document on screen. */
function rvPrint(){
  if (!RPT.id) return;
  openPrintOverlay(RPT.id);
}

/* ---------- Analyze with Orion ----------
   The opening response is a generated result to act on — Copy, Add to
   Report — matching the Orion Report Analysis mock and the "Orion
   Analysis Prompts" brief: state the report's context (type, scope,
   timeframe) up front, then a bolded executive summary organized by the
   report's own Focus Areas (for a P&L: income and expense variances, NOI
   change, trend), each line naming the number and why it matters, closing
   with a short summary. q5 gets that written out by hand, matching the
   reference; anything else falls back to a plainer read of what the chat
   already knows about it. From there it is a conversation like the main
   assistant's — RPT_CHAT holds its own message list, separate from
   state.messages, and follow-ups reuse reportChatMsg() (a botMsg() with
   the interactive fields stripped, since those push onto the hidden main
   conversation instead of this one). */
let RPT_CHAT = { messages:[], thinking:null };
let rptChatTimer = null;
let lastRptMsgCount = 0;

function openReportChat(){
  if (!RPT.id) return;
  document.getElementById('rptOrionBtn').hidden = true;
  document.getElementById('rvOrionChat').hidden = false;
  if (RPT_CHAT.messages.length){ renderReportChatMessages(); return; }
  RPT_CHAT.thinking = 'Analyzing this report';
  renderReportChatMessages();
  const id = RPT.id;
  clearTimeout(rptChatTimer);
  rptChatTimer = setTimeout(() => {
    RPT_CHAT.thinking = null;
    RPT_CHAT.messages.push({ role:'bot', rich: buildAnalysisHtml(id) });
    renderReportChatMessages();
  }, 700 * ORION_PACE);
}

function closeReportChat(){
  document.getElementById('rvOrionChat').hidden = true;
  document.getElementById('rptOrionBtn').hidden = false;
}

/* A trimmed-down botMsg(): text/stats/table/steps/findings/bullets/note
   only — no actions, followups, tile, picker, or article. Those all push
   onto the main state.messages when clicked, which would silently write
   into the hidden main conversation instead of this one. */
function reportChatMsg(id){
  const p = PROMPTS[id];
  return { role:'bot', src:id, text:p.text, rich:p.rich, steps:p.steps, stats:p.stats,
    findings:p.findings, bullets:p.bullets, table:p.table, note:p.note };
}

function submitReportChat(){
  const el = document.getElementById('rvChatInput');
  const q = (el.value || '').trim();
  if (!q) return;
  el.value = '';
  RPT_CHAT.messages.push({ role:'user', text:q });
  const id = matchPrompt(q);
  RPT_CHAT.thinking = id && PROMPTS[id].cat === 0 ? 'Searching Express Help' : 'Reading your data';
  renderReportChatMessages();
  clearTimeout(rptChatTimer);
  rptChatTimer = setTimeout(() => {
    RPT_CHAT.thinking = null;
    RPT_CHAT.messages.push(id ? reportChatMsg(id)
      : { role:'bot', text:'I could not find a confident answer for that yet — try asking about a specific number or property from this report.' });
    renderReportChatMessages();
  }, 900 * ORION_PACE);
}

/* Renders every message, then splices the action row into each bot
   message's .content afterward (DOM, not string surgery) — renderMessage()
   already knows how to lay out a table/stats/bullets answer, this just
   adds Copy/Add to Report underneath whatever it produced. The very first
   message (the opening analysis) carries raw HTML (m.rich) instead of
   PROMPTS fields, so it renders through .rv-analysis directly. */
function renderReportChatMessages(){
  const wrap = document.getElementById('rvChatMessages');
  let html = RPT_CHAT.messages.map((m, i) => {
    if (m.role === 'user') return `<div class="msg-row" data-idx="${i}"><div class="msg-user">${esc(m.text)}</div></div>`;
    if (m.draftFull){
      return `<div class="msg-row"><div class="msg-bot"><div class="content">
        <div class="rv-analysis"><p>Here is the full analysis with that added in — edit it, then update:</p></div>
        <div class="rv-draft" id="draft-${i}">
          <div class="rv-analysis" contenteditable="true">${m.draftBody}</div>
        </div>
        <div class="rv-msg-actions">
          <button class="rv-add-btn" onclick="commitDraft(${i})"><span class="lbl">Update Analysis</span></button>
          <button class="ricon-btn" title="Discard this draft" style="margin-left:auto;" onclick="discardDraft(${i})">${'<svg class="rmx-icon"><use href="#close"></use></svg>'}</button>
        </div>
      </div></div></div>`;
    }
    if (m.rich) return `<div class="msg-row"><div class="msg-bot"><div class="content"><div class="rv-analysis">${m.rich}</div></div></div></div>`;
    return renderMessage(m, i, false);
  }).join('');
  if (RPT_CHAT.thinking){
    html += `<div class="thinking-row">${orionMark(24)}<span class="txt">${esc(RPT_CHAT.thinking)}</span><span class="thinking-dots"><span></span><span></span><span></span></span></div>`;
  }
  wrap.innerHTML = html + '<div class="scroll-spacer"></div>';
  wrap.querySelectorAll('.msg-row').forEach((row, i) => {
    const m = RPT_CHAT.messages[i];
    if (!m || m.role !== 'bot' || m.draftFull) return;
    const content = row.querySelector('.msg-bot .content');
    if (content) content.insertAdjacentHTML('beforeend', actionsRowHtml(i));
  });
  const body = document.getElementById('rvChatBody');
  /* This panel has no bot-only follow-up cards (see reportChatMsg's
     comment — actions/print/summarize never reach here), so the anchor is
     always just the last question asked, with no need for updateAnchor()'s
     extra bot-vs-bot handling. */
  let rptAnchorIdx = -1;
  for (let i = RPT_CHAT.messages.length - 1; i >= 0; i--){
    if (RPT_CHAT.messages[i].role === 'user'){ rptAnchorIdx = i; break; }
  }
  scrollAnchorIntoView(body, rptAnchorIdx, RPT_CHAT.messages.length !== lastRptMsgCount, 'top');
  lastRptMsgCount = RPT_CHAT.messages.length;
}

/* Icon-only and gray (title attr for the hover explanation) — Enhance,
   Edit and Download are left decorative (see raNotBuilt's callers, or
   rather the lack of them); Copy and Add to Report actually do something. */
/* Add to Report only ever targets the opening analysis (message 0) — a
   follow-up gets Add to Analysis instead, which folds it into that
   analysis rather than inserting a second, unrelated page. */
function actionsRowHtml(i){
  const ico = n => `<svg class="rmx-icon"><use href="${iconHref(n)}"></use></svg>`;
  const addControl = i === 0
    ? `<div class="rv-split">
        <button class="rv-add-btn" title="Choose where to add it" onclick="toggleAddMenu(${i}, event)"><span class="lbl">Add to Report</span>${ico('arrow_drop_down')}</button>
        <div class="rv-add-menu" id="addMenu-${i}" hidden>
          <button onclick="addToReport(${i}, 'first')">First Page</button>
          <button onclick="addToReport(${i}, 'last')">Last Page</button>
        </div>
      </div>`
    : `<button class="rv-add-btn" style="margin-left:auto;" onclick="addToAnalysis(${i})"><span class="lbl">Add to Analysis</span></button>`;
  return `<div class="rv-msg-actions">
    <div class="rv-enhance-wrap">
      <button class="ricon-btn" title="Enhance" onclick="toggleEnhanceMenu(${i}, event)">${ico('auto_awesome')}</button>
      <div class="rv-enhance-menu" id="enhanceMenu-${i}" hidden>
        <button onclick="pickEnhance(${i}, 'detailed', event)">${ico('format_list_bulleted')}Detailed</button>
        <button onclick="pickEnhance(${i}, 'concise', event)">${ico('remove')}Concise</button>
      </div>
    </div>
    <button class="ricon-btn" title="Edit">${ico('edit')}</button>
    <button class="ricon-btn" title="Copy" onclick="raCopy(${i})">${ico('content_copy')}</button>
    <button class="ricon-btn" title="Download">${ico('download')}</button>
    ${addControl}
  </div>`;
}

function stripHtml(html){
  const el = document.createElement('div');
  el.innerHTML = html;
  return el.innerText;
}

function raCopy(i){
  const m = RPT_CHAT.messages[i];
  const text = m.rich ? stripHtml(m.rich) : (m.text || '');
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).catch(() => {});
  rvToast('Copied to clipboard.', 'success');
}

function toggleAddMenu(i, ev){
  ev.stopPropagation();
  const menu = document.getElementById('addMenu-' + i);
  const wasHidden = menu.hidden;
  document.querySelectorAll('.rv-add-menu').forEach(m => { m.hidden = true; });
  menu.hidden = !wasHidden;
}
document.addEventListener('click', () => document.querySelectorAll('.rv-add-menu').forEach(m => { m.hidden = true; }));

function toggleEnhanceMenu(i, ev){
  ev.stopPropagation();
  const menu = document.getElementById('enhanceMenu-' + i);
  const wasHidden = menu.hidden;
  document.querySelectorAll('.rv-enhance-menu').forEach(m => { m.hidden = true; });
  menu.hidden = !wasHidden;
}
function pickEnhance(i, mode, ev){
  ev.stopPropagation();
  document.querySelectorAll('.rv-enhance-menu').forEach(m => { m.hidden = true; });
}
document.addEventListener('click', () => document.querySelectorAll('.rv-enhance-menu').forEach(m => { m.hidden = true; }));

/* Same content, report-styled (.rv-analysis-page, Segoe UI) instead of
   the panel's chat styling — a plain <p>/<ul> reconstruction for a
   follow-up answer that only has PROMPTS-style fields, not raw HTML. */
function messageReportHtml(m){
  if (m.rich) return m.rich;
  let html = `<p>${esc(m.text)}</p>`;
  const found = (m.findings || []).concat(m.bullets || []);
  if (m.stats && m.stats.length) html += `<ul>` + m.stats.map(s => `<li><strong>${esc(s[1])}:</strong> ${esc(s[0])}</li>`).join('') + `</ul>`;
  if (found.length) html += `<ul>` + found.map(f => `<li>${esc(f)}</li>`).join('') + `</ul>`;
  return html;
}

/* Shared by addToReport() and addToAnalysis()'s own refresh — inserts (or
   re-inserts) the given HTML as the report's summary page and redraws
   everything that shows the page list, without deciding what to tell the
   user afterward (each caller's toast says something different). */
function applySummaryToReport(pos, html){
  RPT.summaryPos = pos;
  RPT.summaryHtml = html;
  const pages = rptPages(RPT.id);
  RPT.count = pages.length;
  document.getElementById('rptPages').innerHTML = pages.join('');
  document.getElementById('rptTotal').textContent = pages.length;
  rvBuildThumbs();
  rvApplyZoom();
  rvGoto(pos === 'first' ? 1 : pages.length);
}

/* Not a default first page anymore (see rptPages()) — only added when the
   user chooses to, and only at the position they pick. Only the opening
   analysis (message 0) offers this; see addToAnalysis() for a follow-up. */
function addToReport(i, pos){
  document.querySelectorAll('.rv-add-menu').forEach(m => { m.hidden = true; });
  applySummaryToReport(pos, messageReportHtml(RPT_CHAT.messages[i]));
  rvToast('Added to the report as the ' + (pos === 'first' ? 'first' : 'last') + ' page.', 'success');
}

/* Title Case, never the question verbatim — "why is repairs and
   maintenance up" is not a heading. Minor words stay lowercase past the
   first position, matching the Register header convention elsewhere
   (DESIGN.md §7.2, "Title Case"). */
function toTitleCase(str){
  const minor = new Set(['a','an','the','of','in','on','to','for','and','or','is','are','with','at','by','from']);
  return str.split(' ').map((w,i) => {
    if (!w) return w;
    const lower = w.toLowerCase();
    if (i > 0 && minor.has(lower)) return lower;
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }).join(' ');
}

/* A follow-up doesn't get its own report page — it gets folded into the
   opening analysis instead. Rather than proposing just the new piece in
   isolation, this shows the FULL analysis with that section already
   appended (a short Title Case heading summarizing the topic — the
   prompt's own tileName/reportName when there is one, since those already
   read as headings, not the literal question), so there is one complete
   document to review and edit, not a fragment to imagine in context.
   Nothing changes until commitDraft() runs. */
function addToAnalysis(i){
  const m = RPT_CHAT.messages[i];
  const prev = RPT_CHAT.messages[i - 1];
  const question = prev && prev.role === 'user' ? prev.text : null;
  const p = m.src ? PROMPTS[m.src] : null;
  const title = (p && (p.tileName || p.reportName)) || toTitleCase(question || 'Additional Detail');
  const newSection = `<h4>${esc(title)}</h4>${messageReportHtml(m)}`;
  RPT_CHAT.messages.push({ role:'bot', draftFull:true, draftBody: RPT_CHAT.messages[0].rich + newSection });
  renderReportChatMessages();
}

function commitDraft(i){
  const container = document.getElementById('draft-' + i);
  RPT_CHAT.messages[0].rich = container.querySelector('.rv-analysis').innerHTML.trim();
  RPT_CHAT.messages.splice(i, 1);
  renderReportChatMessages();
  if (RPT.summaryPos){
    applySummaryToReport(RPT.summaryPos, RPT_CHAT.messages[0].rich);
    rvToast('Added to the analysis — the report has been updated to match.', 'success');
  } else {
    rvToast('Added to the analysis.', 'success');
  }
}

function discardDraft(i){
  RPT_CHAT.messages.splice(i, 1);
  renderReportChatMessages();
}

const PL_ANALYSIS_HTML = `
<p>The <strong>Profit &amp; Loss (Month to Date)</strong> for <strong>Aug 1–28, 2026</strong> compares this period against the same dates in <strong>2025</strong>, across all <strong>10 properties</strong>. Here is the <strong>executive summary</strong> of the key financial metrics:</p>
<h4>Income:</h4>
<ul>
  <li><strong>Total Income:</strong> <strong>$1,380,730</strong>, up <strong>6.4%</strong> from $1,297,090.
    <ul>
      <li><strong>Rental Property Income:</strong> the largest contributor, at <strong>$1,284,310</strong> (+6.4%), led by base rental income of $1,285,500, offset by $18,400 in vacancy loss and $9,580 in loss to lease.</li>
      <li><strong>Other Income:</strong> <strong>$96,420</strong> (+9.4%), led by Management Fee Income ($42,000) and Tenant Insurance Commission ($15,000).</li>
    </ul>
  </li>
</ul>
<h4>Expenses:</h4>
<ul>
  <li><strong>Total Expenses:</strong> <strong>$573,730</strong>, up <strong>10.4%</strong> from $519,660 — outpacing income growth.
    <ul>
      <li><strong>Repairs &amp; Maintenance:</strong> <strong>$214,880</strong> (+21.9%), the single largest driver, led by HVAC Repairs at $68,400 (+29.3%).</li>
      <li><strong>Turnover:</strong> <strong>$74,310</strong> (+26.1%), driven by Make-Ready Labor at $41,200 (+29.6%).</li>
      <li><strong>Payroll:</strong> $188,400 (+3.0%), tracking close to plan.</li>
      <li><strong>Utilities:</strong> $96,140 (-5.4%) — the only category that came down.</li>
    </ul>
  </li>
</ul>
<h4>Notable Observations:</h4>
<ul>
  <li><strong>Net Operating Income</strong> reached <strong>$807,000</strong>, up <strong>3.8%</strong> from $777,430 — income growth outpaced expenses, but only barely.</li>
  <li><strong>Repairs &amp; Maintenance and Turnover</strong> together account for roughly 92% of the expense increase, pointing to more unit turns and overdue maintenance catching up at once.</li>
  <li><strong>Utilities</strong> is the one category moving in the right direction, down 5.4% even as most other costs rose.</li>
</ul>
<p>In summary, income grew faster than expenses this period, but Repairs &amp; Maintenance and Turnover are rising quickly enough that NOI growth (3.8%) is lagging well behind income growth (6.4%). Worth a closer look at what is driving the HVAC and make-ready cost increases before next period.</p>`;

/* Demoes the "ask a follow-up" flow on the one report with a hand-written
   opening analysis (q5) — clicking the empty composer fills in the
   question the analysis itself flags as worth a closer look ("what's
   driving HVAC and make-ready cost increases") and answers it with the
   same GL-level figures buildProfitLossReport() renders on the sheet,
   not a generic PROMPTS match, so the numbers can't drift from the report. */
const PNL_FOLLOWUP_Q = "What's driving the increase in Repairs & Maintenance and Turnover?";
const PNL_FOLLOWUP_HTML = `
<p><strong>Repairs &amp; Maintenance</strong> and <strong>Turnover</strong> are the two fastest-growing expense categories this period — together they account for roughly 92% of the total expense increase.</p>
<h4>Repairs & Maintenance: $214,880 (+21.9%)</h4>
<ul>
  <li><strong>HVAC Repairs:</strong> $68,400 (+29.3% from $52,900) — the single largest driver.</li>
  <li><strong>Plumbing Repairs:</strong> $54,200 (+21.0% from $44,800).</li>
  <li><strong>Electrical Repairs:</strong> $31,900 (+19.5% from $26,700).</li>
  <li><strong>General Repairs &amp; Supplies:</strong> $60,380 (+16.5% from $51,820).</li>
</ul>
<h4>Turnover: $74,310 (+26.1%)</h4>
<ul>
  <li><strong>Make-Ready Labor:</strong> $41,200 (+29.6% from $31,800) — the largest contributor.</li>
  <li><strong>Flooring &amp; Paint:</strong> $24,900 (+27.0% from $19,600).</li>
  <li><strong>Cleaning:</strong> $8,210 (+8.9% from $7,540).</li>
</ul>
<p>The pattern points to more unit turns this period combined with overdue HVAC repairs catching up at once — both worth a closer look before next period.</p>`;

let pnlFollowUpUsed = false;
/* Bumped every time a report (re)opens, so a typing animation left running
   from a report the user has since navigated away from (or reopened)
   can't keep going in the background and land on the wrong conversation —
   each recursive step below checks it still owns the current token before
   touching the input or RPT_CHAT. */
let pnlTypeToken = 0;
/* Typed one character at a time at a slightly uneven pace, like a real
   keystroke cadence, rather than dropped in all at once — the click just
   starts it; el stays focused with a real blinking caret throughout. */
function pnlAutoFollowUp(){
  if (RPT.id !== 'q5' || pnlFollowUpUsed || RPT_CHAT.thinking) return;
  const el = document.getElementById('rvChatInput');
  if ((el.value || '').trim()) return;
  pnlFollowUpUsed = true;
  const token = ++pnlTypeToken;
  el.focus();
  let i = 0;
  const typeNext = () => {
    if (token !== pnlTypeToken) return;
    i++;
    el.value = PNL_FOLLOWUP_Q.slice(0, i);
    if (i < PNL_FOLLOWUP_Q.length){
      setTimeout(typeNext, 18 + Math.random() * 34);
      return;
    }
    setTimeout(() => {
      if (token !== pnlTypeToken) return;
      el.value = '';
      RPT_CHAT.messages.push({ role:'user', text: PNL_FOLLOWUP_Q });
      RPT_CHAT.thinking = 'Reading your data';
      renderReportChatMessages();
      clearTimeout(rptChatTimer);
      rptChatTimer = setTimeout(() => {
        if (token !== pnlTypeToken) return;
        RPT_CHAT.thinking = null;
        RPT_CHAT.messages.push({ role:'bot', rich: PNL_FOLLOWUP_HTML });
        renderReportChatMessages();
      }, 900 * ORION_PACE);
    }, 400 * ORION_PACE);
  };
  typeNext();
}

function buildAnalysisHtml(id){
  if (id === 'q5') return PL_ANALYSIS_HTML;
  const p = PROMPTS[id];
  let html = `<p>${esc(p.text)}</p>`;
  if (p.stats && p.stats.length){
    html += `<ul>` + p.stats.map(s => `<li><strong>${esc(s[1])}:</strong> ${esc(s[0])}</li>`).join('') + `</ul>`;
  }
  const found = (p.findings || []).concat(p.bullets || []);
  if (found.length){
    html += `<h4>Notable Observations:</h4><ul>` + found.map(f => `<li>${esc(f)}</li>`).join('') + `</ul>`;
  }
  if (p.summary) html += `<p>${esc(p.summary)}</p>`;
  return html;
}

/* DESIGN.md §7.4: success is #6EB744, everything else (help/info) is navy
   — kind defaults to 'info' so every existing one-argument call (Rerun,
   Help, Download, More actions — all "not built" notices) keeps reading
   as informational rather than turning green. */
let rvToastTimer = null;
function rvToast(msg, kind){
  kind = kind === 'success' ? 'success' : 'info';
  let el = document.getElementById('rvToast');
  if (!el){
    el = document.createElement('div');
    el.id = 'rvToast';
    document.body.appendChild(el);
  }
  el.className = 'rv-toast ' + kind;
  const icon = kind === 'success' ? 'check_circle' : 'info';
  el.innerHTML = `<svg class="rmx-icon rmx-icon--24"><use href="${iconHref(icon)}"></use></svg><span class="msg">${esc(msg)}</span>`;
  el.hidden = false;
  clearTimeout(rvToastTimer);
  rvToastTimer = setTimeout(() => { el.hidden = true; }, 4200);
}



/* ---- boot ----
   The panel mounts itself (orion.js). This screen only has to render the
   report named in the query string, and wire the two scroll listeners. */
(function () {
  const id = new URLSearchParams(location.search).get('r') || 'q1';
  renderReport_view(RPT_META_DEFAULT_OK(id) ? id : 'q1');
  const stage = document.getElementById('rptStage');
  if (stage) stage.addEventListener('scroll', rvOnScroll);
  const po = document.getElementById('poScroll');
  if (po) po.addEventListener('scroll', poOnScroll);
})();

function RPT_META_DEFAULT_OK(id) { try { return !!rptMeta(id); } catch (e) { return false; } }
