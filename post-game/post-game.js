// ════════════════════════════════════════════════════════════
//  POST-GAME INTERVIEW CONFIG — edit this section
// ════════════════════════════════════════════════════════════

// Your info — pulled from shared/config.js
const player = {
  name:   STREAMER.name,
  handle: STREAMER.handle,
  title:  'Arc Raiders · Extraction Shooter',
};

// Session recap stats shown in the left panel
// Add/remove as you like — max 4 looks best
const recapStats = [
  { val: '–', label: 'Extractions' },
  { val: '–', label: 'Fights Won' },
  { val: '–', label: 'Deaths' },
  { val: '–', label: 'K/D' },
];

// Topics listed in the left panel (what the "interview" covers)
const topics = [
  'Session highlights',
  'Extraction strategy',
  'K/D breakdown',
  'Chat performance review',
  'Tilt management',
  'What\'s next',
];

// Interview questions — each has its own reporter
// Add as many as you want, they loop
const questions = [
  {
    reporter: 'Chad McStream',
    outlet: 'Gaming Correspondent',
    question: 'Talk us through what happened out there today.',
  },
  {
    reporter: '@ChatGoat',
    outlet: 'Field Reporter, Twitch',
    question: 'Your K/D was described by some analysts as "a choice". How do you respond to that?',
  },
  {
    reporter: 'Bob Sportsname',
    outlet: 'StreamCenter Sports Network',
    question: 'There were a few moments today where things got tight. Walk us through your mindset.',
  },
  {
    reporter: 'Anonymous Source',
    outlet: 'Cannot Be Named',
    question: 'How does it feel knowing the entire lobby was scared of you today?',
  },
  {
    reporter: 'The Chat',
    outlet: 'Collectively',
    question: 'On a scale of 1 to 10, how tilted are you right now? Be honest.',
  },
  {
    reporter: 'Dr. No Scope',
    outlet: 'Journal of Competitive Gaming',
    question: 'Your extraction rate raised some eyebrows in the scientific community. Comment?',
  },
  {
    reporter: 'Chad McStream',
    outlet: 'Gaming Correspondent',
    question: 'What\'s your message to anyone who doubted you coming into today\'s session?',
  },
  {
    reporter: 'The Discord Server',
    outlet: 'Community Correspondent',
    question: 'Some viewers said you were "playing scared" in the early rounds. Fair criticism?',
  },
  {
    reporter: 'Mom',
    outlet: 'Watching From the Other Room',
    question: 'When are you going to eat something? Also are you drinking enough water?',
  },
  {
    reporter: 'Bob Sportsname',
    outlet: 'StreamCenter Sports Network',
    question: 'What adjustments can we expect to see in the next session?',
  },
  {
    reporter: 'The Lobby',
    outlet: 'Submitted Via Complaint Form',
    question: 'Is there anything you\'d like to say to the opponents you eliminated today?',
  },
  {
    reporter: '@ChatGoat',
    outlet: 'Field Reporter, Twitch',
    question: 'Final question — greatest player to ever do it, or greatest of all time?',
  },
];

// Auto-advance to next question (ms). Set to 0 to disable auto-advance.
const AUTO_ADVANCE_MS = 14000;

// ════════════════════════════════════════════════════════════
//  INTERNALS
// ════════════════════════════════════════════════════════════

let currentIdx = 0;
let autoTimer = null;
let hintsVisible = true;

// ── Shared ────────────────────────────────────────────────────
initClock('clock');
initParticles('particles', 14);
initTicker('tickerTrack', [
  'Live post-game interview — StreamCenter Sports Network',
  'Brought to you by the StreamCenter Analytics Department',
  'Questions submitted by chat, analysts, and anonymous sources',
  'All statistics are real. Analyst interpretations may vary.',
  'This interview is conducted under the strict rules of good vibes only',
  'StreamCenter: The Most Trusted Name in Gaming Coverage',
]);

