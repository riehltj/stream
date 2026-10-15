// ════════════════════════════════════════════════════════════
//  GAME MOMENTS — shared engine
//
//  Each moment (level-up.js, death.js, loot.js) registers itself
//  into MOMENTS + HOLD. Pages load this file first, then whichever
//  moments they want:
//
//    level-up.html — plays Level Up on load    (one Stream Deck button)
//    death.html    — plays Death on load       (one Stream Deck button)
//    moments.html  — all three, triggered by ?play= or keys
//
//  Transparent browser source (1920×1080).
//
//  URL PARAM trigger (moments.html):
//    ?play=levelup | loot | death   (+ that moment's own params)
//
//  Other pages can fire moments on the 'stream-events' channel:
//    { type: 'levelup' | 'loot' | 'death', ...same fields as URL }
// ════════════════════════════════════════════════════════════

const MOMENTS = {};   // type → renderer(data) returning { className, html, style }
const HOLD    = {};   // type → ms on screen

const stage  = document.getElementById('stage');
const params = new URLSearchParams(window.location.search);

// ── Persistent counters (survive browser source refreshes) ────
function loadNum(key, fallback) {
  try { const v = parseInt(localStorage.getItem(key)); return isNaN(v) ? fallback : v; }
  catch (e) { return fallback; }
}
function saveNum(key, value) {
  try { localStorage.setItem(key, String(value)); } catch (e) { }
}

// ── Helpers ───────────────────────────────────────────────────
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

function hexToRgba(hex, alpha) {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

function buildBurst(colors, count, minDist, maxDist, delay) {
  let html = '';
  for (let i = 0; i < count; i++) {
    const angle = (360 / count) * i + (Math.random() - 0.5) * (360 / count);
    const size  = Math.random() * 5 + 2;
    html += `<div class="spark" style="
      width:${size}px; height:${size}px;
      background:${pick(colors)};
      --angle:${angle}deg;
      --dist:${Math.random() * (maxDist - minDist) + minDist}px;
      --dur:${Math.random() * 0.5 + 0.7}s;
      --delay:${delay}s;"></div>`;
  }
  return `<div class="burst">${html}</div>`;
}

// ── Queue ─────────────────────────────────────────────────────
const queue   = [];
let isShowing = false;

function enqueue(type, data = {}) {
  if (!MOMENTS[type]) return;
  queue.push({ type, data });
  if (!isShowing) showNext();
}

function showNext() {
  if (queue.length === 0) { isShowing = false; return; }
  isShowing = true;
  const { type, data } = queue.shift();
  showMoment(type, data);
}

function showMoment(type, data) {
  const { className, html, style } = MOMENTS[type](data);

  const el = document.createElement('div');
  el.className = `moment ${className}`;
  if (style) el.style.cssText = style;
  el.innerHTML = html;
  stage.appendChild(el);

  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => {
      el.remove();
      showNext();
    }, 450);
  }, HOLD[type]);
}

// ── Moments fired from other pages ────────────────────────────
try {
  const channel = new BroadcastChannel('stream-events');
  channel.onmessage = ({ data }) => { if (data) enqueue(data.type, data); };
} catch (e) { }

// ── Play on load ──────────────────────────────────────────────
// ?play= wins; otherwise a page can set <body data-autoplay="...">.
// Runs after the moment scripts below this one have registered.
setTimeout(() => {
  const play = params.get('play') || document.body.dataset.autoplay;
  if (!play) return;
  enqueue(play, {
    level:  parseInt(params.get('level')) || 0,
    rarity: params.get('rarity') || '',
    item:   params.get('item')   || '',
    icon:   params.get('icon')   || '',
  });
}, 500);
