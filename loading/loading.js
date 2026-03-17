// ════════════════════════════════════════════════════════════
//  LOADING SCREEN CONFIG — edit this section to customize
// ════════════════════════════════════════════════════════════

const CATEGORY_COLORS = {
  NBA:    '#6B2FAF',
  NFL:    '#D50A0A',
  MLB:    '#003087',
  NHL:    '#0038A8',
  UFC:    '#CC0000',
  GOLF:   '#1a6b1a',
  STREAM: '#FF7919',
};

const headlines = [
  { category: 'NBA',    title: 'LeBron Drops 40 in OT Thriller',       desc: 'Lakers edge the Celtics in overtime as James delivers another clutch performance in Boston.' },
  { category: 'NFL',    title: "Chiefs Dynasty Run Isn't Over",         desc: "Patrick Mahomes leads Kansas City to another AFC Championship — the critics keep getting quieter." },
  { category: 'MLB',    title: 'Ohtani Hits Walk-Off Grand Slam',       desc: 'Shohei Ohtani goes full two-way legend mode with a walk-off in the 10th inning.' },
  { category: 'UFC',    title: 'Jon Jones Defends Title Again',         desc: "Bones Jones puts on a striking clinic and cements his status as the sport's GOAT." },
  { category: 'NBA',    title: 'Wembanyama Named All-Star Starter',     desc: 'Victor Wembanyama earns his first All-Star selection after a dominant first half of the season.' },
  { category: 'NFL',    title: 'College Football Playoff Expands',      desc: 'The 12-team CFP format delivers chaos as all four No.1 seeds are eliminated in the quarterfinals.' },
  { category: 'NHL',    title: 'McDavid Breaks Points Record',          desc: "Connor McDavid surpasses Gretzky's single-season point pace as the Oilers surge in the West." },
  { category: 'MLB',    title: 'Spring Training Storylines',            desc: 'Rookie arms and veteran bats headline a loaded opening day roster battle across the majors.' },
  { category: 'GOLF',   title: 'Masters Preview: Who Wins Augusta?',    desc: 'Rory McIlroy looks to complete the career grand slam as the world No.1 heads to Augusta.' },
  { category: 'STREAM', title: "Stream's Starting Soon!",               desc: "Get comfortable — we're loading up the best content and getting ready to go live." },
];

// Replace `url` values with your actual GIF/image URLs
const funnyContent = [
  { url: '', title: 'When your build compiles first try' },
  { url: '', title: 'Me trying to read patch notes' },
  { url: '', title: 'The whole chat when I miss a shot' },
  { url: '', title: 'My reaction to losing 1 HP' },
  { url: '', title: 'Chat when there is a new bug' },
  { url: '', title: 'Teammate: trust me bro' },
  { url: '', title: 'When the final boss has a second form' },
  { url: '', title: 'Me vs. ranked queue' },
  { url: '', title: 'New update dropped' },
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
  'Stream starting up — grab a snack',
  'Follow to never miss a stream',
  'Chat rules: keep it hype & respectful',
  'Check out the Discord for community chat',
  'Hit that subscribe button',
  "Today's content loading up",
  'Turn up the volume',
  'Raids and hosts always welcome',
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
