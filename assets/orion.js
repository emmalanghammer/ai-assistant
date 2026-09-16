/* ============================================================
   Orion Assistant — the panel, its data, and its behaviour
   ------------------------------------------------------------
   Injected into every screen rather than written into each one, so the
   assistant is the same on My Workspace, the Leasing Dashboard and the
   report viewer — and so a conversation survives navigating between them
   (see saveConversation/restoreConversation at the foot of this file).

   The panel is Orion's own surface. RMX Components ships Orion Action Bar,
   Chat Bubble, Tag and Overlay, but not an assembled assistant panel, so
   its markup is prototype-specific and lives in proto.css. Everything it
   renders INTO the page — buttons, lozenges, registers, field grids — is a
   real RMX component and is tagged as one.

   Data, rendering and interaction below are ported from the Orion Assistant
   Claude Design canvas (orion-design-export/Orion Assistant Panel.dc.html).
   ============================================================ */

const ORION_PRINT_OVERLAY_HTML = `<div id="printOverlay" hidden>
  <div class="po-backdrop" onclick="closePrintOverlay()"></div>
  <div class="po-dialog">
    <div class="po-preview">
      <div class="po-pagebadge" id="poPageBadge">1</div>
      <div class="po-scroll" id="poScroll">
        <div class="po-pages" id="poPages"></div>
      </div>
    </div>
    <div class="po-settings">
      <div class="po-head"><span class="po-title">Print</span><span class="po-count" id="poCount">1 page</span></div>

      <div class="po-field">
        <div class="po-label">Destination</div>
        <div class="po-select"><svg class="rmx-icon"><use href="#description"></use></svg><span class="po-val">Save as PDF</span><svg class="rmx-icon po-chev"><use href="#keyboard-arrow-down"></use></svg></div>
      </div>
      <div class="po-field">
        <div class="po-label">Pages</div>
        <div class="po-select"><span class="po-val">All</span><svg class="rmx-icon po-chev"><use href="#keyboard-arrow-down"></use></svg></div>
      </div>
      <div class="po-field">
        <div class="po-label">Layout</div>
        <div class="po-select"><span class="po-val">Portrait</span><svg class="rmx-icon po-chev"><use href="#keyboard-arrow-down"></use></svg></div>
      </div>

      <div class="po-more" id="poMoreRow" onclick="poToggleMore()"><span>More settings</span><svg class="rmx-icon" id="poMoreChev"><use href="#keyboard-arrow-down"></use></svg></div>
      <div class="po-more-fields" id="poMoreFields" hidden>
        <div class="po-field"><div class="po-label">Copies</div><div class="po-select"><span class="po-val">1</span></div></div>
        <div class="po-field"><div class="po-label">Margins</div><div class="po-select"><span class="po-val">Default</span><svg class="rmx-icon po-chev"><use href="#keyboard-arrow-down"></use></svg></div></div>
        <div class="po-field"><div class="po-label">Scale</div><div class="po-select"><span class="po-val">100</span></div></div>
      </div>

      <div class="po-actions">
        <button class="po-btn po-cancel" onclick="closePrintOverlay()">Cancel</button>
        <button class="po-btn po-save" onclick="poSave()">Save</button>
      </div>
    </div>
  </div>
</div>`;

const ORION_PANEL_HTML = `<div class="orion-panel" id="orionPanel" hidden>
  <div class="orion-resize-w" onmousedown="startResize(event,'w')" title="Drag to resize width"></div>
  <div class="orion-resize-e" onmousedown="startResize(event,'e')" title="Drag to resize width"></div>
  <div class="orion-resize-h" onmousedown="startResize(event,'h')" title="Drag to resize height"></div>
  <div class="orion-resize-corner" onmousedown="startResize(event,'wh')" title="Drag to resize"></div>
  <div class="orion-inner">
    <div class="orion-head" onmousedown="startMove(event)">
      <div class="row">
        <div class="left"><svg class="rmx-icon avatar-logo"><use href="#orion"></use></svg><span class="name" id="orionHeadTitle">Orion Assistant</span></div>
        <div class="icons">
          <svg class="rmx-icon" title="New chat" onclick="newChat()"><use href="#edit-square"></use></svg>
          <div class="vdiv" id="historyDivider"></div>
          <svg class="rmx-icon" id="historyIconBtn" title="History" onclick="toggleHistory()"><use href="#history"></use></svg>
          <div class="vdiv"></div>
          <svg class="rmx-icon" title="Close" onclick="closeOrion()"><use href="#close"></use></svg>
        </div>
      </div>
      <hr>
    </div>

    <div class="history-view" id="historyView" hidden>
      <div class="history-search-wrap">
        <div class="history-search"><svg class="rmx-icon"><use href="#search"></use></svg><input id="historySearchInput" placeholder="Find a chat" oninput="renderHistoryFull()"></div>
      </div>
      <div id="historyFavSection"></div>
      <div id="historyAllSection"></div>
    </div>

    <div class="orion-body" id="orionBody">
      <div class="orion-greet" id="orionGreet">
        <p class="hi">Hi Charlie!</p>
        <div class="home-card">
          <p class="home-prompt">How can I help?</p>
          <div class="home-ask">
            <textarea id="homeInput" rows="1" placeholder="Ask a question..." onclick="demoComposerAutoFill('homeInput')" oninput="growAsk(this)" onkeydown="askKey(event, submitHome)"></textarea>
            <svg class="rmx-icon send" onclick="submitHome()"><use href="#send"></use></svg>
          </div>
          <button class="browse-link" onclick="toggleSheet()"><svg class="rmx-icon"><use href="#lightbulb"></use></svg><span class="lbl">Browse Prompt Suggestions</span></button>
        </div>
      </div>
      <div id="messagesWrap"></div>
    </div>

    <div class="orion-sheet" id="orionSheet" hidden>
      <div class="sh"><span class="t">Prompt Suggestions</span><svg class="rmx-icon" onclick="closeSheet()"><use href="#close"></use></svg></div>
      <div class="cat-pills" id="catPills"></div>
      <div class="prompt-list" id="promptList"></div>
    </div>

    <div class="orion-composer" id="orionComposer" hidden>
      <div><button class="browse-btn" id="browseBtn" onclick="toggleSheet()"><svg class="rmx-icon" style="width:18px;height:18px"><use href="#lightbulb"></use></svg>Prompt Suggestions</button></div>
      <div class="orion-ask">
        <textarea id="draftInput" rows="1" placeholder="Ask anything..." onclick="demoComposerAutoFill('draftInput')" oninput="growAsk(this)" onkeydown="askKey(event, submitDraft)"></textarea>
        <svg class="rmx-icon send" onclick="submitDraft()"><use href="#send"></use></svg>
      </div>
      <div class="orion-disclaimer">AI may be inaccurate. Make sure to verify information before use.</div>
    </div>

    <div class="orion-footer" id="orionFooter">
      <span>Need more help? View all documentation at <a href="#">Express Help</a></span>
      <button class="rmx-btn rmx-btn--secondary rmx-btn--compact" data-rmx-component="Button">Contact Support</button>
    </div>
  </div>
</div>`;


/* ---------- the ask field ----------
   Orion_Input Fields (Figma 2983:17176) is a horizontal auto-layout box whose
   children align to the BOTTOM of the cross axis — which is what keeps the
   send arrow on the last line as the text wraps. In CSS that is
   align-items: flex-end; here we only have to grow the field itself.

   A <textarea> has no intrinsic "fit content" height, so it is reset to one
   row and then set to its own scrollHeight. Capped, after which it scrolls,
   because the panel is only so tall. */
const ASK_MAX_H = 132;   /* ~6 lines before it starts scrolling */

/* Width the panel opens at. It normally lines up with the app bar's icon
   cluster, but that comes out around 380 — narrow enough that the footer's
   "Need more help? View all documentation at Express Help" wraps to two
   lines. 528 is the smallest 4px-grid width that keeps it on one line:
   355 of text + 12 gap + 120 button + 36 padding + 2 border. Dragging the
   panel narrower than this is still allowed; this is only the starting size. */
const ORION_OPEN_MIN_W = 528;

function growAsk(el) {
  if (!el) return;
  el.style.height = 'auto';
  const h = Math.min(el.scrollHeight, ASK_MAX_H);
  el.style.height = h + 'px';
  el.style.overflowY = el.scrollHeight > ASK_MAX_H ? 'auto' : 'hidden';
}

/* Enter sends, Shift+Enter starts a new line — the convention for every chat
   input, and the reason this is a textarea rather than an input. */
function askKey(e, submit) {
  if (e.key !== 'Enter' || e.shiftKey) return;
  e.preventDefault();
  submit();
}

/* Reset to a single row after sending, or the empty field keeps the height of
   whatever was just sent. */
function resetAsk(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.height = 'auto';
  el.style.overflowY = 'hidden';
}


/* While the assistant is open the page behind it does not scroll — only the
   conversation does. The scrim already stops clicks reaching the page; this
   stops the wheel, which otherwise scrolls the workspace out from under the
   panel and makes the dim look broken.

   Keeping the scrollbar's width as padding avoids the page jumping sideways
   as it locks, which is the usual giveaway of a crude overflow:hidden. */
function lockPageScroll(on) {
  const b = document.body, h = document.documentElement;
  if (on) {
    if (b.dataset.scrollLocked) return;
    const gap = window.innerWidth - h.clientWidth;
    b.dataset.scrollLocked = '1';
    b.dataset.prevPaddingRight = b.style.paddingRight || '';
    /* Both, not just body: the page scrolls on the ROOT element, so locking
       body alone leaves the wheel working — which is what happened first. */
    h.style.overflow = 'hidden';
    b.style.overflow = 'hidden';
    if (gap > 0) b.style.paddingRight = gap + 'px';
  } else {
    if (!b.dataset.scrollLocked) return;
    h.style.overflow = '';
    b.style.overflow = '';
    b.style.paddingRight = b.dataset.prevPaddingRight || '';
    delete b.dataset.scrollLocked;
    delete b.dataset.prevPaddingRight;
  }
}

function mountOrionPanel() {
  if (document.getElementById('orionPanel')) return;
  const host = document.createElement('div');
  host.innerHTML = '<div class="orion-scrim" id="orionScrim" hidden onclick="closeOrion()"></div>'
                 + ORION_PANEL_HTML + ORION_PRINT_OVERLAY_HTML;
  while (host.firstChild) document.body.appendChild(host.firstChild);
}
mountOrionPanel();

/* The Orion mark at an arbitrary size. Replaces the old logoSvg(), which
   inlined the whole five-path mark on every call — the geometry now lives
   once, as #orion in assets/icons-local.svg. */
function orionMark(px) {
  return '<svg class="rmx-icon" style="width:' + px + 'px;height:' + px + 'px"><use href="#orion"></use></svg>';
}

/* Repoint an existing <svg class="rmx-icon"><use> at a different symbol. */
function setIconGlyph(id, symbol) {
  const use = document.querySelector('#' + id + ' use');
  if (use) use.setAttribute('href', '#' + symbol);
}


/* ============================================================
   Data — ported from the Orion Assistant Claude Design canvas
   ============================================================ */
const GREEN='green', RED='red', ORANGE='orange', GRAY='gray';

const HELP_PROMPTS = {
  h1: { cat:0, icon:'trending_up', label:'How do I raise rents?',
    kw:'raise rent increase rents renewal increases market rent recurring charges batch',
    rich:`
      <p>To raise rents in Rent Manager, you can use the <strong>Set Renewal Rent Increase</strong> feature to adjust rent charges for tenants whose leases are expiring. Here's how:</p>
      <ol>
        <li><strong>Navigate to the Renewal Increases page:</strong> Go to Rental Info → Leasing → Renewal Increases.</li>
        <li><strong>Set your filters:</strong> Select the properties you want to work with, then specify the lease expiration date range (from six months in the past to eleven months in the future) to identify which tenants need rent increases.</li>
        <li><strong>Click Set Rent Increases:</strong> This opens a dialog where you can configure how to increase the rent.</li>
        <li><strong>Choose your increase method:</strong> Select one of these options:
          <ul>
            <li><strong>Increase By:</strong> Raise rent by a specific dollar amount or percentage.</li>
            <li><strong>New Amount:</strong> Set a flat dollar amount for the new rent.</li>
            <li><strong>Use Market Rent:</strong> Match the current market rent value for the unit.</li>
            <li><strong>Calculation:</strong> Use a scripted formula to calculate the new rent (requires scripting knowledge).</li>
            <li><strong>No Increase:</strong> Keep rent the same.</li>
          </ul>
        </li>
        <li><strong>Select the rent charge type:</strong> Choose which recurring charge to increase from the dropdown.</li>
        <li><strong>Apply optional rounding:</strong> If desired, round the new rent amount down, up, or to the nearest interval (in dollars or cents).</li>
        <li><strong>Add a comment:</strong> Optionally enter a note explaining the increase.</li>
        <li><strong>Review and save:</strong> The system displays the affected tenants and their new rent amounts. Confirm and save your changes.</li>
      </ol>
      <p><strong>Note:</strong> You need the "Set Renewal Rent Increases" privilege to perform this task. If you don't see this option, contact your administrator.</p>
      <p>You can also modify market rent values directly using the Modify Market Rent tool if you want to update the baseline market rent for units before setting renewal increases.</p>` },
  h2: { cat:0, icon:'assignment_turned_in', label:'How do I send renewal offers?',
    kw:'renewal offers renew lease expiration create term rent increase renewal board resend blue moon twa',
    rich:`
      <p>To send renewal offers in Rent Manager, you have two main workflows depending on your system configuration:</p>
      <h4>Creating New Renewal Offers</h4>
      <ol>
        <li><strong>Go to the Create Renewal Offers page:</strong> Navigate to Rental Info → Leasing → Create Renewal Offers.</li>
        <li><strong>Select tenants:</strong> Filter tenants by property, lease expiration date range, lease term, unit type, or user-defined fields. Select the tenants you want to offer renewals to.</li>
        <li><strong>Choose lease term options:</strong> Select whether tenants can renew at their current term, choose a new term, or select from multiple term options.</li>
        <li><strong>Modify charges (optional):</strong> Adjust any additional recurring charges or add one-time charges associated with the renewal.</li>
        <li><strong>Review and send:</strong> Review the renewal offers and click Send to deliver them to tenants.</li>
      </ol>
      <h4>Resending Existing Renewal Offers</h4>
      <p>If you've already sent renewal offers and need to resend them:</p>
      <ul>
        <li><strong>Individual resend:</strong> Go to Rental Info → Leasing → Lease Renewal Board. On the tenant's card, click Resend Offer in the Sent Offer column. You can optionally change the expiration date and select signers before sending.</li>
        <li><strong>Bulk resend:</strong> On the Lease Renewal Board, click Resend Offer in the Sent Offer column heading. Update the expiration date if needed, select signers, and send to all tenants at once.</li>
      </ul>
      <h4>Important Notes</h4>
      <p>Renewal offers can only be sent to residential leases—commercial leases do not generate renewal offers. Renewal offers can be resent only if the status is "Offer Sent" and the delivery method is a Blue Moon lease or a signable document published to Tenant Web Access (TWA). Tenants without valid email addresses are excluded from bulk resend actions.</p>
      <p>If your system requires approval of renewal rent increases before sending offers, you must approve rent increases first before creating renewal offers. For more details on that workflow, refer to the Create Renewal Offers with Rent Increase Approval process.</p>` },
  h3: { cat:0, icon:'payments', label:'How do I pay bills?',
    kw:'pay bills payable payables vendor check ach vendorpay avidxchange zego epay paydirect',
    rich:`
      <p>In Rent Manager, you can pay bills to vendors and owners through the Pay Bills page. Here's how to get started:</p>
      <ol>
        <li><strong>Access the Pay Bills page:</strong> Go to Payables → Bills → Pay Bills.</li>
        <li><strong>Filter bills (optional):</strong> Use the filters on the left to narrow down which bills display. You can filter by property, vendor, bill date, due date, invoice number, or job.</li>
        <li><strong>Select bills and payment methods:</strong> Check the boxes next to the bills you want to pay. For each bill, select your payment method from the Bank column. You can also set a default bank or credit card for all bills on the page.</li>
        <li><strong>Choose your payment method:</strong> Rent Manager supports multiple payment options:
          <ul>
            <li><strong>Traditional bank or credit card:</strong> Select from your configured accounts.</li>
            <li><strong>VendorPay:</strong> Powered by AvidXchange — if enrolled, can simplify and accelerate your payment processes with electronic payments to your vendors.</li>
            <li><strong>Zego ePay (PayDirect):</strong> If enabled, you can pay vendors and owners electronically using their bank account information on file.</li>
          </ul>
        </li>
        <li><strong>Complete the payment:</strong> Follow the prompts to finalize the payment. Depending on your payment method, the bill may be submitted for processing immediately or require additional approval steps.</li>
      </ol>
      <p><strong>Note:</strong> You need the "Allow user to pay bills" privilege in the Payables group to pay bills. If you're paying a bill for the property management company, you also need the "Take owner Payments" privilege in the Receivables group. If you don't see certain payment options, contact your administrator to enable them in system preferences.</p>` },
  h4: { cat:0, icon:'summarize', label:'What report will tell me who is behind on rent?',
    kw:'report which tell delinquency behind rent aging receivables as of date',
    rich:`
      <p>The <strong>Delinquency report</strong> is the primary report for identifying tenants who are behind on rent. This report displays tenants and prospects with delinquent charges as of a specified date, along with the balance of delinquent charges by property, a grand total for all selected properties, per-day late fee totals, and interest loan charges.</p>
      <p>To run the Delinquency report:</p>
      <ol>
        <li><strong>Navigate to the report:</strong> Go to Receivables → Charges → Delinquency.</li>
        <li><strong>Select properties:</strong> Choose each property or property group to include in the report.</li>
        <li><strong>Set the report date:</strong> Enter an "As of Date" to examine delinquent charges up through that date.</li>
        <li><strong>Filter by delinquency age (optional):</strong> Check "Exclude Tenants with Less Than X Delinquent Days" and enter a number (for example, 5) to show only tenants with charges that are at least that many days overdue.</li>
        <li><strong>Choose detail level:</strong> Select "Detail" to see each delinquent charge individually, or "Summary" to see only the total delinquent amount per tenant.</li>
        <li><strong>Include or exclude prospects:</strong> Check "Include Prospects" if you want prospect accounts in the results.</li>
        <li><strong>Generate the report:</strong> Select your desired file format and run the report.</li>
      </ol>
      <p><strong>Important:</strong> This report examines unpaid charges, not ending balances. If a payment was received but not yet applied to outstanding charges, those charges will still appear as delinquent on this report.</p>
      <p><strong>Note:</strong> You must have the "Run reports" privilege enabled and access to the Delinquency report on the Reports tab.</p>` },
  h5: { cat:0, icon:'receipt_long', label:'Is there an easy way to enter expense receipts into Rent Manager?',
    kw:'easy enter expense receipts smart receipts ai extraction rmappsuite capture mobile scan',
    rich:`
      <p>Yes, Rent Manager offers the <strong>Smart Receipts</strong> feature, which is designed to make entering expense receipts easy and efficient.</p>
      <h4>How it works</h4>
      <ol>
        <li><strong>Capture or upload receipts:</strong> You or your technicians can take a photo of a receipt using the Capture tool in rmAppSuite Pro, or upload an image file (PDF or image format) of a receipt.</li>
        <li><strong>AI extraction:</strong> Orion AI automatically extracts the relevant transaction data from the receipt image, such as the amount, vendor, and date.</li>
        <li><strong>Review and verify:</strong> The extracted details are populated into draft transactions in Rent Manager. You review the information to ensure accuracy and add any additional details like a memo.</li>
        <li><strong>Classify the expense:</strong> You classify the charge as either a company credit card transaction or a personal reimbursement.</li>
        <li><strong>Post the transaction:</strong> Once verified, you can save the receipt for later or post it directly as a credit card transaction or as a bill to reimburse an employee.</li>
      </ol>
      <h4>Additional features</h4>
      <ul>
        <li>You can link Rent Manager users to vendor accounts, making it clear which employee is being reimbursed for personal charges.</li>
        <li>You can use the Smart Receipts page to view all uploaded receipts and manage them in one place.</li>
        <li>A dashboard tile shows pending Smart Receipts that have been uploaded but not yet posted.</li>
      </ul>
      <p><strong>Note:</strong> Smart Receipts is a licensed feature and must be purchased separately. Contact your sales representative for more information.</p>` },
};