// ── DOM refs ──────────────────────────────────────────────────
const playerNameEl = document.getElementById('playerName');
const playerHandleEl = document.getElementById('playerHandle');
const playerTitleEl = document.getElementById('playerTitle');
const recapGridEl = document.getElementById('recapGrid');
const topicsListEl = document.getElementById('topicsList');
const reporterChip = document.getElementById('reporterChip');
const reporterNameEl = document.getElementById('reporterName');
const reporterOutlet = document.getElementById('reporterOutlet');
const questionTextEl = document.getElementById('questionText');
const questionCounter = document.getElementById('questionCounter');
const qDotsEl = document.getElementById('qDots');
const qNumEl = document.getElementById('qNum');
const keyHintsMini = document.querySelector('.key-hints-mini');

// ── Build player card ─────────────────────────────────────────
function buildPlayerCard() {
  playerNameEl.textContent = player.name;
  playerHandleEl.textContent = player.handle;
  playerTitleEl.textContent = player.title;

  recapGridEl.innerHTML = recapStats.map((s, i) => `
    <div class="recap-stat" style="animation-delay: ${0.3 + i * 0.07}s">
      <div class="recap-stat-val">${s.val}</div>
      <div class="recap-stat-label">${s.label}</div>
    </div>
  `).join('');

  topicsListEl.innerHTML = topics.map((t, i) => `
    <li class="topic-item" id="topic-${i}" style="animation-delay: ${0.5 + i * 0.06}s">
      <span class="topic-bullet"></span>
      <span>${t}</span>
    </li>
  `).join('');
}

// ── Build question dots ───────────────────────────────────────
function buildDots() {
  // Show max 12 dots to avoid overflow
  const count = Math.min(questions.length, 12);
  qDotsEl.innerHTML = Array.from({ length: count }, (_, i) =>
    `<div class="q-dot" id="qdot-${i}"></div>`
  ).join('');
}

function updateDots(idx) {
  const count = Math.min(questions.length, 12);
  for (let i = 0; i < count; i++) {
    const dot = document.getElementById(`qdot-${i}`);
    if (!dot) continue;
    dot.classList.toggle('active', i === idx);
    dot.classList.toggle('done', i < idx);
  }
  qNumEl.textContent = `${idx + 1} / ${questions.length}`;
}

// Highlight the relevant topic based on question index (cycles through topics)
function highlightTopic(qIdx) {
  const topicIdx = qIdx % topics.length;
  document.querySelectorAll('.topic-item').forEach((el, i) => {
    el.classList.toggle('active', i === topicIdx);
  });
}

// ── Load question ─────────────────────────────────────────────
function loadQuestion(idx, animate = true) {
  const q = questions[idx];

  function applyQuestion() {
    reporterNameEl.textContent = q.reporter;
    reporterOutlet.textContent = q.outlet;
    questionTextEl.textContent = q.question;
    updateDots(idx);
    highlightTopic(idx);

    if (animate) {
      questionTextEl.classList.add('slide-in');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        questionTextEl.classList.remove('slide-in');
      }));
    }
  }

  if (animate) {
    questionTextEl.classList.add('slide-out');
    setTimeout(() => {
      questionTextEl.classList.remove('slide-out');
      applyQuestion();
    }, 320);
  } else {
    applyQuestion();
  }

  scheduleAutoAdvance();
}

function nextQuestion() {
  currentIdx = (currentIdx + 1) % questions.length;
  loadQuestion(currentIdx);
}

function randomQuestion() {
  let next;
  do { next = Math.floor(Math.random() * questions.length); }
  while (next === currentIdx && questions.length > 1);
  currentIdx = next;
  loadQuestion(currentIdx);
}

// ── Auto-advance ──────────────────────────────────────────────
function scheduleAutoAdvance() {
  clearTimeout(autoTimer);
  if (AUTO_ADVANCE_MS > 0) {
    autoTimer = setTimeout(nextQuestion, AUTO_ADVANCE_MS);
  }
}

// ── Keyboard handler ──────────────────────────────────────────
document.addEventListener('keydown', e => {
  switch (e.key.toUpperCase()) {
    case 'N':
    case ' ':
      e.preventDefault();
      nextQuestion();
      break;
    case 'R':
      randomQuestion();
      break;
    case 'H':
      hintsVisible = !hintsVisible;
      keyHintsMini.classList.toggle('hidden', !hintsVisible);
      break;
  }
});

// ── Init ──────────────────────────────────────────────────────
buildPlayerCard();
buildDots();
loadQuestion(0, false);
scheduleAutoAdvance();
