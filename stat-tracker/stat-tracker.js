// ════════════════════════════════════════════════════════════
//  STAT TRACKER CONFIG
// ════════════════════════════════════════════════════════════

// Rotating analyst notes — add your own, they're always positive
const analystNotes = [
  "Currently performing at levels not seen since the discovery of video games.",
  "Deaths are a bold strategic choice. The analysts respect the commitment.",
  "Extraction rate classified by the government. We cannot share further details.",
  "Our panel of experts agrees: the lobby simply wasn't ready.",
  "K/D ratio pending peer review. Early results are, quote, \"illegal\".",
  "Fights won counter may be underreporting due to witnesses fleeing the scene.",
  "Chat says he's \"just vibing\". Analysts disagree. He is LOCKED IN.",
  "For legal reasons, we cannot confirm or deny that this player is the final boss.",
  "Deaths logged as \"tactical repositions\" per player request. Analysts comply.",
  "Impact score off the charts. We've contacted the Vatican.",
  "Survival rate calculated using advanced metrics that heavily favor this player.",
  "Sources confirm opponents are, in fact, scared. Full report forthcoming.",
  "The lobby has been notified. They have requested a mercy rule.",
  "Statistically, this player should not exist. And yet, here we are.",
  "\"Not tilted\" — Player, probably. Analysts are not so sure about the keyboard.",
];

// Threat level rotates — always alarming
const threatLevels = [
  'EXTREME', 'NUCLEAR', 'UNPRECEDENTED', 'OFF CHARTS', 'ILLEGAL', 'CRITICAL',
];

// Session rating — always elite, rotates occasionally
const sessionRatings = ['S+', 'S+', 'S', 'S+', 'S+', 'A+'];

// Funny death sub-label rotations
const deathLabels = [
  'tactical repositions',
  'strategic respawns',
  'involuntary exits',
  'brief retirements',
  'unplanned rotations',
];

// Analyst note rotation interval (ms)
const ANALYST_ROTATE_MS = 9000;

// ════════════════════════════════════════════════════════════
//  STATE
// ════════════════════════════════════════════════════════════

const state = {
  extractions: 0,
  fightsWon:   0,
  deaths:      0,
  history:     [],   // array of 'E' or 'D' per round
  lastAction:  null, // for undo: { type, roundAdded }
};

// ── Shared ────────────────────────────────────────────────────
initClock('clock');
initParticles('particles', 16);

// Ticker is updated dynamically based on current stats
function rebuildTicker() {
  const kd    = getKD();
  const surv  = getSurvivalRate();
  const items = [
    `Extractions: ${state.extractions}`,
    `Fights Won: ${state.fightsWon}`,
    `Deaths: ${state.deaths}  (tactical repositions)`,
    `K/D Ratio: ${kd}`,
    `Survival Rate: ${surv}`,
    'Lobby Threat Level: EXTREME',
    'Analyst Rating: S+',
    'Impact Score: ' + getLobbyImpactScore(),
  ];
  initTicker('tickerTrack', items);
}
rebuildTicker();

// ── DOM refs ──────────────────────────────────────────────────
const valExtractions = document.getElementById('valExtractions');
const valFights      = document.getElementById('valFights');
const valDeaths      = document.getElementById('valDeaths');
const valSurvival    = document.getElementById('valSurvival');
const valKD          = document.getElementById('valKD');
const valThreat      = document.getElementById('valThreat');
const valImpact      = document.getElementById('valImpact');
const subExtractions = document.getElementById('subExtractions');
const subFights      = document.getElementById('subFights');
const subDeaths      = document.getElementById('subDeaths');
const recentBadges   = document.getElementById('recentBadges');
const analystText    = document.getElementById('analystText');
const ratingValue    = document.getElementById('ratingValue');
const keyHints       = document.getElementById('keyHints');
const resetConfirm   = document.getElementById('resetConfirm');
const sessionTimerEl = document.getElementById('sessionTimer');

// ── Derived stats ─────────────────────────────────────────────
function getKD() {
  if (state.deaths === 0) return state.fightsWon > 0 ? '∞' : '–';
  return (state.fightsWon / state.deaths).toFixed(2);
}

