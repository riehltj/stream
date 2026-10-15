// ════════════════════════════════════════════════════════════
//  FILM BREAKDOWN
//
//  Left panel shows play info + numbered analysis points.
//  Point bar slides up above ticker with current point text.
//  Keyboard controls navigate through points and plays.
//
//  KEYBOARD:
//    N / → / Space  — Next point
//    P / ←          — Prev point
//    1–9            — Jump to point
//    ] / .          — Next play
//    [ / ,          — Prev play
//    R              — Reset to first point
//    H              — Toggle key hints
// ════════════════════════════════════════════════════════════

// ── Config ────────────────────────────────────────────────
const plays = [
  {
    category: 'ROUND 1',
    title: 'Opening Engagement',
    timestamp: '0:47',
    points: [
      'Watch the rotation — both players commit before cover is established',
      'Notice how quickly the third-party shows up once shots are heard',
      'The high ground here gives a massive sightline advantage',
      'Positioning mistake — never hold this angle without a bailout',
    ],
  },
  {
    category: 'ROUND 2',
    title: 'Zone Rotation Read',
    timestamp: '3:12',
    points: [
      'Early rotation call paid off — zone was already moving this direction',
      'Using the ridgeline to move without exposing to the center',
      'Inventory check mid-rotation — notice what\'s picked up vs skipped',
      'Final position chosen for coverage of two likely approach vectors',
      'The team that rotated late got caught completely exposed',
    ],
  },
  {
    category: 'ROUND 3',
    title: 'Late Game Positioning',
    timestamp: '8:55',
    points: [
      'Final ring callout — we\'re inside before anyone else arrives',
      'Proactive utility usage to cut off the east flank',
      'Watch the crossfire setup — both players have independent angles',
      'Timing the push here instead of waiting is the right call',
    ],
  },
  {
    category: 'KEY MOMENT',
    title: 'The Clutch Sequence',
    timestamp: '11:30',
    points: [
      'Down to last squad — managing the pressure of the 1v2',
      'Bait and reposition — forcing the enemy to push on our terms',
      'The bait works. Enemy commits too aggressively',
      'Clean cleanup — this is what all the positioning work leads to',
      'GG. Study this sequence. This is the win condition.',
    ],
  },
];

// ── Ticker content ────────────────────────────────────────
const tickerItems = [
  '📽️ Film Session Active',
  'Use N / → to advance analysis points',
  'Use ] / [ to switch between plays',
  'Press 1–9 to jump to a specific point',
  'Press H to toggle keyboard hints',
  'Press R to reset the current play',
];

// ── State ─────────────────────────────────────────────────
let currentPlayIdx  = 0;
let currentPointIdx = -1; // -1 = no point active yet
let hintsVisible    = true;

// ── DOM refs ──────────────────────────────────────────────
const playCategory  = document.getElementById('playCategory');
const playTitle     = document.getElementById('playTitle');
const playTimestamp = document.getElementById('playTimestamp');
const playCounter   = document.getElementById('playCounter');
const btnPrevPlay   = document.getElementById('btnPrevPlay');
const btnNextPlay   = document.getElementById('btnNextPlay');
const pointsList    = document.getElementById('pointsList');
const keyHints      = document.getElementById('keyHints');
const pointBar      = document.getElementById('pointBar');
const pointBarText  = document.getElementById('pointBarText');
const chipNum       = document.getElementById('chipNum');
const pbDots        = document.getElementById('pbDots');
const filmStrip     = document.getElementById('filmStrip');

// ── Film strip perforations ───────────────────────────────
function buildFilmStrip() {
  filmStrip.innerHTML = '';
  const count = Math.floor(310 / 20); // approx holes to fill width
  for (let i = 0; i < count; i++) {
    const hole = document.createElement('div');
    hole.className = 'film-hole';
    filmStrip.appendChild(hole);
  }
}

// ── Render play info ──────────────────────────────────────
function renderPlayInfo() {
  const play = plays[currentPlayIdx];
  playCategory.textContent  = play.category;
  playTitle.textContent     = play.title;
  playTimestamp.textContent = play.timestamp;
  playCounter.textContent   = `${currentPlayIdx + 1} / ${plays.length}`;
  btnPrevPlay.disabled = currentPlayIdx === 0;
  btnNextPlay.disabled = currentPlayIdx === plays.length - 1;
}

// ── Build points list ─────────────────────────────────────
function buildPointsList() {
  const play = plays[currentPlayIdx];
  pointsList.innerHTML = '';

  play.points.forEach((text, i) => {
    const li = document.createElement('li');
    li.className = 'point-item pending';
    li.dataset.idx = i;

    const numEl = document.createElement('span');
    numEl.className = 'point-num';
    numEl.textContent = i + 1;

    const textEl = document.createElement('span');
    textEl.className = 'point-text';
    textEl.textContent = text;

    const doneIcon = document.createElement('span');
    doneIcon.className = 'point-done-icon';
    doneIcon.textContent = '✓';

    li.appendChild(numEl);
    li.appendChild(textEl);
    li.appendChild(doneIcon);

    li.addEventListener('click', () => setPoint(i));
    pointsList.appendChild(li);
  });
}

