// ════════════════════════════════════════════════════════════
//  OUTRO / RAID SCENE
//
//  Default:        outro-raid.html             → Outro screen
//  Raid mode:      outro-raid.html?raid=Name   → Raid screen
//  Custom message: ?message=See+you+tomorrow   → Override tagline
//
//  EXAMPLES (OBS Browser Source URL):
//    outro-raid.html
//    outro-raid.html?raid=ChannelName
//    outro-raid.html?raid=ChannelName&message=Go+show+them+love
// ════════════════════════════════════════════════════════════

const params     = new URLSearchParams(window.location.search);
const raidTarget = params.get('raid');
const customMsg  = params.get('message');
const isRaid     = !!raidTarget;

// ── DOM refs ──────────────────────────────────────────────
const outroStage   = document.getElementById('outroStage');
const raidStage    = document.getElementById('raidStage');
const flash        = document.getElementById('flash');
const burst        = document.getElementById('burst');
const corners      = ['cornerTL','cornerTR','cornerBL','cornerBR'].map(id => document.getElementById(id));

// Outro els
const outroEyebrow = document.getElementById('outroEyebrow');
const outroTitle   = document.getElementById('outroTitle');
const outroDivider = document.getElementById('outroDivider');
const outroTagline = document.getElementById('outroTagline');
const socialsRow   = document.getElementById('socialsRow');
const followCta    = document.getElementById('followCta');
const twitchHandle = document.getElementById('twitchHandle');
const twitterHandle= document.getElementById('twitterHandle');
const youtubeHandle= document.getElementById('youtubeHandle');

// Raid els
const raidEyebrow  = document.getElementById('raidEyebrow');
const raidTargetEl = document.getElementById('raidTarget');
const raidDivider  = document.getElementById('raidDivider');
const raidCtaText  = document.getElementById('raidCtaText');

// ── Populate from config ──────────────────────────────────
twitchHandle.textContent  = '/' + STREAMER.twitch;
twitterHandle.textContent = STREAMER.twitter;
youtubeHandle.textContent = STREAMER.youtube;

if (isRaid) {
  raidTargetEl.textContent = raidTarget;
  raidCtaText.textContent  = `twitch.tv/${raidTarget}`;
  if (customMsg) {
    document.querySelector('#raidStage .tagline').textContent = customMsg;
  }
} else {
  if (customMsg) {
    outroTagline.textContent = customMsg;
  }
}

// ── Helpers ───────────────────────────────────────────────
function doFlash() {
  flash.classList.add('on');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    flash.classList.remove('on');
    flash.classList.add('off');
    setTimeout(() => flash.classList.remove('off'), 400);
  }));
}

function doBurst() {
  burst.innerHTML = '';
  const colors = ['#FF7919', '#FF9940', '#fff', '#f5a623', '#FF7919'];
  const COUNT  = 60;
  for (let i = 0; i < COUNT; i++) {
    const p     = document.createElement('div');
    p.className = 'burst-p';
    const angle = (360 / COUNT) * i + (Math.random() - 0.5) * (360 / COUNT);
    const dist  = Math.random() * 300 + 80;
    const size  = Math.random() * 5 + 2;
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

function at(ms, fn) { return setTimeout(fn, ms); }

// ── Outro sequence ────────────────────────────────────────
function runOutro() {
  outroStage.classList.remove('hidden');
  raidStage.classList.add('hidden');

  at(200,  doFlash);
  at(500,  () => outroEyebrow.classList.add('show'));
  at(900,  () => { outroTitle.classList.add('show'); doBurst(); });
  at(1300, () => outroDivider.classList.add('expand'));
  at(1600, () => outroTagline.classList.add('show'));
  at(2000, () => socialsRow.classList.add('show'));
  at(2400, () => followCta.classList.add('show'));
  at(2700, drawCorners);
  at(3100, doFlash);
}

// ── Raid sequence ─────────────────────────────────────────
function runRaid() {
  raidStage.classList.remove('hidden');
  outroStage.classList.add('hidden');

  at(200,  doFlash);
  at(500,  () => raidEyebrow.classList.add('show'));
  at(900,  () => {
    raidStage.querySelectorAll('.title').forEach(t => t.classList.add('show'));
    doBurst();
  });
  at(1300, () => raidDivider.classList.add('expand'));
  at(1600, () => raidStage.querySelector('.tagline').classList.add('show'));
  at(2000, () => raidStage.querySelector('.raid-cta').classList.add('show'));
  at(2400, drawCorners);
  at(2800, doFlash);
}

// ── Init ──────────────────────────────────────────────────
initParticles('particles', 15);

if (isRaid) {
  runRaid();
} else {
  runOutro();
}
