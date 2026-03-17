// ════════════════════════════════════════════════════════════
//  SCENE TRANSITION BUMPER
//
//  Works as a standalone brand bumper OR as a scene transition.
//  Customize via URL params so one file covers every use case.
//
//  URL PARAMS (all optional):
//    label  — top eyebrow text   e.g. "UP NEXT" / "NOW ENTERING" / "WELCOME TO"
//    title  — main title line 1  e.g. "HALFTIME"
//    title2 — main title line 2  e.g. "BREAK"  (gets orange outline treatment)
//    sub    — small subtext       e.g. "Taking a quick break"
//    badge  — bottom-right badge  e.g. "SEASON 1" / "EPISODE 2"
//    loop   — loop duration in ms (default 5500)
//
//  EXAMPLES (paste as OBS Browser Source URL):
//    Brand bumper:      intro.html
//    Scene transition:  intro.html?label=UP+NEXT&title=HALFTIME&sub=Back+in+5
//    Top plays:         intro.html?label=NOW+ENTERING&title=TOP+PLAYS
//    Breaking news:     intro.html?label=INCOMING&title=BREAKING&title2=NEWS
//    Post game:         intro.html?label=SWITCHING+TO&title=POST+GAME
// ════════════════════════════════════════════════════════════

const params = new URLSearchParams(window.location.search);

const config = {
  eyebrow:    params.get('label')  || 'WELCOME TO',
  titleLine1: params.get('title')  || 'HIGHLIGHT',
  titleLine2: params.get('title2') || '',
  tagline:    params.get('sub')    || 'StreamCenter · Live',
  liveSub:    STREAMER.brand,
  badge:      params.get('badge')  || '',
  loopMs:     parseInt(params.get('loop')) || 5500,
};

// ════════════════════════════════════════════════════════════
//  INTERNALS
// ════════════════════════════════════════════════════════════

const cineTop    = document.getElementById('cineTop');
const cineBot    = document.getElementById('cineBot');
const flash      = document.getElementById('flash');
const shockwave  = document.getElementById('shockwave');
const eyebrowEl  = document.getElementById('eyebrow');
const titleEl    = document.getElementById('titleEl');
const titleGhost = document.getElementById('titleGhost');
const divider    = document.getElementById('introDivider');
const taglineEl  = document.getElementById('taglineEl');
const liveRow    = document.getElementById('liveRow');
const liveSubEl  = document.getElementById('liveSubEl');
const seasonBadge= document.getElementById('seasonBadge');
const burst      = document.getElementById('burst');
const corners    = ['cornerTL','cornerTR','cornerBL','cornerBR'].map(id => document.getElementById(id));

// ── Build content from config ─────────────────────────────────
function buildContent() {
  eyebrowEl.textContent = config.eyebrow;

  if (config.titleLine2) {
    titleEl.innerHTML    = `<span class="line1">${config.titleLine1}</span><span class="line2">${config.titleLine2}</span>`;
    titleGhost.innerHTML = `<span>${config.titleLine1}</span><span>${config.titleLine2}</span>`;
  } else {
    titleEl.textContent    = config.titleLine1;
    titleGhost.textContent = config.titleLine1;
  }

  taglineEl.textContent   = config.tagline;
  liveSubEl.textContent   = config.liveSub;
  seasonBadge.textContent = config.badge;

  // Hide season badge if empty
  if (!config.badge) seasonBadge.style.display = 'none';
}

// ── Flash ─────────────────────────────────────────────────────
function doFlash() {
  flash.classList.add('on');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    flash.classList.remove('on');
    flash.classList.add('off');
    setTimeout(() => flash.classList.remove('off'), 400);
  }));
}

// ── Particle burst ────────────────────────────────────────────
function doBurst() {
  burst.innerHTML = '';
  const colors = ['#FF7919', '#FF9940', '#fff', '#f5a623', '#FF7919'];
  const COUNT  = 50;
  for (let i = 0; i < COUNT; i++) {
    const p     = document.createElement('div');
    p.className = 'burst-p';
    const angle = (360 / COUNT) * i + (Math.random() - 0.5) * (360 / COUNT);
    const dist  = Math.random() * 280 + 80;
    const size  = Math.random() * 5 + 2;
    const dur   = Math.random() * 0.4 + 0.5;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      --angle:${angle}deg; --dist:${dist}px; --dur:${dur}s;
    `;
    burst.appendChild(p);
  }
  setTimeout(() => { burst.innerHTML = ''; }, 1000);
}

// ── Shockwave ─────────────────────────────────────────────────
function doShockwave() {
  shockwave.classList.remove('fire');
  void shockwave.offsetWidth;
  shockwave.classList.add('fire');
  setTimeout(() => shockwave.classList.remove('fire'), 800);
}

// ── Corner accents ────────────────────────────────────────────
function drawCorners() {
  corners.forEach((c, i) => setTimeout(() => c.classList.add('drawn'), i * 60));
}
function hideCorners() {
  corners.forEach(c => c.classList.remove('drawn'));
}

// ── Reset to pre-animation state ──────────────────────────────
function reset() {
  cineTop.classList.remove('open');
  cineBot.classList.remove('open');
  cineTop.classList.add('closed');
  cineBot.classList.add('closed');

  eyebrowEl.classList.remove('show');
  titleEl.classList.remove('slam');
  titleGhost.classList.remove('glitch');
  titleEl.style.opacity    = '0';
  titleGhost.style.opacity = '0';

  divider.classList.remove('expand');
  taglineEl.classList.remove('show');
  liveRow.classList.remove('show');
  seasonBadge.classList.remove('show');
  hideCorners();
  burst.innerHTML = '';
}

// ── Sequence timeline ─────────────────────────────────────────
function runSequence() {
  at(200,  () => { cineTop.classList.remove('closed'); cineBot.classList.remove('closed'); cineTop.classList.add('open'); cineBot.classList.add('open'); });
  at(480,  doFlash);
  at(720,  () => eyebrowEl.classList.add('show'));
  at(1000, () => { titleGhost.classList.add('glitch'); setTimeout(() => { titleEl.classList.add('slam'); doShockwave(); doBurst(); }, 80); });
  at(1380, () => divider.classList.add('expand'));
  at(1680, () => taglineEl.classList.add('show'));
  at(1980, () => liveRow.classList.add('show'));
  at(2250, drawCorners);
  at(2650, doFlash); // second punch

  // Badge only if content exists
  if (config.badge) at(2900, () => seasonBadge.classList.add('show'));

  // Close and loop
  at(config.loopMs - 1000, () => { cineTop.classList.remove('open'); cineBot.classList.remove('open'); cineTop.classList.add('closed'); cineBot.classList.add('closed'); });
  at(config.loopMs, () => { reset(); setTimeout(runSequence, 200); });
}

function at(ms, fn) { return setTimeout(fn, ms); }

// ── Space to replay ───────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    const highest = setTimeout(() => {}, 0);
    for (let i = 0; i <= highest; i++) clearTimeout(i);
    reset();
    setTimeout(runSequence, 300);
  }
});

// ── Init ──────────────────────────────────────────────────────
buildContent();
cineTop.classList.add('closed');
cineBot.classList.add('closed');
setTimeout(runSequence, 400);
