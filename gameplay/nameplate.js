// ════════════════════════════════════════════════════════════
//  NAMEPLATE — your name + rotating socials. Latest follow / sub /
//  gift / bits / raid gets pinned for a bit when it comes in.
//
//  Transparent browser source, suggested size 400 × 36.
// ════════════════════════════════════════════════════════════

// Lines that rotate through the nameplate
const nameplateItems = [
  { label: 'Twitch',  text: () => STREAMER.twitch  },
  { label: 'X',       text: () => STREAMER.twitter },
  { label: 'YouTube', text: () => STREAMER.youtube },
];

// Rotation interval (ms)
const ROTATE_MS = 7000;

// How long a "latest" event stays pinned before rotation resumes (ms)
const EVENT_PIN_MS = 15000;

// ════════════════════════════════════════════════════════════
//  INTERNALS
// ════════════════════════════════════════════════════════════

const npInfo = document.getElementById('npInfo');
document.getElementById('npName').textContent = STREAMER.name;

// ── Rotation ──────────────────────────────────────────────────
let rotateIdx = 0;
let pinnedUntil = 0;

function setInfo(label, text, isEvent = false) {
  npInfo.classList.add('swapping');
  setTimeout(() => {
    npInfo.innerHTML = `<span class="np-label">${label}</span>${text}`;
    npInfo.classList.toggle('flash', isEvent);
    npInfo.classList.remove('swapping');
  }, 350);
}

function rotate() {
  if (Date.now() < pinnedUntil) return;
  const item = nameplateItems[rotateIdx];
  rotateIdx = (rotateIdx + 1) % nameplateItems.length;
  setInfo(item.label, item.text());
}

// ── Latest events ─────────────────────────────────────────────
const EVENT_LABELS = {
  follow: d => ['Latest Follow', d.name],
  sub:    d => ['Latest Sub',    d.name],
  resub:  d => ['Latest Sub',    d.name],
  gift:   d => ['Gifted',        `${d.name}${d.count > 1 ? ` ×${d.count}` : ''}`],
  cheer:  d => ['Bits',          `${d.name} · ${d.amount}`],
  raid:   d => ['Raid',          `${d.name} · ${d.count}`],
};

function handleEvent(type, data = {}) {
  const fmt = EVENT_LABELS[type];
  if (!fmt || !data.name) return;
  const [label, text] = fmt(data);
  pinnedUntil = Date.now() + EVENT_PIN_MS;
  setInfo(label, text, true);
}

// Test alerts fired from the Alerts overlay
try {
  const channel = new BroadcastChannel('stream-events');
  channel.onmessage = ({ data }) => { if (data) handleEvent(data.type, data); };
} catch (e) { }

// Live Twitch events
connectTwitch(handleEvent);

// ── Init ──────────────────────────────────────────────────────
rotate();
setInterval(rotate, ROTATE_MS);