const DATA_PROMPTS = {
  q1: { reportName:'Occupancy Summary', reportSource:'Rental Info · Box Score', cat:1, icon:'donut_large', label:'What is my total occupancy?',
    kw:'total occupancy occupied vacant units',
    text:'Occupancy across the 10 properties in your scope is 89.6% — 751 of 838 units occupied as of this morning.',
    stats:[ ['89.6%','Occupied units'], ['87','Vacant units'], ['17','Vacant over 30 days'] ],
    table:[ ['Riverview Apartments','91.6% · 141 of 154'], ['Union Street Lofts','89.5% · 94 of 105'], ['Crestline Business Park','87.7% · 57 of 65'], ['Hawthorne Ridge','84.6% · 88 of 104'], ['Harbor Flats','90.9% · 80 of 88'], ['Willowbrook','93.1% · 67 of 72'], ['Ridgeline','88.5% · 85 of 96'], ['Meadowbrook Apartments','91.7% · 55 of 60'], ['Ashford Commons','87.0% · 47 of 54'], ['Birchwood Flats','92.5% · 37 of 40'] ],
    followups:['occ_month','occ_old','occ_econ'],
    tileName:'Portfolio Occupancy', tileRows:[ ['Portfolio','89.6% · 751 of 838','Below',ORANGE] ],
    summary:"89.6% occupied portfolio-wide, ranging from Birchwood Flats at 92.5% down to Hawthorne Ridge at 84.6%.",
    actions:['summarize','print'] },
  q2: { reportName:'Issue History · Over 7 Days', reportSource:'Services · Issue Detail', cat:1, icon:'build', label:'Show me a list of maintenance requests that took more than 7 days to resolve',
    kw:'maintenance requests list resolve resolved days issues slow',
    text:'14 issues closed in the last 90 days took longer than 7 days. Average time to resolve on those was 12.4 days against a 3.1-day portfolio average.',
    table:[ ['4090 · Hawthorne 1108','HVAC · D. Ramirez rescheduled twice','16 d',RED], ['4319 · Hawthorne 902','HVAC · waiting on D. Ramirez','15 d',RED], ['4276 · Hawthorne 410','HVAC · part on backorder','13 d',RED], ['4198 · Hawthorne 204','HVAC · D. Ramirez no-show','14 d',RED], ['4142 · Hawthorne 512','HVAC · D. Ramirez rescheduled','10 d',ORANGE], ['4265 · Hawthorne 305','HVAC · waiting on D. Ramirez','9 d',ORANGE], ['4182 · Riverview 204B','Plumbing · opened Jun 2 · closed Jun 21','21 d',RED], ['4213 · Union 214','Appliance · part on backorder','11 d',ORANGE], ['4155 · Riverview 305','Electrical · permit wait','9 d',ORANGE], ['4256 · Crestline 118','Roof · parts backorder','16 d',RED], ['4301 · Harbor Flats 702','Plumbing · T. Alvarez no-show','13 d',RED], ['4188 · Willowbrook 145','Appliance · part on backorder','10 d',ORANGE], ['4247 · Ridgeline 420','General · scheduling delay','8 d',ORANGE], ['4330 · Union 610','Electrical · permit wait','8 d',ORANGE] ],
    findings:['9 of the 14 sat in Assigned with no tech acceptance for more than 3 days.','Hawthorne Ridge accounts for 6 of the 14 — all HVAC, all assigned to the same tech, D. Ramirez.'],
    followups:['mt_vendor','mt_open','mt_cat'],
    tileName:'Slow Issues', tileRows:[ ['Over 7 days','14 issues · avg 12.4 days','Watch',RED] ],
    actions:['print'] },
  q3: { reportName:'Vehicle Register · Riverview Apartments', reportSource:'Rental Info · Tenant Vehicles', cat:1, icon:'directions_car', label:'Who has a red Camaro in Riverview Apartments?',
    kw:'camaro vehicle car red riverview plate parking',
    text:'One tenant at Riverview Apartments has a red Camaro on the vehicle record.',
    tenants:[ {id:'reed', name:'Marcus Reed', unit:'Riverview Apartments · 512', vehicle:'2019 Chevrolet Camaro · Red · Plate 8XKJ221', match:'exact'}, {id:'brooks', name:'Hailey Brooks', unit:'Riverview Apartments · 118', vehicle:'2021 Dodge Charger · Red · Plate 4TRM905', match:'near'}, {id:'cho', name:'Elena Cho', unit:'Riverview Apartments · 204B', vehicle:'2020 Honda Civic · Red · Plate 6PLM230', match:'near'} ],
    note:"Vehicle data comes from the tenant's Vehicles tab. Two other red vehicles are on file at this property; only the Camaro is an exact match.",
    followups:['veh_parking','veh_missing'],
    actions:['print'] },
  q4: { reportName:'Unit Availability · Filtered', reportSource:'Rental Info · Unit Availability', cat:1, icon:'apartment', label:'What units are on the 2nd floor, are waterfront, and available next month?',
    kw:'units second floor waterfront available next month vacant',
    text:'Three units match all three conditions — second floor, waterfront exposure, and available during September.',
    table:[ ['Riverview 204B','2 bed · $1,890 · waterfront','Sep 30',GREEN], ['Riverview 212','1 bed · $1,610 · waterfront','Sep 5',GREEN], ['Harbor Flats 208','2 bed · $1,975 · waterfront','Sep 1',GREEN] ],
    findings:['Riverview 212 has 2 interested prospects with a waterfront preference logged.'],
    note:"Floor comes from the unit's Floor field; waterfront comes from each unit's own amenity flag, not the property — some units at Riverview and Harbor Flats aren't waterfront.",
    followups:['unit_prospects','unit_rents'],
    tileName:'Waterfront Availability', tileRows:[ ['2nd floor waterfront','3 units available in September','Open',GREEN] ],
    actions:['print'] },
  q5: { reportName:'Profit & Loss · MTD vs. Last Year', reportSource:'Financial · Comparative P&L', cat:1, icon:'assessment', label:'Run a P&L this month to date compared to last year same period',
    kw:'profit loss statement compared last year period income expenses noi report',
    text:'P&L for August 1–28, 2026 against August 1–28, 2025. All 10 properties, accrual basis.',
    report:{ title:'Profit & Loss · MTD vs. same period last year', cols:['Aug 1–28, 2026','Aug 1–28, 2025','Var'],
      rows:[
        {kind:'head', a:'Income'},
        {kind:'row', a:'Rental Income', b:'$1,284,310', c:'$1,208,940', d:'+6.2%', dir:'up'},
        {kind:'row', a:'Other Income', b:'$96,420', c:'$88,150', d:'+9.4%', dir:'up'},
        {kind:'total', a:'Total Income', b:'$1,380,730', c:'$1,297,090', d:'+6.4%', dir:'up'},
        {kind:'head', a:'Expenses'},
        {kind:'row', a:'Repairs & Maintenance', b:'$214,880', c:'$176,220', d:'+21.9%', dir:'bad'},
        {kind:'row', a:'Payroll', b:'$188,400', c:'$182,900', d:'+3.0%', dir:'flat'},
        {kind:'row', a:'Utilities', b:'$96,140', c:'$101,600', d:'-5.4%', dir:'up'},
        {kind:'row', a:'Turnover', b:'$74,310', c:'$58,940', d:'+26.1%', dir:'bad'},
        {kind:'total', a:'Total Expenses', b:'$573,730', c:'$519,660', d:'+10.4%', dir:'bad'},
        {kind:'total', a:'Net Operating Income', b:'$807,000', c:'$777,430', d:'+3.8%', dir:'up'},
      ] },
    findings:['Income growth is broad — 8 of 10 properties are ahead on rental income.','Expense growth is concentrated: Repairs & Maintenance and Turnover are 92% of the increase.'],
    note:'This is the report summary, not the posted report. Ask me anything about these numbers and I will read the detail behind them.',
    followups:['pl_rm','pl_noi','pl_byprop'],
    tileName:'NOI vs. Last Year', tileRows:[ ['Portfolio NOI','$807,000 · was $777,430','+3.8%',GREEN] ],
    summary:'Income is up 6.4% year-over-year and would have carried NOI further if not for a 23.6% jump in expenses, concentrated almost entirely in Repairs & Maintenance and Turnover.',
    actions:['summarize','print'] },
};

const ACTION_PROMPTS = {
  x1: { cat:2, icon:'ac_unit', label:'Add a charge to several tenants',
    kw:'add snow removal charge all tenants riverview apartments batch post charges fee',
    text:"I can stage this as a batch charge. Here is exactly what I will post — nothing is written until you post it.",
    plan:{ title:'Batch Charge · Snow Removal', rows:[
        ['Property','Riverview Apartments'], ['Applies to','148 active tenants · occupied units only'],
        ['Charge type','Snow Removal · GL 4120 Other Income'], ['Amount','$25.00 each · one time, not recurring'],
        ['Charge date','Aug 28, 2026 · due Sep 1, 2026'], ['Batch total','$3,700.00'],
        ['Excluded','6 vacant units · 2 tenants on move-out notice'] ],
      warn:'Two tenants have a lease clause that caps ancillary charges. I left them in the batch but flagged them below — remove them before posting if that clause applies.' },
    findings:['Flagged: Sam Ortega (512) and Anh Nguyen (902) — lease addendum limits pass-through charges.','The charge type Snow Removal already exists, so no new setup is needed.','Tenant Web Access will show the charge to residents as soon as it posts.'],
    actions:['post','flagged','cancel'],
    posted:{ text:'Posted. 148 Snow Removal charges totaling $3,700.00 hit the Riverview Apartments tenant ledgers, dated Aug 28, 2026.',
      stats:[ ['148','Charges posted'], ['$3,700.00','Batch total'], ['#20458','Batch reference number'] ] },
    tileName:'Snow Removal Charge Collection', tileRows:[ ['Riverview Apartments','148 charged · 0 paid','$3,700',ORANGE], ['Due Sep 1','Appears on TWA today','0%',GRAY], ['Flagged leases','2 excluded by clause','-$50',GRAY] ] },
  x3: { cat:2, icon:'redeem', label:'Add a $25 credit to tenant accounts with open maintenance requests over 7 days old',
    kw:'add credit tenant accounts open maintenance requests over 7 days goodwill',
    text:'I can stage this as a batch credit. Here is exactly what I will post — nothing is written until you post it.',
    plan:{ title:'Batch Credit · Maintenance Delay Goodwill', rows:[
        ['Criteria','Tenant has an open issue older than 7 days · one credit each'],
        ['Applies to','14 tenants · 6 properties'],
        ['Charge type','Goodwill Credit · GL 4120 Other Income (contra)'],
        ['Amount','-$25.00 each · one time, not recurring'],
        ['Credit date','Aug 28, 2026'],
        ['Batch total','-$350.00'] ] },
    table:[ ['Hailey Brooks · Riverview 118','Open 9 days · plumbing','-$25.00',GREEN], ['Anh Nguyen · Hawthorne 410','Open 8 days · HVAC','-$25.00',GREEN], ['Maria Delgado · Riverview 204B','Open 12 days · appliance','-$25.00',GREEN], ['Rob Feldman · Union 214','Open 11 days · appliance','-$25.00',GREEN], ['Devon Marsh · Harbor 702','Open 10 days · electrical','-$25.00',GREEN], ['Nia Carter · Union 610','Open 8 days · electrical','-$25.00',GREEN], ['Carla Jimenez · Crestline 118','Open 16 days · roof','-$25.00',GREEN], ['Brian Sato · Willowbrook 145','Open 10 days · appliance','-$25.00',GREEN], ['Latasha Green · Ridgeline 420','Open 8 days · general','-$25.00',GREEN], ['Tom Reyes · Harbor Flats 1108','Open 9 days · plumbing','-$25.00',GREEN], ['Sam Ortega · Riverview 512','Open 13 days · plumbing','-$25.00',GREEN], ['Terrance Boyd · Hawthorne 1108','Open 16 days · HVAC','-$25.00',GREEN], ['Grace Liu · Riverview 305','Open 9 days · electrical','-$25.00',GREEN], ['Omar Hassan · Crestline 220','Open 14 days · plumbing','-$25.00',GREEN] ],
    findings:['Two of the 14 already have a vendor visit scheduled, so the delay may resolve before the credit posts.','The other 12 have no visit scheduled yet.'],
    actions:['post_credit','cancel'],
    posted:{ text:'Posted. 14 goodwill credits totaling $350.00 hit the affected tenant ledgers, dated Aug 28, 2026.',
      stats:[ ['14','Credits posted'], ['$350.00','Batch total'], ['#20512','Batch reference number'] ] },
    tileName:'Maintenance Delay Credits', tileRows:[ ['This batch','14 tenants · $350.00 credited','Posted',GREEN] ],
    reportName:'Batch Credit · Maintenance Delay Goodwill', reportSource:'Transactions · Batch Credits' },
  x4: { cat:2, icon:'local_parking', label:'Add a parking violation for red Camaro at Riverview Apartments',
    kw:'add parking violation red camaro riverview',
    text:"I found the vehicle. Marcus Reed's 2019 Chevrolet Camaro is the only exact red Camaro match at Riverview Apartments — here's the violation I'll log.",
    tenants:[ {id:'reed', name:'Marcus Reed', unit:'Riverview Apartments · 512', vehicle:'2019 Chevrolet Camaro · Red · Plate 8XKJ221', match:'exact'} ],
    plan:{ title:'Parking Violation · Marcus Reed', rows:[
        ['Vehicle','2019 Chevrolet Camaro · Red · Plate 8XKJ221'],
        ['Violation type','Parked in another unit’s assigned space'],
        ['Details','Found in space P-118, assigned to Unit 204B'],
        ['Date observed','Aug 28, 2026'],
        ['Notice','Standard warning notice attached to the tenant record'] ] },
    actions:['log_violation','cancel'],
    posted:{ text:'Logged. A parking violation was added to Marcus Reed’s tenant record, dated Aug 28, 2026.',
      stats:[ ['1','Violation logged'], ['P-118','Space parked in'], ['#PV-3042','Violation reference number'] ] } },
  x5: { cat:2, icon:'assignment_late', label:'Help me prioritize the maintenance requests submitted via the resident portal this week',
    kw:'prioritize maintenance requests resident portal this week triage',
    text:'Six new requests came in through the resident portal this week. I ranked them by urgency — I can set these priority levels in Rent Manager if you approve.',
    table:[ ['4402 · Hawthorne 902','No heat reported · HVAC','Urgent',RED], ['4405 · Riverview 118','Water leak under sink · Plumbing','Urgent',RED], ['4410 · Union 214','Garbage disposal not working · Appliance','High',ORANGE], ['4412 · Willowbrook 145','Smoke detector chirping · General','High',ORANGE], ['4415 · Crestline 220','Light fixture flickering · Electrical','Medium',GRAY], ['4418 · Ridgeline 420','Squeaky door hinge · General','Low',GRAY] ],
    findings:['The no-heat and water-leak requests are emergency-priority regardless of submission order.','The other four are routine and can be scheduled around your crew’s current workload.'],
    actions:['apply_priorities','cancel'],
    posted:{ text:'Applied. Priority levels were set on all 6 issues — the 2 urgent requests now show at the top of the technician queue.',
      stats:[ ['6','Priorities updated'], ['2','Marked urgent'], ['Aug 28, 2026','Applied date'] ] } },
  x6: { cat:2, icon:'drafts', label:'Draft follow-up emails to all my leads that haven’t responded in over 7 days',
    kw:'draft follow up emails leads no response 7 days prospects',
    text:'Six leads have gone quiet for more than 7 days after real engagement. I drafted a short, personalized check-in for each — nothing sends until you approve.',
    table:[ ['Devon Marsh','22 days silent · last touch: guest card','Draft ready',GRAY], ['Dana Whitfield','18 days silent · last touch: toured Riverview 212','Draft ready',GRAY], ['Simone Baptiste','17 days silent · last touch: application','Draft ready',GRAY], ['Felicia Ward','16 days silent · last touch: toured','Draft ready',GRAY], ['Aaron Blake','15 days silent · last touch: toured','Draft ready',GRAY], ['Miguel Torres','14 days silent · last touch: application','Draft ready',GRAY] ],
    findings:['Each draft references their specific unit or tour so it doesn’t read as a form email.','None of the six have an active application in progress, so a check-in is unlikely to feel premature.'],
    actions:['send_drafts','cancel'],
    posted:{ text:'Sent. 6 personalized check-in emails went out, logged to each guest card.',
      stats:[ ['6','Emails sent'], ['0','Replies so far'], ['Aug 28, 2026','Sent date'] ] } },
};

