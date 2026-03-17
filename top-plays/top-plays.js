// ════════════════════════════════════════════════════════════
//  TOP PLAYS CONFIG — edit this section
// ════════════════════════════════════════════════════════════

// Plays go from rank 5 (worst) → rank 1 (best, your #1 dunk moment)
// Drop your image/gif URL into each `url` field
const plays = [
  {
    rank:  5,
    title: 'The Ankle Breaker',
    stat:  'vs. Chat Lobby · 3rd Quarter',
    label: 'Play of the Game',
    url:   '',  // ← paste your image/gif URL here
  },
  {
    rank:  4,
    title: 'Full Court Buzzer',
    stat:  'Game 2 · Overtime',
    label: 'Clutch Factor',
    url:   '',
  },
  {
    rank:  3,
    title: 'The Poster Dunk',
    stat:  'vs. Randoms · MVP Cam',
    label: 'Highlight Reel',
    url:   '',
  },
  {
    rank:  2,
    title: 'No Look Dime',
    stat:  'Assist of the Year Candidate',
    label: 'Playmaker',
    url:   '',
  },
  {
    rank:  1,
    title: '360 Windmill Slam',
    stat:  'Greatest Moment in Sports History',
    label: '🏆 Best Play of the Session',
    url:   '',
  },
];

// Timing (milliseconds)
const INTRO_DURATION  = 4000;  // how long the intro title card shows
const PLAY_DURATION   = 10000; // how long each play is shown
const NEXT_UP_LEAD    = 3000;  // how early "NEXT UP" banner appears before switching
const REPLAY_WAIT     = 8000;  // countdown on champion screen before replaying

// ════════════════════════════════════════════════════════════
//  INTERNALS
// ════════════════════════════════════════════════════════════

// Display order: rank 5 first → rank 1 last
const playOrder = [...plays].sort((a, b) => b.rank - a.rank);

const PLACEHOLDER_BG = [
  'linear-gradient(135deg, #1a0050 0%, #5500cc 100%)',
  'linear-gradient(135deg, #001840 0%, #003ea8 100%)',
  'linear-gradient(135deg, #400010 0%, #aa0030 100%)',
  'linear-gradient(135deg, #001800 0%, #005500 100%)',
  'linear-gradient(135deg, #301800 0%, #996600 100%)',
];

let currentIdx    = 0;
let playTimer     = null;
let nextUpTimer   = null;
let progressTimer = null;

// ── Shared components ─────────────────────────────────────────
initClock('clock');
initParticles('particles', 18);
initTicker('tickerTrack', [
  'Top 5 plays of the session — auto-advancing',
  'React in chat — which play was the best?',
  'No. 1 coming up... brace yourself',
  'Clip these and share the highlights',
  'Like & subscribe if you enjoyed the stream',
  'Hit follow so you never miss a moment like this',
]);

// ── DOM refs ──────────────────────────────────────────────────
const introScreen   = document.getElementById('introScreen');
const playView      = document.getElementById('playView');
const champScreen   = document.getElementById('champScreen');
const flashOverlay  = document.getElementById('flashOverlay');
const rankWatermark = document.getElementById('rankWatermark');
const playMedia     = document.getElementById('playMedia');
const playBadgeNum  = document.getElementById('playBadgeNum');
const playLabel     = document.getElementById('playLabel');
const playTitle     = document.getElementById('playTitle');
const playStat      = document.getElementById('playStat');
const progressFill  = document.getElementById('progressFill');
const queueList     = document.getElementById('queueList');
const nextUpBanner  = document.getElementById('nextUpBanner');
const nextUpTitleEl = document.getElementById('nextUpTitle');
const champTitle    = document.getElementById('champTitle');
const champStat     = document.getElementById('champStat');
const champReplay   = document.getElementById('champReplay');

// ── Screen switcher ───────────────────────────────────────────
function showScreen(id) {
  [introScreen, playView, champScreen].forEach(el => {
    el.style.display = el.id === id ? 'flex' : 'none';
  });
}

// ── Flash transition ──────────────────────────────────────────
function flash(callback) {
  flashOverlay.classList.add('on');
  setTimeout(() => {
    callback();
    setTimeout(() => flashOverlay.classList.remove('on'), 180);
  }, 160);
}