function getSurvivalRate() {
  const rounds = state.history.length;
  if (rounds === 0) return '–';
  return Math.round((state.extractions / rounds) * 100) + '%';
}

function getFightsPerExtraction() {
  if (state.extractions === 0) return '0';
  return (state.fightsWon / state.extractions).toFixed(1);
}

// The "Lobby Impact Score" — looks impressive, technically derived from real stats
function getLobbyImpactScore() {
  const base   = Math.max(state.extractions, 1) * 100;
  const kills  = state.fightsWon * 47;
  const deaths = state.deaths * 11; // deaths barely count, naturally
  const score  = Math.min(9999, Math.max(742, base + kills - deaths + 234));
  return score.toLocaleString();
}

// ── Render ────────────────────────────────────────────────────
function render() {
  const rounds = state.history.length;

  // Primary stats
  valExtractions.textContent = state.extractions;
  valFights.textContent      = state.fightsWon;
  valDeaths.textContent      = state.deaths;

  // Sub-labels
  subExtractions.textContent = `${rounds} round${rounds !== 1 ? 's' : ''} played`;
  subFights.textContent      = `${getFightsPerExtraction()} per extraction`;
  subDeaths.textContent      = deathLabels[state.deaths % deathLabels.length];

  // Derived
  const kd   = getKD();
  const surv = getSurvivalRate();
  valSurvival.textContent = surv;
  valKD.textContent       = kd;
  valImpact.textContent   = getLobbyImpactScore();

  // Color-code K/D
  valKD.className = 'stat-value secondary-value';
  if (kd !== '–' && kd !== '∞') {
    const kdNum = parseFloat(kd);
    if (kdNum >= 2)   valKD.classList.add('gold');
    else if (kdNum < 0.8) valKD.style.color = '#cc2222';
    else valKD.style.color = '';
  } else if (kd === '∞') {
    valKD.classList.add('gold');
  }

  // Recent rounds
  renderRecentRounds();

  // Key hint totals
  document.getElementById('hintValE').textContent = `+1 (${state.extractions})`;
  document.getElementById('hintValF').textContent = `+1 (${state.fightsWon})`;
  document.getElementById('hintValD').textContent = `+1 (${state.deaths})`;

  // Rebuild ticker with fresh stats
  rebuildTicker();
}

function renderRecentRounds() {
  const last = state.history.slice(-14); // show last 14 rounds
  if (last.length === 0) {
    recentBadges.innerHTML = '<div class="recent-empty">No rounds yet this session</div>';
    return;
  }
  recentBadges.innerHTML = last.map((type, i) => {
    const cls   = type === 'E' ? 'badge-extract' : 'badge-death';
    const label = type === 'E' ? 'EXT' : 'RIP';
    const delay = `animation-delay: ${i * 0.04}s`;
    return `<div class="recent-badge ${cls}" style="${delay}">${label}</div>`;
  }).join('');
}

// ── Float +1 ──────────────────────────────────────────────────
function floatPlus(cardEl, colorClass = 'orange') {
  const el = document.createElement('div');
  el.className = `float-plus ${colorClass}`;
  el.textContent = '+1';
  cardEl.querySelector('.stat-value').appendChild(el);
  setTimeout(() => el.remove(), 900);
}

// ── Key hint flash ────────────────────────────────────────────
function flashHint(hintId) {
  const row = document.getElementById(hintId);
  row.classList.add('active');
  setTimeout(() => row.classList.remove('active'), 300);
}

// ── Pulse card ────────────────────────────────────────────────
function pulseCard(cardEl, pulseClass = 'pulse') {
  cardEl.classList.remove('pulse', 'pulse-red', 'pulse-gold');
  void cardEl.offsetWidth; // reflow to restart
  cardEl.classList.add(pulseClass);
  setTimeout(() => cardEl.classList.remove(pulseClass), 500);
}

// ── Actions ───────────────────────────────────────────────────
function addExtraction() {
  state.extractions++;
  state.history.push('E');
  state.lastAction = { type: 'E' };
  pulseCard(document.getElementById('cardExtractions'));
  floatPlus(document.getElementById('cardExtractions'), 'orange');
  flashHint('hintE');
  render();
}