const BILLING_PROMPTS = {
  x2: { cat:2, icon:'request_quote', label:'Find all unbilled maintenance requests to property owners and create the bills',
    kw:'find all unbilled maintenance requests property owners create bills billable issues rebill charge back',
    text:'I found 23 completed issues across 6 owners with billable cost and no owner charge posted against them. Here is the batch I would create — nothing posts until you say so.',
    plan:{ title:'Owner Billing Batch · Unbilled Maintenance', rows:[
        ['Source','Completed issues, Jun 1 – Aug 28, 2026'], ['Found unbilled','23 issues · 6 owners · 9 properties'],
        ['Billable cost','$18,940.00 labor, parts and vendor invoices'], ['Management markup','10% per management agreement · $1,894.00'],
        ['Batch total','$20,834.00 across 6 owner bills'], ['Charge type','Maintenance Reimbursement · GL 5210'],
        ['Bill date','Aug 28, 2026 · net 15'], ['Held back','4 issues · missing vendor invoice or cost'] ],
      warn:'Two issues at Hawthorne Ridge exceed the $2,500 owner approval threshold in the management agreement and have no approval on file. They are excluded from the batch until approval is logged.' },
    table:[ ['Delgado Holdings','7 issues · Riverview','$6,320',GRAY], ['Ridgeline Partners LP','5 issues · Ridgeline','$4,720',GRAY], ['Harbor Equity Group','4 issues · Harbor Flats','$3,650',GRAY], ['Union Street Trust','3 issues · Union Lofts','$2,780',GRAY], ['Crestline Ventures','2 issues · Crestline','$1,790',GRAY], ['Meridian Holdings','2 issues · Willowbrook','$1,574',GRAY] ],
    findings:['The oldest unbilled order is 84 days old — 4090, HVAC at Hawthorne 1108, $2,180.','9 of the 23 have a vendor invoice attached, so those bills carry documentation automatically.','4 orders are held back because cost is still $0 — vendor invoice not entered yet.'],
    actions:['postbills','held','cancel'],
    posted:{ text:'Created. 6 owner bills totaling $20,834.00, dated Aug 28, 2026, each itemized by issue with the vendor invoice attached where one exists.',
      stats:[ ['6','Owner bills created'], ['$20,834.00','Billed · incl. $1,894 markup'], ['19','Issues marked billed'] ],
      table:[ ['Delgado Holdings','Bill 10442 · 6 orders · net 15','$6,320',GREEN], ['Ridgeline Partners LP','Bill 10443 · 4 orders · net 15','$4,720',GREEN], ['Harbor Equity Group','Bill 10444 · 3 orders · net 15','$3,650',GREEN], ['Union Street Trust','Bill 10445 · 2 orders · net 15','$2,780',GREEN], ['Crestline Ventures','Bill 10446 · 2 orders · net 15','$1,790',GREEN], ['Meridian Holdings','Bill 10447 · 2 orders · net 15','$1,574',GREEN] ],
      note:'Bills sit in Owner Statements as unsent. Review and send them from Owners > Pay Owners.' } },
};

const INSIGHT_PROMPTS = {
  d1: { reportName:'Delinquency Detail', reportSource:'Receivables · Delinquency', icon:'task_alt', label:'Where should I focus on delinquency this month?',
    kw:'delinquency focus this month behind pace collections',
    text:'You are behind where you were at this point last month. On day 18 of the period you had collected 93.40%; today you are at 91.18%, which is $23,410 more outstanding than the same day last month.',
    stats:[ ['$249,502','Delinquent balance (+$23,410 vs. day 18 last month)'], ['91.18%','Collected · down 2.22 pts from 93.40%'], ['Behind','Pace vs. same day last month'] ],
    findings:['Hawthorne Ridge is the whole gap: $64,870 outstanding against $38,140 on the same day last month.','Crestline Business Park is actually ahead, down from 22.10% to 19.56% uncollected.','Riverview is flat month over month, so the portfolio slip is concentrated in one property.','Two months ago on day 18 you were at 94.05%, so this is the second consecutive month of slipping pace.'],
    note:'Compares charges, receipts and tenant balances as of the same day in the prior period.',
    actions:['nextsteps','list','print'],
    nextSteps:[ ['Close the Hawthorne Ridge gap first','It accounts for $26,730 of the $23,410 portfolio slip, so nothing else moves the number as much.'], ['Check late fee posting at Hawthorne Ridge','Fees were not posted for two of the last three cycles, which is likely why the pace fell there and nowhere else.'], ['Review the 9 tenants over 60 days','All have promised payments logged but no receipts. Seven of the nine are at Hawthorne.'], ['Copy what Crestline did','It improved 2.54 points month over month. Its manager started calling on day 5 instead of day 12.'] ],
    tileName:'Delinquency Pace vs. Last Month', tileHead:['Property','Outstanding vs. same day','Pace'],
    tileNote:'Behind last month · 91.18% collected vs. 93.40% on day 18 · +$23,410 outstanding',
    tileRows:[ ['Hawthorne Ridge','$64,870 · was $38,140','Behind',RED], ['Riverview Apartments','$32,072 · was $31,640','Flat',GRAY], ['Crestline Business Park','$26,012 · was $29,880','Ahead',GREEN] ],
    tileFooter:'Day 18 of period · same-day comparison · refreshes daily',
    table:[ ['Portfolio','91.18% collected · was 93.40%','-2.22 pts',RED], ['Hawthorne Ridge','8.94% uncollected · was 5.31%','-3.63 pts',RED], ['Riverview Apartments','7.37% uncollected · was 7.28%','-0.09 pts',GRAY], ['Crestline Business Park','19.56% uncollected · was 22.10%','+2.54 pts',GREEN] ] },
  d2: { reportName:'Upcoming Vacancy & Prospect Coverage', reportSource:'Rental Info · Lease Expiration', icon:'insights', label:'Show me upcoming vacant units and any prospects that have shown interest or may be a good fit.',
    kw:'upcoming vacant units prospects interest good fit coverage',
    text:'Here is what I found across your 10 selected properties for the next 30 days.',
    bullets:['14 units are vacating, and 9 applications are pending across 5 of them.','4 units have logged prospect interest but no application yet.','5 units have no interest logged at all, and Unit 420 at Ridgeline is the closest of those at Sep 24.','23 prospects are interested across all vacating units, and 6 more match Unit 420’s preferences without having asked about it.','Harbor Flats has the thinnest coverage of any property, at 44% of its vacating units.'],
    note:'Based on lease end dates, move-out notices, application status and prospect preferences.',
    actions:['nextsteps','list','print'],
    nextSteps:[ ['Prioritize Unit 420','No interest logged and 24 days out. Six preference matches exist in your prospect register.'], ['Confirm the 9 pending applications','Three are missing income verification, which is the usual stall point.'], ['Re-list Harbor Flats early','Coverage there has run below 50% for three consecutive months.'] ],
    tileName:'Upcoming Vacancy Coverage', tileKind:'vacancy', unitList:true,
    tileHead:['Unit','Vacant · applications','Interest'], tileNote:'14 vacating · 5 covered · 4 interest only · 5 with no interest logged',
    tileRows:[ ['420 · Ridgeline','Sep 24 · no applications','None',RED], ['1108 · Harbor Flats','Sep 19 · 1 pending','3',ORANGE], ['305 · Ridgeline','Sep 12 · 2 pending','4',GREEN] ],
    tileFooter:'14 units · 23 interested prospects' },
  d3: { reportName:'Resident Sentiment Watchlist', reportSource:'Rental Info · Tenant History', icon:'insights', label:'Flag escalated residents before they vacate',
    kw:'escalated residents sentiment flag vacate churn',
    text:'I read maintenance history, portal messages, survey responses and smart voicemail transcripts for the last 30 days.',
    stats:[ ['7','Residents with negative sentiment'], ['3','Renew within 60 days'], ['19','Escalated signals logged'] ],
    findings:['Maria Delgado (204B) is the sharpest drop: 3 ticket re-opens, 2 portal complaints and a 4/10 survey.','Two more negative-sentiment residents renew inside 120 days, and both cite noise rather than price.','Sentiment for this group has declined six months running while resolved-ticket volume fell.'],
    note:'Based on history and notes, issues, portal messages, surveys and voicemail transcripts.',
    actions:['nextsteps','list','print'],
    nextSteps:[ ['Walk 204B with a technician','Same issue re-opened three times. Renewal decision is due Oct 31.'], ['Group the noise complaints','Four residents in the same building reported noise in the same window.'], ['Close the 9-day-old portal messages','Two residents are waiting on a reply, which is the strongest churn signal in the set.'] ],
    tileName:'Resident Sentiment Watchlist', tileHead:['Resident','Unit · renewal','Sentiment'],
    tileNote:'7 flagged · -23 average sentiment · 3 renew within 60 days',
    tileRows:[ ['Maria Delgado','204B · renews Oct 31','-38',RED], ['Terrance Boyd','1108 · renews Dec 31','-19',ORANGE], ['Anh Nguyen','512 · renews Feb 28','-12',ORANGE] ],
    tileFooter:'7 residents tracked · refreshes daily',
    table:[ ['Maria Delgado','3 re-opens · survey 4/10','-38',RED], ['Terrance Boyd','Voicemail: noise · 1 escalation','-19',ORANGE], ['Anh Nguyen','2 portal messages unresolved','-12',ORANGE] ] },
  d4: { reportName:'Lead Conversion Scoring', reportSource:'Rental Info · Prospect Waiting List', icon:'insights', label:'Score my leads by likelihood to convert',
    kw:'score leads likelihood convert conversion',
    text:'I scored 34 active leads on stage reached, days in stage, note volume, visits and reply speed.',
    stats:[ ['34','Active leads scored'], ['8','Scoring 81 to 100'], ['66','Average score'] ],
    findings:['Priya Raman (91) and Jordan Wells (84) both advanced a stage in the last five days.','Dana Whitfield has sat in screening 11 days, the longest stall in your pipeline.','Leads that reply within four hours convert at roughly twice the rate of the rest.'],
    note:'Based on prospect stage history, history and notes entries, the visit log and message timestamps.',
    actions:['nextsteps','list','print'],
    nextSteps:[ ['Call Priya Raman today','Application started four days ago and she has replied twice this week.'], ['Unblock Dana Whitfield','Screening has been open 11 days. Income verification is the missing piece.'], ['Book Jordan Wells a second showing','Two tours logged and no decision. A ranked shortlist usually closes this.'] ],
    tileName:'Lead Conversion Score', tileHead:['Prospect','Stage · days in stage','Score'],
    tileNote:'34 leads scored · average 66 · sortable by score or days',
    tileRows:[ ['Priya Raman','Application · 4 days','91',GREEN], ['Jordan Wells','Property Tour · 6 days','84',GREEN], ['Chris Okafor','Guest Card · 2 days','72',GRAY] ],
    tileFooter:'34 leads scored · top 10 shown',
    table:[ ['Priya Raman','Application · 2 replies this week','91',GREEN], ['Dana Whitfield','Screening · 11 days stalled','41',ORANGE], ['Nia Carter','Guest Card · no visits','28',RED] ] },
  d5: { icon:'insights', label:'Pre-tour briefing 30 minutes before showings',
    kw:'pre tour briefing showings today',
    text:'You have two showings today. I cross-referenced each prospect’s stated preferences against current availability.',
    stats:[ ['2','Showings today'], ['5','Units ranked'], ['96','Best fit score'] ],
    findings:['Jordan Wells at 2:30 PM: Unit 305 meets all five stated preferences at $1,795.','Unit 420 is $50 over his stated ceiling, so hold it as a fallback only.','Chris Okafor at 4:15 PM: Unit 610 meets all four preferences and his Oct 1 move-in.'],
    note:'Based on prospect preferences, unit availability and pricing, and your showing calendar.',
    actions:['nextsteps','print'],
    nextSteps:[ ['Lead with Unit 305 for Jordan','Five of five preferences met and under his budget ceiling.'], ['Print the comparison for both prospects','Fit ranking, price and availability date in one page.'], ['Hold Unit 610 for the 4:15 showing','It matches Chris on every preference and his move-in date.'] ],
    tileName:'Pre-Tour Briefings', tileHead:['Showing','Top match','Fit'],
    tileNote:'Emails you the ranked shortlist 30 minutes before each showing',
    tileRows:[ ['2:30 PM · Jordan Wells','Unit 305 · $1,795','96',GREEN], ['4:15 PM · Chris Okafor','Unit 610 · $1,320','90',GREEN], ['Fallback','Unit 420 · over budget','63',ORANGE] ],
    tileFooter:'Today’s showings · ranked by fit' },
  n1: { reportName:'Prospect Follow-Up Aging', reportSource:'Rental Info · Prospect Activity', icon:'task_alt', label:'Who should I follow up with today?',
    kw:'follow up today prospects contact',
    text:'21 active prospects have had no communication or status change in 7 or more days. Here is how I would order them.',
    stats:[ ['21','Awaiting contact'], ['3','Past 30 days'], ['9','Went quiet after strong interest'] ],
    findings:['Sam Ortega had five touches then went silent 12 days ago, right after a tour.','Nia Carter has been waiting 34 days and is your oldest open guest card.','Six of the 21 have a unit still available that matched their stated preferences.'],
    note:'I can surface and organize these. Sending messages is not something I can do yet.',
    actions:['nextsteps','list','print'],
    nextSteps:[ ['Start with the 9 who went quiet after strong interest','They engaged repeatedly, so a single check-in usually restarts the conversation.'], ['Close out the 3 past 30 days','Mark them lost or re-qualify them so your pipeline numbers stay honest.'], ['Match the 6 with available units','Their preferred unit type is open right now, which gives you a concrete reason to call.'] ],
    tileName:'Follow-Up Queue', tileHead:['Prospect','Last contact','Priority'],
    tileNote:'21 awaiting contact · 12 at 7–14 days · 6 at 15–30 · 3 past 30',
    tileRows:[ ['Sam Ortega','12 days · Toured','Priority',RED], ['Hailey Brooks','19 days · Applied','Priority',RED], ['Marcus Reed','8 days · Inquiry','Normal',GRAY] ],
    tileFooter:'21 prospects · aged by last contact',
    table:[ ['Nia Carter','34 days · Guest Card','Oldest',RED], ['Owen Krantz','33 days · Inquiry','Overdue',RED], ['Renee Coats','31 days · Applied','Overdue',RED], ['Devon Marsh','22 days · Guest Card','Quiet',ORANGE], ['Chris Okafor','20 days · Applied','Quiet',ORANGE], ['Dana Whitfield','18 days · Toured','Quiet',ORANGE], ['Simone Baptiste','17 days · Applied','Quiet',ORANGE], ['Felicia Ward','16 days · Toured','Quiet',ORANGE], ['Aaron Blake','15 days · Toured','Quiet',ORANGE], ['Miguel Torres','14 days · Applied','Quiet',ORANGE], ['Greg Halloway','13 days · Toured','Quiet',ORANGE], ['Sam Ortega','12 days · Toured','Quiet',ORANGE], ['Bianca Ruiz','12 days · Inquiry','New',GRAY], ['Rob Feldman','11 days · Inquiry','New',GRAY], ['Hailey Brooks','10 days · Inquiry','New',GRAY], ['Jordan Wells','9 days · Inquiry','New',GRAY], ['Marcus Yates','9 days · Inquiry','New',GRAY], ['Marcus Reed','8 days · Inquiry','New',GRAY], ['Diane Okonkwo','8 days · Inquiry','New',GRAY], ['Priya Raman','7 days · Inquiry','New',GRAY], ['Alicia Fenn','7 days · Inquiry','New',GRAY] ] },
};


/* Only prompts with a `cat` appear in the Prompt Suggestions sheet. The ones
   without one still answer if typed, and the seeded history still links to
   them — they are just not suggested. That is how the sheet was trimmed back
   to the three lists Emma specified without throwing away working answers. */
const PROMPTS = Object.assign({}, HELP_PROMPTS, DATA_PROMPTS, INSIGHT_PROMPTS, ACTION_PROMPTS, BILLING_PROMPTS);

const UNITS = [
  { unit:'420', property:'Ridgeline', vacant:'Sep 24', apps:0, interest:0, prospects:[], matches:6 },
  { unit:'702', property:'Harbor Flats', vacant:'Sep 28', apps:0, interest:0, prospects:[] },
  { unit:'145', property:'Willowbrook', vacant:'Oct 1', apps:0, interest:0, prospects:[] },
  { unit:'318', property:'Crestline', vacant:'Oct 3', apps:0, interest:0, prospects:[] },
  { unit:'1204', property:'Hawthorne Ridge', vacant:'Oct 5', apps:0, interest:0, prospects:[] },
  { unit:'431', property:'Harbor Flats', vacant:'Oct 2', apps:0, interest:1, prospects:['Marcus Reed'] },
  { unit:'512', property:'Riverview', vacant:'Sep 26', apps:0, interest:2, prospects:['Sam Ortega','Nia Carter'] },
  { unit:'208', property:'Willowbrook', vacant:'Sep 29', apps:0, interest:2, prospects:['Hailey Brooks','Devon Marsh'] },
  { unit:'902', property:'Riverview', vacant:'Oct 4', apps:0, interest:2, prospects:['Rob Feldman','Anh Nguyen'] },
  { unit:'118', property:'Ridgeline', vacant:'Sep 30', apps:1, interest:2, prospects:['Jordan Wells','Chris Okafor'] },
  { unit:'1108', property:'Harbor Flats', vacant:'Sep 19', apps:1, interest:3, prospects:['Dana Whitfield','Marcus Reed','Sam Ortega'] },
  { unit:'214', property:'Union Street Lofts', vacant:'Sep 15', apps:2, interest:3, prospects:['Chris Okafor','Nia Carter','Devon Marsh'] },
  { unit:'305', property:'Ridgeline', vacant:'Sep 12', apps:2, interest:4, prospects:['Jordan Wells','Priya Raman','Hailey Brooks','Marcus Reed'] },
  { unit:'610', property:'Union Street Lofts', vacant:'Sep 22', apps:3, interest:4, prospects:['Chris Okafor','Priya Raman','Rob Feldman','Dana Whitfield'] },
];

