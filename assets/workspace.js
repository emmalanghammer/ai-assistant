/* ============================================================
   My Workspace — tab switching and the Orion tiles column
   ------------------------------------------------------------
   The five workspace cards sit side by side on a wide screen. Below the
   tablet breakpoint responsive.css hides all but one and shows the icon
   tab bar instead, and this switches between them.
   ============================================================ */
function selectWorkspaceTab(tab) {
  document.querySelectorAll('#workspaceTabs button')
    .forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.workspace-columns > .ws-col')
    .forEach(t => t.classList.toggle('tab-active', t.classList.contains(tab)));
}

/* Any tile Orion built this session — on this screen or another one —
   is rendered into its column on load. renderOrionTiles lives in
   orion.js, next to the code that records the tiles. */
document.addEventListener('DOMContentLoaded', () => {
  renderOrionTiles();
  /* Arriving from "Open my dashboard" in a conversation. */
  if (location.hash === '#orionTilesCol') {
    const col = document.getElementById('orionTilesCol');
    if (col && col.style.display !== 'none') col.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});
