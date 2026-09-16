/* Boot for the live network that travels the whole page. Wherever WebGL 2
   works the object is live: from 900px it is a fixed layer over the free lane
   beside the copy, clipped around every element marked data-network-avoid so
   it can never sit on the portrait or the controls, with the composition
   measured live from the page; below 900px it lives inside a figure in flow
   after the opening and builds as that figure passes through the viewport.
   Reduced motion keeps it live but calm: nothing moves on its own, everything
   still answers the visitor. The Blender still stays in the page as the
   accessible image and takes over only when WebGL or the asset fails. */
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
  const wide = matchMedia('(min-width: 900px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  const GAP = 22, EDGE = 14, MIN = 96, RETRIES = 3;
  let live = null, pending = false, failed = false, paused = false, layoutFrame = 0, room = false, onscreen = true, attempts = 0, retryTimer = 0;
  // WebGL 2 is probed once and the probe context released at once: a probe per
  // scroll frame would pile up contexts until the browser dropped the live one.
  let webgl = null;
  function webglAvailable() {
    if (webgl !== null) return webgl;
    try {
      const c = document.createElement('canvas'), gl = c.getContext('webgl2');
      webgl = Boolean(gl);
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch (e) { webgl = false; }
    return webgl;
  }
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
  function pageProgress() { return Math.max(0, Math.min(1, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight))); }
  function px(v) { return Math.round(v * 100) / 100; }
  function place(next) {
    if (next.x === box.x && next.y === box.y && next.w === box.w && next.h === box.h) return;
    box = next;
    if (wide.matches) { host.style.left = px(box.x) + 'px'; host.style.top = px(box.y) + 'px'; host.style.width = px(box.w) + 'px'; host.style.height = px(box.h) + 'px'; }
  }

  function layout() {
    layoutFrame = 0;
    if (!wide.matches) {
      // In flow: the figure is the frame, it builds as it travels up the viewport, and it runs only while on screen.
      if (host.style.left) { host.style.cssText = ''; poster.style.cssText = ''; clip = ''; }
      const r = host.getBoundingClientRect();
      place({ x: 0, y: 0, w: r.width, h: r.height });
      free = { x: 0, y: 0, w: r.width, h: r.height };
      room = r.width >= MIN && r.height >= MIN;
      onscreen = r.bottom > 0 && r.top < innerHeight;
      if (live && room) { live.setFrame({ free, w: r.width, h: r.height }); live.setProgress((innerHeight - r.top) / (innerHeight + r.height) * 1.25); }
      sync(); return;
    }
    onscreen = true;
    const top = Math.max(0, nav ? nav.getBoundingClientRect().bottom : 0) + EDGE, bottom = innerHeight - EDGE;
    let left = -Infinity;
    for (const lane of lanes) { const r = lane.getBoundingClientRect(); if (r.width > 0) left = Math.max(left, r.left); }
    const right = document.documentElement.clientWidth - EDGE;
    const next = { x: left, y: top, w: right - left, h: bottom - top };
    room = Number.isFinite(left) && next.w >= MIN && next.h >= MIN;
    if (!room) { sync(); return; }
    place(next);
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
    if (live && room) { live.setFrame({ free, w: box.w, h: box.h }); live.setProgress(pageProgress()); }
    sync();
  }
  function scheduleLayout() { if (!layoutFrame) layoutFrame = requestAnimationFrame(layout); }

  function eligible() { return !connection?.saveData && webglAvailable(); }
  // A lost context or a failed start is retried a few times before the still
  // stands in for good; a GPU reset or a crowded tab should not end the object.
  function fallback(error) {
    live?.dispose(); live = null;
    host.classList.remove('is-live');
    host.removeAttribute('tabindex');
    if (controls) controls.hidden = true;
    if (error) console.warn('Network paused:', error.message);
    if (attempts < RETRIES) {
      clearTimeout(retryTimer);
      retryTimer = setTimeout(() => { retryTimer = 0; failed = false; layout(); }, 1200 * attempts + 800);
      return;
    }
    failed = true;
    console.warn('Network still fallback after ' + attempts + ' attempts.');
  }
  function sync() {
    if (!eligible()) {
      if (live) { live.dispose(); live = null; host.classList.remove('is-live'); host.removeAttribute('tabindex'); if (controls) controls.hidden = true; }
      return;
    }
    if (live) { live.setActive(room && onscreen && !document.hidden && !paused); return; }
    if (pending || failed || !room || retryTimer) return;
    pending = true; attempts++;
    import('./neural.js?v=20260916c')
      .then(m => m.createNetwork(host, { onFailure: fallback, status, fireButton, calm: () => reduced.matches }))
      .then(result => {
        if (!eligible()) { result.dispose(); return; }
        live = result;
        host.classList.add('is-live');
        host.tabIndex = 0;
        host.setAttribute('role', 'application');
        host.setAttribute('aria-label', 'Neural network. Arrow keys turn it, Enter fires a forward pass.');
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
  wide.addEventListener('change', () => { box = { x: -1, y: -1, w: 0, h: 0 }; host.style.cssText = ''; poster.style.cssText = ''; clip = ''; scheduleLayout(); });
  reduced.addEventListener('change', scheduleLayout);
  connection?.addEventListener?.('change', sync);
  if ('ResizeObserver' in window) new ResizeObserver(scheduleLayout).observe(document.body);
  if (document.fonts) document.fonts.ready.then(scheduleLayout);
  addEventListener('load', scheduleLayout, { once: true });
  layout();
}