// ── Progress bar ──────────────────────────────────────────────
function startProgress(duration) {
  clearInterval(progressTimer);
  progressFill.style.width = '0%';
  const start = Date.now();
  progressTimer = setInterval(() => {
    const pct = Math.min(100, ((Date.now() - start) / duration) * 100);
    progressFill.style.width = pct + '%';
    if (pct >= 100) clearInterval(progressTimer);
  }, 50);
}

// ── Queue render ──────────────────────────────────────────────
function renderQueue(activeIdx) {
  queueList.innerHTML = playOrder.map((play, i) => {
    const cls = i === activeIdx ? 'active' : i < activeIdx ? 'done' : '';
    return `
      <div class="queue-item ${cls}">
        <div class="queue-rank">${play.rank}</div>
        <div class="queue-body">
          <div class="queue-title-text">${play.title}</div>
          <div class="queue-stat-text">${play.stat}</div>
        </div>
      </div>
    `;
  }).join('');
}

// ── Load a play ───────────────────────────────────────────────
function loadPlay(idx) {
  clearTimeout(playTimer);
  clearTimeout(nextUpTimer);
  nextUpBanner.classList.remove('visible');

  const play    = playOrder[idx];
  const isChamp = play.rank === 1;

  // Champion mode toggle (gold accents)
  playView.classList.toggle('champion', isChamp);
  rankWatermark.textContent = play.rank;

  // Swap media with a quick fade
  playMedia.classList.add('fading');
  setTimeout(() => {
    if (play.url && play.url.length > 0) {
      playMedia.style.backgroundImage = `url('${play.url}')`;
      playMedia.style.background = '';
    } else {
      playMedia.style.backgroundImage = 'none';
      playMedia.style.background = PLACEHOLDER_BG[idx % PLACEHOLDER_BG.length];
    }
    playMedia.classList.remove('fading');
  }, 100);

  // Text content
  playBadgeNum.textContent = play.rank;
  playLabel.textContent    = play.label;
  playTitle.textContent    = play.title;
  playStat.textContent     = play.stat;

  renderQueue(idx);
  startProgress(PLAY_DURATION);

  // Show "NEXT UP" banner before the switch
  const nextPlay = playOrder[idx + 1];
  if (nextPlay) {
    nextUpTitleEl.textContent = `#${nextPlay.rank} — ${nextPlay.title}`;
    nextUpTimer = setTimeout(() => {
      nextUpBanner.classList.add('visible');
    }, PLAY_DURATION - NEXT_UP_LEAD);
  }

  // Advance or go to champ screen
  playTimer = setTimeout(() => {
    nextUpBanner.classList.remove('visible');
    if (idx + 1 < playOrder.length) {
      flash(() => loadPlay(idx + 1));
    } else {
      flash(() => showChampion());
    }
  }, PLAY_DURATION);
}

// ── Champion screen ───────────────────────────────────────────
function showChampion() {
  const champ = plays.find(p => p.rank === 1);
  champTitle.textContent = champ.title;
  champStat.textContent  = champ.stat;

  // Reset animations by cloning
  const newChamp = champScreen.cloneNode(true);
  champScreen.parentNode.replaceChild(newChamp, champScreen);
  const freshChamp = document.getElementById('champScreen');

  showScreen('champScreen');
  spawnConfetti();

  // Countdown to replay
  let secs = Math.floor(REPLAY_WAIT / 1000);
  const replayEl = document.getElementById('champReplay');
  replayEl.textContent = `Replaying in ${secs}...`;
  const cd = setInterval(() => {
    secs--;
    replayEl.textContent = secs > 0 ? `Replaying in ${secs}...` : 'Here we go again...';
    if (secs <= 0) {
      clearInterval(cd);
      setTimeout(() => flash(() => startShow()), 1000);
    }
  }, 1000);
}

// ── Confetti ──────────────────────────────────────────────────
function spawnConfetti() {
  const container = document.getElementById('champConfetti');
  if (!container) return;
  container.innerHTML = '';
  const colors = ['#FF7919', '#f5a623', '#fff', '#FFD700', '#FF4444', '#44AAFF'];
  for (let i = 0; i < 80; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${Math.random() * 8 + 4}px;
      height: ${Math.random() * 8 + 4}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      --dur: ${Math.random() * 2 + 2}s;
      --delay: ${Math.random() * 1.5}s;
    `;
    container.appendChild(el);
  }
}

// ── Start / loop ──────────────────────────────────────────────
function startShow() {
  currentIdx = 0;
  showScreen('playView');
  loadPlay(0);
}

// Kick off after intro
setTimeout(() => flash(() => startShow()), INTRO_DURATION);
