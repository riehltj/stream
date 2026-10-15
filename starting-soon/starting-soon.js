// ─── Shared components (clock, particles, ticker) ─────────────
initClock('clock');
initParticles('particles', 22);
initTicker('tickerTrack', tickerItems('starting-soon'));

// ─── Countdown ────────────────────────────────────────────────
const COUNTDOWN_SECONDS = 5 * 60; // change to your actual countdown
let totalSeconds = COUNTDOWN_SECONDS;
const countdownEl = document.getElementById('countdown');
const subCountdown = document.getElementById('subCountdown');
const liveDot = document.getElementById('liveDot');
const liveText = document.getElementById('liveText');

function fmtTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

function tick() {
  if (totalSeconds <= 0) {
    countdownEl.textContent = 'LIVE';
    subCountdown.textContent = 'LIVE';
    liveDot.classList.add('active');
    liveText.textContent = 'Live Now';
    return;
  }
  countdownEl.textContent = fmtTime(totalSeconds);
  subCountdown.textContent = fmtTime(totalSeconds);
  totalSeconds--;
}
tick();
setInterval(tick, 1000);

// ─── Viewer count (real Twitch count + boost) ─────────────────
// The boost climbs from 0 to VIEWER_BOOST in random jumps, landing
// right around when the countdown hits zero. 😎
const VIEWER_BOOST = 10000;           // where the fake count ends up
const RAMP_SECONDS = COUNTDOWN_SECONDS; // how long the climb takes
const viewerEl = document.getElementById('viewerCount');
let realViewers = 0;                  // from Twitch, refreshed every 30s
let boost = 0;
let shownViewers = 0;
const rampStart = Date.now();

// Roll the number from its current value to the target
let rollId = 0;
function rollViewers(target) {
  const id = ++rollId;                // a newer roll cancels this one
  const from = shownViewers;
  const start = performance.now();
  const dur = 900;
  (function frame(now) {
    if (id !== rollId) return;
    const t = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    shownViewers = Math.round(from + (target - from) * eased);
    viewerEl.textContent = shownViewers.toLocaleString('en-US');
    if (t < 1) requestAnimationFrame(frame);
  })(start);
}

function showViewers() {
  rollViewers(Math.round(boost) + realViewers);
}

// Add a random chunk of what's left, sized so the climb finishes on time
function growBoost() {
  const secondsLeft = RAMP_SECONDS - (Date.now() - rampStart) / 1000;
  if (secondsLeft <= 2) {
    boost = VIEWER_BOOST;
  } else {
    const avgGap  = 1.75;                          // seconds between jumps
    const perJump = (VIEWER_BOOST - boost) / (secondsLeft / avgGap);
    boost = Math.min(VIEWER_BOOST, boost + perJump * (0.3 + Math.random() * 1.4));
  }
  showViewers();
  if (boost < VIEWER_BOOST) setTimeout(growBoost, (1 + Math.random() * 1.5) * 1000);
}

async function refreshViewers() {
  const count = await getTwitchViewers();
  if (count !== null) realViewers = count;
  showViewers();
}

viewerEl.textContent = '0';
setTimeout(growBoost, 1500);
refreshViewers();
setInterval(refreshViewers, 30000);

// ─── Category (from your Twitch channel info) ─────────────────
const gameEl = document.getElementById('gameName');

async function refreshGame() {
  const channel = await getTwitchChannel();
  if (channel && channel.game) {
    gameEl.textContent = channel.game;
    gameEl.title = channel.game; // full name if it gets cut off
  }
}

refreshGame();
setInterval(refreshGame, 60000); // picks up category changes
