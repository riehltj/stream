// ════════════════════════════════════════════════════════════
//  LIVE SCOREBOARD — ESPN-style football score bug
//
//  Streamer vs Chat. Every sub is a scoring drive for Chat:
//    - Touchdown (+6), then an extra point try (85% good, +1)
//    - Sometimes a field goal (+3) instead
//  Score persists between reloads (localStorage).
//
//  Transparent OBS browser source. Enable "Transparent background"
//  in OBS browser source settings.
//
//  Live subs come from Twitch (shared/twitch.js). Test subs fired
//  on the Alerts overlay also score when both sources are served
//  from the same origin.
//
//  KEYBOARD (testing, via OBS "Interact"):
//    S        — Sub (random TD or FG)
//    T        — Force touchdown
//    K        — Force field goal
//    Shift+R  — Reset to starting score
//
//  URL PARAMS:
//    ?home=Highlight&away=Chat   — team names
//    ?homeRank=1&awayRank=       — rankings (blank = unranked, or e.g. NR)
//    ?startHome=49&startAway=0   — starting score (used on reset)
//    ?scorer=home                — make subs score for the streamer instead
//    ?reset                      — reset to starting score on load
//    ?demo=sub&name=ChatGoat     — fire a sub on load
// ════════════════════════════════════════════════════════════

const params = new URLSearchParams(window.location.search);
const intParam = (key, fallback) => {
  const n = parseInt(params.get(key));
  return Number.isNaN(n) ? fallback : n;
};

const CFG = {
  homeName: (params.get('home') || STREAMER.name).toUpperCase(),
  awayName: (params.get('away') || 'CHAT').toUpperCase(),
  homeRank: params.has('homeRank') ? params.get('homeRank') : '1',
  awayRank: params.get('awayRank') || '',   // unranked
  startHome: intParam('startHome', 35),
  startAway: intParam('startAway', 0),
  scorer: params.get('scorer') === 'home' ? 'home' : 'away',
  fgChance: 0.20,   // chance a sub is a field goal instead of a TD
  xpChance: 0.85,   // chance the extra point is good
  quarterSec: 15 * 60,
};

const STORAGE_KEY = 'scoreboard-state';

const MISSES = [
  'Wide left', 'Wide right', 'Doinked off the upright',
  'Blocked!', 'Bad snap', 'Hooked it',
];
const TD_LINES = [
  'takes it to the house', 'punches it in', 'with the diving catch',
  'breaks three tackles', 'goes untouched', 'hurdles the safety',
];
const FG_LINES = ['from 42 yards', 'from 38 yards', 'from 51 yards', 'from 27 yards'];
const QUARTERS = ['1ST', '2ND', '3RD', '4TH', 'OT'];

// ── DOM refs ──────────────────────────────────────────────
const el = {
  teams: { home: document.getElementById('teamHome'), away: document.getElementById('teamAway') },
  names: { home: document.getElementById('homeName'), away: document.getElementById('awayName') },
  ranks: { home: document.getElementById('homeRank'), away: document.getElementById('awayRank') },
  scores: { home: document.getElementById('homeScore'), away: document.getElementById('awayScore') },
  qtr: document.getElementById('qtr'),
  clock: document.getElementById('gameClock'),
  banner: document.getElementById('playBanner'),
  bannerTtl: document.getElementById('playTitle'),
  bannerSub: document.getElementById('playSub'),
};

const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const wait = ms => new Promise(r => setTimeout(r, ms));

// ── State (persisted) ─────────────────────────────────────
function freshState() {
  return {
    home: CFG.startHome, away: CFG.startAway,
    qtr: 0, clock: CFG.quarterSec,
    ball: CFG.scorer,
  };
}

function loadState() {
  if (params.has('reset')) return freshState();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved.home === 'number') return { ...freshState(), ...saved };
  } catch (e) { }
  return freshState();
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { }
}

let state = loadState();
state.ball = CFG.scorer; // ball stays with whoever subs score for

// ── Rendering ─────────────────────────────────────────────
function renderClock() {
  const m = Math.floor(state.clock / 60);
  const s = String(state.clock % 60).padStart(2, '0');
  el.qtr.textContent = QUARTERS[state.qtr];
  el.clock.textContent = `${m}:${s}`;
}

function renderBall() {
  el.teams.home.classList.toggle('has-ball', state.ball === 'home');
  el.teams.away.classList.toggle('has-ball', state.ball === 'away');
}

