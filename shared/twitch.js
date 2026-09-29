// ════════════════════════════════════════════════════════════
//  TWITCH EVENTSUB (WebSocket) — live events for any scene
//
//  Needs shared/twitch-secrets.js (gitignored) loaded first:
//    const TWITCH = { clientId: '...', token: '...' };
//  Copy shared/twitch-secrets.example.js to get started.
//
//  Usage in a scene:
//    connectTwitch((type, data) => { ... });
//    const viewers = await getTwitchViewers(); // no connect needed
//    const channel = await getTwitchChannel(); // { game, title }
//
//  type / data:
//    'follow' { name }
//    'sub'    { name, tier }
//    'resub'  { name, tier, months }
//    'gift'   { name, tier, count }
//    'cheer'  { name, amount }
//    'raid'   { name, count }
//
//  A status pill appears briefly on connect, and stays on screen
//  if something goes wrong (e.g. expired token).
// ════════════════════════════════════════════════════════════

const TWITCH_WS_URL = 'wss://eventsub.wss.twitch.tv/ws';
const TWITCH_API    = 'https://api.twitch.tv/helix';

// Maps an EventSub notification to our alert types
const TWITCH_EVENTS = {
  'channel.follow': {
    version: '2',
    condition: id => ({ broadcaster_user_id: id, moderator_user_id: id }),
    map: e => ['follow', { name: e.user_name }],
  },
  'channel.subscribe': {
    version: '1',
    condition: id => ({ broadcaster_user_id: id }),
    // Gift recipients also fire this — the gift event already covers them
    map: e => (e.is_gift ? null : ['sub', { name: e.user_name, tier: tierNum(e.tier) }]),
  },
  'channel.subscription.message': {
    version: '1',
    condition: id => ({ broadcaster_user_id: id }),
    map: e => ['resub', { name: e.user_name, tier: tierNum(e.tier), months: e.cumulative_months }],
  },
  'channel.subscription.gift': {
    version: '1',
    condition: id => ({ broadcaster_user_id: id }),
    map: e => ['gift', {
      name:  e.is_anonymous ? 'Anonymous' : e.user_name,
      tier:  tierNum(e.tier),
      count: e.total || 1,
    }],
  },
  'channel.cheer': {
    version: '1',
    condition: id => ({ broadcaster_user_id: id }),
    map: e => ['cheer', { name: e.is_anonymous ? 'Anonymous' : e.user_name, amount: e.bits }],
  },
  'channel.raid': {
    version: '1',
    condition: id => ({ to_broadcaster_user_id: id }),
    map: e => ['raid', { name: e.from_broadcaster_user_name, count: e.viewers }],
  },
};

function tierNum(tier) {
  return Math.round(parseInt(tier) / 1000) || 1;
}

// ── Status pill ───────────────────────────────────────────
let twitchStatusEl = null;
let twitchStatusTimer = null;

function twitchStatus(text, isError = false) {
  if (!twitchStatusEl) {
    twitchStatusEl = document.createElement('div');
    twitchStatusEl.style.cssText = `
      position:fixed; top:12px; right:12px; z-index:9999;
      padding:6px 12px; border-radius:4px;
      font:700 12px/1 'Roboto Condensed', sans-serif;
      letter-spacing:0.08em; text-transform:uppercase; color:#fff;
      transition:opacity 0.4s; pointer-events:none;
    `;
    document.body.appendChild(twitchStatusEl);
  }
  clearTimeout(twitchStatusTimer);
  twitchStatusEl.textContent = text;
  twitchStatusEl.style.background = isError ? '#b3140a' : '#6441a5';
  twitchStatusEl.style.opacity = '1';
  if (!isError) twitchStatusTimer = setTimeout(() => { twitchStatusEl.style.opacity = '0'; }, 4000);
  (isError ? console.warn : console.log)('[twitch]', text);
}

// ── Helix API ─────────────────────────────────────────────
async function twitchApi(path, options = {}) {
  const res = await fetch(TWITCH_API + path, {
    ...options,
    headers: {
      'Authorization': `Bearer ${TWITCH.token}`,
      'Client-Id':     TWITCH.clientId,
      'Content-Type':  'application/json',
    },
  });
  if (res.status === 401) throw new Error('Token invalid or expired — get a new one');
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || `HTTP ${res.status}`);
  return body;
}

