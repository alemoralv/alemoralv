/* Boot for the live network that travels the whole page. On wide screens
   with a fine pointer, no reduced motion and WebGL 2, the renderer runs in a
   fixed layer over the free lane beside the copy; the layer is clipped around
   every element marked data-network-avoid, so the object can never sit on the
   portrait or the controls, and the composition is measured live from the
   page. Everyone else gets the Blender-rendered still, which stays in the page
   as the accessible image in every case. Scroll progress drives construction. */
const host = document.querySelector('[data-network-layer]');
if (host) {
  const poster = host.querySelector('.network-poster');
  const controls = document.querySelector('[data-network-controls]');
  const status = document.querySelector('[data-network-status]');
  const fireButton = document.querySelector('[data-network-fire]');
  const pauseButton = document.querySelector('[data-network-pause]');
  const lanes = Array.from(document.querySelectorAll('[data-network-lane]'));
  const avoid = Array.from(document.querySelectorAll('[data-network-avoid]'));
  const nav = document.querySelector('.index');
  const wide = matchMedia('(min-width: 1024px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const connection = navigator.connection;
  const GAP = 22, EDGE = 14, MIN = 96;
  let live = null, pending = false, failed = false, paused = false, layoutFrame = 0, room = false;
  let box = { x: -1, y: -1, w: 0, h: 0 }, free = null, clip = '';

  // The largest free rectangle of a box after removing holes: every hole edge
  // is a grid line, so a candidate is a union of whole cells. Hysteresis keeps
  // the previous choice unless a new one is clearly larger.
  function largestFree(w, h, holes, previous) {
    const X = [...new Set([0, w, ...holes.flatMap(o => [o.x, o.x + o.w])])].sort((a, b) => a - b);
    const Y = [...new Set([0, h, ...holes.flatMap(o => [o.y, o.y + o.h])])].sort((a, b) => a - b);
    const nx = X.length - 1, ny = Y.length - 1, blocked = new Uint8Array(nx * ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const cx = (X[i] + X[i + 1]) / 2, cy = (Y[j] + Y[j + 1]) / 2;
      blocked[j * nx + i] = holes.some(o => cx > o.x && cx < o.x + o.w && cy > o.y && cy < o.y + o.h) ? 1 : 0;
    }
    let best = null, bestScore = 0;
    for (let i0 = 0; i0 < nx; i0++) for (let i1 = i0 + 1; i1 <= nx; i1++) for (let j0 = 0; j0 < ny; j0++) for (let j1 = j0 + 1; j1 <= ny; j1++) {
      let ok = true;
      for (let j = j0; j < j1 && ok; j++) for (let i = i0; i < i1; i++) if (blocked[j * nx + i]) { ok = false; break; }
      if (!ok) continue;
      const r = { x: X[i0], y: Y[j0], w: X[i1] - X[i0], h: Y[j1] - Y[j0] };
      if (r.w < MIN || r.h < MIN) continue;
      let score = r.w * r.h;
      if (previous) {
        const ow = Math.max(0, Math.min(r.x + r.w, previous.x + previous.w) - Math.max(r.x, previous.x));
        const oh = Math.max(0, Math.min(r.y + r.h, previous.y + previous.h) - Math.max(r.y, previous.y));
        score *= 1 + 0.25 * (ow * oh) / Math.max(1, previous.w * previous.h);
      }
      if (score > bestScore) { bestScore = score; best = r; }
    }
    return best;
  }
  function progress() { return Math.max(0, Math.min(1, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight))); }
  function px(v) { return Math.round(v * 100) / 100; }

  function layout() {
    layoutFrame = 0;
    if (!wide.matches) {
      if (box.w) { box = { x: -1, y: -1, w: 0, h: 0 }; host.style.cssText = ''; poster.style.cssText = ''; }
      room = false; sync(); return;
    }
    const top = Math.max(0, nav ? nav.getBoundingClientRect().bottom : 0) + EDGE, bottom = innerHeight - EDGE;
    let left = -Infinity;
    for (const lane of lanes) { const r = lane.getBoundingClientRect(); if (r.width > 0) left = Math.max(left, r.left); }
    const right = document.documentElement.clientWidth - EDGE;
    const next = { x: left, y: top, w: right - left, h: bottom - top };
    room = Number.isFinite(left) && next.w >= MIN && next.h >= MIN;
    if (!room) { sync(); return; }
    if (next.x !== box.x || next.y !== box.y || next.w !== box.w || next.h !== box.h) {
      box = next;
      host.style.left = px(box.x) + 'px'; host.style.top = px(box.y) + 'px'; host.style.width = px(box.w) + 'px'; host.style.height = px(box.h) + 'px';
    }
    const holes = [];
    for (const el of avoid) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const x0 = Math.max(0, r.left - GAP - box.x), y0 = Math.max(0, r.top - GAP - box.y);
      const x1 = Math.min(box.w, r.right + GAP - box.x), y1 = Math.min(box.h, r.bottom + GAP - box.y);
      if (x1 > x0 && y1 > y0) holes.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 });
    }
    free = largestFree(box.w, box.h, holes, free);
    let path = 'M0 0H' + px(box.w) + 'V' + px(box.h) + 'H0Z';
    for (const o of holes) path += 'M' + px(o.x) + ' ' + px(o.y) + 'H' + px(o.x + o.w) + 'V' + px(o.y + o.h) + 'H' + px(o.x) + 'Z';
    if (path !== clip) { clip = path; host.style.clipPath = 'path(evenodd, "' + path + '")'; }
    if (free) { poster.style.left = px(free.x) + 'px'; poster.style.top = px(free.y) + 'px'; poster.style.width = px(free.w) + 'px'; poster.style.height = px(free.h) + 'px'; }
    room = Boolean(free);
    if (live && room) { live.setFrame({ free, w: box.w, h: box.h }); live.setProgress(progress()); }
    sync();
  }
  function scheduleLayout() { if (!layoutFrame) layoutFrame = requestAnimationFrame(layout); }

  function eligible() { return wide.matches && fine.matches && !reduced.matches && !connection?.saveData && Boolean(document.createElement('canvas').getContext('webgl2')); }
  function fallback(error) {
    failed = true;
    live?.dispose(); live = null;
    host.classList.remove('is-live');
    if (controls) controls.hidden = true;
    if (error) console.warn('Network still fallback:', error.message);
  }
  function sync() {
    if (!eligible()) {
      if (live) { live.dispose(); live = null; host.classList.remove('is-live'); if (controls) controls.hidden = true; }
      return;
    }
    if (live) { live.setActive(room && !document.hidden && !paused); return; }
    if (pending || failed || !room) return;
    pending = true;
    import('./neural.js')
      .then(m => m.createNetwork(host, { onFailure: fallback, status, fireButton }))
      .then(result => {
        if (!eligible()) { result.dispose(); return; }
        live = result;
        host.classList.add('is-live');
        if (controls) controls.hidden = false;
        layout();
      })
      .catch(fallback)
      .finally(() => { pending = false; });
  }
  if (pauseButton) pauseButton.addEventListener('click', () => {
    paused = !paused;
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.textContent = paused ? 'Resume motion' : 'Pause motion';
    sync();
  });
  document.addEventListener('visibilitychange', sync);
  addEventListener('scroll', scheduleLayout, { passive: true });
  addEventListener('resize', scheduleLayout, { passive: true });
  wide.addEventListener('change', scheduleLayout);
  reduced.addEventListener('change', sync);
  fine.addEventListener('change', sync);
  connection?.addEventListener?.('change', sync);
  if ('ResizeObserver' in window) new ResizeObserver(scheduleLayout).observe(document.body);
  if (document.fonts) document.fonts.ready.then(scheduleLayout);
  addEventListener('load', scheduleLayout, { once: true });
  layout();
}
