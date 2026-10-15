// ════════════════════════════════════════════════════════════
//  LOOT DROP — light beam + rarity-colored item card
//
//  URL PARAMS:
//    ?rarity=common | uncommon | rare | epic | legendary   (else random)
//    ?item=Arc+Blade   ?icon=sword   (any name from shared/icons.js)
//
//  KEYBOARD (testing — right-click source → Interact):
//    G   — Loot drop (random rarity)
//    1–5 — Loot drop: common / uncommon / rare / epic / legendary
// ════════════════════════════════════════════════════════════

// Rarity tiers — color, drop weight (for random), and loot table
const RARITIES = {
  common: {
    color: '#9CA3AF', weight: 40,
    sub:   'Vendor trash. Keeping it anyway.',
    items: [['Slightly Used Bandage', 'bandage'], ['Rusty Wrench', 'wrench'], ['Mystery Box', 'package']],
  },
  uncommon: {
    color: '#22C55E', weight: 28,
    sub:   'A respectable find.',
    items: [['Reinforced Gloves', 'hand'], ['Tactical Snack', 'cookie'], ['Field Radio', 'radio']],
  },
  rare: {
    color: '#3B82F6', weight: 18,
    sub:   'Now we\'re talking.',
    items: [['Precision Scope', 'crosshair'], ['Ballistic Vest', 'shirt'], ['Signal Booster', 'wifi']],
  },
  epic: {
    color: '#A855F7', weight: 10,
    sub:   'Chat, clip that.',
    items: [['Arc Blade', 'sword'], ['Phase Shield', 'shield'], ['Overclocked Core', 'cpu']],
  },
  legendary: {
    color: '#FF9940', weight: 4,
    sub:   'Chat is legally required to type W.',
    items: [['Crown of the Lobby', 'crown'], ['The Chat Carry', 'gem'], ['Golden Ticket', 'ticket']],
  },
};
const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

HOLD.loot = 4800;

function randomRarity() {
  const total = RARITY_ORDER.reduce((sum, r) => sum + RARITIES[r].weight, 0);
  let roll = Math.random() * total;
  for (const r of RARITY_ORDER) {
    roll -= RARITIES[r].weight;
    if (roll <= 0) return r;
  }
  return 'common';
}

MOMENTS.loot = data => {
  const rarity = RARITIES[data.rarity] ? data.rarity : randomRarity();
  const cfg    = RARITIES[rarity];
  const [defaultItem, defaultIcon] = pick(cfg.items);
  const big    = rarity === 'epic' || rarity === 'legendary';

  return {
    className: 'loot',
    style: `--rc:${cfg.color}; --rc-glow:${hexToRgba(cfg.color, 0.45)}; --ring:${cfg.color}; --ring-delay:0.4s;`,
    html: `
      ${big ? '<div class="loot-edge"></div>' : ''}
      <div class="loot-beam"></div>
      <div class="centered ring"></div>
      ${buildBurst([cfg.color, '#fff'], big ? 50 : 24, 140, big ? 460 : 300, 0.4)}
      <div class="loot-card">
        <div class="loot-icon">${icon(data.icon) || icon(defaultIcon)}</div>
        <div class="loot-text">
          <div class="loot-rarity">${rarity} drop</div>
          <div class="loot-name">${data.item || defaultItem}</div>
          <div class="loot-sub">${cfg.sub}</div>
        </div>
        <div class="loot-shine"></div>
      </div>
    `,
  };
};

document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const key = e.key.toUpperCase();
  if (key >= '1' && key <= '5') enqueue('loot', { rarity: RARITY_ORDER[parseInt(key) - 1] });
  else if (key === 'G') enqueue('loot');
});
