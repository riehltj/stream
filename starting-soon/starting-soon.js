// ─── Shared components (clock, particles, ticker) ─────────────
initClock('clock');
initParticles('particles', 22);
initTicker('tickerTrack', [
  "Stream starting in just a moment",
  "Follow for stream notifications",
  "Go grab a snack",
  "I'm pooping be right there",
  "Hit that follow button to stay in the loop",
  "Check out the Discord for community chat & Nudes",
  "Today's elite gameplay",
  "Turn down for what",
]);

// ─── Countdown ────────────────────────────────────────────────
let totalSeconds = 5 * 60; // change to your actual countdown
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
const VIEWER_BOOST = 10000;           // added on top of the real count 😎
const viewerEl = document.getElementById('viewerCount');
let realViewers = 0;                  // from Twitch, refreshed every 30s
let shownViewers = 0;

// Roll the number from its current value to the target
function rollViewers(target) {
  const from = shownViewers;
  const start = performance.now();
  const dur = 900;
  (function frame(now) {
    const t = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    shownViewers = Math.round(from + (target - from) * eased);
    viewerEl.textContent = shownViewers.toLocaleString('en-US');
    if (t < 1) requestAnimationFrame(frame);
  })(start);
}

async function refreshViewers() {
  const count = await getTwitchViewers();
  if (count !== null) realViewers = count;
  rollViewers(VIEWER_BOOST + realViewers);
}

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
