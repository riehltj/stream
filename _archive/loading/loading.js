// ════════════════════════════════════════════════════════════
//  LOADING SCREEN CONFIG — edit this section to customize
// ════════════════════════════════════════════════════════════

const CATEGORY_COLORS = {
  CHAT:    '#6B2FAF',
  RANKED:  '#D50A0A',
  TECH:    '#0d6efd',
  LORE:    '#C8920A',
  SNACKS:  '#1a8a3a',
  CLIPS:   '#CC0000',
  STREAM:  '#FF7919',
};

const headlines = [
  { category: 'STREAM', title: 'Streamer Says "Just One More Game"',     desc: 'Sources confirm this is the fourth "one more game" of the night. Experts expect at least six more.' },
  { category: 'CHAT',   title: 'Chat Confidently Backseats Again',        desc: 'Viewers who have never played the game offer detailed strategy. Streamer ignores all of it, loses anyway.' },
  { category: 'TECH',   title: 'Mic Was Muted for 20 Minutes',            desc: 'Local streamer delivers best bit of the year to absolutely no one. Chat spammed "MIC" 400 times.' },
  { category: 'RANKED', title: 'Rank Plummets After "Warmup" Games',      desc: 'The warmup did not work. Analysts are calling it "the worst warmup in recorded history."' },
  { category: 'SNACKS', title: 'Snack Break Runs 14 Minutes Over',        desc: 'Streamer insists the microwave "was being weird." BRB screen now has more watch time than gameplay.' },
  { category: 'CLIPS',  title: 'Clip of Streamer Walking Off Ledge Goes Viral', desc: 'The clip has been watched 11 times, 9 of which were by the streamer. Still counts.' },
  { category: 'LORE',   title: 'Chat Invents Inside Joke, Refuses to Explain', desc: 'New viewers left confused. Veterans say "you had to be there." Nobody remembers where it started.' },
  { category: 'TECH',   title: 'OBS Crashes During Best Play Ever',       desc: 'Witnesses say it was incredible. There is no footage. There will never be footage.' },
  { category: 'RANKED', title: 'Teammate Says "Trust Me Bro," Was Wrong', desc: 'Investigation ongoing. Early reports indicate the teammate should not have been trusted.' },
  { category: 'CHAT',   title: 'Lurker Speaks for First Time in 6 Months', desc: 'The message was "lol." Community celebrates. Streamer visibly emotional.' },
  { category: 'STREAM', title: 'Starting Soon Actually Starting Soon',    desc: "In a stunning turn of events, the stream is almost ready. Grab a drink — we're about to go live." },
];

// Replace `url` values with your actual GIF/image URLs
const funnyContent = [
  { url: '', title: 'Me after saying "easy" out loud' },
  { url: '', title: 'Chat watching me miss a wide open shot' },
  { url: '', title: 'Me at 1 HP thinking I can win this' },
  { url: '', title: 'Teammate: "trust me bro"' },
  { url: '', title: 'Me reading chat instead of playing' },
  { url: '', title: 'When the game patches 5 min before stream' },
  { url: '', title: 'Me realizing I was muted' },
  { url: '', title: 'Chat when I blame lag' },
  { url: '', title: 'The final boss has a second health bar' },
];

const HEADLINE_ROTATE_MS  = 8000;
const LOWER_THIRD_SHOW_MS = 5500;
const GIF_ROTATE_MS       = [14000, 18000, 11000];

// ════════════════════════════════════════════════════════════
//  INTERNALS
// ════════════════════════════════════════════════════════════

const ITEM_H       = 76;
const VISIBLE_ITEMS = 6;

// ── Shared components ─────────────────────────────────────────
initClock('clock');
initParticles('particles', 20);
initTicker('tickerTrack', [
  'Loading… this is not lag, it is anticipation',
  'Follow so the algorithm thinks we are cool',
  'Backseating is legal here but it will be ignored',
  'Streamer reportedly "almost ready" for the third time',
  'Subs fund the snack budget — think of the snacks',
  'Discord is open — come argue about loadouts',
  'Hydrate. Stretch. Blame lag.',
  'Raids welcome — we promise to act normal',
]);

// ── Left Panel Headlines ──────────────────────────────────────
let headlineIndex = 0;
const featuredCard     = document.getElementById('featuredCard');
const featuredImg      = document.getElementById('featuredImg');
const featuredCategory = document.getElementById('featuredCategory');
const featuredTitle    = document.getElementById('featuredTitle');
const featuredDesc     = document.getElementById('featuredDesc');
const headlinesInner   = document.getElementById('headlinesInner');

function categoryColor(cat) {
  return CATEGORY_COLORS[cat] || '#FF7919';
}

function applyFeatured(item) {
  const color = categoryColor(item.category);
  featuredImg.style.background =
    `linear-gradient(135deg, ${color}88 0%, rgba(13,27,42,0.95) 100%)`;
  featuredCategory.textContent      = item.category;
  featuredCategory.style.background = color;
  featuredTitle.textContent         = item.title;
  featuredDesc.textContent          = item.desc;
}

function renderFeatured(item, animate = false) {
  if (animate) {
    featuredCard.classList.add('updating');
    setTimeout(() => {
      applyFeatured(item);
      featuredCard.classList.remove('updating');
    }, 320);
  } else {
    applyFeatured(item);
  }
}

