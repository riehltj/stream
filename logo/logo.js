// ════════════════════════════════════════════════════════════
//  HR LOGO — variant sheet + PNG exports
//
//  The monogram itself lives in shared/logo.js. "accent" is the
//  chosen logo used across the scenes.
//
//  logo.html shows every variant on dark + light.
//  ?only=ring|accent|badge&bg=none renders one, transparent (export).
//  ?only=avatar renders the main logo on navy, padded for Twitch's
//  circle crop (profile picture export).
// ════════════════════════════════════════════════════════════

// Monogram + orange come from shared/logo.js (the logo the scenes use)
const ORANGE   = HR_ORANGE;
const monogram = hrMonogram;

const VARIANTS = {
  // Cleaned-up original: thin ring, single color
  ring: ({ fg }) => `
    <circle cx="50" cy="50" r="45" fill="none" stroke="${fg}" stroke-width="3"/>
    ${monogram({ color: fg })}`,

  // Brand accent: orange crossbar + orange arc on a dim ring
  accent: ({ fg, dim }) => `
    <circle cx="50" cy="50" r="45" fill="none" stroke="${dim}" stroke-width="3"/>
    <circle cx="50" cy="50" r="45" fill="none" stroke="${ORANGE}" stroke-width="3"
            stroke-dasharray="70 213" transform="rotate(-80 50 50)"/>
    ${monogram({ color: fg, bar: ORANGE })}`,

  // Solid orange square, dark monogram
  badge: () => `
    <rect x="0" y="0" width="100" height="100" fill="${ORANGE}"/>
    ${monogram({ color: '#0a0a0f' })}`,
};

function logoSvg(name, theme) {
  const t = theme === 'light'
    ? { fg: '#0a0a0f', dim: 'rgba(10,10,15,0.18)' }
    : { fg: '#fff',    dim: 'rgba(255,255,255,0.22)' };
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${VARIANTS[name](t)}</svg>`;
}

// ════════════════════════════════════════════════════════════
//  PAGE
// ════════════════════════════════════════════════════════════

const params = new URLSearchParams(window.location.search);
const only   = params.get('only');
const root   = document.getElementById('sheet');

if (only === 'avatar') {
  document.body.classList.add('single');
  root.innerHTML = `<div class="avatar">${hrLogo()}</div>`;
} else if (only && VARIANTS[only]) {
  document.body.classList.add('single');
  if (params.get('bg') === 'none') document.body.classList.add('no-bg');
  root.innerHTML = `<div class="solo">${logoSvg(only, params.get('theme') || 'dark')}</div>`;
} else {
  const names = { ring: 'Ring — cleaned-up original', accent: 'Accent — orange crossbar + arc (main logo)', badge: 'Badge — orange square' };
  root.innerHTML = Object.keys(VARIANTS).map(v => `
    <section class="row">
      <h2>${names[v]}</h2>
      <div class="tiles">
        <div class="tile tile--dark">${logoSvg(v, 'dark')}</div>
        <div class="tile tile--light">${logoSvg(v, 'light')}</div>
        <div class="tile tile--dark tile--small">
          <div class="mini">${logoSvg(v, 'dark')}</div>
          <div class="lockup">
            <div class="lockup-mark">${logoSvg(v, 'dark')}</div>
            <div class="lockup-text"><span>Highlight</span><small>Riehl</small></div>
          </div>
        </div>
      </div>
    </section>
  `).join('');
}
