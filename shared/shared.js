// ─── Clock ────────────────────────────────────────────────────
// Call initClock('elementId') in your scene JS
function initClock(elementId) {
  const el = document.getElementById(elementId);
  function update() {
    el.textContent = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
    });
  }
  setInterval(update, 1000);
  update();
}

// ─── Particles ────────────────────────────────────────────────
// Call initParticles('containerId', count) in your scene JS
function initParticles(containerId, count = 22) {
  const container = document.getElementById(containerId);
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 3 + 1;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      --dur:${Math.random() * 10 + 8}s;
      --delay:${Math.random() * 14}s;
      --op:${Math.random() * 0.4 + 0.1};
      background:${Math.random() > 0.6 ? '#FF7919' : '#fff'};
    `;
    container.appendChild(p);
  }
}

// ─── Ticker ───────────────────────────────────────────────────
// Call initTicker('trackId', ['item 1', 'item 2', ...]) in your scene JS
function initTicker(trackId, items) {
  const track = document.getElementById(trackId);
  const doubled = [...items, ...items]; // seamless loop
  track.innerHTML = doubled.map(t =>
    `<span class="ticker-item">${t}<span class="ticker-sep">◆</span></span>`
  ).join('');
}