const FOLLOWUPS = {
  del_notice: { q:'Who is eligible for a notice?', text:'Five tenants are past the grace period with no promise, plan or partial payment logged — the usual bar for a pay-or-quit notice.',
    table:[ ['Anh Nguyen · Hawthorne 410','$11,640 · 68 days · no contact','Eligible',RED], ['Delgado Holdings · Crestline 120','$18,900 · 71 days · commercial terms','Eligible',RED], ['Terrance Boyd · Hawthorne 1108','$21,480 · 94 days · no contact','Eligible',RED], ['Maria Delgado · Riverview 204B','$4,310 · 47 days · no contact','Eligible',ORANGE], ['Nia Carter · Union 610','$2,940 · 41 days · no contact','Eligible',ORANGE] ],
    note:'Notice templates live in Letters & Notices. I can surface the list and the balances; generating and serving the notice is yours.', followups:['del_plans'] },
  del_plans: { q:'Which tenants are on a payment plan?', text:'Twelve tenants have an active plan. Ten are current against it; two have missed an installment.',
    table:[ ['Hailey Brooks · Riverview 118','$3,220 · 4 of 6 installments paid','Current',GREEN], ['Anh Nguyen · Hawthorne 410','$11,640 · 3 of 5 installments paid','Current',GREEN], ['Maria Delgado · Riverview 204B','$4,310 · 2 of 4 installments paid','Current',GREEN], ['Rob Feldman · Union 214','$1,845 · 2 of 3 installments paid','Current',GREEN], ['Devon Marsh · Harbor 702','$1,190 · 1 of 2 installments paid','Current',GREEN], ['Nia Carter · Union 610','$2,940 · 3 of 5 installments paid','Current',GREEN], ['Carla Jimenez · Crestline 118','$2,410 · 2 of 3 installments paid','Current',GREEN], ['Brian Sato · Willowbrook 145','$1,975 · 1 of 3 installments paid','Current',GREEN], ['Latasha Green · Ridgeline 420','$3,680 · 3 of 4 installments paid','Current',GREEN], ['Tom Reyes · Harbor Flats 1108','$2,205 · 1 of 2 installments paid','Current',GREEN], ['Sam Ortega · Riverview 512','$9,280 · missed Aug 15 installment','Missed',RED], ['Terrance Boyd · Hawthorne 1108','$21,480 · missed 2 installments','Missed',RED] ],
    followups:['del_notice'] },
  ar_prop: { q:'Which properties moved the most?', text:'Four properties account for the change. Hawthorne Ridge is the only one materially worse.',
    table:[ ['Hawthorne Ridge','$64,870 open · was $38,140','+$26,730',RED], ['Riverview Apartments','$32,072 open · was $31,640','+$432',GRAY], ['Union Street Lofts','$21,940 open · was $22,610','-$670',GREEN], ['Crestline Business Park','$26,012 open · was $29,880','-$3,868',GREEN] ],
    followups:['ar_tenants','ar_latefee'] },
  ar_tenants: { q:'Who owes the most right now?', text:'Nine tenants are past 60 days. These four carry $61,300 of the $249,502 open.',
    table:[ ['Terrance Boyd · Hawthorne 1108','$21,480 · 94 days · promise logged','94 d',RED], ['Delgado Holdings · Crestline 120','$18,900 · 71 days · commercial','71 d',RED], ['Anh Nguyen · Hawthorne 410','$11,640 · 68 days','68 d',RED], ['Sam Ortega · Riverview 512','$9,280 · 62 days · partial paid','62 d',ORANGE] ],
    findings:['Seven of the nine over-60 tenants are at Hawthorne Ridge.','All nine have a promised payment logged and no receipt against it.'], followups:['ar_latefee'] },
  ar_latefee: { q:'Were late fees posted this period?', text:'Not everywhere. Late fees posted on 8 of your 10 properties. Hawthorne Ridge and Crestline were skipped, and Hawthorne has now missed two of the last three cycles.',
    bullets:['Unposted late fees at Hawthorne Ridge total roughly $4,900 across 31 delinquent leases.','Hawthorne is also the property where aging past 30 days grew the most, which usually follows missed fee posting.'],
    note:'Post Late Fees can be run for a single property, so this does not require re-running the whole portfolio.', followups:['ar_prop'] },
  occ_month: { q:'How does that compare to last month?', text:'Occupancy was 90.4% on July 28, so you are down 0.8 points — four net move-outs, three of them at Hawthorne Ridge.',
    table:[ ['Hawthorne Ridge','84.6% · was 87.5%','-2.9 pts',RED], ['Riverview Apartments','91.6% · was 91.0%','+0.6 pts',GREEN], ['Union Street Lofts','89.5% · was 89.5%','Flat',GRAY] ], followups:['occ_old','occ_econ'] },
  occ_old: { q:'Which vacancies are oldest?', text:'Seventeen units have been vacant more than 30 days. These four are past 60.',
    table:[ ['Hawthorne Ridge 902','Vacant 94 days · 2 bed','94 d',RED], ['Hawthorne Ridge 410','Vacant 78 days · 1 bed','78 d',RED], ['Crestline Suite 120','Vacant 71 days · commercial','71 d',RED], ['Union Street Lofts 214','Vacant 63 days · studio','63 d',ORANGE] ], followups:['occ_econ'] },
  occ_econ: { q:'What is the economic occupancy?', text:'Physical occupancy is 89.6%; economic occupancy is 87.0%. The 2.6-point gap is concessions and unpaid rent, not empty units.',
    bullets:['Concessions in place on 18 leases — $14,200 of monthly rent forgiven.','Delinquency over 30 days on 22 leases — $31,480 billed but uncollected.'] },
  mt_vendor: { q:'Which techs are slowest?', text:'Two techs carry most of the delay. Average days from assignment to first on-site visit:',
    table:[ ['D. Ramirez','6 issues · avg 9.2 days to first visit','Slow',RED], ['T. Alvarez','4 issues · avg 5.8 days','Watch',ORANGE], ['Rest of team','31 issues · avg 0.9 days','On time',GREEN] ], followups:['mt_open'] },
  mt_open: { q:'Are any of these still open?', text:'All 14 are closed. Separately, 6 open issues are already past 7 days — those are the ones worth attention now.',
    findings:['4 of the 6 are assigned to D. Ramirez and have no accepted date.','2 are waiting on tenant access after two failed entry attempts.'], followups:['mt_vendor'] },
  mt_cat: { q:'Which categories run longest?', text:'By average days to resolve over the last 90 days:',
    table:[ ['HVAC','22 issues · avg 8.4 days','8.4 d',RED], ['Appliance','17 issues · avg 5.1 days','5.1 d',ORANGE], ['Plumbing','34 issues · avg 2.6 days','2.6 d',GREEN], ['General','58 issues · avg 1.8 days','1.8 d',GREEN] ] },
  veh_parking: { q:'Which parking space is assigned to that unit?', text:'Unit 512 has one assigned space, P-212 in the covered garage, on the lease as a $75 monthly recurring charge.',
    bullets:['Second vehicle on file for the unit — 2016 Honda Civic, gray — has no assigned space.','Riverview has 7 unassigned covered spaces available this month.'] },
  veh_missing: { q:'How many tenants have no vehicle on file?', text:'At Riverview Apartments, 41 of 148 occupied units have no vehicle record. 19 of those have a parking charge on the lease, which is usually a data-entry gap rather than a tenant without a car.', followups:['veh_parking'] },
  unit_prospects: { q:'Who is interested in those units?', text:'Six prospects have a waterfront preference logged and an active guest card.',
    table:[ ['Priya Raman','Application on Riverview 212 · 4 days','91',GREEN], ['Jordan Wells','Toured Riverview 204B · 6 days','84',GREEN], ['Chris Okafor','Toured Harbor Flats 208 · 3 days','88',GREEN], ['Dana Whitfield','Application on Riverview 212 · 9 days','76',GREEN], ['Sam Ortega','Guest card · no visit yet','52',ORANGE], ['Devon Marsh','Guest card · no visit yet','45',ORANGE] ] },
  unit_rents: { q:'How do those rents compare to the property average?', text:'All three are priced above their property average, which is consistent with the waterfront premium on file.',
    table:[ ['Riverview 204B','$1,890 · 2 bed average $1,742','+8.5%',GREEN], ['Riverview 212','$1,610 · 1 bed average $1,505','+7.0%',GREEN], ['Harbor Flats 208','$1,975 · 2 bed average $1,860','+6.2%',GREEN] ] },
  pl_rm: { q:'Why is Repairs & Maintenance up?', text:'Repairs & Maintenance is up $38,660 against last August. Three items account for $34,100 of it.',
    bullets:['Hawthorne Ridge roof repairs — $18,400 across two issues, no comparable spend last year.','Riverview HVAC compressor replacements — $9,900 on three units.','Turn-related drywall and paint at Union Street Lofts — $5,800, tied to 9 turns this month against 4 last August.'],
    note:'The roof work is capital-eligible. Moving it out of R&M would put the category at +3.7% year over year.', followups:['pl_noi','pl_byprop'] },
  pl_noi: { q:'Which property drove the NOI change?', text:'NOI is up $29,570. Riverview carried it; Hawthorne Ridge is the only property down year over year.',
    table:[ ['Riverview Apartments','NOI $341,200 · was $318,600','+7.1%',GREEN], ['Union Street Lofts','NOI $198,400 · was $191,050','+3.8%',GREEN], ['Crestline Business Park','NOI $151,900 · was $149,800','+1.4%',GRAY], ['Hawthorne Ridge','NOI $115,500 · was $117,980','-2.1%',RED] ], followups:['pl_rm','pl_byprop'] },
  pl_byprop: { q:'Show the same period by property', text:'Income and expense for August 1–28, 2026, by property, with the year-over-year variance on total income.',
    table:[ ['Riverview Apartments','Income $521,400 · Expense $180,200','+7.4%',GREEN], ['Union Street Lofts','Income $312,900 · Expense $114,500','+5.1%',GREEN], ['Crestline Business Park','Income $268,300 · Expense $116,400','+2.2%',GRAY], ['Hawthorne Ridge','Income $278,130 · Expense $162,630','+1.1%',ORANGE] ],
    note:'I can export this summary to the Financial Analytics board or build it as a dashboard tile.' },
};

const TENANT_RECORDS = {
  reed: { account:'516', balance:'0.00', deposit:'1,170.00', name:'Marcus Reed', meta:'Riverview Apartments · Unit 512 · Tenant since Mar 2023',
    fields:[ ['Lease Term','Mar 1, 2026 – Feb 28, 2027'], ['Rent','$1,545 monthly'], ['Balance','$0.00'], ['Phone','(513) 555-0142'], ['Email','m.reed@example.com'], ['Parking Space','P-212 · covered garage'] ],
    vehicle:{ label:'Vehicle', value:'2019 Chevrolet Camaro · Red', meta:'Plate 8XKJ221 · Ohio · added Mar 4, 2023' },
    second:'Second vehicle on file: 2016 Honda Civic · Gray · Plate 2LMD884' },
  brooks: { account:'742', balance:'0.00', deposit:'1,610.00', name:'Hailey Brooks', meta:'Riverview Apartments · Unit 118 · Tenant since Aug 2024',
    fields:[ ['Lease Term','Aug 1, 2026 – Jul 31, 2027'], ['Rent','$1,610 monthly'], ['Balance','$0.00'], ['Phone','(513) 555-0198'], ['Email','h.brooks@example.com'], ['Parking Space','Unassigned'] ],
    vehicle:{ label:'Vehicle', value:'2021 Dodge Charger · Red', meta:'Plate 4TRM905 · Kentucky · added Aug 12, 2024' },
    second:'' },
  cho: { account:'883', balance:'340.00', deposit:'1,495.00', name:'Elena Cho', meta:'Riverview Apartments · Unit 204B · Tenant since Jan 2025',
    fields:[ ['Lease Term','Jan 1, 2026 – Dec 31, 2026'], ['Rent','$1,495 monthly'], ['Balance','$0.00'], ['Phone','(513) 555-0176'], ['Email','e.cho@example.com'], ['Parking Space','P-118 · surface lot'] ],
    vehicle:{ label:'Vehicle', value:'2020 Honda Civic · Red', meta:'Plate 6PLM230 · Ohio · added Jan 9, 2025' },
    second:'' },
};

const CATS = [
  { label:'Find Answers', hint:'I look this up in Rent Manager documentation and walk you through it.' },
  { label:'Analyze Data', hint:'I read your records across modules and consolidate what I find.' },
  { label:'Take Action', hint:'I read your records, then rank what needs attention and why, and I can act on it.' },
];

const DASHBOARDS = [
  { name:'My Leasing Dashboard', meta:'12 tiles · private to you' },
  { name:'Prospect Snapshot', meta:'8 tiles · shared with your team' },
  { name:'Lease Renewals', meta:'6 tiles · shared with your team' },
];

const ACTION_LABELS = {
  nextsteps:['Suggest next steps', false], tile:['Create a dashboard tile', false], list:['Show me the full list', false],
  article:['Open the article', true], browse:['Prompt Suggestions', false],
  post:['Post the charges', true], postbills:['Create the bills', true], held:['Why are 4 held back?', false],
  print:['Print a report', false], flagged:['Remove the 2 flagged tenants', false], cancel:['Do not post', false],
  summarize:['Summarize', false],
  post_credit:['Post the credits', true], log_violation:['Log the violation', true],
  apply_priorities:['Apply these priorities', true], send_drafts:['Send the drafts', true],
};

/* ============================================================
   State + rendering engine
   ============================================================ */
let state = { cat:0, messages:[], thinking:null, sheetOpen:false, dashSel:0, orionOpen:false, rootId:null };
let pendingTimer = null;
let lastRenderedMsgCount = 0;

