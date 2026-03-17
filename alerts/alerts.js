// ════════════════════════════════════════════════════════════
//  ALERT OVERLAY
//
//  Transparent HTML overlay — add as an OBS Browser Source
//  on top of all other scenes. Size: match your stream res.
//  Check "Transparent background" in OBS browser source settings.
//
//  KEYBOARD (for manual triggering / testing):
//    F      — Follow alert
//    S      — Sub alert (Tier 1)
//    B      — Bits / Cheer alert
//    R      — Raid alert
//    1/2/3  — Sub Tier 1 / 2 / 3
//
//  URL PARAM (fires on load — useful for OBS scene transitions):
//    ?demo=follow
//    ?demo=sub&name=ChatGoat&tier=2
//    ?demo=raid&name=ChannelName&count=150
//    ?demo=cheer&name=SomeViewer&amount=500
// ════════════════════════════════════════════════════════════

// ── Alert type definitions ────────────────────────────────
const ALERT_TYPES = {
  follow: {
    icon:  '🔔',
    label: 'NEW FOLLOWER',
    color: '#FF7919',
    hold:  4000,
    getMessage: d => `${d.name} is now following!`,
    getSub:     d => `Welcome to the stream`,
  },
  sub: {
    icon:  '⭐',
    label: 'NEW SUBSCRIBER',
    color: '#FFD700',
    hold:  5000,
    getMessage: d => `${d.name} just subscribed!`,
    getSub:     d => d.tier && d.tier > 1 ? `Tier ${d.tier} · Thank you!` : `Thank you for the sub!`,
  },
  resub: {
    icon:  '🔁',
    label: 'RESUBSCRIBED',
    color: '#FFD700',
    hold:  5000,
    getMessage: d => `${d.name} resubscribed!`,
    getSub:     d => `${d.months ? `${d.months} months` : ''} · Thank you!`,
  },
  cheer: {
    icon:  '💥',
    label: 'BITS',
    color: '#9147ff',
    hold:  4500,
    getMessage: d => `${d.name} cheered ${d.amount || '???'} bits!`,
    getSub:     d => `Let's gooo`,
  },
  raid: {
    icon:  '⚡',
    label: 'INCOMING RAID',
    color: '#FF7919',
    hold:  6000,
    getMessage: d => `${d.name} is raiding!`,
    getSub:     d => `${d.count ? `${d.count} raiders incoming` : 'Incoming raiders'} — welcome!`,
  },
  gift: {
    icon:  '🎁',
    label: 'GIFTED SUB',
    color: '#FF7919',
    hold:  5000,
    getMessage: d => `${d.name} gifted a sub!`,
    getSub:     d => d.recipient ? `To ${d.recipient} · Thank you!` : `Thank you for the gift!`,
  },
};

// ── Queue system ──────────────────────────────────────────
const container = document.getElementById('alertContainer');
const queue     = [];
let   isShowing = false;

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

function showAlert(type, data) {
  const cfg = ALERT_TYPES[type];
  if (!cfg) { showNext(); return; }

  const card = document.createElement('div');
  card.className = 'alert-card';
  card.style.setProperty('--color', cfg.color);
  card.style.setProperty('--hold-ms', cfg.hold + 'ms');

  card.innerHTML = `
    <div class="alert-accent"></div>
    <div class="alert-icon">${cfg.icon}</div>
    <div class="alert-body">
      <div class="alert-label">${cfg.label}</div>
      <div class="alert-message">${cfg.getMessage(data)}</div>
      <div class="alert-sub">${cfg.getSub(data)}</div>
    </div>
    <div class="alert-progress"></div>
  `;

  container.appendChild(card);

  // Slide in
  requestAnimationFrame(() => requestAnimationFrame(() => {
    card.classList.add('slide-in');
  }));

  // Hold, then slide out
  setTimeout(() => {
    card.classList.remove('slide-in');
    card.classList.add('slide-out');
    setTimeout(() => {
      card.remove();
      showNext();
    }, 400);
  }, cfg.hold);
}

// ── Keyboard triggers (testing / manual use) ──────────────
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  switch (e.key.toUpperCase()) {
    case 'F': enqueue('follow', { name: 'TestViewer'  }); break;
    case 'S': enqueue('sub',    { name: 'TestViewer', tier: 1 }); break;
    case 'B': enqueue('cheer',  { name: 'TestViewer', amount: 100 }); break;
    case 'R': enqueue('raid',   { name: 'TestChannel', count: 50 }); break;
    case 'G': enqueue('gift',   { name: 'TestViewer', recipient: 'AnotherViewer' }); break;
    case '1': enqueue('sub',    { name: 'TestViewer', tier: 1 }); break;
    case '2': enqueue('sub',    { name: 'TestViewer', tier: 2 }); break;
    case '3': enqueue('sub',    { name: 'TestViewer', tier: 3 }); break;
  }
});

// ── URL param demo trigger ────────────────────────────────
const params = new URLSearchParams(window.location.search);
const demo   = params.get('demo');
if (demo && ALERT_TYPES[demo]) {
  setTimeout(() => {
    enqueue(demo, {
      name:      params.get('name')      || 'TestViewer',
      count:     parseInt(params.get('count')) || 50,
      amount:    parseInt(params.get('amount')) || 100,
      tier:      parseInt(params.get('tier'))   || 1,
      months:    parseInt(params.get('months')) || 0,
      recipient: params.get('recipient') || '',
    });
  }, 500);
}