function addFight() {
  state.fightsWon++;
  state.lastAction = { type: 'F' };
  pulseCard(document.getElementById('cardFights'), 'pulse-gold');
  floatPlus(document.getElementById('cardFights'), 'gold');
  flashHint('hintF');
  render();
}

function addDeath() {
  state.deaths++;
  state.history.push('D');
  state.lastAction = { type: 'D' };
  pulseCard(document.getElementById('cardDeaths'), 'pulse-red');
  floatPlus(document.getElementById('cardDeaths'), 'red');
  flashHint('hintD');
  render();
}

function undo() {
  if (!state.lastAction) return;
  const { type } = state.lastAction;
  if (type === 'E' && state.extractions > 0) {
    state.extractions--;
    const idx = state.history.lastIndexOf('E');
    if (idx !== -1) state.history.splice(idx, 1);
  } else if (type === 'F' && state.fightsWon > 0) {
    state.fightsWon--;
  } else if (type === 'D' && state.deaths > 0) {
    state.deaths--;
    const idx = state.history.lastIndexOf('D');
    if (idx !== -1) state.history.splice(idx, 1);
  }
  state.lastAction = null;
  render();
}

// ── Reset flow ────────────────────────────────────────────────
let awaitingReset = false;
let resetTimeout  = null;

function promptReset() {
  if (awaitingReset) {
    // Second R — confirm
    doReset();
    return;
  }
  awaitingReset = true;
  resetConfirm.style.display = 'flex';
  resetTimeout = setTimeout(() => {
    awaitingReset = false;
    resetConfirm.style.display = 'none';
  }, 4000);
}

function doReset() {
  clearTimeout(resetTimeout);
  awaitingReset = false;
  resetConfirm.style.display = 'none';
  state.extractions = 0;
  state.fightsWon   = 0;
  state.deaths      = 0;
  state.history     = [];
  state.lastAction  = null;
  sessionStart      = Date.now();
  render();
}

function cancelReset() {
  clearTimeout(resetTimeout);
  awaitingReset = false;
  resetConfirm.style.display = 'none';
}

// ── Keyboard handler ──────────────────────────────────────────
document.addEventListener('keydown', e => {
  // Don't fire on input elements
  if (e.target.tagName === 'INPUT') return;

  if (awaitingReset) {
    if (e.key.toUpperCase() === 'R') {
      promptReset(); // second R = confirm
    } else {
      cancelReset();
    }
    return;
  }

  switch (e.key.toUpperCase()) {
    case 'E': addExtraction(); break;
    case 'F': addFight();      break;
    case 'D': addDeath();      break;
    case 'Z': undo();          break;
    case 'R': promptReset();   break;
    case 'H':
      keyHints.classList.toggle('hidden');
      break;
  }
});

// ── Session timer ─────────────────────────────────────────────
let sessionStart = Date.now();
function updateSessionTimer() {
  const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const display = h > 0
    ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    : `${m}:${String(s).padStart(2,'0')}`;
  sessionTimerEl.textContent = `Session: ${display}`;
}
setInterval(updateSessionTimer, 1000);
updateSessionTimer();

// ── Session date ──────────────────────────────────────────────
document.getElementById('sessionDate').textContent = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'short', day: 'numeric',
});

// ── Analyst notes rotation ────────────────────────────────────
let analystIdx    = 0;
let threatIdx     = 0;
let ratingIdx     = 0;

function rotateAnalyst() {
  analystText.classList.add('swapping');
  setTimeout(() => {
    analystIdx = (analystIdx + 1) % analystNotes.length;
    analystText.textContent = analystNotes[analystIdx];
    analystText.classList.remove('swapping');
  }, 400);
}

function rotateThreat() {
  threatIdx = (threatIdx + 1) % threatLevels.length;
  valThreat.textContent = threatLevels[threatIdx];
}

function rotateRating() {
  ratingIdx = (ratingIdx + 1) % sessionRatings.length;
  ratingValue.textContent = sessionRatings[ratingIdx];
}

setInterval(rotateAnalyst, ANALYST_ROTATE_MS);
setInterval(rotateThreat, 15000);
setInterval(rotateRating, 20000);

// Set initial analyst note
analystText.textContent = analystNotes[0];

// ── Init ──────────────────────────────────────────────────────
initClock('clock');
render();
