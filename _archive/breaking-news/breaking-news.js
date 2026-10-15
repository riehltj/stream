// ════════════════════════════════════════════════════════════
//  BREAKING NEWS CONFIG — edit this section
// ════════════════════════════════════════════════════════════

// severity: 'breaking' (orange) | 'critical' (red) | 'update' (gold)
const newsAlerts = [
  {
    severity:  'critical',
    badge:     'DEVELOPING STORY',
    category:  'GAMING CRISIS 🎮',
    headline:  'Local Gamer Refuses to Pause Mid-Game',
    sub:       'Sources confirm the situation is "totally fine" and he is "literally almost done"',
    source:    'Anonymous Roommate',
    reporter:  'Chad McStream, Gaming Correspondent',
  },
  {
    severity:  'breaking',
    badge:     'BREAKING STORY',
    category:  'CHAT REPORT 💬',
    headline:  'Area Man Insists He Is Absolutely Not Tilted',
    sub:       'Keyboard currently under federal investigation for war crimes. No further comment.',
    source:    'Twitch Chat, Unverified',
    reporter:  '@ChatGoat, Field Reporter',
  },
  {
    severity:  'critical',
    badge:     'URGENT',
    category:  'LOCKER ROOM NEWS 🏀',
    headline:  'Streamer Blames Lag for Third Loss in a Row',
    sub:       'Independent analysis confirms 240hz monitor, 1ms ping, and "that guy was literally hacking"',
    source:    'Inside Sources',
    reporter:  'The Discord Server',
  },
  {
    severity:  'breaking',
    badge:     'DEVELOPING STORY',
    category:  'TECH ALERT ⚠️',
    headline:  '"One More Game" Enters Its 6th Hour',
    sub:       'Dinner is cold. Experts estimate the situation could escalate further.',
    source:    'The Kitchen',
    reporter:  'Microwave, Staff Writer',
  },
  {
    severity:  'update',
    badge:     'SCORE UPDATE',
    category:  'FIELD REPORT 📡',
    headline:  'Streamer Drops Into Top 10, Chat Goes Feral',
    sub:       'Officials report unprecedented levels of "LET\'S GO" in the chat log. Markets volatile.',
    source:    'StreamCenter Analytics',
    reporter:  'Bob Sportsname, Senior Analyst',
  },
  {
    severity:  'critical',
    badge:     'BREAKING STORY',
    category:  'ECONOMIC CRISIS 💸',
    headline:  'Viewer Drops a $5 Dono Mid-Clutch, Streamer Immediately Chokes',
    sub:       'Witnesses describe the moment as "cursed". Scientists are baffled.',
    source:    'Anonymous Donor',
    reporter:  'The Economy, Reporting Live',
  },
  {
    severity:  'breaking',
    badge:     'DEVELOPING STORY',
    category:  'SPORTS SCIENCE 🔬',
    headline:  'Experts Confirm That Shot "100% Should Have Hit"',
    sub:       'A full panel of scientists, engineers, and Twitch chat are in agreement.',
    source:    'NASA JPL',
    reporter:  'Dr. No Scope, PhD',
  },
  {
    severity:  'update',
    badge:     'LATE UPDATE',
    category:  'WELLNESS REPORT 🧃',
    headline:  'Streamer Has Not Consumed Water in 3 Hours',
    sub:       'Chat has been notified. Hydration officials are standing by.',
    source:    'Concerned Viewers',
    reporter:  'The Water Bottle, Correspondent',
  },
];

// How long each story shows (ms)
const STORY_DURATION = 9000;

// How long the intro flash holds before first story
const INTRO_FLASH_MS = 600;

// ════════════════════════════════════════════════════════════
//  INTERNALS
// ════════════════════════════════════════════════════════════

let currentIdx    = 0;
let storyTimer    = null;
let progressTimer = null;

// ── Shared ────────────────────────────────────────────────────
initClock('clock');
initParticles('particles', 14);
initTicker('tickerTrack', newsAlerts.map(a => a.headline));

