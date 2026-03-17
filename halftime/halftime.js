// ════════════════════════════════════════════════════════════
//  HALFTIME CONFIG — edit this section
// ════════════════════════════════════════════════════════════

// Default break length in minutes
const DEFAULT_MINUTES = 5;

// "While You Wait" items shown in the left panel
const waitItems = [
  { icon: '💬', text: 'Drop a prediction for the second half in chat' },
  { icon: '🔔', text: 'Turn on notifications so you never miss a stream' },
  { icon: '👍', text: 'Hit that follow button — it\'s free and it helps a ton' },
  { icon: '🍕', text: 'Grab a snack. We\'ll wait. No seriously, go.' },
  { icon: '📱', text: 'Join the Discord and say hi to the community' },
  { icon: '☕', text: 'Refill your drink. Hydration is the meta.' },
];

// Halftime report quotes — always analytical, always slightly absurd
const halftimeReports = [
  { quote: "The first half showed us everything we expected, and considerably more.", source: "— StreamCenter Analytics" },
  { quote: "Hydration status: critical. The data strongly supports this break.", source: "— Medical Panel" },
  { quote: "Our models predict a 97.3% chance of even better content in the second half.", source: "— Predictive Algorithms" },
  { quote: "Sources confirm: chat was adequately fed in the first half. Demand for more: high.", source: "— Viewer Research Group" },
  { quote: "Comeback narrative: fully intact. Second half potential: MAXIMUM.", source: "— The Coaching Staff" },
  { quote: "First half performance placed in the 99th percentile of streamers who look this good.", source: "— Independent Auditors" },
  { quote: "The lobby has been given time to reflect on its choices.", source: "— League Officials" },
  { quote: "Win probability model updated. Odds described as 'very favorable, trust me'.", source: "— Trust Me Bro Institute" },
];

// Second half teaser — what's coming up
const secondHalfItems = [
  'More Arc Raiders action',
  'Taking chat suggestions',
  'Going for a W streak',
  'Absolutely not tilted',
  'Road to top of lobby',
];

// How long to show the "LET'S GET IT" end screen before resetting (ms)
const END_SCREEN_DURATION = 4000;

// Halftime report rotation interval (ms)
const REPORT_ROTATE_MS = 10000;

// ════════════════════════════════════════════════════════════
//  INTERNALS
// ════════════════════════════════════════════════════════════

// Timer state
let totalSeconds  = DEFAULT_MINUTES * 60;
let timerState    = 'idle'; // 'idle' | 'running' | 'paused' | 'done'
let timerInterval = null;

// ── Shared ────────────────────────────────────────────────────
initClock('clock');
initParticles('particles', 20);
initTicker('tickerTrack', [
  'Halftime — back in just a moment',
  'Grab a snack while you wait',
  'Follow the channel so you never miss a stream',
  'Drop a prediction in chat for the second half',
  'Check out the Discord community',
  'Second half content incoming — stay locked in',
  'Hydration break in progress. Science approves.',
]);

// ── DOM refs ──────────────────────────────────────────────────
const countMin      = document.getElementById('countMin');
const countSec      = document.getElementById('countSec');
const countdownWrap = document.getElementById('countdownWrap');
const countdownLabel= document.getElementById('countdownLabel');
const countdownHint = document.getElementById('countdownHint');
const topbarStatus  = document.getElementById('topbarStatus');
const reportBody    = document.querySelector('.report-body');
const reportQuote   = document.getElementById('reportQuote');
const reportSource  = document.getElementById('reportSource');
const endScreen     = document.getElementById('endScreen');
const endFlash      = document.getElementById('endFlash');
const waitListEl    = document.getElementById('waitList');
const teaserItemsEl = document.getElementById('teaserItems');

// ── Render timer display ──────────────────────────────────────
function renderTimer() {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  countMin.textContent = String(m).padStart(2, '0');
  countSec.textContent = String(s).padStart(2, '0');

  // Urgent mode under 30s
  if (totalSeconds <= 30 && timerState === 'running') {
    countdownWrap.classList.add('urgent');
  } else {
    countdownWrap.classList.remove('urgent');
  }
}