function renderList() {
  const listItems = [];
  for (let i = 1; i <= VISIBLE_ITEMS + 2; i++) {
    listItems.push(headlines[(headlineIndex + i) % headlines.length]);
  }
  headlinesInner.innerHTML = listItems.map((item, idx) => `
    <div class="headline-item">
      <div class="headline-num">${idx + 1}</div>
      <div class="headline-body">
        <div class="headline-category" style="color:${categoryColor(item.category)}">${item.category}</div>
        <div class="headline-title">${item.title}</div>
      </div>
    </div>
  `).join('');
  headlinesInner.style.transition = 'none';
  headlinesInner.style.transform  = 'translateY(0)';
}

function rotateHeadlines() {
  headlinesInner.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
  headlinesInner.style.transform  = `translateY(-${ITEM_H}px)`;
  setTimeout(() => {
    headlineIndex = (headlineIndex + 1) % headlines.length;
    renderFeatured(headlines[headlineIndex], true);
    renderList();
    showLowerThird(headlines[headlineIndex]);
  }, 520);
}

// ── Lower Third ───────────────────────────────────────────────
const lowerThird = document.getElementById('lowerThird');
const ltCategory = document.getElementById('ltCategory');
const ltHeadline = document.getElementById('ltHeadline');
const ltSub      = document.getElementById('ltSub');
let ltHideTimer  = null;

function showLowerThird(item) {
  if (ltHideTimer) clearTimeout(ltHideTimer);
  const color = categoryColor(item.category);
  ltCategory.textContent      = item.category;
  ltCategory.style.background = color;
  ltHeadline.textContent      = item.title;
  ltSub.textContent           = item.desc;
  lowerThird.classList.add('visible');
  ltHideTimer = setTimeout(() => lowerThird.classList.remove('visible'), LOWER_THIRD_SHOW_MS);
}

// ── Funny / GIF Panels ────────────────────────────────────────
const panels = [
  { a: document.getElementById('funnyA1'), b: document.getElementById('funnyB1'), title: document.getElementById('funnyTitle1') },
  { a: document.getElementById('funnyA2'), b: document.getElementById('funnyB2'), title: document.getElementById('funnyTitle2') },
  { a: document.getElementById('funnyA3'), b: document.getElementById('funnyB3'), title: document.getElementById('funnyTitle3') },
];

const panelState = panels.map((_, i) => ({
  currentLayer: 'a',
  contentIndex: (i * 3) % funnyContent.length,
}));

const PLACEHOLDER_GRADIENTS = [
  'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 100%)',
  'linear-gradient(135deg, #0a1a2e 0%, #0d4a8a 100%)',
  'linear-gradient(135deg, #1a0a0a 0%, #6b1a1a 100%)',
  'linear-gradient(135deg, #0a1a0a 0%, #1a4a1a 100%)',
  'linear-gradient(135deg, #1a1a0a 0%, #4a3a0a 100%)',
  'linear-gradient(135deg, #0a1a1a 0%, #0a3a3a 100%)',
  'linear-gradient(135deg, #2e0a1a 0%, #6b1a3a 100%)',
  'linear-gradient(135deg, #1a0a2e 0%, #4a1a6b 100%)',
  'linear-gradient(135deg, #0a0a1a 0%, #1a1a4a 100%)',
];

function setLayerContent(layer, item, idx) {
  if (item.url && item.url.length > 0) {
    layer.style.backgroundImage = `url('${item.url}')`;
    layer.style.background = '';
  } else {
    layer.style.backgroundImage = 'none';
    layer.style.background = PLACEHOLDER_GRADIENTS[idx % PLACEHOLDER_GRADIENTS.length];
  }
}

function initFunnyPanels() {
  panels.forEach((panel, i) => {
    const state = panelState[i];
    setLayerContent(panel.a, funnyContent[state.contentIndex], state.contentIndex);
    panel.title.textContent = funnyContent[state.contentIndex].title;
  });
}

function rotateFunnyPanel(panelIdx) {
  const panel = panels[panelIdx];
  const state = panelState[panelIdx];
  state.contentIndex = (state.contentIndex + 1) % funnyContent.length;
  const nextItem  = funnyContent[state.contentIndex];
  const isA       = state.currentLayer === 'a';
  const incoming  = isA ? panel.b : panel.a;
  const outgoing  = isA ? panel.a : panel.b;

  setLayerContent(incoming, nextItem, state.contentIndex);
  requestAnimationFrame(() => {
    outgoing.classList.add('fade-out');
    incoming.classList.add('fade-in');
    setTimeout(() => { panel.title.textContent = nextItem.title; }, 400);
    setTimeout(() => {
      outgoing.classList.remove('fade-out', 'fade-in');
      incoming.classList.remove('fade-out', 'fade-in');
      panel.a.style.opacity = isA ? '0' : '1';
      panel.b.style.opacity = isA ? '1' : '0';
      state.currentLayer = isA ? 'b' : 'a';
    }, 900);
  });
}

function scheduleFunnyPanel(panelIdx) {
  setTimeout(() => {
    rotateFunnyPanel(panelIdx);
    scheduleFunnyPanel(panelIdx);
  }, GIF_ROTATE_MS[panelIdx]);
}

// ── Init ──────────────────────────────────────────────────────
renderFeatured(headlines[headlineIndex]);
renderList();
setTimeout(() => showLowerThird(headlines[headlineIndex]), 1200);
setInterval(rotateHeadlines, HEADLINE_ROTATE_MS);
initFunnyPanels();
panels.forEach((_, i) => scheduleFunnyPanel(i));