// ── DOM refs ──────────────────────────────────────────────────
const alertFlash   = document.getElementById('alertFlash');
const breakingBadge= document.getElementById('breakingBadge');
const storyCard    = document.getElementById('storyCard');
const storyCategory= document.getElementById('storyCategory');
const storyHeadline= document.getElementById('storyHeadline');
const storySub     = document.getElementById('storySub');
const storySource  = document.getElementById('storySource');
const storyReporter= document.getElementById('storyReporter');
const storyTime    = document.getElementById('storyTime');
const storyCounter = document.getElementById('storyCounter');
const storyDots    = document.getElementById('storyDots');
const accentBar    = document.getElementById('accentBar');
const progressFill = document.getElementById('progressFill');

// ── Build dots ────────────────────────────────────────────────
function buildDots() {
  storyDots.innerHTML = newsAlerts.map((_, i) =>
    `<div class="story-dot" id="dot-${i}"></div>`
  ).join('');
}

function updateDots(idx) {
  newsAlerts.forEach((_, i) => {
    const dot = document.getElementById(`dot-${i}`);
    dot.classList.toggle('active', i === idx);
    dot.classList.toggle('done',   i < idx);
  });
}

// ── Progress bar ──────────────────────────────────────────────
function startProgress() {
  clearInterval(progressTimer);
  progressFill.style.width = '0%';
  const start = Date.now();
  progressTimer = setInterval(() => {
    const pct = Math.min(100, ((Date.now() - start) / STORY_DURATION) * 100);
    progressFill.style.width = pct + '%';
    if (pct >= 100) clearInterval(progressTimer);
  }, 50);
}

// ── Severity styling ──────────────────────────────────────────
function applySeverity(severity) {
  document.body.classList.remove('severity-critical', 'severity-update', 'severity-breaking');
  if (severity !== 'breaking') {
    document.body.classList.add(`severity-${severity}`);
  }
}

// ── Flash ─────────────────────────────────────────────────────
function flash(callback) {
  alertFlash.classList.add('on');
  setTimeout(() => {
    if (callback) callback();
    setTimeout(() => alertFlash.classList.remove('on'), 120);
  }, 100);
}

// ── Load story ────────────────────────────────────────────────
function loadStory(idx, animate = true) {
  const story = newsAlerts[idx];

  function applyContent() {
    applySeverity(story.severity);

    breakingBadge.textContent   = story.badge;
    storyCategory.textContent   = story.category;
    storyHeadline.textContent   = story.headline;
    storySub.textContent        = story.sub;
    storySource.textContent     = story.source;
    storyReporter.textContent   = story.reporter;
    storyTime.textContent       = getTimeAgo();
    storyCounter.textContent    = `Story ${idx + 1} of ${newsAlerts.length}`;

    updateDots(idx);
    startProgress();

    if (animate) {
      // Slide in from right
      storyCard.classList.add('slide-in-right');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          storyCard.classList.remove('slide-in-right');
        });
      });
    }
  }

  if (animate && idx > 0) {
    // Slide out current story, then swap
    storyCard.classList.add('slide-out-left');
    setTimeout(() => {
      storyCard.classList.remove('slide-out-left');
      applyContent();
    }, 380);
  } else {
    applyContent();
  }

  // Schedule next
  clearTimeout(storyTimer);
  storyTimer = setTimeout(() => {
    const next = (idx + 1) % newsAlerts.length;
    flash(() => loadStory(next));
  }, STORY_DURATION);
}

// ── Helpers ───────────────────────────────────────────────────
function getTimeAgo() {
  const opts = ['Just Now', '1 min ago', '2 mins ago', 'Breaking'];
  return opts[Math.floor(Math.random() * opts.length)];
}

// ── Init ──────────────────────────────────────────────────────
buildDots();
setTimeout(() => {
  flash(() => loadStory(0, false));
}, INTRO_FLASH_MS);