// ── Build dots ────────────────────────────────────────────
function buildPbDots() {
  const play = plays[currentPlayIdx];
  pbDots.innerHTML = '';
  play.points.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'pb-dot';
    dot.dataset.idx = i;
    pbDots.appendChild(dot);
  });
}

// ── Update point item states ──────────────────────────────
function refreshPointStates() {
  const items = pointsList.querySelectorAll('.point-item');
  items.forEach((item, i) => {
    item.classList.remove('pending', 'active', 'done');
    if (i < currentPointIdx)       item.classList.add('done');
    else if (i === currentPointIdx) item.classList.add('active');
    else                            item.classList.add('pending');
  });

  // Update dots
  const dots = pbDots.querySelectorAll('.pb-dot');
  dots.forEach((dot, i) => {
    dot.classList.remove('active', 'done');
    if (i < currentPointIdx)       dot.classList.add('done');
    else if (i === currentPointIdx) dot.classList.add('active');
  });
}

// ── Scroll active point into view ────────────────────────
function scrollActiveIntoView() {
  const active = pointsList.querySelector('.point-item.active');
  if (active) active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

// ── Point bar text swap animation ────────────────────────
function swapPointBarText(newText) {
  pointBarText.classList.add('swap-out');
  setTimeout(() => {
    pointBarText.textContent = newText;
    pointBarText.classList.remove('swap-out');
    pointBarText.classList.add('swap-in');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      pointBarText.classList.remove('swap-in');
    }));
  }, 250);
}

// ── Set active point ──────────────────────────────────────
function setPoint(idx, skipBarAnimation) {
  const play = plays[currentPlayIdx];
  if (idx < 0 || idx >= play.points.length) return;

  const wasActive = currentPointIdx >= 0;
  currentPointIdx = idx;

  // Animate newly active item
  const items = pointsList.querySelectorAll('.point-item');
  refreshPointStates();

  const activeItem = items[idx];
  if (activeItem) {
    activeItem.classList.add('just-activated');
    setTimeout(() => activeItem.classList.remove('just-activated'), 400);
    scrollActiveIntoView();
  }

  // Update chip
  chipNum.textContent = idx + 1;

  // Show / update point bar
  if (!wasActive && !skipBarAnimation) {
    pointBarText.textContent = play.points[idx];
    pointBar.classList.add('visible');
  } else {
    swapPointBarText(play.points[idx]);
    if (!pointBar.classList.contains('visible')) {
      pointBar.classList.add('visible');
    }
  }
}

// ── Load play ─────────────────────────────────────────────
function loadPlay(idx) {
  currentPlayIdx  = idx;
  currentPointIdx = -1;

  renderPlayInfo();
  buildPointsList();
  buildPbDots();

  // Hide point bar until first point is selected
  pointBar.classList.remove('visible');
}

// ── Navigation helpers ────────────────────────────────────
function nextPoint() {
  const play = plays[currentPlayIdx];
  if (currentPointIdx < play.points.length - 1) {
    setPoint(currentPointIdx + 1);
  }
}

function prevPoint() {
  if (currentPointIdx > 0) {
    setPoint(currentPointIdx - 1);
  }
}

function nextPlay() {
  if (currentPlayIdx < plays.length - 1) loadPlay(currentPlayIdx + 1);
}

function prevPlay() {
  if (currentPlayIdx > 0) loadPlay(currentPlayIdx - 1);
}

function resetPlay() {
  loadPlay(currentPlayIdx);
}

// ── Keyboard controls ─────────────────────────────────────
document.addEventListener('keydown', e => {
  // Don't fire if modifier keys
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  switch (e.key) {
    case 'n': case 'N':
    case 'ArrowRight':
    case ' ':
      e.preventDefault();
      nextPoint();
      break;

    case 'p': case 'P':
    case 'ArrowLeft':
      e.preventDefault();
      prevPoint();
      break;

    case ']': case '.':
      nextPlay();
      break;

    case '[': case ',':
      prevPlay();
      break;

    case 'r': case 'R':
      resetPlay();
      break;

    case 'h': case 'H':
      hintsVisible = !hintsVisible;
      keyHints.classList.toggle('hidden', !hintsVisible);
      break;

    default:
      // Number keys 1–9: jump to that point
      if (e.key >= '1' && e.key <= '9') {
        setPoint(parseInt(e.key) - 1);
      }
      break;
  }
});

// ── Play nav buttons ──────────────────────────────────────
btnPrevPlay.addEventListener('click', prevPlay);
btnNextPlay.addEventListener('click', nextPlay);

// ── Init ──────────────────────────────────────────────────
buildFilmStrip();
loadPlay(0);
initClock('clock');
initParticles('particles', 12);
initTicker('tickerTrack', tickerItems);
