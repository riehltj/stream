// ════════════════════════════════════════════════════════════
//  DEATH — screen shake, red flash, glitchy "ELIMINATED" bar
//
//  KEYBOARD (testing — right-click source → Interact):
//    D — Death
// ════════════════════════════════════════════════════════════

const DEATH_QUIPS = [
  'Skill issue. Allegedly.',
  'The replay will show it was lag.',
  'Respawning with zero lessons learned.',
  'Tactical reset. Totally intended.',
  'Chat saw that coming.',
  'That one counts as practice.',
];

HOLD.death = 4000;

MOMENTS.death = () => {
  return {
    className: 'death',
    html: `
      <div class="death-flash"></div>
      <div class="death-vignette"></div>
      <div class="death-bar">
        <div class="death-title" data-text="Eliminated">Eliminated</div>
        <div class="death-sub">${pick(DEATH_QUIPS)}</div>
      </div>
    `,
  };
};

document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key.toUpperCase() === 'D') enqueue('death');
});
