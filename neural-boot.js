/* Boot for the live network in #network. Loads the renderer only for fine
   pointers without reduced motion or data saving, only once the section is
   near the viewport, and hands everything else the Blender-rendered still.
   The still stays in the page as the accessible image in every case. */
const stage = document.querySelector('[data-network-stage]');
if (stage) {
  const controls = document.querySelector('[data-network-controls]');
  const hint = document.querySelector('[data-network-hint]');
  const status = document.querySelector('[data-network-status]');
  const fireButton = document.querySelector('[data-network-fire]');
  const resetButton = document.querySelector('[data-network-reset]');
  const pauseButton = document.querySelector('[data-network-pause]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const connection = navigator.connection;
  const restHint = hint ? hint.textContent : '';
  let live = null, pending = false, failed = false, near = false, visible = false, paused = false;

  function eligible() { return fine.matches && !reduced.matches && !connection?.saveData && Boolean(document.createElement('canvas').getContext('webgl2')); }
  function fallback(error) {
    failed = true;
    live?.dispose(); live = null;
    stage.classList.remove('is-live');
    if (controls) controls.hidden = true;
    if (hint) hint.textContent = restHint;
    if (error) console.warn('Network still fallback:', error.message);
  }
  function sync() {
    if (!eligible()) {
      if (live) { live.dispose(); live = null; stage.classList.remove('is-live'); if (controls) controls.hidden = true; if (hint) hint.textContent = restHint; }
      return;
    }
    if (live) { live.setActive(visible && !document.hidden && !paused); return; }
    if (pending || failed || !near) return;
    pending = true;
    import('./neural.js')
      .then(m => m.createNetwork(stage, { onFailure: fallback, hint, status, fireButton, resetButton }))
      .then(result => {
        if (!eligible()) { result.dispose(); return; }
        live = result;
        stage.classList.add('is-live');
        if (controls) controls.hidden = false;
        sync();
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
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { near = entries[0].isIntersecting; sync(); }, { rootMargin: '400px 0px' }).observe(stage);
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: 0.05 }).observe(stage);
  } else { near = visible = true; sync(); }
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  fine.addEventListener('change', sync);
  connection?.addEventListener?.('change', sync);
}