function esc(s){ return (s==null?'':String(s)).replace(/[&<>]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
function toneClass(t){ return t===GREEN?'success':t===RED?'error':t===ORANGE?'caution':'status'; }

/* Scrolls so a given message sits at the top of the panel, instead of
   snapping to the bottom of the whole conversation — whatever follows it
   can then be read from its own first line without scrolling back up,
   however long it runs. Takes the anchor's message index directly
   (callers work out which message that should be — see
   render()/renderReportChatMessages() for the two different rules).
   Called on every render — not just ones that add a message — because
   render() rebuilds the whole message list from scratch each time
   (rebuilding .scroll-spacer at height 0 along with it), so anything that
   re-renders without also re-sizing the spacer (the "thinking…" indicator
   appearing, the prompt sheet opening) would collapse the scroll room the
   previous call set up and let the browser clamp scrollTop back down.
   `jump` (only true when a message was actually added) controls whether
   we additionally move scrollTop — every call still keeps the spacer
   correctly sized so that jump remains possible once it happens. Sizing
   is computed from the spacer's own current height rather than zeroing
   it first: zero-then-remeasure forces an intermediate layout with no
   scroll room at all, and the browser clamps scrollTop right then, before
   the real height is written back. */
/* mode 'top' pins the anchor's own top edge to the panel's top — used for
   a question, so its reply can be read from its first line however long
   it runs. mode 'reveal' does the smaller thing a button result needs:
   scroll only as much as it takes to bring the whole message into view
   (nothing at all if it's already visible), without shoving it up to the
   top of the panel. 'reveal' never needs the spacer — a row's own bottom
   can never sit past the end of the scrollable content it's part of, so
   there's no "not enough room" case the way there is for top-alignment. */
function scrollAnchorIntoView(body, idx, jump, mode){
  const spacer = body.querySelector('.scroll-spacer');
  if (idx === -1){
    if (spacer) spacer.style.height = '0px';
    if (jump) body.scrollTop = 0;
    return;
  }
  const row = body.querySelector(`[data-idx="${idx}"]`);
  if (!row) return;

  if (mode === 'reveal'){
    if (spacer) spacer.style.height = '0px';
    if (jump){
      const bodyRect = body.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      if (rowRect.bottom > bodyRect.bottom){
        body.scrollTop += Math.min(rowRect.bottom - bodyRect.bottom, Math.max(0, rowRect.top - bodyRect.top));
      } else if (rowRect.top < bodyRect.top){
        body.scrollTop += (rowRect.top - bodyRect.top);
      }
    }
    return;
  }

  const currentSpacerHeight = spacer ? spacer.offsetHeight : 0;
  const bodyRect = body.getBoundingClientRect();
  const rowRect = row.getBoundingClientRect();
  const rowContentTop = body.scrollTop + (rowRect.top - bodyRect.top);
  /* Height of everything from the anchor's own top down to the very end
     of the scrollable content (excluding the spacer's own contribution)
     — if that's shorter than the panel itself, scrolling the anchor to
     the top is physically impossible without the spacer padding out the
     difference. */
  const tailHeight = (body.scrollHeight - currentSpacerHeight) - rowContentTop;
  const needed = Math.max(0, body.clientHeight - tailHeight);
  if (spacer) spacer.style.height = needed + 'px';
  if (jump){
    const bodyRect2 = body.getBoundingClientRect();
    const rowRect2 = row.getBoundingClientRect();
    body.scrollTop += (rowRect2.top - bodyRect2.top);
    settleSpacer(body);
  }
}

/* The spacer is the room the answer types into, so it has to be sized for
   an answer that has not arrived yet — at the moment a reply is pushed its
   prose is still empty (typeOutContent blanks every text node before it
   types them back in) and its blocks are still fading in one at a time.
   The only safe assumption is a full panel, which is why it starts at
   roughly clientHeight.

   An answer that ends up SHORTER than the panel therefore finishes with
   the difference left over as blank space below it — the room it turned
   out not to need. That is the empty half-panel you see under a two-
   paragraph reply. Nothing can prevent it while the reply is still
   growing, because the question cannot sit at the top of the panel unless
   there is a panel's worth of scrollable room beneath it. It can only be
   given back afterwards.

   So: once the reply stops growing and stops typing, scroll down by
   whatever the answer did not use and drop the spacer. The conversation
   settles to the bottom of the panel the way a chat normally sits. The
   scroll is animated and the spacer is only removed once it lands, so the
   content glides rather than jumping. A long answer never reaches here
   with anything to give back — its spacer is already 0. */
const settleTimers = new WeakMap();
function settleSpacer(body){
  /* Both handles matter. The interval is the watcher; the timeout is the
     scheduled hand-back that fires 500ms after it decides to settle. A new
     question arriving in that gap would otherwise be pinned to the top and
     then immediately dragged back to the bottom by the previous answer's
     leftover timeout. */
  const prev = settleTimers.get(body);
  if (prev){ clearInterval(prev.poll); clearTimeout(prev.drop); }

  let lastContentH = -1, stableFor = 0, polls = 0;
  const timer = setInterval(() => {
    /* Look the spacer up every poll rather than holding a reference to it:
       render() rebuilds the whole message list, and the spacer with it, on
       every pass — a captured element goes stale the moment the thinking
       indicator appears or disappears, which silently killed this watcher
       before it ever got to settle anything. */
    const spacer = body.querySelector('.scroll-spacer');
    if (!spacer || ++polls > 60){ clearInterval(timer); return; }

    const spacerH = spacer.offsetHeight;
    const contentH = body.scrollHeight - spacerH;
    /* Still typing, or still fading blocks in one at a time. */
    if (body.querySelector('.mtype-cursor') || contentH !== lastContentH){
      lastContentH = contentH;
      stableFor = 0;
      return;
    }
    /* Blocks fade in up to 600ms apart (revealMessage's `step` is clamped
       there), so anything shorter than that reads a perfectly ordinary gap
       between two blocks as "the answer has finished" and hands the room
       back while the rest is still coming. Five polls is a full second. */
    if (++stableFor < 5) return;
    clearInterval(timer);

    if (spacerH < 24) return;
    const target = Math.max(0, contentH - body.clientHeight);
    if (target >= body.scrollTop){ spacer.style.height = '0px'; return; }

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    body.scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' });
    handles.drop = setTimeout(() => {
      const sp = body.querySelector('.scroll-spacer');
      if (sp) sp.style.height = '0px';
      /* Dropping the spacer cuts any smooth scroll still in flight short,
         which would leave the last line or two of the answer below the
         fold. Land it on the real bottom explicitly. */
      body.scrollTop = Math.max(0, body.scrollHeight - body.clientHeight);
    }, reduced ? 0 : 500);
  }, 200);
  const handles = { poll: timer, drop: null };
  settleTimers.set(body, handles);
}

/* Which message the main chat should keep pinned to the top. A new user
   question always takes over as the anchor — that covers every ask/
   routeQuestion/followUp/etc. flow, since each of those pushes its own
   chat bubble before thinkThen() pushes the reply. The other case is a
   bot-only card with no chat bubble of its own — Print a report, Excel,
   Summarize's "not built" cousins, a picker's "added to dashboard"
   confirmation — which pushStandalone() marks via forceNewAnchor so it
   takes over as the anchor too, rather than silently rendering below the
   fold under whatever question happened to be pinned before it. Anything
   pushed WITHOUT going through pushStandalone (i.e. a bot reply arriving
   after its own question's thinking delay) leaves the current anchor
   alone, which is what keeps that question pinned while its answer fills
   in underneath. */
let lastAnchorIdx = -1;
let lastAnchorMode = 'top';
let forceNewAnchor = false;
function pushStandalone(msgs){
  forceNewAnchor = true;
  push(msgs);
}
function updateAnchor(messages, fromIdx){
  let newUserIdx = -1;
  for (let i = fromIdx; i < messages.length; i++){
    if (messages[i].role === 'user') newUserIdx = i;
  }
  if (newUserIdx !== -1){
    lastAnchorIdx = newUserIdx;
    lastAnchorMode = 'top';
  } else if (forceNewAnchor){
    lastAnchorIdx = fromIdx;
    lastAnchorMode = 'reveal';
  }
  forceNewAnchor = false;
  return lastAnchorIdx;
}

function render(){
  const isHome = state.messages.length === 0;
  document.getElementById('orionGreet').hidden = !isHome;
  document.getElementById('orionComposer').hidden = isHome;
  const body = document.getElementById('orionBody');
  const wrap = document.getElementById('messagesWrap');
  const toReveal = [];
  state.messages.forEach((m,i) => { if (m.role === 'bot' && !m._shown) toReveal.push(i); });
  wrap.innerHTML = state.messages.map((m,i) => renderMessage(m, i, toReveal.indexOf(i) >= 0)).join('') + (state.thinking ? renderThinking() : '') + '<div class="scroll-spacer"></div>';
  toReveal.forEach(i => { state.messages[i]._shown = true; });
  /* Reveal (which un-hides each message's .rv blocks synchronously,
     before it starts the async per-character typing) has to run BEFORE
     the scroll math below — otherwise a freshly-added message's extra
     content (a print card, a table, steps) is still collapsed to zero
     height at measurement time, and 'reveal' mode comes up short on how
     far it needs to scroll to show all of it. */
  toReveal.forEach(i => revealMessage(i));
  const countChanged = state.messages.length !== lastRenderedMsgCount;
  const anchorIdx = countChanged ? updateAnchor(state.messages, lastRenderedMsgCount) : lastAnchorIdx;
  scrollAnchorIntoView(body, anchorIdx, countChanged, lastAnchorMode);
  lastRenderedMsgCount = state.messages.length;

  const sheet = document.getElementById('orionSheet');
  sheet.hidden = !state.sheetOpen;
  document.getElementById('browseBtn').classList.toggle('active', state.sheetOpen);

  const inlineMode = isHome && state.sheetOpen;
  sheet.classList.toggle('orion-sheet-inline', inlineMode);
  body.style.flex = inlineMode ? '0 0 auto' : '';

  /* Orion Assistant Overlay 2:1069 / 17:94 — on the opening screen the sheet
     does not float below the card, it takes the Browse link's own place
     inside it. So move the element rather than restyling two copies, and
     put it back under .orion-inner the moment the sheet closes or a
     conversation starts (where it floats over the message list instead). */
  const card = document.querySelector('.home-card');
  const link = document.querySelector('.browse-link');
  if (inlineMode){
    if (sheet.parentElement !== card) card.appendChild(sheet);
    sheet.classList.add('orion-sheet-in-card');
    if (link) link.hidden = true;
  } else {
    const inner = document.querySelector('.orion-inner');
    if (card && sheet.parentElement === card && inner)
      inner.insertBefore(sheet, document.getElementById('orionComposer'));
    sheet.classList.remove('orion-sheet-in-card');
    if (link) link.hidden = false;
  }

  if (state.sheetOpen){
    renderSheet();
    if (inlineMode){ sheet.style.bottom = ''; sheet.style.maxHeight = ''; }
    else positionSheet();
  }
}

/* Types the ENTIRE reply out — intro line, steps, bullets, a rich answer's
   headings and lists, all of it — not just the first line or two with
   everything after it fading in as whole blocks. The .rv-wrapped blocks
   are unhidden immediately (their own fade-in still plays), then
   typeOutContent reveals every block's text in reading order. Doesn't
   touch scroll — the caller (render) has already anchored the view to the
   top of the question this is answering. */
/* How long an answer takes to build itself out, once the thinking pause is
   over. Separate from ORION_PACE because they are different problems: the
   pause is anticipation, this is comprehension. Higher is slower. */
const ORION_REVEAL = 3;

/* How long the opening paragraph takes to type, whatever its length — capped
   rather than per-character so a long answer still finishes in about a
   second and a half instead of crawling. Named because revealMessage waits
   for it: the paragraph should be readable before the data starts landing
   under it, not race it. */
const TYPE_MS = 1500;

function revealMessage(idx){
  const row = document.querySelector(`.msg-row[data-idx="${idx}"]`);
  if (!row) return;
  const content = row.querySelector('.content');
  if (!content) return;

  const blocks = [...content.querySelectorAll('.rv')];
  const lead = content.querySelector(':scope > .text');
  const leadHasText = !!(lead && lead.textContent.trim());

  /* The opening paragraph types. Everything after it fades in, one piece at
     a time, in reading order — a stat, then the next stat, then the table.
     Only prose types: running a register through a character-by-character
     reveal reads as a gimmick, and it keeps a single cursor on screen. */
  if (leadHasText) typeOutContent(lead);

  if (!blocks.length) return;

  /* Spread the build-out over a target window rather than a fixed delay per
     block, so a two-part answer is not glacial and a twenty-row register
     does not take a minute. Clamped at both ends. */
  const step = Math.min(600, Math.max(140,
    Math.round((900 * ORION_REVEAL) / blocks.length)));

  let i = 0, typedRich = leadHasText;
  const next = () => {
    if (!content.isConnected) return;
    const el = blocks[i++];
    if (!el) return;
    el.hidden = false;
    el.classList.add('rv-in');
    /* An answer that is all rich HTML has no opening paragraph, so the rich
       block is what types instead. */
    if (!typedRich && el.querySelector('.mrich')) { typedRich = true; typeOutContent(el); }
    if (i < blocks.length) setTimeout(next, step);
  };
  setTimeout(next, leadHasText ? TYPE_MS + 200 : 0);
}

/* Walks every text node under `content` in reading order and reveals each
   a few characters at a time, so the whole answer reads as typed while
   its structure (lists, bold, headings) is already fully in place — only
   the text itself fills in. A real blinking-cursor element trails
   whichever node is currently filling, rather than a ::after pinned to
   one line. Material Symbols text is skipped: typing "check_ci…" a
   letter at a time renders as broken fallback text, not the glyph, until
   the full ligature string is back. Total typing time is capped rather
   than scaling per character, so a long rich answer still finishes in a
   couple of seconds instead of crawling. */
function typeOutContent(content){
  const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let n;
  while ((n = walker.nextNode())){
    if (!n.nodeValue.trim()) continue;
    if (n.parentElement && n.parentElement.closest('.rmx-icon')) continue;
    nodes.push({ node: n, full: n.nodeValue });
    n.nodeValue = '';
  }
  const totalChars = nodes.reduce((s, x) => s + x.full.length, 0);
  if (!totalChars) return;

  const cursor = document.createElement('span');
  cursor.className = 'mtype-cursor';
  const placeCursor = () => {
    const cur = nodes[ni];
    if (cur && cur.node.parentNode) cur.node.parentNode.insertBefore(cursor, cur.node.nextSibling);
  };

  const TICKS = Math.round(TYPE_MS / 16);
  const charsPerTick = Math.max(1, Math.ceil(totalChars / TICKS));
  let ni = 0, ci = 0;
  placeCursor();
  const timer = setInterval(() => {
    if (!content.isConnected){ clearInterval(timer); cursor.remove(); return; }
    if (ni >= nodes.length){ clearInterval(timer); cursor.remove(); return; }
    const cur = nodes[ni];
    ci = Math.min(cur.full.length, ci + charsPerTick);
    cur.node.nodeValue = cur.full.slice(0, ci);
    if (ci >= cur.full.length){
      ni++; ci = 0;
      if (ni < nodes.length) placeCursor(); else { clearInterval(timer); cursor.remove(); }
    }
  }, 16);
}

function submitHome(){
  const el = document.getElementById('homeInput');
  const q = (el.value||'').trim();
  if (!q) return;
  el.value = '';
  resetAsk('homeInput');
  routeQuestion(q);
}

/* Demoes the composer with a scripted walk through four real prompts —
   clicking the empty box types in the next one in sequence (typed, not
   dropped in, matching the same cadence used elsewhere for this kind of
   demo fill) and stops there; nothing is submitted, so the presenter
   decides when to send it. The sequence spans BOTH composers the demo
   passes through: homeInput (the fresh "Hi Charlie!" screen) for the first
   ask, then draftInput (the composer at the bottom of an ongoing
   conversation) for every follow-up after that one's been sent — so
   clicking into whichever box is on screen keeps advancing the same
   four-question walk. homeAutoFillIndex is intentionally never reset by
   newChat(), so returning to a fresh home screen mid-sequence still picks
   up where it left off rather than restarting at the first prompt. */
const HOME_AUTOFILL_SEQUENCE = ['q2', 'q3', 'q4', 'q5'];
let homeAutoFillIndex = 0;
function demoComposerAutoFill(elId){
  if (homeAutoFillIndex >= HOME_AUTOFILL_SEQUENCE.length) return;
  const el = document.getElementById(elId);
  if ((el.value || '').trim()) return;
  const text = PROMPTS[HOME_AUTOFILL_SEQUENCE[homeAutoFillIndex]].label;
  homeAutoFillIndex++;
  let i = 0;
  const typeNext = () => {
    if (!el.isConnected || !el.offsetParent) return;
    growAsk(el);
    i++;
    el.value = text.slice(0, i);
    if (i < text.length) setTimeout(typeNext, 18 + Math.random() * 34);
  };
  typeNext();
}

function renderThinking(){
  return `<div class="thinking-row">${orionMark(24)}<span class="txt">${esc(state.thinking)}</span>
    <span class="thinking-dots"><span></span><span></span><span></span></span></div>`;
}

/* Actions that are really follow-up QUESTIONS — "suggest next steps", "show
   me the full list" — belong at the end of the row, after the things you can
   do with the result. Print a report is an output, so it goes above them.
   Everything else keeps the order the answer declared, because a commit flow
   (post the charges, then cancel) reads in a deliberate sequence. */
const ORION_QUESTION_ACTIONS = ['nextsteps', 'list'];

function orderActions(keys) {
  const questions = keys.filter(k => ORION_QUESTION_ACTIONS.includes(k));
  const rest = keys.filter(k => !ORION_QUESTION_ACTIONS.includes(k));
  return rest.concat(questions);
}

function renderMessage(m, idx, animate){
  if (m.role === 'user') return `<div class="msg-row" data-idx="${idx}"><div class="msg-user">${esc(m.text)}</div></div>`;
  const p = m.src ? PROMPTS[m.src] : null;
  const rv = animate ? ' rv' : '', hid = animate ? ' hidden' : '';
  const wrapOne = html => animate ? `<div class="rv" hidden>${html}</div>` : html;
  let inner = `<div class="text">${esc(m.text)}</div>`;

  /* A fully-formatted answer (its own headings, numbered steps with
     sub-options, a closing note) that text/steps/bullets/note can't shape
     — revealed as one unit alongside the (empty, for these) .text typing
     pass rather than typed itself. */
  if (m.rich) inner += wrapOne(`<div class="mrich">${m.rich}</div>`);
  if (m.steps) inner += `<div class="mstep-list">${m.steps.map((s,i)=>`<div class="mstep${rv}"${hid}><span class="n">${i+1}</span><span class="t">${esc(s)}</span></div>`).join('')}</div>`;

  /* Order is deliberate: prose, then the data, then anything that
     qualifies the data, then what you can DO with it, and the follow-up
     questions last. Bullets, findings and the note used to be interleaved
     with the grids — a finding landing above the table it described — so
     they are grouped underneath now. */

  /* the data */
  if (m.stats) inner += `<div class="mstats">${m.stats.map(s=>`<div class="mstat${rv}"${hid}><div class="v">${esc(s[0])}</div><div class="l">${esc(s[1])}</div></div>`).join('')}</div>`;
  if (m.unitList) inner += wrapOne(renderUnitList());
  if (m.plan) inner += wrapOne(renderPlan(m.plan));
  if (m.table) inner += `<div class="mtable">${m.table.map(r=>`<div class="row${rv}"${hid}><span class="a">${esc(r[0])}</span><span class="b">${esc(r[1])}</span>${r.length>2?`<span class="rmx-lozenge rmx-lozenge--${toneClass(r[3])}" data-rmx-component="Lozenge">${esc(r[2])}</span>`:''}</div>`).join('')}</div>`;
  if (m.report) inner += wrapOne(renderReport(m.report));
  if (m.tenants) inner += wrapOne(renderTenants(m.tenants, idx, m.showAllMatches));
  if (m.record) inner += wrapOne(renderRecord(m.record));

  /* what qualifies it, underneath the grids */
  if (m.bullets) inner += `<div class="mbullet-list">${m.bullets.map(b=>`<div class="mbullet${rv}"${hid}><span class="dot"></span><span class="t">${esc(b)}</span></div>`).join('')}</div>`;
  if (m.findings) inner += `<div class="mfind-list">${m.findings.map(f=>`<div class="mfind${rv}"${hid}><svg class="rmx-icon"><use href="#check-circle"></use></svg><span class="t">${esc(f)}</span></div>`).join('')}</div>`;
  if (m.note){
    const hiddenMatches = m.tenants ? m.tenants.filter(t => t.match !== 'exact').length : 0;
    const toggle = hiddenMatches && !m.showAllMatches
      ? ` <a href="#" onclick="event.preventDefault(); toggleVehicleMatches(${idx})">Show ${hiddenMatches} partial match${hiddenMatches>1?'es':''}</a>`
      : hiddenMatches && m.showAllMatches
      ? ` <a href="#" onclick="event.preventDefault(); toggleVehicleMatches(${idx})">Hide partial matches</a>`
      : '';
    inner += wrapOne(`<div class="mnote"><svg class="rmx-icon"><use href="#info"></use></svg><span class="t">${esc(m.note)}${toggle}</span></div>`);
  }

  /* what you can do with it — Print a report sits above the follow-ups */
  if (m.article) inner += wrapOne(`<div class="marticle" onclick="act('article','${m.src||''}')"><span class="lab">Suggested Article</span><span class="t">${esc(m.article)}</span><svg class="rmx-icon"><use href="#open-in-new"></use></svg></div>`);
  if (m.tile) inner += wrapOne(renderTilePreview(p));
  if (m.picker) inner += wrapOne(renderPicker(m.src));
  if (m.reportLink) inner += wrapOne(`<a class="mlink" href="#" onclick="event.preventDefault(); openReport('${m.reportLink.id}')"><svg class="rmx-icon"><use href="#description"></use></svg><span class="lcol"><span class="t">${esc(m.reportLink.label)}</span><span class="h">${esc(m.reportLink.hint)}</span></span><svg class="rmx-icon"><use href="#open-in-new"></use></svg></a>`);
  if (m.link) inner += wrapOne(`<a class="mlink" href="#" onclick="onLinkClick(event)"><svg class="rmx-icon"><use href="#dashboard"></use></svg><span class="lcol"><span class="t">${esc(m.link.label)}</span><span class="h">${esc(m.link.hint)}</span></span><svg class="rmx-icon"><use href="#open-in-new"></use></svg></a>`);
  if (m.print) inner += wrapOne(renderPrint(m.print, m.src));
  if (m.actions && m.actions.length) inner += wrapOne(`<div class="mactions">${orderActions(m.actions).map(k=>{
    if (k === 'summarize') return `<button class="mact-btn orion-summarize" onclick="act('${k}','${m.src||''}')">${orionMark(16)}Summarize</button>`;
    /* Every action offered after a response is the Secondary button —
       one treatment, so the row reads as a set of choices rather than a
       ranked one. ACTION_LABELS' second field still marks which actions
       commit something; it no longer changes how they look. */
    const variant = 'secondary';
    return `<button class="mact-btn ${variant}" onclick="act('${k}','${m.src||''}')">${esc(ACTION_LABELS[k][0])}</button>`;
  }).join('')}</div>`);

  /* and the follow-up questions last */
  if (m.followups && m.followups.length) inner += wrapOne(renderFollowups(m.followups));

  return `<div class="msg-row" data-idx="${idx}"><div class="msg-bot"><div class="content">${inner}</div></div></div>`;
}

function renderUnitList(){
  const rows = UNITS.map(u => {
    const appStyle = u.apps===0 ? 'error' : 'success';
    const interestColor = u.interest===0 ? 'var(--text-error)' : u.interest<3 ? 'var(--icon-attention)' : 'var(--text-success)';
    const prospectTxt = u.prospects.length ? u.prospects.join(', ') : (u.matches ? `No interest logged · ${u.matches} preference matches` : 'No interest logged');
    return `<div style="padding:9px 12px;border-bottom:1px solid var(--register-hairline);">
      <div style="display:grid;grid-template-columns:1.35fr .7fr .85fr .85fr;gap:8px;align-items:center;font-size:13.5px;">
        <span style="color:var(--text-secondary)">${esc(u.unit)} · ${esc(u.property)}</span>
        <span style="font-size:12.5px;color:var(--text-primary)">${esc(u.vacant)}</span>
        <span><span class="rmx-lozenge rmx-lozenge--${appStyle}" data-rmx-component="Lozenge">${u.apps===0?'None':u.apps+' pending'}</span></span>
        <span style="text-align:right;font-size:13px;font-weight:600;color:${interestColor}">${u.interest===0?'0 interested':u.interest+' interested'}</span>
      </div>
      <div style="font-size:12px;line-height:17px;color:${u.prospects.length?'var(--text-primary)':'var(--text-disabled)'};${u.prospects.length?'':'font-style:italic;'}margin-top:2px;">${esc(prospectTxt)}</div>
    </div>`;
  }).join('');
  return `<div class="mtile-preview">
    <div class="thead"><span>Unit</span><span>Vacant</span><span>Applications</span><span style="text-align:right">Interest</span></div>
    ${rows}
    <div class="tfoot"><span>14 units · 9 applications</span><span>23 interested prospects</span></div>
  </div>`;
}

function renderPlan(plan){
  return `<div class="mplan">
    <div class="ph"><svg class="rmx-icon"><use href="#list"></use></svg><span class="t">${esc(plan.title)}</span><span class="badge">Not posted</span></div>
    ${plan.rows.map(r=>`<div class="prow"><span class="l">${esc(r[0])}</span><span class="v">${esc(r[1])}</span></div>`).join('')}
    ${plan.warn ? `<div class="warn"><svg class="rmx-icon"><use href="#warning"></use></svg><span class="t">${esc(plan.warn)}</span></div>` : ''}
  </div>`;
}

function renderReport(report){
  const rows = report.rows.map(r => {
    if (r.kind === 'head') return `<div class="rrow head"><span>${esc(r.a).toUpperCase()}</span><span></span><span></span><span></span></div>`;
    const cls = r.kind === 'total' ? 'rrow total' : 'rrow';
    const dirCls = r.dir === 'up' ? 'dir-up' : r.dir === 'bad' ? 'dir-bad' : 'dir-flat';
    return `<div class="${cls}"><span style="color:var(--text-secondary)">${esc(r.a)}</span><span>${esc(r.b)}</span><span>${esc(r.c)}</span><span class="${dirCls}">${esc(r.d)}</span></div>`;
  }).join('');
  return `<div class="mreport">
    <div class="rh"><span class="t">${esc(report.title)}</span><svg class="rmx-icon"><use href="#open-in-new"></use></svg></div>
    <div class="cols"><span></span>${report.cols.map(c=>`<span>${esc(c)}</span>`).join('')}</div>
    ${rows}
  </div>`;
}

function renderTenants(tenants, idx, showAll){
  const visible = showAll ? tenants : tenants.filter(t => t.match === 'exact');
  return `<div class="mtenants">${visible.map(t=>`
    <div class="mtenant-row" onclick="openTenant('${t.id}')">
      <svg class="rmx-icon person"><use href="#person"></use></svg>
      <div class="tmeta"><span class="name">${esc(t.name)}</span><span class="unit">${esc(t.unit)}</span><span class="veh">${esc(t.vehicle)}</span></div>
      <span class="rmx-lozenge rmx-lozenge--${t.match==='exact'?'success':'neutral'}" data-rmx-component="Lozenge">${t.match==='exact'?'Exact match':'Red, not a Camaro'}</span>
      <svg class="rmx-icon chevron"><use href="#chevron-right"></use></svg>
    </div>`).join('')}</div>`;
}
function toggleVehicleMatches(idx){
  state.messages[idx].showAllMatches = !state.messages[idx].showAllMatches;
  render();
}

function renderRecord(r){
  return `<div class="mrecord">
    <div class="rh2"><svg class="rmx-icon person"><use href="#person"></use></svg>
      <div class="rname"><span class="n">${esc(r.name)}</span><span class="m">${esc(r.meta)}</span></div>
      <svg class="rmx-icon open" onclick="openTenantPage('${r._id}')" title="Open full record"><use href="#open-in-new"></use></svg>
    </div>
    <div class="rbody">
      <div class="vehicle-box"><span class="vl">${esc(r.vehicle.label)}</span><span class="vv">${esc(r.vehicle.value)}</span><span class="vm">${esc(r.vehicle.meta)}</span></div>
      <div class="rfields">${r.fields.map(f=>`<div class="f"><span class="l">${esc(f[0])}</span><span class="v">${esc(f[1])}</span></div>`).join('')}</div>
      ${r.second ? `<div class="second"><svg class="rmx-icon"><use href="#search"></use></svg><span class="t">${esc(r.second)}</span></div>` : ''}
    </div>
  </div>`;
}

function renderFollowups(keys){
  const items = keys.filter(k=>FOLLOWUPS[k]);
  if (!items.length) return '';
  return `<div class="mfollow"><div class="mfollow-label">Ask about this result</div><div class="mfollow-wrap">
    ${items.map(k=>`<button class="follow-chip" onclick="followUp('${k}')"><span class="fl">${esc(FOLLOWUPS[k].q)}</span><svg class="rmx-icon chev"><use href="#chevron-right"></use></svg></button>`).join('')}
  </div></div>`;
}

function renderPrint(print, id){
  return `<div class="mprint">
    <div class="pph"><svg class="rmx-icon"><use href="#print"></use></svg><span class="t">${esc(print.name)}</span><span class="pages">${esc(print.pages)}</span></div>
    ${print.params.map(p=>`<div class="pprow"><span class="l">${esc(p[0])}</span><span class="v">${esc(p[1])}</span></div>`).join('')}
    <div class="pfoot">
      <button class="mact-btn primary" onclick="output('Print','${id||''}')"><svg class="rmx-icon rmx-icon--16" style="vertical-align:-3px"><use href="#print"></use></svg> Print</button>
      <button class="mact-btn secondary" onclick="output('PDF','${id||''}')"><svg class="rmx-icon rmx-icon--16" style="vertical-align:-3px"><use href="#description"></use></svg> PDF</button>
      <button class="mact-btn secondary" onclick="output('Excel','${id||''}')"><svg class="rmx-icon rmx-icon--16" style="vertical-align:-3px"><use href="#grid-view"></use></svg> Excel</button>
    </div>
  </div>`;
}

function renderTilePreview(p){
  if (!p) return '';
  const head = p.tileHead || ['Record','Detail','Value'];
  return `<div class="mtile-preview">
    <div class="th2"><strong>${esc(p.tileName)}</strong><span style="display:flex;gap:10px;"><svg class="rmx-icon" style="color:var(--text-link);width:18px;height:18px"><use href="#refresh"></use></svg><svg class="rmx-icon" style="color:var(--text-primary);width:18px;height:18px"><use href="#more-vert"></use></svg></span></div>
    ${p.tileNote ? `<div class="tnote">${esc(p.tileNote)}</div>` : ''}
    <div class="thead"><span>${esc(head[0])}</span><span>${esc(head[1])}</span><span style="text-align:right">${esc(head[2])}</span></div>
    ${(p.tileRows||[]).map(r=>`<div class="trow"><span style="color:var(--text-secondary)">${esc(r[0])}</span><span class="b">${esc(r[1])}</span><span class="rmx-lozenge rmx-lozenge--${toneClass(r[3])}" data-rmx-component="Lozenge">${esc(r[2])}</span></div>`).join('')}
    <div class="tfoot"><span>${esc(p.tileFooter||'')}</span><span style="color:var(--text-link)">View All</span></div>
  </div>`;
}

function renderPicker(srcId){
  return `<div class="mpicker"><span class="pt">Which dashboard should it go on?</span>
    <div style="display:flex;flex-direction:column;gap:6px;">
      ${DASHBOARDS.map((d,i)=>`<div class="dash-opt ${state.dashSel===i?'sel':''}" onclick="selectDash(${i})"><span class="radio"></span><div><div class="dname">${esc(d.name)}</div><div class="dmeta">${esc(d.meta)}</div></div></div>`).join('')}
    </div>
    <button class="mact-btn primary" style="align-self:flex-start;" onclick="addTile('${srcId}')">Add to Dashboard</button>
  </div>`;
}

function selectDash(i){ state.dashSel = i; render(); }

/* ============================================================
   Interaction logic — ported 1:1 from the design's Component class
   ============================================================ */
function push(msgs){ state.messages = state.messages.concat(msgs); render(); }

function botMsg(id){
  const p = PROMPTS[id];
  return { role:'bot', src:id, text:p.text, rich:p.rich, steps:p.steps, stats:p.stats, findings:p.findings,
    bullets:p.bullets, table:p.table, report:p.report, tenants:p.tenants, plan:p.plan,
    unitList:p.unitList, article:p.article, note:p.note, followups:p.followups, actions:p.actions };
}

function matchPrompt(q){
  const words = (q.toLowerCase().match(/[a-z&]{3,}/g)) || [];
  let best = null, bestScore = 1;
  Object.keys(PROMPTS).forEach(id => {
    const hay = (PROMPTS[id].label + ' ' + (PROMPTS[id].kw||'')).toLowerCase();
    const score = words.filter(w => hay.includes(w)).length;
    if (score > bestScore) { bestScore = score; best = id; }
  });
  return best;
}

/* How long Orion "thinks" before answering, as a multiplier on every call
   site below. One knob rather than fifteen numbers, so the pace can be tuned
   for a room without hunting through the file — and because the relative
   rhythm matters: a summary should still land faster than a posted batch.
   1 is the original pace; higher is slower. At 1.6 the standard beat is
   ~1.5s. How fast the ANSWER then builds is ORION_REVEAL, separately. */
const ORION_PACE = 1.6;

function thinkThen(text, fn, delay){
  state.thinking = text; render();
  clearTimeout(pendingTimer);
  pendingTimer = setTimeout(()=>{ state.thinking = null; fn(); }, (delay || 900) * ORION_PACE);
}

function ask(id){
  const p = PROMPTS[id];
  state.sheetOpen = false;
  if (state.messages.length === 0) state.rootId = id;
  push([{ role:'user', text:p.label }]);
  thinkThen(p.cat===0 ? 'Searching Express Help' : 'Reading your data', ()=>push([botMsg(id)]), 900);
}

function submitDraft(){
  const el = document.getElementById('draftInput');
  const q = (el.value||'').trim();
  if (!q) return;
  el.value = '';
  resetAsk('draftInput');
  routeQuestion(q);
}

function routeQuestion(q){
  const id = matchPrompt(q);
  const isFirst = state.messages.length === 0;
  state.sheetOpen = false;
  if (id){
    const p = PROMPTS[id];
    if (isFirst) state.rootId = id;
    push([{ role:'user', text:q }]);
    thinkThen(p.cat===0 ? 'Searching Express Help' : 'Reading your data', ()=>push([botMsg(id)]), 900);
    return;
  }
  push([{ role:'user', text:q }]);
  thinkThen('Searching Express Help', ()=>push([{ role:'bot', text:'I could not find a confident answer for that yet. Try rephrasing with a module name, or open Prompt Suggestions for a close match.', actions:['browse'] }]), 900);
}

function followUp(key){
  const f = FOLLOWUPS[key];
  if (!f) return;
  state.sheetOpen = false;
  push([{ role:'user', text:f.q }]);
  thinkThen('Reading the detail behind that', ()=>push([{ role:'bot', text:f.text, bullets:f.bullets, table:f.table, findings:f.findings, stats:f.stats, note:f.note, followups:f.followups }]), 800);
}

function openTenant(tid){
  const r = TENANT_RECORDS[tid];
  if (!r) return;
  push([{ role:'user', text:'Open ' + r.name + '.' }]);
  clearTimeout(pendingTimer);
  pendingTimer = setTimeout(()=>{
    push([{ role:'bot', text: r.name + ' — the vehicle on file is highlighted below.', record: Object.assign({_id:tid}, r), followups:['veh_parking','veh_missing'] }]);
  }, 500);
}

function act(key, id){
  const p = PROMPTS[id];
  if (key === 'article'){ pushStandalone([{ role:'bot', text:'Opening ' + p.article + ' in a new tab. The steps above are the short version.', article:p.article }]); return; }
  if (key === 'browse'){ state.sheetOpen = true; render(); return; }
  if (key === 'summarize'){
    push([{ role:'user', text:'Summarize this.' }]);
    thinkThen('Summarizing', ()=>push([{ role:'bot', text: p.summary || p.text }]), 600);
    return;
  }
  if (key === 'flagged'){
    push([{ role:'user', text:'Remove the two flagged tenants from the batch.' },
      { role:'bot', src:id, text:'Removed. The batch is now 146 tenants at $25.00 each, $3,650.00 total. Sam Ortega and Anh Nguyen are excluded and I noted the lease clause on both records.', actions:['post','cancel'] }]);
    return;
  }
  if (key === 'cancel'){ pushStandalone([{ role:'bot', text:'Nothing was posted. The batch is staged — tell me what to change and I will restage it, or ask me to discard it.', actions:['browse'] }]); return; }
  if (key === 'print'){
    /* The page count is the real one — the report is laid out here, not guessed. */
    const m = rptMeta(id);
    const count = rptPageCount(id);
    pushStandalone([{ role:'bot', src:id, text:'I can format this result as a report. Here is what it will contain.',
      print:{ name: m.name, pages: count + (count === 1 ? ' page' : ' pages'), params: m.params } }]);
    return;
  }
  if (key === 'held'){
    push([{ role:'user', text:'What is holding back the other 4?' },
      { role:'bot', src:id, text:'Four issues have no cost recorded, so a bill would post at $0. Two more are over the owner approval threshold.',
        table:[ ['4318 · Hawthorne 1108','HVAC · Summit HVAC · no invoice','$0',RED], ['4327 · Riverview 512','Plumbing · in-house · no labor logged','$0',RED], ['4290 · Hawthorne 902','Roof · over $2,500, no approval','$3,140',ORANGE], ['4291 · Hawthorne 410','Roof · over $2,500, no approval','$2,780',ORANGE] ],
        note:'Enter the vendor invoices and log owner approval, then ask me again and I will restage those four.', actions:['postbills','cancel'] }]);
    return;
  }
  if (key === 'postbills'){
    push([{ role:'user', text:'Create the bills.' }]);
    thinkThen('Creating owner bills', ()=>{ const d = p.posted; push([{ role:'bot', src:id, text:d.text, stats:d.stats, table:d.table, note:d.note }]); }, 1100);
    return;
  }
  if (key === 'post'){
    push([{ role:'user', text:'Post the charges.' }]);
    thinkThen('Posting the batch', ()=>{ const d = p.posted; push([{ role:'bot', src:id, text:d.text, stats:d.stats, table:d.table, note:d.note, actions:['print'] }]); }, 1000);
    return;
  }
  if (key === 'post_credit'){
    push([{ role:'user', text:'Post the credits.' }]);
    thinkThen('Posting the batch', ()=>{ const d = p.posted; push([{ role:'bot', src:id, text:d.text, stats:d.stats, table:d.table, note:d.note, actions:['print'] }]); }, 1000);
    return;
  }
  if (key === 'log_violation'){
    push([{ role:'user', text:'Log the violation.' }]);
    thinkThen('Logging the violation', ()=>{ const d = p.posted; push([{ role:'bot', src:id, text:d.text, stats:d.stats, table:d.table, note:d.note }]); }, 800);
    return;
  }
  if (key === 'apply_priorities'){
    push([{ role:'user', text:'Apply these priorities.' }]);
    thinkThen('Updating priorities', ()=>{ const d = p.posted; push([{ role:'bot', src:id, text:d.text, stats:d.stats, table:d.table, note:d.note }]); }, 900);
    return;
  }
  if (key === 'send_drafts'){
    push([{ role:'user', text:'Send the drafts.' }]);
    thinkThen('Sending the emails', ()=>{ const d = p.posted; push([{ role:'bot', src:id, text:d.text, stats:d.stats, table:d.table, note:d.note }]); }, 900);
    return;
  }
  if (key === 'nextsteps'){
    push([{ role:'user', text:'What do you suggest I do next?' }]);
    thinkThen('Ranking what needs attention', ()=>{
      push([{ role:'bot', src:id, text:'Here is the order I would work it, with the reason for each.',
        steps: p.nextSteps.map(n => n[0] + ' — ' + n[1]),
        note:'I can organize and track this. Writing or sending messages is not available yet, so these are yours to act on.', actions:['list'] }]);
    }, 800);
    return;
  }
  if (key === 'list'){
    if (p.unitList){ pushStandalone([{ role:'bot', src:id, text:'All 14 units vacating in the next 30 days, ordered from least interest to most so the exposure is at the top.', unitList:true, actions:['tile'] }]); return; }
    pushStandalone([{ role:'bot', src:id, text:'The full list, ordered the same way:', table:p.table || p.tileRows, actions:['tile'] }]);
    return;
  }
  if (key === 'tile'){
    push([{ role:'user', text:'Create a dashboard tile so I can keep an eye on this.' }]);
    thinkThen('Building the tile', ()=>{ push([{ role:'bot', src:id, text:'I built the ' + p.tileName + ' tile. It reads live from the same records, so it stays current.', tile:true, picker:true }]); }, 800);
  }
}

function addTile(id){
  const p = PROMPTS[id];
  const dash = DASHBOARDS[state.dashSel];

  /* The tile is recorded, then rendered. Recording it separately is what
     lets it survive the trip to another screen — Orion can be asked to
     build a tile from anywhere, but the column that shows it only exists
     on My Workspace, so the tile has to outlive this page. */
  const tiles = loadOrionTiles();
  tiles.push({ id: id, dashboard: dash.name });
  saveOrionTiles(tiles);
  renderOrionTiles();

  pushStandalone([{ role:'bot', text: p.tileName + ' was added to ' + dash.name + '. It refreshes each morning at 6:00 AM, and you can move or resize it from the dashboard.',
    link:{ label:'Open ' + dash.name, hint:'View the tile and work through your next steps there' },
    note:'Want it tracked differently? Tell me what to change and I will rebuild the tile.', actions:['browse'] }]);
}

const ORION_TILE_STORE = 'rmx-orion-tiles';
function loadOrionTiles(){
  try { return JSON.parse(sessionStorage.getItem(ORION_TILE_STORE) || '[]'); } catch (e) { return []; }
}
function saveOrionTiles(tiles){
  try { sessionStorage.setItem(ORION_TILE_STORE, JSON.stringify(tiles)); } catch (e) {}
}

/* Renders every tile Orion has built this session into the My Workspace
   column. A no-op on screens that do not have that column. */
function renderOrionTiles(){
  const col = document.getElementById('orionTilesCol');
  const body = document.getElementById('orionTilesBody');
  if (!col || !body) return;
  const tiles = loadOrionTiles();
  col.style.display = tiles.length ? 'flex' : 'none';
  body.innerHTML = tiles.map(t => orionTileCardHtml(t.id)).join('');
}

function orionTileCardHtml(id){
  const p = PROMPTS[id];
  if (!p) return '';
  const head = p.tileHead || ['Record','Detail','Value'];
  return `<div class="orion-tile-card">
    <div class="oth"><strong>${esc(p.tileName)}</strong><svg class="rmx-icon rmx-icon--16" style="color:var(--text-link)"><use href="#refresh"></use></svg></div>
    ${p.tileNote ? `<div class="otnote">${esc(p.tileNote)}</div>` : ''}
    <div class="othead"><span>${esc(head[0])}</span><span>${esc(head[1])}</span><span style="text-align:right">${esc(head[2])}</span></div>
    ${(p.tileRows||[]).slice(0,3).map(r=>`<div class="otrow"><span>${esc(r[0])}</span><span style="color:var(--text-primary);font-size:12px;">${esc(r[1])}</span><span class="rmx-lozenge rmx-lozenge--${toneClass(r[3])}" data-rmx-component="Lozenge">${esc(r[2])}</span></div>`).join('')}
    <div class="otfoot"><span>${esc(p.tileFooter||'')}</span><span class="rmx-text--link">View All</span></div>
  </div>`;
}


/* q1 has a hand-built page; everything else is laid out by the generic
   builder in the report block below. */
const PRINT_REPORTS = { q1: buildOccupancySummaryReport, q5: buildProfitLossReport };

/* Excel stays a message — a spreadsheet is not a document the viewer can show.
   Print goes straight to the print overlay, the same way a browser's own
   Print command does not stop to "build" anything first. PDF still builds
   the report and opens it in the report viewer. */
function output(fmt, id){
  if (fmt === 'Excel'){
    pushStandalone([{ role:'bot', text:'Exported to Excel with one row per record.',
      note:'Report parameters are saved, so you can re-run this from My Reports without asking me again.' }]);
    return;
  }
  if (fmt === 'Print'){ openPrintOverlay(id); return; }
  const m = rptMeta(id);
  const count = rptPageCount(id);
  const pageTxt = count + (count === 1 ? ' page' : ' pages');
  push([{ role:'user', text:'Generate it as a PDF.' }]);
  thinkThen('Building ' + m.name, () => {
    push([{ role:'bot', src:id,
      text: 'Built. ' + m.name + ' came out at ' + pageTxt + '. Opening it in the report viewer.',
      reportLink:{ id: id, label:'Open ' + m.name, hint: pageTxt },
      note:'Report parameters are saved, so you can re-run this from My Reports without asking me again.' }]);
    setTimeout(() => openReport(id), 900 * ORION_PACE);
  }, 1200);
}

/* ---------- Print overlay ----------
   A recreation of the OS print dialog rather than a call to window.print() —
   it opens over the app the same instant a real Print command would, no
   "building" delay, showing the same .rpt-page documents the report viewer
   uses. Destination/Pages/Layout are decorative and silent, Cancel just
   closes it, and Save drops a confirmation into the conversation the way
   finishing a real print or export would. */
function openPrintOverlay(id){
  const pages = rptPages(id);
  document.getElementById('poPages').innerHTML = pages.join('');
  document.getElementById('poCount').textContent = pages.length + (pages.length === 1 ? ' page' : ' pages');
  document.getElementById('poMoreFields').hidden = true;
  setIconGlyph('poMoreChev', 'keyboard-arrow-down');
  document.getElementById('printOverlay').hidden = false;
  const scroller = document.getElementById('poScroll');
  scroller.scrollTop = 0;
  document.getElementById('poPageBadge').textContent = '1';
  poFitPages();
}

function closePrintOverlay(){ document.getElementById('printOverlay').hidden = true; }

/* Pages are laid out at their real letter size (816px) — scale the whole
   stack down to whatever the preview pane actually has room for. */
function poFitPages(){
  const pane = document.querySelector('#printOverlay .po-preview');
  const stack = document.getElementById('poPages');
  if (!pane || !stack) return;
  const scale = Math.min(1, (pane.clientWidth - 64) / 816);
  stack.style.transform = `scale(${scale})`;
}

function poOnScroll(){
  const scroller = document.getElementById('poScroll');
  if (!scroller) return;
  const mark = scroller.getBoundingClientRect().top + 40;
  let n = 1;
  document.querySelectorAll('#poPages .rpt-page').forEach(p => {
    if (p.getBoundingClientRect().top <= mark) n = Number(p.dataset.rptPage) || n;
  });
  document.getElementById('poPageBadge').textContent = n;
}

function poToggleMore(){
  const fields = document.getElementById('poMoreFields');
  fields.hidden = !fields.hidden;
  setIconGlyph('poMoreChev', fields.hidden ? 'keyboard-arrow-down' : 'keyboard-arrow-up');
}


function poSave(){
  closePrintOverlay();
  pushStandalone([{ role:'bot', text:'Saved as a PDF.',
    note:'Report parameters are saved, so you can re-run this from My Reports without asking me again.' }]);
}

window.addEventListener('resize', () => { if (!document.getElementById('printOverlay').hidden) poFitPages(); });

function reportCell(content, opts){
  opts = opts || {};
  const cls = ['rpt-cell']; if (opts.amount) cls.push('amount'); if (opts.first) cls.push('first'); if (opts.summary) cls.push('summary');
  const style = opts.indent ? ` style="padding-left:${opts.indent}px"` : '';
  return `<div class="${cls.join(' ')}"${style}>${esc(content)}</div>`;
}

function buildOccupancySummaryReport(){
  const p = PROMPTS.q1;
  const rows = p.table.map(r => {
    const name = r[0];
    const m = r[1].match(/([\d.]+)%\s*·\s*(\d+)\s*of\s*(\d+)/);
    const pct = m[1] + '%', occ = +m[2], total = +m[3], vac = total - occ;
    return { name, pct, occ, total, vac };
  });
  const totalUnits = rows.reduce((s,r)=>s+r.total,0);
  const totalOcc = rows.reduce((s,r)=>s+r.occ,0);
  const totalVac = rows.reduce((s,r)=>s+r.vac,0);
  const totalPct = p.stats[0][0];
  const overThirty = +p.stats[2][0];
  const underThirty = totalVac - overThirty;

  const tableRows = rows.map(r => `<div class="rpt-row">
    ${reportCell(r.name, {first:true})}
    ${reportCell(r.total, {amount:true})}
    ${reportCell(r.occ, {amount:true})}
    ${reportCell(r.vac, {amount:true})}
    ${reportCell(r.pct, {amount:true})}
  </div>`).join('');

  return `
    <div class="rpt-page">
      <div class="rpt-header">
        <div class="rpt-title-row">
          <span class="rpt-title">${esc(p.reportName)}</span>
          <span class="rpt-daterange">As of Aug 28, 2026</span>
        </div>
        <div class="rpt-options">${esc(p.reportSource)} — 10 properties selected · class60</div>
      </div>

      <div class="rpt-body">
        <div class="rpt-section">
          <div class="rpt-section-label"><span class="lbl">Occupancy by Property</span></div>
          <div class="rpt-row rpt-headrow">
            ${reportCell('Property')}
            ${reportCell('Units', {amount:true})}
            ${reportCell('Occupied', {amount:true})}
            ${reportCell('Vacant', {amount:true})}
            ${reportCell('Occupancy', {amount:true})}
          </div>
          ${tableRows}
          <div class="rpt-row rpt-total">
            ${reportCell('Portfolio Total', {first:true, total:true})}
            ${reportCell(totalUnits, {amount:true, summary:true})}
            ${reportCell(totalOcc, {amount:true, summary:true})}
            ${reportCell(totalVac, {amount:true, summary:true})}
            ${reportCell(totalPct, {amount:true, summary:true, total:true})}
          </div>
        </div>

        <div class="rpt-component">
          <div class="rpt-component-label"><span class="lbl">Vacancy Aging</span></div>
          <div class="rpt-crow"><span class="k">Vacant 30 days or fewer</span><span class="v">${underThirty}</span></div>
          <div class="rpt-crow"><span class="k">Vacant over 30 days</span><span class="v">${overThirty}</span></div>
          <div class="rpt-crow rpt-csum"><span class="k">Total vacant units</span><span class="v">${totalVac}</span></div>
        </div>
      </div>

      <div class="rpt-footer">
        <div class="rpt-foot-left">
          <svg class="rmx-icon rpt-foot-ico"><use href="#properties"></use></svg>
          <span>RentManager.com</span><span>08/28/26</span><span>7:14 AM</span>
        </div>
        <div class="rpt-foot-page">1 of 1</div>
      </div>
    </div>`;
}

/* Profit & Loss — a real GL statement (account numbers, nested groups,
   indented children, bold subtotals) rather than the 4-line category
   comparison the chat shows. Modeled directly on a real Rent Manager P&L
   printout: plain italic scope line (no shaded band, unlike the
   Occupancy Summary's Report Options bar), two indent levels, and
   subtotals in bold black — blue is reserved for section bands only. */
const PL_GRID = '1fr 120px 120px 90px';
function plFmt(n){ return n.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 }); }

