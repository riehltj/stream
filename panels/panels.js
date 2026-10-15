// ════════════════════════════════════════════════════════════
//  TWITCH PANELS — 320 × 100 headers for the About section
//
//  Open panels.html to see the whole sheet.
//  ?only=discord shows just that panel (used for the PNG exports
//  in panels/export/ — upload those to Twitch).
//
//  Edit the list below; `icon` is a line icon, `brand` a logo
//  (both from shared/icons.js).
// ════════════════════════════════════════════════════════════

const PANELS = [
  { id: 'donate',    title: 'Donate',    sub: 'Fuel the stream',               icon:  'dollar'  },
  { id: 'youtube',   title: 'YouTube',   sub: 'Highlights & full VODs',        brand: 'youtube' },
  { id: 'discord',   title: 'Discord',   sub: 'Join the community',            brand: 'discord' },
  { id: 'about',     title: 'About Me',  sub: 'Who\'s behind the mic',         icon:  'user'    },
  { id: 'subscribe', title: 'Subscribe', sub: 'Emotes, no ads, eternal glory', icon:  'star'    },
];

// ════════════════════════════════════════════════════════════
//  INTERNALS
// ════════════════════════════════════════════════════════════

const only  = new URLSearchParams(window.location.search).get('only');
const sheet = document.getElementById('sheet');
if (only) document.body.classList.add('single');

sheet.innerHTML = PANELS
  .filter(p => !only || p.id === only)
  .map(p => `
    <div class="sheet-item">
      <div class="panel">
        <div class="panel-ghost">${p.title}</div>
        <div class="panel-corner panel-corner--l"></div>
        <div class="panel-corner panel-corner--r"></div>
        <div class="panel-icon">${p.brand ? brandIcon(p.brand) : icon(p.icon)}</div>
        <div class="panel-text">
          <div class="panel-title">${p.title}</div>
          <div class="panel-sub">${p.sub}</div>
        </div>
      </div>
      <div class="sheet-label">${p.id}.png</div>
    </div>
  `).join('');
