/* RMX prototype behaviour layer — the same file in every prototype.

   Screens stay declarative: you write markup with data- attributes, this
   wires the behaviour. Nothing here is app logic, and nothing here invents
   a visual. Every class it touches is already defined in rmx.css.

   Why it exists: without it, each designer hand-writes a different toggle
   in each screen and the prototypes stop behaving alike. It is also the
   part a developer can throw away cleanly — the markup is the deliverable,
   this is the fake wiring around it.

   Never use alert(), confirm() or prompt() in a prototype. Use RMX.toast().
*/
(function () {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- tabs ----------
     <div class="rmx-tabrow" data-rmx-tabs>
       <button class="rmx-tab" aria-selected="true" data-panel="summary">Summary</button>
     </div>
     <section data-tab-panel="summary">…</section>                       */
  function tabs() {
    $$('[data-rmx-tabs]').forEach(row => {
      row.addEventListener('click', e => {
        const tab = e.target.closest('.rmx-tab[data-panel]');
        if (!tab || !row.contains(tab)) return;
        $$('.rmx-tab', row).forEach(t => t.setAttribute('aria-selected', String(t === tab)));
        const scope = row.closest('[data-rmx-tabscope]') || document;
        $$('[data-tab-panel]', scope).forEach(p => {
          p.hidden = p.dataset.tabPanel !== tab.dataset.panel;
        });
      });
    });
  }

  /* ---------- dropdowns ----------
     Never a native <select> — that is an audit error. Instead:
     <div data-rmx-dropdown>
       <button class="rmx-field__box" data-rmx-trigger>Status<svg …></button>
       <div class="rmx-menu" data-rmx-menu hidden>
         <button data-value="active">Active</button>
       </div>
     </div>
     Choosing an option writes its text into [data-rmx-value] (or the
     trigger itself) and fires an `rmx:select` event on the wrapper.       */
  function dropdowns() {
    $$('[data-rmx-dropdown]').forEach(dd => {
      const trigger = $('[data-rmx-trigger]', dd) || dd.firstElementChild;
      const menu    = $('[data-rmx-menu]', dd);
      if (!trigger || !menu) return;

      trigger.addEventListener('click', e => {
        e.stopPropagation();
        const open = !menu.hidden;
        closeAllMenus();
        menu.hidden = open;
        dd.dataset.open = String(!open);
      });

      menu.addEventListener('click', e => {
        const opt = e.target.closest('[data-value]');
        if (!opt) return;
        const label = $('[data-rmx-value]', dd) || trigger;
        const slot = $('[data-rmx-value]', label) || label;
        if (slot.firstChild && slot.firstChild.nodeType === 3) slot.firstChild.nodeValue = opt.textContent.trim();
        else slot.textContent = opt.textContent.trim();
        slot.classList.remove('rmx-placeholder');
        $$('[data-value]', menu).forEach(o => o.setAttribute('aria-selected', String(o === opt)));
        menu.hidden = true;
        dd.dataset.open = 'false';
        dd.dispatchEvent(new CustomEvent('rmx:select', {
          bubbles: true, detail: { value: opt.dataset.value, label: opt.textContent.trim() }
        }));
      });
    });
  }

  function closeAllMenus() {
    $$('[data-rmx-menu]').forEach(m => { m.hidden = true; });
    $$('[data-rmx-dropdown]').forEach(d => { d.dataset.open = 'false'; });
  }

  /* ---------- overlays and panels ----------
     <button data-rmx-open="add-charge">Add charge</button>
     <div class="rmx-overlay" id="add-charge" hidden>… <button data-rmx-close>  */
  function overlays() {
    document.addEventListener('click', e => {
      const opener = e.target.closest('[data-rmx-open]');
      if (opener) {
        e.preventDefault();
        openOverlay(opener.dataset.rmxOpen);
        return;
      }
      if (e.target.closest('[data-rmx-close]')) {
        e.preventDefault();
        closeOverlay(e.target.closest('.rmx-overlay, [data-rmx-panel]'));
      }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeAllMenus(); closeOverlay(); }
    });
  }

  function scrim() {
    let s = $('.rmx-scrim');
    if (!s) {
      s = document.createElement('div');
      s.className = 'rmx-scrim';
      s.hidden = true;
      s.addEventListener('click', () => closeOverlay());
      document.body.appendChild(s);
    }
    return s;
  }

  function openOverlay(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.hidden = false;
    el.classList.add('is-open');
    scrim().hidden = false;
    const f = $('input, button, [tabindex]', el);
    if (f) f.focus();
  }

  function closeOverlay(el) {
    const targets = el ? [el] : $$('.rmx-overlay.is-open, [data-rmx-panel].is-open');
    targets.forEach(t => { t.classList.remove('is-open'); t.hidden = true; });
    if (!$('.rmx-overlay.is-open, [data-rmx-panel].is-open')) scrim().hidden = true;
  }

  /* ---------- checkboxes, radios, register select-all ----------
     RMX draws its own; a native one is an audit error. A checked box is
     orange (--icon-attention) except the select-all above a register,
     which is blue — that is the rmx-check--register modifier, not a
     colour you set here.                                                  */
  function choices() {
    document.addEventListener('click', e => {
      const check = e.target.closest('.rmx-check');
      if (check && !check.hasAttribute('data-static')) {
        const on = check.dataset.checked !== 'true';
        check.dataset.checked = String(on);
        const all = check.closest('[data-rmx-selectall]');
        if (all) {
          const table = document.getElementById(all.dataset.rmxSelectall) || all.closest('.rmx-tile, section');
          if (table) $$('.rmx-check', table).forEach(c => { if (c !== check) c.dataset.checked = String(on); });
        }
        check.dispatchEvent(new CustomEvent('rmx:change', { bubbles: true, detail: { checked: on } }));
        return;
      }
      const radio = e.target.closest('.rmx-radio');
      if (radio && !radio.hasAttribute('data-static')) {
        const group = radio.closest('[data-rmx-radiogroup]') || document;
        $$('.rmx-radio', group).forEach(r => { r.dataset.checked = String(r === radio); });
      }
    });
  }

  /* ---------- register sort ----------
     <th data-sort="text|number|date">Tenant</th>                          */
  function sorting() {
    $$('.rmx-register').forEach(table => {
      const head = $('thead', table);
      if (!head) return;
      head.addEventListener('click', e => {
        const th = e.target.closest('th[data-sort]');
        if (!th) return;
        const body = $('tbody', table);
        if (!body) return;
        const idx = Array.from(th.parentNode.children).indexOf(th);
        const dir = th.dataset.dir === 'asc' ? 'desc' : 'asc';
        $$('th[data-sort]', head).forEach(h => delete h.dataset.dir);
        th.dataset.dir = dir;
        const val = tr => {
          const raw = (tr.children[idx]?.textContent || '').trim();
          if (th.dataset.sort === 'number') return parseFloat(raw.replace(/[^0-9.\-]/g, '')) || 0;
          if (th.dataset.sort === 'date') return new Date(raw).getTime() || 0;
          return raw.toLowerCase();
        };
        Array.from(body.rows)
          .sort((a, b) => (val(a) > val(b) ? 1 : val(a) < val(b) ? -1 : 0) * (dir === 'asc' ? 1 : -1))
          .forEach(r => body.appendChild(r));
        restripe(body);
      });
    });
  }

  /* Striping is OPT-IN and always was in the design system — a register is
     not striped unless the design says so. Earlier this ran on every register
     automatically, which put zebra stripes on screens nobody asked for.
     Opt in per table with <table class="rmx-register" data-rmx-striped>. */
  function restripe(body) {
    const table = body.closest('.rmx-register');
    if (!table || !table.hasAttribute('data-rmx-striped')) return;
    let i = 0;
    for (const r of body.rows) { if (!r.hidden) { r.dataset.striped = String(i % 2 === 1); i++; } }
  }

  /* ---------- filtering ----------
     <input data-rmx-filter="#charges"> filters rows of that table/list.
     Also updates any [data-rmx-count="#charges"] with the visible count.  */
  function filtering() {
    $$('[data-rmx-filter]').forEach(input => {
      input.addEventListener('input', () => {
        const target = $(input.dataset.rmxFilter);
        if (!target) return;
        const q = input.value.trim().toLowerCase();
        const rows = $$('tbody tr, [data-rmx-row]', target);
        let shown = 0;
        rows.forEach(r => {
          const hit = !q || r.textContent.toLowerCase().includes(q);
          r.hidden = !hit;
          if (hit) shown++;
        });
        const body = $('tbody', target);
        if (body) restripe(body);
        $$(`[data-rmx-count="${input.dataset.rmxFilter}"]`).forEach(c => { c.textContent = shown; });
        const empty = $('[data-rmx-empty]', target) || document.querySelector(`[data-rmx-empty="${input.dataset.rmxFilter}"]`);
        if (empty) empty.hidden = shown !== 0;
      });
    });
  }

  /* ---------- toasts ----------
     RMX.toast('Charge added', 'success')  — success | failure | neutral    */
  function toast(message, kind = 'neutral', ms = 3200) {
    let stack = $('.rmx-toaststack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'rmx-toaststack';
      document.body.appendChild(stack);
    }
    const el = document.createElement('div');
    el.className = 'rmx-toast' + (kind === 'neutral' ? '' : ` rmx-toast--${kind}`);
    el.setAttribute('role', 'status');
    el.textContent = message;
    stack.appendChild(el);
    setTimeout(() => { el.remove(); }, ms);
    return el;
  }

  /* ---------- unwired affordances ----------
     Anything marked data-rmx-todo says so instead of doing nothing
     silently — a stakeholder clicking a dead button assumes it is broken. */
  function todos() {
    document.addEventListener('click', e => {
      const el = e.target.closest('[data-rmx-todo]');
      if (!el) return;
      e.preventDefault();
      toast(el.dataset.rmxTodo || 'Not built in this prototype', 'neutral');
    });
  }

  /* ---------- icons ----------
     Screens reference the shared symbol sheet: <svg class="rmx-icon">
     <use href="../assets/icons.svg#chevron-down"></use></svg>
     bundle.mjs rewrites those into inlined symbols when publishing, so the
     same markup works in a repo and in a published page.                  */

  document.addEventListener('click', e => {
    if (!e.target.closest('[data-rmx-dropdown]')) closeAllMenus();
  });

  function init(root) {
    tabs(); dropdowns(); overlays(); choices(); sorting(); filtering(); todos();
    $$('.rmx-register[data-rmx-striped] tbody').forEach(restripe);
  }

  window.RMX = { init, toast, openOverlay, closeOverlay, restripe };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init());
  else init();
})();
