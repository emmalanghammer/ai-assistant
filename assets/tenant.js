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
  const get = label => {
    const f = (r.fields || []).find(x => (x.label ?? x[0]) === label);
    return f ? (f.value ?? f[1]) : '';
  };

  /* The page title is the register this record belongs to, not the record —
     Context Bar, node 10861:12222, carries one Title Text item. The record's
     own name is the Scoreboard's job. */
  document.title = r.name + ' — Rent Manager Express';
  document.getElementById('tdName').textContent = r.name;

  /* Scoreboard Header, node 11560:8512. Identity row at 40px gaps: name,
     italic account number, status Lozenge at h32. Meta row at 32px gaps:
     four Icon Items — property, unit, email, phone. */
  document.getElementById('tdAccount').textContent = 'Account #: ' + (r.account || '—');

  const item = (icon, text) => text
    ? `<span class="sb-item"><svg class="rmx-icon"><use href="#${icon}"></use></svg>${esc(text)}</span>` : '';
  document.getElementById('tdMeta').innerHTML =
      item('properties', parts[0])
    + item('units', parts[1])
    + item('mail', get('Email'))
    + item('call', get('Phone'));

  /* Trailing figures column: Balance Items, right-aligned, label then value. */
  const balance = (label, value) =>
    `<span class="sb-balance"><span class="l">${esc(label)}</span><span class="v">${esc(value)}</span></span>`;
  document.getElementById('tdFigures').innerHTML =
      balance('Balance Due:', '$' + (r.balance || '0.00'))
    + balance('Security Deposit:', '$' + (r.deposit || '0.00'));

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