// The token owner's (your) Twitch user id — cached after first lookup
let twitchUserIdCache = null;
async function twitchUserId() {
  if (!twitchUserIdCache) twitchUserIdCache = (await twitchApi('/users')).data[0].id;
  return twitchUserIdCache;
}

function hasTwitchSecrets() {
  return typeof TWITCH !== 'undefined' && TWITCH.clientId && TWITCH.token;
}

// Current live viewer count: 0 when offline, null if Twitch isn't set up / fails
async function getTwitchViewers() {
  if (!hasTwitchSecrets()) return null;
  try {
    const { data } = await twitchApi(`/streams?user_id=${await twitchUserId()}`);
    return data.length ? data[0].viewer_count : 0;
  } catch (err) {
    console.warn('[twitch] viewer count failed:', err.message);
    return null;
  }
}

// Channel info (works offline too): { game, title }, or null if Twitch isn't set up / fails
async function getTwitchChannel() {
  if (!hasTwitchSecrets()) return null;
  try {
    const { data } = await twitchApi(`/channels?broadcaster_id=${await twitchUserId()}`);
    return { game: data[0].game_name, title: data[0].title };
  } catch (err) {
    console.warn('[twitch] channel info failed:', err.message);
    return null;
  }
}

async function subscribeAll(sessionId, userId) {
  const failed = [];
  for (const [type, cfg] of Object.entries(TWITCH_EVENTS)) {
    try {
      await twitchApi('/eventsub/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          type,
          version:   cfg.version,
          condition: cfg.condition(userId),
          transport: { method: 'websocket', session_id: sessionId },
        }),
      });
    } catch (err) {
      console.warn(`[twitch] could not subscribe to ${type}:`, err.message);
      failed.push(type.replace('channel.', ''));
    }
  }
  return failed;
}

// ── Connection ────────────────────────────────────────────
function connectTwitch(onEvent) {
  if (!hasTwitchSecrets()) {
    console.log('[twitch] no shared/twitch-secrets.js — running in test mode');
    return;
  }

  const seen = new Set(); // Twitch may redeliver a message
  let retryMs = 2000;

  function open(url, isReconnect = false) {
    const ws = new WebSocket(url);

    ws.onmessage = async ({ data }) => {
      const msg  = JSON.parse(data);
      const kind = msg.metadata.message_type;

      if (kind === 'session_welcome') {
        retryMs = 2000;
        if (isReconnect) return; // subscriptions carry over on a reconnect
        try {
          const failed = await subscribeAll(msg.payload.session.id, await twitchUserId());
          if (failed.length === Object.keys(TWITCH_EVENTS).length) {
            twitchStatus('Twitch: no events subscribed — check console', true);
          } else if (failed.length) {
            twitchStatus(`Twitch connected · missing: ${failed.join(', ')}`, true);
          } else {
            twitchStatus('Twitch connected');
          }
        } catch (err) {
          twitchStatus(`Twitch: ${err.message}`, true);
          ws.onclose = null;
          ws.close();
        }
      }

      else if (kind === 'notification') {
        if (seen.has(msg.metadata.message_id)) return;
        seen.add(msg.metadata.message_id);
        const handler = TWITCH_EVENTS[msg.metadata.subscription_type];
        const mapped  = handler && handler.map(msg.payload.event);
        if (mapped) onEvent(mapped[0], mapped[1]);
      }

      else if (kind === 'session_reconnect') {
        // Twitch asks us to move — open the new socket, then drop this one
        ws.onclose = null;
        open(msg.payload.session.reconnect_url, true);
        setTimeout(() => ws.close(), 1000);
      }

      else if (kind === 'revocation') {
        twitchStatus(`Twitch revoked ${msg.payload.subscription.type} — get a new token`, true);
      }
    };

    ws.onclose = () => {
      twitchStatus('Twitch disconnected — retrying…', true);
      setTimeout(() => open(TWITCH_WS_URL), retryMs);
      retryMs = Math.min(retryMs * 2, 60000);
    };
  }

  open(TWITCH_WS_URL);
}