// ── Timer controls ────────────────────────────────────────────
function startTimer() {
  timerState = 'running';
  countdownWrap.classList.remove('idle', 'paused');
  topbarStatus.textContent = 'BRB';
  countdownLabel.textContent = 'BACK IN';
  countdownHint.innerHTML = `
    <span class="hint-key">SPACE</span> Pause &nbsp;·&nbsp;
    <span class="hint-key">+</span><span class="hint-key">−</span> Time &nbsp;·&nbsp;
    <span class="hint-key">R</span> Reset
  `;

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (totalSeconds <= 0) {
      clearInterval(timerInterval);
      timerFinished();
      return;
    }
    totalSeconds--;
    renderTimer();
  }, 1000);
}

function pauseTimer() {
  timerState = 'paused';
  clearInterval(timerInterval);
  countdownWrap.classList.add('paused');
  topbarStatus.textContent = 'Halftime';
  countdownLabel.textContent = 'PAUSED';
  countdownHint.innerHTML = `
    <span class="hint-key">SPACE</span> Resume &nbsp;·&nbsp;
    <span class="hint-key">+</span><span class="hint-key">−</span> Time &nbsp;·&nbsp;
    <span class="hint-key">R</span> Reset
  `;
}

function resetTimer() {
  clearInterval(timerInterval);
  timerState    = 'idle';
  totalSeconds  = DEFAULT_MINUTES * 60;
  countdownWrap.classList.remove('running', 'paused', 'urgent');
  countdownWrap.classList.add('idle');
  topbarStatus.textContent   = 'Halftime';
  countdownLabel.textContent = 'BACK IN';
  countdownHint.innerHTML = `
    <span class="hint-key">SPACE</span> Start &nbsp;·&nbsp;
    <span class="hint-key">+</span><span class="hint-key">−</span> Time &nbsp;·&nbsp;
    <span class="hint-key">R</span> Reset
  `;
  renderTimer();
}

function addTime(minutes) {
  totalSeconds = Math.max(0, totalSeconds + minutes * 60);
  renderTimer();
}

function timerFinished() {
  timerState = 'done';
  countdownWrap.classList.remove('urgent');
  clearInterval(timerInterval);

  // Flash + show end screen
  endFlash.classList.add('on');
  setTimeout(() => {
    endFlash.classList.remove('on');
    endScreen.style.display = 'flex';

    setTimeout(() => {
      endScreen.style.display = 'none';
      resetTimer();
    }, END_SCREEN_DURATION);
  }, 200);
}

// ── Keyboard handler ──────────────────────────────────────────
document.addEventListener('keydown', e => {
  switch (e.key) {
    case ' ':
    case 'Space':
      e.preventDefault();
      if (timerState === 'idle' || timerState === 'paused') startTimer();
      else if (timerState === 'running') pauseTimer();
      break;
    case 'r':
    case 'R':
      resetTimer();
      break;
    case '+':
    case '=':
      addTime(1);
      break;
    case '-':
    case '_':
      addTime(-1);
      break;
  }
});

// ── Build static panels ───────────────────────────────────────
function buildWaitList() {
  waitListEl.innerHTML = waitItems.map((item, i) => `
    <li class="wait-item" style="animation-delay: ${0.8 + i * 0.08}s">
      <span class="wait-item-icon">${item.icon}</span>
      <span>${item.text}</span>
    </li>
  `).join('');
}

function buildTeaserItems() {
  teaserItemsEl.innerHTML = secondHalfItems.map((item, i) => `
    <div class="teaser-item" style="animation-delay: ${0.85 + i * 0.07}s">
      <span class="teaser-bullet"></span>
      <span>${item}</span>
    </div>
  `).join('');
}

// ── Halftime report rotation ──────────────────────────────────
let reportIdx = 0;

function rotateReport() {
  reportBody.classList.add('swapping');
  setTimeout(() => {
    reportIdx = (reportIdx + 1) % halftimeReports.length;
    reportQuote.textContent  = halftimeReports[reportIdx].quote;
    reportSource.textContent = halftimeReports[reportIdx].source;
    reportBody.classList.remove('swapping');
  }, 420);
}

// ── Init ──────────────────────────────────────────────────────
buildWaitList();
buildTeaserItems();

// Set first report
reportQuote.textContent  = halftimeReports[0].quote;
reportSource.textContent = halftimeReports[0].source;

// Start in idle state
countdownWrap.classList.add('idle');
renderTimer();

setInterval(rotateReport, REPORT_ROTATE_MS);
