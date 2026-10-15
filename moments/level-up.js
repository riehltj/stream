// ════════════════════════════════════════════════════════════
//  LEVEL UP — gold rays, "LEVEL UP" slam, LVL 11 ▶ 12
//
//  URL PARAMS:
//    ?level=12   show a specific level (otherwise last level + 1)
//
//  KEYBOARD (testing — right-click source → Interact):
//    L — Level up (+1)    X — Reset level to 1
// ════════════════════════════════════════════════════════════

const LEVEL_QUIPS = [
  'Skill points: unallocated. Confidence: maxed.',
  'Stats up. Decision-making: unchanged.',
  'The grind is paying off. Allegedly.',
  'New perks unlocked. Old habits retained.',
  'Chat called it. Chat calls everything.',
];

HOLD.levelup = 4200;

let level = loadNum('moments.level', 1);

MOMENTS.levelup = data => {
  const prev = level;
  level = data.level > 0 ? data.level : level + 1;
  saveNum('moments.level', level);
  const from = data.level > 0 ? data.level - 1 : prev;

  return {
    className: 'levelup',
    html: `
      <div class="lu-glow"></div>
      <div class="centered lu-rays-wrap"><div class="lu-rays"></div></div>
      <div class="centered ring"></div>
      ${buildBurst(['#f5a623', '#FFD98A', '#fff', '#FF9940'], 60, 180, 520, 0.3)}
      <div class="lu-content">
        <div class="lu-eyebrow">New Level Reached</div>
        <div class="lu-title">Level Up</div>
        <div class="lu-level">
          <span class="lu-lvl-label">LVL</span>
          <span class="lu-old">${from}</span>
          <span class="lu-arrow">▶</span>
          <span class="lu-new">${level}</span>
        </div>
        <div class="lu-sub">${pick(LEVEL_QUIPS)}</div>
      </div>
    `,
  };
};

document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  switch (e.key.toUpperCase()) {
    case 'L': enqueue('levelup'); break;
    case 'X': level = 1; saveNum('moments.level', level); break;
  }
});
