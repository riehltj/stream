// ════════════════════════════════════════════════════════════
//  GLOBAL STREAMER CONFIG
//  Edit this one file — all scenes pull from it automatically.
// ════════════════════════════════════════════════════════════

const STREAMER = {
  name: 'Highlight',
  handle: '@HighlightRiehl',
  twitch: 'HighlightRiehl',
  twitter: '@HighlightRiehl',
  youtube: '@HighlightRiehl',
  brand: 'StreamCenter',
  tagline: 'StreamCenter · Live',
};

// ─── Ticker (bottom scroll bar) ───────────────────────────────
// `all` shows on every scene with a ticker; each scene adds its own
// lines on top. Scenes call initTicker('tickerTrack', tickerItems('brb')).
const TICKER = {
  all: [
    'Follow the channel so you always miss the stream',
    'Check out the Discord for community chat and Nudes',
    'Grab a snack while you wait',
    'Go get a beer',
    'Made you look'
  ],
  'starting-soon': [
    'Stream starting in just a moment',
    "I'm pooping be right there",
    "I'm on the way",
    'Turn down for what',
  ],
  brb: [
    'Be right back — just a moment',
    'Drop a message in chat while you wait',
    'Probably grabbing a drink',
  ],
};
