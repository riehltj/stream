// ════════════════════════════════════════════════════════════
//  HR LOGO — the one source of truth for the brand mark
//
//  Usage:
//    In HTML: <span class="brand-mark" data-logo></span>   (filled on load)
//             data-logo="light" for use on light backgrounds
//    In JS:   el.innerHTML = hrLogo();
//
//  Monogram on a 100 × 100 grid: a free-standing bar on the left +
//  a "+" through the R's stem read as an H; the R's bowl hangs below
//  the crossbar. Even 8-unit strokes, square ends.
//  logo/logo.html shows every variant and exports the PNGs.
// ════════════════════════════════════════════════════════════

const HR_ORANGE = '#FF7919';

// `bar` = the H crossbar (orange in the main logo)
function hrMonogram({ color = '#fff', bar = color } = {}) {
  return `
    <g fill="none" stroke-width="8" stroke-linejoin="miter" stroke-linecap="butt">
      <path d="M30 22 V44"                      stroke="${color}"/>
      <path d="M50 22 V80"                      stroke="${color}"/>
      <path d="M40 40 H62"                      stroke="${bar}"/>
      <path d="M50 52 H59 A8 8 0 0 1 59 68 H50" stroke="${color}"/>
      <path d="M56 68 L69 81"                   stroke="${color}"/>
    </g>`;
}

// Main logo: dim ring + orange arc, orange crossbar
function hrLogo({ theme = 'dark' } = {}) {
  const fg  = theme === 'light' ? '#0a0a0f' : '#fff';
  const dim = theme === 'light' ? 'rgba(10,10,15,0.18)' : 'rgba(255,255,255,0.22)';
  return `
    <svg class="hr-logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="HR">
      <circle cx="50" cy="50" r="45" fill="none" stroke="${dim}" stroke-width="3"/>
      <circle cx="50" cy="50" r="45" fill="none" stroke="${HR_ORANGE}" stroke-width="3"
              stroke-dasharray="70 213" transform="rotate(-80 50 50)"/>
      ${hrMonogram({ color: fg, bar: HR_ORANGE })}
    </svg>`;
}

document.querySelectorAll('[data-logo]').forEach(el => {
  el.innerHTML = hrLogo({ theme: el.dataset.logo || 'dark' });
});