function renderAll() {
  el.names.home.textContent = CFG.homeName;
  el.names.away.textContent = CFG.awayName;
  el.ranks.home.textContent = CFG.homeRank.toUpperCase();
  el.ranks.away.textContent = CFG.awayRank.toUpperCase();
  el.scores.home.textContent = state.home;
  el.scores.away.textContent = state.away;
  renderClock();
  renderBall();
}

// Count the score up and flash the team block
function addPoints(team, pts) {
  const from = state[team];
  state[team] += pts;
  saveState();

  const block = el.teams[team];
  block.classList.remove('scored');
  void block.offsetWidth;
  block.classList.add('scored');

  const start = performance.now();
  const dur = 500;
  (function tick(now) {
    const t = Math.min((now - start) / dur, 1);
    el.scores[team].textContent = Math.round(from + pts * t);
    if (t < 1) requestAnimationFrame(tick);
  })(start);
}

function showBanner(kind, title, sub) {
  el.banner.dataset.kind = kind;
  el.bannerTtl.textContent = title;
  el.bannerSub.textContent = sub;
  el.banner.classList.remove('show');
  void el.banner.offsetWidth;
  el.banner.classList.add('show');
}

function hideBanner() {
  el.banner.classList.remove('show');
}

// ── Plays ─────────────────────────────────────────────────
async function runScoringDrive(name, forced) {
  const team = CFG.scorer;
  const who = name || 'Someone';
  const isFG = forced ? forced === 'fg' : Math.random() < CFG.fgChance;

  state.ball = team;
  renderBall();
  await wait(700);

  if (isFG) {
    showBanner('fg', 'Field Goal', `${who} · it's good ${pick(FG_LINES)}!`);
    await wait(500);
    addPoints(team, 3);
    await wait(3000);
  } else {
    showBanner('td', 'Touchdown', `${who} ${pick(TD_LINES)}!`);
    await wait(500);
    addPoints(team, 6);
    await wait(3000);

    const good = Math.random() < CFG.xpChance;
    if (good) {
      showBanner('xp', 'Extra Point Good', 'Right down the middle');
      await wait(500);
      addPoints(team, 1);
    } else {
      showBanner('miss', 'No Good', pick(MISSES));
    }
    await wait(2600);
  }

  hideBanner();
  await wait(400);
}

// Queue so back-to-back subs play out one at a time
let playChain = Promise.resolve();
function scoreSub(name, forced) {
  playChain = playChain.then(() => runScoringDrive(name, forced));
}

// ── Living game clock ─────────────────────────────────────
setInterval(() => {
  state.clock--;
  if (state.clock < 0) {
    state.qtr = Math.min(state.qtr + 1, QUARTERS.length - 1);
    state.clock = state.qtr === QUARTERS.length - 1 ? 10 * 60 : CFG.quarterSec;
  }
  renderClock();
  if (state.clock % 10 === 0) saveState();
}, 1000);

// ── Reset ─────────────────────────────────────────────────
function resetGame() {
  state = freshState();
  saveState();
  renderAll();
}

// ── Keyboard triggers ─────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  switch (e.key.toUpperCase()) {
    case 'S': scoreSub('TestViewer'); break;
    case 'T': scoreSub('TestViewer', 'td'); break;
    case 'K': scoreSub('TestViewer', 'fg'); break;
    case 'R': if (e.shiftKey) resetGame(); break;
  }
});

// ── Subs → scoring drives ─────────────────────────────────
// Each gifted sub counts as its own drive
function handleSubEvent(type, data = {}) {
  if (!['sub', 'resub', 'gift'].includes(type)) return;
  const drives = type === 'gift' ? Math.max(1, data.count || 1) : 1;
  for (let i = 0; i < drives; i++) scoreSub(data.name);
}

// Test alerts fired from the Alerts overlay
try {
  const channel = new BroadcastChannel('stream-events');
  channel.onmessage = ({ data }) => { if (data) handleSubEvent(data.type, data); };
} catch (e) { }

// Live Twitch events
connectTwitch(handleSubEvent);

// ── Init ──────────────────────────────────────────────────
renderAll();
saveState();

if (params.get('demo') === 'sub') {
  setTimeout(() => scoreSub(params.get('name') || 'TestViewer'), 1200);
}
