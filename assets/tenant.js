/* ============================================================
   Tenant detail — populate from the record id in the query string
   ------------------------------------------------------------
   Reached from a record card in an Orion conversation. In the single-file
   version this swapped a hidden <div>; it is its own screen now, so the
   record is named in ?t= and read here on load. TENANT_RECORDS comes from
   orion.js, which is the prototype's one copy of that data — the same
   tenant owes the same balance wherever they appear.
   ============================================================ */
(function () {
  const id = new URLSearchParams(location.search).get('t');
  const r = (typeof TENANT_RECORDS !== 'undefined') && TENANT_RECORDS[id];

  if (!r) {
    /* A link with no record behind it should say so, not render an empty
       shell that reads as a data bug. */
    document.getElementById('tdName').textContent = 'Record not found';
    document.getElementById('tdMeta').innerHTML =
      '<span class="item">Open a tenant from a record card in an Orion conversation.</span>';
    return;
  }

  const esc = s => (s == null ? '' : String(s)).replace(/[&<>]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;' }[c]));
  const parts = r.meta.split(' · ');

  document.getElementById('tdTitle').textContent = r.name;
  document.getElementById('tdName').textContent = r.name;
  document.title = r.name + ' — Rent Manager Express';

  document.getElementById('tdMeta').innerHTML =
    `<span class="item"><svg class="rmx-icon"><use href="#rental-info"></use></svg>${esc(parts[0])}</span>` +
    `<span class="item"><svg class="rmx-icon"><use href="#occupancy"></use></svg>${esc(parts[1] || '')}</span>`;

  const field = f => `<div class="rmx-ro"><span class="rmx-ro__label">${esc(f.label ?? f[0])}</span>` +
                     `<span class="rmx-ro__value">${esc(f.value ?? f[1])}</span></div>`;
  const col = fields => `<div class="rmx-fieldgrid__col">${fields.map(field).join('')}</div>`;

  document.getElementById('tdFields').innerHTML = col(r.fields.slice(0, 3)) + col(r.fields.slice(3));

  document.getElementById('tdVehicle').innerHTML =
    `<div class="rmx-fieldgrid">` +
      col([{ label: r.vehicle.label, value: r.vehicle.value }, { label: 'Detail', value: r.vehicle.meta }]) +
      (r.second
        ? col([{ label: 'Second Vehicle', value: r.second.replace('Second vehicle on file: ', '') }])
        : '') +
    `</div>`;
})();
