// ════════════════════════════════════════════════════════════
//  BRB CONFIG — edit this section
// ════════════════════════════════════════════════════════════

// "While You Wait" items shown in the left panel
const waitItems = [
  { icon: 'message', text: 'Drop a welcome back message in the chat so I feel loved' },
  { icon: 'bell', text: 'Turn on notifications so you know when to not watch the stream' },
  { icon: 'heart', text: 'Hit that follow button! It\'s free and it helps a ton' },
  { icon: 'crown', text: 'You should use you twitch prime on me so I can feed my cats' },
  { icon: 'beer', text: 'Grab a drink you deserve it' },
  { icon: 'venus', text: 'Join the Discord for nudes' }
];

// Break report quotes — always analytical, always slightly absurd
const breakReports = [
  { quote: "This break brought to you by Indian food.", source: "— StreamCenter Analytics" },
  { quote: "If the break lasts longer than 5 mins call the plumber", source: "— Medical Panel" },
  { quote: "Our models predict a 97.3% chance of worse content after this break.", source: "— Artificial Intelligence Programming" },
  { quote: "Sources confirm: chat distracted streamer and that is why streamer died", source: "— Viewer Research Group" },
  { quote: "Comeback narrative: unlikely. Post-break comment: He should retire.", source: "— The Coaching Staff" },
  { quote: "Pre-break performance placed in the 99th percentile of streamers who look this good.", source: "— Independent Auditors" },
  { quote: "The chat has been given time to reflect on its choices.", source: "— League Officials" },
  { quote: "My dad looks delicious'.", source: "— Smudge" },
];

// Up Next teaser — what's coming up
const upNextItems = [
  'Pretending that never happened',
  'Ignoring chat\'s advice',
  'Probably a beer',
  'Emotional damage: fully healed',
  'Likely more lag',
];

// Break report rotation interval (ms)
const REPORT_ROTATE_MS = 10000;

// ════════════════════════════════════════════════════════════
//  INTERNALS
// ════════════════════════════════════════════════════════════

// ── Shared ────────────────────────────────────────────────────
initClock('clock');
initParticles('particles', 20);
initTicker('tickerTrack', tickerItems('brb'));

// ── DOM refs ──────────────────────────────────────────────────
const reportBody = document.querySelector('.report-body');
const reportQuote = document.getElementById('reportQuote');
const reportSource = document.getElementById('reportSource');
const waitListEl = document.getElementById('waitList');
const teaserItemsEl = document.getElementById('teaserItems');

// ── Build static panels ───────────────────────────────────────
function buildWaitList() {
  waitListEl.innerHTML = waitItems.map((item, i) => `
    <li class="wait-item" style="animation-delay: ${0.8 + i * 0.08}s">
      <span class="wait-item-icon">${icon(item.icon)}</span>
      <span>${item.text}</span>
    </li>
  `).join('');
}

function buildTeaserItems() {
  teaserItemsEl.innerHTML = upNextItems.map((item, i) => `
    <div class="teaser-item" style="animation-delay: ${0.85 + i * 0.07}s">
      <span class="teaser-bullet"></span>
      <span>${item}</span>
    </div>
  `).join('');
}

// ── Break report rotation ──────────────────────────────────
let reportIdx = 0;

function rotateReport() {
  reportBody.classList.add('swapping');
  setTimeout(() => {
    reportIdx = (reportIdx + 1) % breakReports.length;
    reportQuote.textContent = breakReports[reportIdx].quote;
    reportSource.textContent = breakReports[reportIdx].source;
    reportBody.classList.remove('swapping');
  }, 420);
}

// ── Init ──────────────────────────────────────────────────────
buildWaitList();
buildTeaserItems();

// Set first report
reportQuote.textContent = breakReports[0].quote;
reportSource.textContent = breakReports[0].source;

setInterval(rotateReport, REPORT_ROTATE_MS);
