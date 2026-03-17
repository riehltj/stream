// ─── Shared components (clock, particles, ticker) ─────────────
initClock('clock');
initParticles('particles', 22);
initTicker('tickerTrack', [
  "Stream starting in just a moment",
  "Follow for stream notifications",
  "Grab a snack — we're almost live",
  "Chat rules: keep it respectful & have fun",
  "Hit that follow button to stay in the loop",
  "Check out the Discord for community chat",
  "Today's content coming up shortly",
  "Turn up the volume — it's about to get good",
]);

// ─── Countdown ────────────────────────────────────────────────
let totalSeconds = 10 * 60; // change to your actual countdown
const countdownEl  = document.getElementById('countdown');
const subCountdown = document.getElementById('subCountdown');
const liveDot      = document.getElementById('liveDot');
const liveText     = document.getElementById('liveText');

function fmtTime(s) {
  const m   = Math.floor(s / 60).toString().padStart(2, '0');
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
  countdownEl.textContent  = fmtTime(totalSeconds);
  subCountdown.textContent = fmtTime(totalSeconds);
  totalSeconds--;
}
tick();
setInterval(tick, 1000);

// ─── Viewer count (simulated) ─────────────────────────────────
let viewers = Math.floor(Math.random() * 40) + 10;
const viewerEl = document.getElementById('viewerCount');
viewerEl.textContent = viewers;
setInterval(() => {
  viewers += Math.floor(Math.random() * 5) - 1;
  if (viewers < 1) viewers = 1;
  viewerEl.textContent = viewers;
}, 4000);