function plRow(label, indent, cur, prior){
  const cells = [reportCell(label, { first:true, indent })];
  if (cur === undefined){
    cells.push(reportCell('', { amount:true }), reportCell('', { amount:true }), reportCell('', { amount:true }));
  } else {
    cells.push(reportCell(plFmt(cur), { amount:true }), reportCell(plFmt(prior), { amount:true }), reportCell(plFmt(cur + prior), { amount:true }));
  }
  return `<div class="rpt-row" style="grid-template-columns:${PL_GRID}">${cells.join('')}</div>`;
}
function plSubtotal(label, indent, cur, prior, grand){
  const cells = [reportCell(label, { first:true, indent })];
  cells.push(reportCell(plFmt(cur), { amount:true }), reportCell(plFmt(prior), { amount:true }), reportCell(plFmt(cur + prior), { amount:true }));
  return `<div class="rpt-row rpt-pl-subtotal${grand ? ' rpt-pl-grand' : ''}" style="grid-template-columns:${PL_GRID}">${cells.join('')}</div>`;
}
function plGap(){ return `<div style="height:10px"></div>`; }

function buildProfitLossReport(){
  const income = [
    ['4000', 'Management Fee Income', 42000, 39500],
    ['4001', 'Tenant Insurance Commission', 15000, 13000],
    ['4002', 'Forfeited Security Deposits', 7200, 5400],
    ['4003', 'Damages Retained', 3900, 3200],
    ['4004', 'Laundry Income', 2850, 2600],
    ['4005', 'Application Fees', 2100, 1750],
    ['4006', 'Late Fees', 6400, 5900],
    ['4007', 'Utility Reimbursement', 1200, 980],
    ['4008', 'NSF Fees', 1250, 980],
    ['4009', 'Interest Income', 310, 260],
    ['4010', 'Miscellaneous Other Income', 14210, 14580],
  ];
  const otherIncomeTotal = [income.reduce((s,r)=>s+r[2],0), income.reduce((s,r)=>s+r[3],0)];

  const rental = [
    ['4101', 'Rental Income', 1285500, 1208100],
    ['4102', 'Pet Fees', 9240, 8100],
    ['4103', 'Storage Fees', 6850, 6200],
    ['4104', 'Garage', 5400, 4980],
    ['4105', 'Association Dues', 3200, 2900],
    ['4110', 'Lot Rent', 2100, 1960],
    ['4117', 'Vacancy Loss', -18400, -16200],
    ['4118', 'Loss to Lease', -9580, -7100],
  ];
  const rentalTotal = [rental.reduce((s,r)=>s+r[2],0), rental.reduce((s,r)=>s+r[3],0)];
  const totalIncome = [rentalTotal[0] + otherIncomeTotal[0], rentalTotal[1] + otherIncomeTotal[1]];

  const rm = [
    ['5010', 'HVAC Repairs', 68400, 52900],
    ['5020', 'Plumbing Repairs', 54200, 44800],
    ['5030', 'Electrical Repairs', 31900, 26700],
    ['5040', 'General Repairs & Supplies', 60380, 51820],
  ];
  const rmTotal = [rm.reduce((s,r)=>s+r[2],0), rm.reduce((s,r)=>s+r[3],0)];

  const payroll = [
    ['5110', 'Salaries & Wages', 152600, 148900],
    ['5120', 'Payroll Taxes', 24800, 23700],
    ['5130', 'Benefits', 11000, 10300],
  ];
  const payrollTotal = [payroll.reduce((s,r)=>s+r[2],0), payroll.reduce((s,r)=>s+r[3],0)];

  const util = [
    ['5210', 'Electric', 58700, 62900],
    ['5220', 'Water & Sewer', 29800, 31200],
    ['5230', 'Gas', 7640, 7500],
  ];
  const utilTotal = [util.reduce((s,r)=>s+r[2],0), util.reduce((s,r)=>s+r[3],0)];

  const turnover = [
    ['5310', 'Make-Ready Labor', 41200, 31800],
    ['5320', 'Flooring & Paint', 24900, 19600],
    ['5330', 'Cleaning', 8210, 7540],
  ];
  const turnoverTotal = [turnover.reduce((s,r)=>s+r[2],0), turnover.reduce((s,r)=>s+r[3],0)];

  const totalExpenses = [rmTotal[0] + payrollTotal[0] + utilTotal[0] + turnoverTotal[0],
                          rmTotal[1] + payrollTotal[1] + utilTotal[1] + turnoverTotal[1]];
  const noi = [totalIncome[0] - totalExpenses[0], totalIncome[1] - totalExpenses[1]];

  const acctRows = (list, indent) => list.map(r => plRow(r[0] + ' ' + r[1], indent, r[2], r[3])).join('');
  const headRow = `<div class="rpt-row rpt-headrow" style="grid-template-columns:${PL_GRID}">
    ${reportCell('')}
    ${reportCell('2026', { amount:true })}
    ${reportCell('2025', { amount:true })}
    ${reportCell('Total', { amount:true })}
  </div>`;

  /* Two pages, not one crammed sheet — a real GL-level P&L runs long
     enough that a real one prints multiple sheets too (see the Reports
     Guide reference: five pages for a much longer recap). */
  const page = (bodyHtml, n, total) => `
    <div class="rpt-page">
      <div class="rpt-header">
        <div class="rpt-title-row">
          <span class="rpt-title">Profit &amp; Loss Statement</span>
          <span class="rpt-daterange">Yearly recap from 2025 to 2026</span>
        </div>
        <div class="rpt-subtitle">Accrual Basis | All Properties</div>
      </div>
      <div class="rpt-body"><div class="rpt-section">${bodyHtml}</div></div>
      <div class="rpt-footer">
        <div class="rpt-foot-left">
          <svg class="rmx-icon rpt-foot-ico"><use href="#properties"></use></svg>
          <span>RentManager.com</span><span>08/28/26</span><span>7:22 AM</span>
        </div>
        <div class="rpt-foot-page">${n} of ${total}</div>
      </div>
    </div>`;

  const page1Body = `
    ${headRow}
    <div class="rpt-section-label"><span class="lbl">Income</span></div>
    ${plGap()}
    ${income.slice(0,10).map(r => plRow(r[0] + ' ' + r[1], 24, r[2], r[3])).join('')}
    ${plRow('4100 RENTAL PROPERTY INCOME', 24)}
    ${acctRows(rental, 48)}
    ${plSubtotal('4100 TOTAL RENTAL PROPERTY INCOME', 24, rentalTotal[0], rentalTotal[1])}
    ${plGap()}
    ${plRow(income[10][0] + ' ' + income[10][1], 24, income[10][2], income[10][3])}
    ${plGap()}
    ${plSubtotal('Total Income', 0, totalIncome[0], totalIncome[1], true)}`;

  const page2Body = `
    ${headRow}
    <div class="rpt-section-label"><span class="lbl">Expenses</span></div>
    ${plGap()}
    ${plRow('5000 REPAIRS & MAINTENANCE', 24)}
    ${acctRows(rm, 48)}
    ${plSubtotal('5000 TOTAL REPAIRS & MAINTENANCE', 24, rmTotal[0], rmTotal[1])}
    ${plGap()}
    ${plRow('5100 PAYROLL', 24)}
    ${acctRows(payroll, 48)}
    ${plSubtotal('5100 TOTAL PAYROLL', 24, payrollTotal[0], payrollTotal[1])}
    ${plGap()}
    ${plRow('5200 UTILITIES', 24)}
    ${acctRows(util, 48)}
    ${plSubtotal('5200 TOTAL UTILITIES', 24, utilTotal[0], utilTotal[1])}
    ${plGap()}
    ${plRow('5300 TURNOVER', 24)}
    ${acctRows(turnover, 48)}
    ${plSubtotal('5300 TOTAL TURNOVER', 24, turnoverTotal[0], turnoverTotal[1])}
    ${plGap()}
    ${plSubtotal('Total Expenses', 0, totalExpenses[0], totalExpenses[1], true)}
    ${plGap()}
    ${plSubtotal('Net Operating Income', 0, noi[0], noi[1], true)}`;

  return [page(page1Body, 1, 2), page(page2Body, 2, 2)];
}

