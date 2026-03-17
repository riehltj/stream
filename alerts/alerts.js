// ════════════════════════════════════════════════════════════
//  ALERT OVERLAY — SportsCenter LED scoreboard style
//
//  Two-row scissors reveal: colored top stripe slides from LEFT,
//  dark bottom stripe slides from RIGHT. Pixel grid texture on
//  the colored row. Screen-border ring flash on impact.
//
//  Transparent OBS browser source. Enable "Transparent background"
//  in OBS browser source settings.
//
//  KEYBOARD (testing):
//    F      — Follow
//    S      — Sub (Tier 1)  |  1/2/3 — Tier 1/2/3
//    B      — Bits/Cheer
//    R      — Raid
//    G      — Gifted Sub
//
//  URL PARAM demo (fires on load):
//    ?demo=follow
//    ?demo=raid&name=ChannelName&count=150
//    ?demo=sub&name=ChatGoat&tier=2
//    ?demo=cheer&name=SomeViewer&amount=500
// ════════════════════════════════════════════════════════════

const ALERT_TYPES = {
  follow: {
    type:      'NEW FOLLOWER',
    icon:      '🔔',
    color:     '#CC1500',
    hold:      4500,
    getName:   d => d.name || 'Someone',
    getAction: () => 'is now following!',
    getSub:    () => 'Welcome to the stream',
  },
  sub: {
    type:      'NEW SUBSCRIBER',
    icon:      '⭐',
    color:     '#C8920A',
    hold:      5500,
    getName:   d => d.name || 'Someone',
    getAction: d => `just subscribed${d.tier && d.tier > 1 ? ` — Tier ${d.tier}` : ''}!`,
    getSub:    () => 'Thank you for the support',
  },
  resub: {
    type:      'RESUBSCRIBED',
    icon:      '🔁',
    color:     '#C8920A',
    hold:      5500,
    getName:   d => d.name || 'Someone',
    getAction: d => `resubscribed${d.months ? ` — ${d.months} months` : ''}!`,
    getSub:    () => 'Absolute legend',
  },
  cheer: {
    type:      'BITS ALERT',
    icon:      '💥',
    color:     '#6B21A8',
    hold:      5000,
    getName:   d => d.name || 'Someone',
    getAction: d => `dropped ${d.amount || '???'} bits!`,
    getSub:    () => "Let's gooo",
  },
  raid: {
    type:      'INCOMING RAID',
    icon:      '⚡',
    color:     '#CC1500',
    hold:      7000,
    getName:   d => d.name || 'Someone',
    getAction: d => `is raiding with ${d.count || '???'} viewers!`,
    getSub:    () => 'Welcome the raiders',
  },
  gift: {
    type:      'GIFTED SUB',
    icon:      '🎁',
    color:     '#CC1500',
    hold:      5000,
    getName:   d => d.name || 'Someone',
    getAction: d => d.recipient ? `gifted a sub to ${d.recipient}!` : 'gifted a sub!',
    getSub:    () => 'Thank you!',
  },
};

// ── DOM refs ──────────────────────────────────────────────
const container = document.getElementById('alertContainer');
const ringEl    = document.getElementById('alertRing');

// ── Ring flash ────────────────────────────────────────────
function doRingFlash(color) {
  ringEl.style.setProperty('--ring-color', color);
  ringEl.classList.add('impact');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    ringEl.classList.remove('impact');
  }));
}

// ── Queue ─────────────────────────────────────────────────
const queue   = [];
let isShowing = false;

function enqueue(type, data = {}) {
  queue.push({ type, data });
  if (!isShowing) showNext();
}

function showNext() {
  if (queue.length === 0) { isShowing = false; return; }
  isShowing = true;
  const { type, data } = queue.shift();
  showAlert(type, data);
}

// ── Show alert ────────────────────────────────────────────
function showAlert(type, data) {
  const cfg = ALERT_TYPES[type];
  if (!cfg) { showNext(); return; }

  const card = document.createElement('div');
  card.className = 'alert-card';
  card.style.setProperty('--color', cfg.color);
  card.style.setProperty('--hold-ms', cfg.hold + 'ms');

  card.innerHTML = `
    <div class="alert-top-wrap">
      <div class="alert-top">
        <div class="top-badge">${cfg.icon}</div>
        <div class="top-sep"></div>
        <div class="top-type">${cfg.type}</div>
        <div class="top-live">
          <div class="top-live-dot"></div>
          LIVE
        </div>
        <div class="top-lines">
          <div class="speed-line"></div>
          <div class="speed-line"></div>
          <div class="speed-line"></div>
          <div class="speed-line"></div>
          <div class="speed-line"></div>
          <div class="speed-line"></div>
        </div>
      </div>
    </div>
    <div class="alert-bottom-wrap">
      <div class="alert-bottom">
        <span class="bottom-name">${cfg.getName(data)}</span>
        <span class="bottom-sep">·</span>
        <span class="bottom-action">${cfg.getAction(data)}</span>
        <span class="bottom-sub">${cfg.getSub(data)}</span>
      </div>
    </div>
    <div class="alert-drain"></div>
  `;

  container.appendChild(card);

  // Scissors in — top from left, bottom from right (40ms stagger via CSS)
  requestAnimationFrame(() => requestAnimationFrame(() => {
    card.classList.add('animate-in');
  }));

  // Ring flash fires at impact (when both rows have landed)
  setTimeout(() => doRingFlash(cfg.color), 340);

  // Exit after hold
  setTimeout(() => {
    card.classList.remove('animate-in');
    card.classList.add('animate-out');
    setTimeout(() => {
      card.remove();
      showNext();
    }, 280);
  }, cfg.hold);
}

// ── Keyboard triggers ─────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  switch (e.key.toUpperCase()) {
    case 'F': enqueue('follow', { name: 'TestViewer'                         }); break;
    case 'S': enqueue('sub',    { name: 'TestViewer',  tier: 1               }); break;
    case 'B': enqueue('cheer',  { name: 'TestViewer',  amount: 100           }); break;
    case 'R': enqueue('raid',   { name: 'TestChannel', count: 50             }); break;
    case 'G': enqueue('gift',   { name: 'TestViewer',  recipient: 'ChatGoat' }); break;
    case '1': enqueue('sub',    { name: 'TestViewer',  tier: 1               }); break;
    case '2': enqueue('sub',    { name: 'TestViewer',  tier: 2               }); break;
    case '3': enqueue('sub',    { name: 'TestViewer',  tier: 3               }); break;
  }
});

// ── URL param demo trigger ────────────────────────────────
const params = new URLSearchParams(window.location.search);
const demo   = params.get('demo');
if (demo && ALERT_TYPES[demo]) {
  setTimeout(() => {
    enqueue(demo, {
      name:      params.get('name')             || 'TestViewer',
      count:     parseInt(params.get('count'))  || 50,
      amount:    parseInt(params.get('amount')) || 100,
      tier:      parseInt(params.get('tier'))   || 1,
      months:    parseInt(params.get('months')) || 0,
      recipient: params.get('recipient')        || '',
    });
  }, 500);
}
