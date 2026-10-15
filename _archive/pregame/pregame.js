// ════════════════════════════════════════════════════════════
//  PRE-GAME BROADCAST OPENER
//
//  NFL-style broadcast intro. Plays once and holds on the
//  final "IT'S GAME TIME" screen. Space to replay.
//
//  URL PARAMS (all optional):
//    game     — game/show title      e.g. "ARC+RAIDERS"
//    season   — season label         e.g. "SEASON+2"
//    session  — session number       e.g. "5"
//    record   — win/loss record      e.g. "12-3"
//    opponent — who you're facing    e.g. "THE+LOBBY"
//    sub      — final screen subtext e.g. "Loading+up"
//
//  EXAMPLES:
//    pregame.html
//    pregame.html?game=ARC+RAIDERS&session=5&record=12-3
//    pregame.html?game=VALORANT&opponent=RANKED+QUEUE&season=SEASON+3
// ════════════════════════════════════════════════════════════

const params = new URLSearchParams(window.location.search);

const config = {
  game:     (params.get('game')     || 'ARC RAIDERS').toUpperCase(),
  season:   (params.get('season')   || 'SEASON 1').toUpperCase(),
  session:  params.get('session')   || '1',
  record:   params.get('record')    || '???–???',
  opponent: (params.get('opponent') || 'THE ENTIRE LOBBY').toUpperCase(),
  sub:      params.get('sub')       || 'Loading up · Lobby won\'t know what hit it',
};

// ── DOM refs ──────────────────────────────────────────────
const cineTop      = document.getElementById('cineTop');
const cineBot      = document.getElementById('cineBot');
const flash        = document.getElementById('flash');
const shockwave    = document.getElementById('shockwave');
const burst        = document.getElementById('burst');
const networkBug   = document.getElementById('networkBug');
const broadcastBar = document.getElementById('broadcastBar');
const corners      = ['cornerTL','cornerTR','cornerBL','cornerBR'].map(id => document.getElementById(id));

// Act 1
const actOpening    = document.getElementById('actOpening');
const openingEyebrow= document.getElementById('openingEyebrow');
const openingGame   = document.getElementById('openingGame');
const openingSession= document.getElementById('openingSession');
const openingSeasonEl = document.getElementById('openingSeason');
const openingSessionNum = document.getElementById('openingSessionNum');

// Act 2
const actPlayer       = document.getElementById('actPlayer');
const spotlightLabel  = document.getElementById('spotlightLabel');
const spotlightName   = document.getElementById('spotlightName');
const spotlightHandle = document.getElementById('spotlightHandle');
const spotlightStats  = document.getElementById('spotlightStats');
const ssSession       = document.getElementById('ssSession');
const ssRecord        = document.getElementById('ssRecord');

// Act 3
const actMatchup       = document.getElementById('actMatchup');
const matchupVs        = document.getElementById('matchupVs');
const matchupOpponent  = document.getElementById('matchupOpponent');
const matchupMeta      = document.getElementById('matchupMeta');

// Act 4
const actGameTime = document.getElementById('actGameTime');
const gtEyebrow   = document.getElementById('gtEyebrow');
const gtTitle     = document.getElementById('gtTitle');
const gtDivider   = document.getElementById('gtDivider');
const gtSub       = document.getElementById('gtSub');

// Broadcast bar
const broadcastGame    = document.getElementById('broadcastGame');
const broadcastSession = document.getElementById('broadcastSession');

// ── Populate config ───────────────────────────────────────
openingGame.textContent       = config.game;
openingSeasonEl.textContent   = config.season;
openingSessionNum.textContent = `SESSION ${config.session}`;
spotlightName.textContent     = STREAMER.name.toUpperCase();
spotlightHandle.textContent   = STREAMER.handle;
ssSession.textContent         = config.season.replace('SEASON ', 'S');
ssRecord.textContent          = config.record;
matchupOpponent.textContent   = config.opponent;
gtSub.textContent             = config.sub;
broadcastGame.textContent     = config.game;
broadcastSession.textContent  = `SESSION ${config.session}`;

// ── Effect helpers ────────────────────────────────────────
function doFlash() {
  flash.classList.add('on');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    flash.classList.remove('on');
    flash.classList.add('off');
    setTimeout(() => flash.classList.remove('off'), 400);
  }));
}

function doShockwave() {
  shockwave.classList.remove('fire');
  void shockwave.offsetWidth;
  shockwave.classList.add('fire');
  setTimeout(() => shockwave.classList.remove('fire'), 800);
}