/* ============================================================
   Prompt Suggestions sheet
   ============================================================ */
function renderSheet(){
  document.getElementById('catPills').innerHTML = CATS.map((c,i)=>`<div class="cat-pill ${state.cat===i?'sel':''}" onclick="selectCat(${i})">${esc(c.label)}</div>`).join('');
  const list = Object.keys(PROMPTS).filter(k => PROMPTS[k].cat === state.cat);
  document.getElementById('promptList').innerHTML = list.map(k => {
    const p = PROMPTS[k];
    /* No leading glyph. The prompts are sentences, and an icon per row read
       as decoration rather than meaning — several were substitutions for
       concepts RMX has no icon for, so the set was inconsistent as well. */
    return `<div class="prompt-item" onclick="ask('${k}')"><span class="pl">${esc(p.label)}</span><svg class="rmx-icon chev"><use href="#chevron-right"></use></svg></div>`;
  }).join('');
}
function selectCat(i){ state.cat = i; renderSheet(); }
function toggleSheet(){ state.sheetOpen = !state.sheetOpen; render(); }
function closeSheet(){ state.sheetOpen = false; render(); }

/* Pops the sheet up from its trigger button, filling whatever empty space sits between the
   conversation and the button — it never overlaps the header, and never overlaps the
   conversation above it unless the panel is too short to fit the sheet's header, category
   row, and at least 3 prompt rows, in which case that guaranteed-visible minimum takes
   priority over staying clear of the conversation. */
function positionSheet(){
  const inner = document.querySelector('.orion-inner');
  const sheet = document.getElementById('orionSheet');
  if (!inner || !sheet || sheet.hidden) return;
  const isHome = document.getElementById('orionComposer').hidden;
  const trigger = isHome ? document.querySelector('.browse-link') : document.getElementById('browseBtn');
  const contentEl = isHome ? document.querySelector('.home-card') : document.getElementById('messagesWrap').lastElementChild;
  const headDivider = document.querySelector('.orion-head hr');
  const sheetHead = sheet.querySelector('.sh');
  const catPills = document.getElementById('catPills');
  const promptList = document.getElementById('promptList');
  if (!trigger || !contentEl || !headDivider) return;

  const innerRect = inner.getBoundingClientRect();
  const trigRect = trigger.getBoundingClientRect();
  const headRect = headDivider.getBoundingClientRect();
  const contentRect = contentEl.getBoundingClientRect();

  const visibleItems = Array.from(promptList.children).slice(0, 3);
  const itemsHeight = visibleItems.reduce((sum, el) => sum + el.getBoundingClientRect().height, 0)
    + Math.max(0, visibleItems.length - 1) * 6 /* prompt-list gap */;
  const chromeHeight = sheetHead.getBoundingClientRect().height + catPills.getBoundingClientRect().height
    + 32 /* padding */ + 20 /* gaps around sh/pills/list */
    + (visibleItems.length ? itemsHeight + 6 : 0) /* gap before list */;

  const gap = 8;
  const bottomOffset = Math.round(innerRect.bottom - trigRect.top) + gap;
  const headBoundary = headRect.bottom + 12;
  const contentBoundary = contentRect.bottom + gap;
  const chromeBoundary = trigRect.top - gap - chromeHeight;

  let top = Math.max(headBoundary, contentBoundary);
  top = Math.min(top, Math.max(headBoundary, chromeBoundary));

  sheet.style.bottom = bottomOffset + 'px';
  /* Never below the guaranteed minimum this function's comment promises —
     header, category row and three prompts. The old floor was 0, so any
     state where the measurements came out tight collapsed the sheet to a
     sliver of padding with nothing in it, which is worse than overlapping
     the conversation by a few pixels. If the trigger has not been laid out
     yet its rect is all zeroes, which is exactly one of those states. */
  const available = Math.round(trigRect.top - gap - top);
  sheet.style.maxHeight = Math.max(Math.round(chromeHeight), available) + 'px';
}
window.addEventListener('resize', () => {
  if (!state.orionOpen || !state.sheetOpen) return;
  if (!document.getElementById('orionSheet').classList.contains('orion-sheet-inline')) positionSheet();
});

/* title always mirrors PROMPTS[id].label — it's replayed verbatim as the user's
   question when resuming, so it has to match what the reply is actually answering. */
let HISTORY_ITEMS = [
  { id:'q1', title:PROMPTS.q1.label, ago:'2mo ago', favorite:true },
  { id:'d1', title:PROMPTS.d1.label, ago:'1d ago', favorite:false },
  { id:'q3', title:PROMPTS.q3.label, ago:'2d ago', favorite:false },
  { id:'h2', title:PROMPTS.h2.label, ago:'1w ago', favorite:false },
  { id:'n1', title:PROMPTS.n1.label, ago:'2mo ago', favorite:false },
  { id:'h4', title:PROMPTS.h4.label, ago:'2mo ago', favorite:false },
];

function toggleHistory(){
  const isOpen = document.getElementById('historyView').hidden;
  state.sheetOpen = false;
  document.getElementById('historyView').hidden = !isOpen;
  document.getElementById('orionBody').hidden = isOpen;
  document.getElementById('orionComposer').hidden = true;
  document.getElementById('orionFooter').hidden = isOpen;
  document.getElementById('orionSheet').hidden = true;
  document.getElementById('orionHeadTitle').textContent = isOpen ? 'Orion Assistant History' : 'Orion Assistant';
  document.getElementById('historyIconBtn').hidden = isOpen;
  document.getElementById('historyDivider').hidden = isOpen;
  if (isOpen){ renderHistoryFull(); }
  else { render(); }
}

function historyRowHtml(item){
  return `<button class="history-row" onclick="resumeHistory('${item.id}')">
    <div class="htext"><span class="htitle">${esc(item.title)}</span><span class="htime">${esc(item.ago)}</span></div>
    <div class="hicons">
      <svg class="rmx-icon star ${item.favorite ? 'filled' : ''}" title="${item.favorite ? 'Unfavorite' : 'Favorite'}" onclick="event.stopPropagation(); toggleFavorite('${item.id}')"><use href="#${item.favorite ? 'grade' : 'grade-outline'}"></use></svg>
      <svg class="rmx-icon trash" title="Delete" onclick="event.stopPropagation(); deleteHistoryItem('${item.id}')"><use href="#delete-filled"></use></svg>
    </div>
  </button>`;
}

function renderHistoryFull(){
  const q = (document.getElementById('historySearchInput').value || '').toLowerCase();
  const filtered = HISTORY_ITEMS.filter(i => i.title.toLowerCase().includes(q));
  const favs = filtered.filter(i => i.favorite);
  const rest = filtered.filter(i => !i.favorite);

  const favSection = document.getElementById('historyFavSection');
  favSection.innerHTML = favs.length ? `<div class="history-section-label">Favorites</div>${favs.map((item,i) => historyRowHtml(item) + (i < favs.length-1 ? '<div class="history-divider"></div>' : '')).join('')}` : '';

  const allSection = document.getElementById('historyAllSection');
  allSection.innerHTML = `<div class="history-section-label">All Chats</div>` +
    (rest.length ? rest.map((item,i) => historyRowHtml(item) + (i < rest.length-1 ? '<div class="history-divider"></div>' : '')).join('') : '<div class="history-empty">No chats found.</div>');
}

function toggleFavorite(id){
  const item = HISTORY_ITEMS.find(i => i.id === id);
  if (item) item.favorite = !item.favorite;
  renderHistoryFull();
}

function deleteHistoryItem(id){
  HISTORY_ITEMS = HISTORY_ITEMS.filter(i => i.id !== id);
  renderHistoryFull();
}

/* Resuming from History shows the conversation exactly as it happened —
   no re-thinking delay, no re-typing. It's a saved transcript, not a new ask. */
function resumeHistory(id){
  const item = HISTORY_ITEMS.find(h => h.id === id);
  const p = PROMPTS[id];
  if (!item || !p){ toggleHistory(); return; }
  const reply = botMsg(id);
  reply._shown = true;
  state.rootId = id;
  state.thinking = null;
  state.messages = [ { role:'user', text: item.title, _shown:true }, reply ];
  toggleHistory();
}

function newChat(){
  state.messages = []; state.thinking = null; state.sheetOpen = false;
  lastAnchorIdx = -1;
  lastAnchorMode = 'top';
  document.getElementById('historyView').hidden = true;
  document.getElementById('orionBody').hidden = false;
  document.getElementById('orionFooter').hidden = false;
  document.getElementById('orionHeadTitle').textContent = 'Orion Assistant';
  document.getElementById('historyIconBtn').hidden = false;
  document.getElementById('historyDivider').hidden = false;
  render();
}

/* ============================================================
   Panel open/close + header entry point
   ============================================================ */
function toggleOrion(){ state.orionOpen ? closeOrion() : openOrion(); }
function openOrion(){
  state.orionOpen = true;
  const scrim = document.getElementById('orionScrim');
  if (scrim) scrim.hidden = false;
  lockPageScroll(true);
  document.getElementById('orionPanel').hidden = false;
  document.getElementById('orionEntry').classList.add('open');
  document.getElementById('orionEntry').classList.remove('pulsing');
  document.getElementById('orionTooltip').hidden = true;
  positionOrionPanel();
}

/* Anchored 16px under Command Launch, right edge lined up under the Orion icon.
   Always positioned via left/top (never right) so drag and resize both move a
   single, consistent edge instead of juggling two positioning schemes. */
const ORION_SHEET_BREAKPOINT = 720;

function positionOrionPanel(){
  const panel = document.getElementById('orionPanel');
  if (!panel) return;

  /* Below the tablet breakpoint the panel is a full-screen sheet laid out
     by orion.css. Writing inline geometry here would override it, so stop —
     and clear anything a previous wider layout left behind. */
  if (document.documentElement.clientWidth <= ORION_SHEET_BREAKPOINT) {
    panel.style.removeProperty('max-height');
    return;
  }
  const viewportW = document.documentElement.clientWidth;
  const viewportH = document.documentElement.clientHeight;
  panel.style.right = 'auto';

  /* Once the user has dragged or resized the panel this session, it stays
     wherever they put it — just keep it on-screen as the viewport changes. */
  if (panel.dataset.userMoved){
    const rect = panel.getBoundingClientRect();
    const left = Math.max(0, Math.min(viewportW - rect.width, rect.left));
    const top = Math.max(0, Math.min(viewportH - rect.height, rect.top));
    panel.style.left = left + 'px';
    panel.style.top = top + 'px';
    if (!panel.dataset.userResizedH){
      panel.style.maxHeight = (viewportH - top - 16) + 'px';
    }
    return;
  }

  const search = document.querySelector('.rmx-appbar__search');
  const entry = document.getElementById('orionEntry');
  const icons = document.querySelector('.rmx-appbar__icons');
  if (!search || !entry || !icons) return;
  const sRect = search.getBoundingClientRect();
  const eRect = entry.getBoundingClientRect();
  const iRect = icons.getBoundingClientRect();
  const top = Math.round(sRect.bottom + 16);
  const width = panel.dataset.userResizedW
    ? Math.round(panel.getBoundingClientRect().width)
    : Math.max(ORION_OPEN_MIN_W, Math.min(900, Math.round(eRect.right - iRect.left)));
  if (!panel.dataset.userResizedW){
    panel.style.width = width + 'px';
  }
  panel.style.left = Math.round(eRect.right - width) + 'px';
  panel.style.top = top + 'px';
  if (!panel.dataset.userResizedH){
    panel.style.maxHeight = (viewportH - top - 16) + 'px';
  }
}
window.addEventListener('resize', () => { if (state.orionOpen) positionOrionPanel(); });

/* Drag handle covers the whole header bar, not just the title text — but
   clicks on the actual icon buttons (new chat / history / close) still work. */
function startMove(e){
  if (e.target.closest('.icons')) return;
  e.preventDefault();
  const panel = document.getElementById('orionPanel');
  const rect = panel.getBoundingClientRect();
  const x0 = e.clientX, y0 = e.clientY, left0 = rect.left, top0 = rect.top;
  function move(ev){
    panel.dataset.userMoved = '1';
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const w = rect.width, h = rect.height;
    const left = Math.max(0, Math.min(vw - w, left0 + (ev.clientX - x0)));
    const top = Math.max(0, Math.min(vh - h, top0 + (ev.clientY - y0)));
    panel.style.left = left + 'px';
    panel.style.top = top + 'px';
    if (!panel.dataset.userResizedH){
      panel.style.maxHeight = (vh - top - 16) + 'px';
    }
  }
  function up(){
    window.removeEventListener('mousemove', move);
    window.removeEventListener('mouseup', up);
  }
  window.addEventListener('mousemove', move);
  window.addEventListener('mouseup', up);
}

/* axes: 'w' = left edge (drag left to grow, right edge stays put),
   'e' = right edge (drag right to grow, left edge stays put),
   'h' = bottom edge (drag down to grow), 'wh' = bottom-left corner. */
function startResize(e, axes){
  e.preventDefault();
  e.stopPropagation();
  const panel = document.getElementById('orionPanel');
  const rect = panel.getBoundingClientRect();
  const x0 = e.clientX, y0 = e.clientY, w0 = rect.width, h0 = rect.height, left0 = rect.left;
  function move(ev){
    if (axes.indexOf('w') >= 0){
      panel.dataset.userResizedW = '1';
      const w = Math.max(380, Math.min(900, w0 + (x0 - ev.clientX)));
      panel.style.width = w + 'px';
      panel.style.left = (left0 - (w - w0)) + 'px';
    }
    if (axes.indexOf('e') >= 0){
      panel.dataset.userResizedW = '1';
      const w = Math.max(380, Math.min(900, w0 + (ev.clientX - x0)));
      panel.style.width = w + 'px';
    }
    if (axes.indexOf('h') >= 0){
      panel.dataset.userResizedH = '1';
      const maxH = document.documentElement.clientHeight - panel.getBoundingClientRect().top - 16;
      const h = Math.max(320, Math.min(maxH, h0 + (ev.clientY - y0)));
      panel.style.height = h + 'px';
      panel.style.maxHeight = 'none';
    }
  }
  function up(){
    window.removeEventListener('mousemove', move);
    window.removeEventListener('mouseup', up);
  }
  window.addEventListener('mousemove', move);
  window.addEventListener('mouseup', up);
}
function closeOrion(){
  archiveCurrentConversation();
  state.orionOpen = false;
  const scrim = document.getElementById('orionScrim');
  if (scrim) scrim.hidden = true;
  lockPageScroll(false);
  const panel = document.getElementById('orionPanel');
  panel.hidden = true;
  /* Forget any manual drag/resize — next open always starts back at the
     default position and size, anchored under the Orion icon. */
  delete panel.dataset.userMoved;
  delete panel.dataset.userResizedW;
  delete panel.dataset.userResizedH;
  panel.style.left = '';
  panel.style.top = '';
  panel.style.right = '';
  panel.style.width = '';
  panel.style.height = '';
  panel.style.maxHeight = '';
  document.getElementById('orionEntry').classList.remove('open');
  if (!document.getElementById('historyView').hidden) exitHistoryView();
}

/* Closing the overlay always ends the conversation — save it to History (if
   anything was actually asked) so it stays reachable, then reset to a blank
   new chat for next time the overlay opens. */
function archiveCurrentConversation(){
  if (state.messages.length && state.rootId){
    HISTORY_ITEMS.unshift({ id: state.rootId, title: state.messages[0].text, ago: 'Just now', favorite: false });
  }
  state.messages = [];
  state.thinking = null;
  state.rootId = null;
  state.sheetOpen = false;
  render();
}
function exitHistoryView(){
  document.getElementById('historyView').hidden = true;
  document.getElementById('orionHeadTitle').textContent = 'Orion Assistant';
  document.getElementById('historyIconBtn').hidden = false;
  document.getElementById('historyDivider').hidden = false;
  render();
}
function entryHover(on){
  document.getElementById('orionTooltip').hidden = !(on && !state.orionOpen);
}


/* ============================================================
   Carrying the conversation between screens
   ------------------------------------------------------------
   The prototype used to be one file, so opening a tenant record or a
   report never unloaded the panel. Screens are separate files now — the
   skill wants one screen per file — so the conversation is written to
   sessionStorage on every change and read back on load. Without this,
   following a link out of a result and coming back would silently lose
   the conversation that produced it, which is the one thing a reviewer
   is most likely to try.

   sessionStorage, not localStorage: a prototype should start clean in a
   new tab, and a stakeholder should never inherit the last person's chat.
   ============================================================ */
const ORION_STORE = 'rmx-orion-conversation';

function saveConversation() {
  try {
    sessionStorage.setItem(ORION_STORE, JSON.stringify({
      messages: state.messages, cat: state.cat, rootId: state.rootId,
      orionOpen: state.orionOpen, history: typeof HISTORY !== 'undefined' ? HISTORY : undefined
    }));
  } catch (e) { /* private window, or storage disabled — the panel still works */ }
}

function restoreConversation() {
  let saved = null;
  try { saved = JSON.parse(sessionStorage.getItem(ORION_STORE) || 'null'); } catch (e) { return; }
  if (!saved) return;
  state.messages = saved.messages || [];
  state.cat = saved.cat || 0;
  state.rootId = saved.rootId || null;
  if (saved.history && typeof HISTORY !== 'undefined') {
    HISTORY.length = 0; saved.history.forEach(h => HISTORY.push(h));
  }
  if (state.messages.length) render();
  /* The panel does NOT reopen. Following a result to another screen is a
     deliberate move away from the conversation, and having the assistant
     reappear over the page you just asked for covers the thing you went to
     look at. The conversation is still here — reopening shows it. */
  state.orionOpen = false;
}

/* Every entry point that changes the conversation persists it. */
['ask', 'submitDraft', 'submitHome', 'newChat', 'openHistoryItem', 'toggleFavorite',
 'deleteHistoryItem', 'openOrion', 'closeOrion'].forEach(fn => {
  const original = window[fn];
  if (typeof original !== 'function') return;
  window[fn] = function () { const r = original.apply(this, arguments); saveConversation(); return r; };
});

document.addEventListener('DOMContentLoaded', restoreConversation);
if (document.readyState !== 'loading') restoreConversation();


/* ============================================================
   Leaving the panel for another screen
   ------------------------------------------------------------
   In the single-file version these three swapped hidden <div>s. Each is
   its own screen now, so they navigate — carrying the record or report id
   in the query string, and leaving the conversation in sessionStorage so
   the panel comes back with it. Each target screen reads its own
   parameter on load.
   ============================================================ */
/* Where the other screens live, relative to whatever page is running this.
   Three layouts, and the rule differs in each:

     repo root      index.html        the workspace -> others are in screens/
     repo screens   screens/*.html    siblings, and home is one level up
     bundle         dist/*.html       bundle.mjs flattens everything

   Matching the other RMX prototype repos, the root URL IS the workspace, so
   emmalanghammer.github.io/ai-assistant/ opens it with no index in between. */
function inBundle() { return /\/dist\//.test(location.pathname); }
function inScreensDir() { return /\/screens\//.test(location.pathname); }

function screenPath(file) {
  if (inBundle()) return file;
  return inScreensDir() ? file : 'screens/' + file;
}

function homePath() {
  if (inBundle()) return 'index.html';
  return inScreensDir() ? '../index.html' : 'index.html';
}

function openTenantPage(tid) {
  saveConversation();
  location.href = screenPath('tenant-detail.html') + '?t=' + encodeURIComponent(tid);
}

function openReport(id) {
  saveConversation();
  location.href = screenPath('report-viewer.html') + '?r=' + encodeURIComponent(id);
}

function showDashboard() {
  saveConversation();
  location.href = homePath();
}

/* "View it on my dashboard" on a tile Orion just built. */
function onLinkClick(e) {
  e.preventDefault();
  saveConversation();
  location.href = homePath() + '#orionTilesCol';
}

/* The Rent Manager logo is the way back to My Workspace from anywhere. */
function goHome() { showDashboard(); }