function doBurst() {
  burst.innerHTML = '';
  const colors = ['#FF7919', '#FF9940', '#fff', '#FFD700', '#FF7919'];
  const COUNT  = 70;
  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'burst-p';
    const angle = (360 / COUNT) * i + (Math.random() - 0.5) * (360 / COUNT);
    const dist  = Math.random() * 350 + 80;
    const size  = Math.random() * 6 + 2;
    const dur   = Math.random() * 0.5 + 0.5;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      --angle:${angle}deg; --dist:${dist}px; --dur:${dur}s;
    `;
    burst.appendChild(p);
  }
  setTimeout(() => { burst.innerHTML = ''; }, 1200);
}

function drawCorners() {
  corners.forEach((c, i) => setTimeout(() => c.classList.add('drawn'), i * 60));
}

function hideCorners() {
  corners.forEach(c => c.classList.remove('drawn'));
}

function showAct(el) {
  el.classList.remove('act--hidden');
  el.classList.add('act--visible');
}

function hideAct(el) {
  el.classList.remove('act--visible');
  el.classList.add('act--hidden');
}

function at(ms, fn) { return setTimeout(fn, ms); }

// ── Reset ─────────────────────────────────────────────────
function reset() {
  cineTop.classList.remove('open');
  cineBot.classList.remove('open');
  cineTop.classList.add('closed');
  cineBot.classList.add('closed');

  hideCorners();
  networkBug.classList.remove('show');
  broadcastBar.classList.remove('show');

  [actPlayer, actMatchup, actGameTime].forEach(hideAct);
  showAct(actOpening);

  // Reset all animated elements
  [openingEyebrow, openingGame, openingSession,
   spotlightLabel, spotlightName, spotlightHandle, spotlightStats,
   matchupVs, matchupOpponent, matchupMeta,
   gtEyebrow, gtTitle, gtSub].forEach(el => {
    el.classList.remove('show', 'expand');
  });
  gtDivider.classList.remove('expand');
  burst.innerHTML = '';
}

// ── Main sequence ─────────────────────────────────────────
function runSequence() {

  // ── Act 1: Opening ────────────────────────
  at(300,  doFlash);
  at(500,  () => {
    cineTop.classList.remove('closed');
    cineBot.classList.remove('closed');
    cineTop.classList.add('open');
    cineBot.classList.add('open');
  });
  at(900,  () => networkBug.classList.add('show'));
  at(1200, () => openingEyebrow.classList.add('show'));
  at(1600, () => openingGame.classList.add('show'));
  at(2200, () => openingSession.classList.add('show'));
  at(2600, drawCorners);

  // ── Act 2: Player Spotlight ───────────────
  at(3400, () => {
    doFlash();
    hideCorners();
    setTimeout(() => {
      hideAct(actOpening);
      showAct(actPlayer);
      spotlightLabel.classList.add('show');
    }, 180);
  });
  at(3700, () => spotlightName.classList.add('show'));
  at(4200, () => {
    doShockwave();
    doBurst();
  });
  at(4300, () => spotlightHandle.classList.add('show'));
  at(4600, () => spotlightStats.classList.add('show'));

  // ── Act 3: Matchup ────────────────────────
  at(5500, () => {
    doFlash();
    hideAct(actPlayer);
    showAct(actMatchup);
    matchupVs.classList.add('show');
  });
  at(5900, () => matchupOpponent.classList.add('show'));
  at(6400, () => matchupMeta.classList.add('show'));

  // ── Act 4: IT'S GAME TIME ─────────────────
  at(7200, () => {
    doFlash();
    doShockwave();
    doBurst();
    hideAct(actMatchup);
    showAct(actGameTime);
    gtEyebrow.classList.add('show');
  });
  at(7500, () => gtTitle.classList.add('show'));
  at(7900, () => gtDivider.classList.add('expand'));
  at(8200, () => gtSub.classList.add('show'));
  at(8400, drawCorners);
  at(8800, doFlash); // final punch
  at(9000, () => broadcastBar.classList.add('show'));
}

// ── Space to replay ───────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    e.preventDefault();
    const highest = setTimeout(() => {}, 0);
    for (let i = 0; i <= highest; i++) clearTimeout(i);
    reset();
    setTimeout(runSequence, 400);
  }
});

// ── Init ──────────────────────────────────────────────────
initParticles('particles', 18);
cineTop.classList.add('closed');
cineBot.classList.add('closed');
setTimeout(runSequence, 300);
