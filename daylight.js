/* Daylight: a small, progressive enhancement of the original notebook.
   The vendored Scroll Craft engine remains unchanged. No network/API calls. */
(function () {
  'use strict';

  var hero = document.querySelector('.daylight .masthead');
  if (!hero) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var path = hero.querySelector('[data-path-line]');
  var endpoint = hero.querySelector('[data-path-end]');
  var reset = hero.querySelector('.path-reset');
  var status = hero.querySelector('.path-status');
  var sketch = hero.querySelector('[data-chance-path]');
  var frame = 0;
  var pointerFrame = 0;
  var heroHeight = 1;
  var heroTop = 0;
  var sketchFinish = 1;
  var viewportHeight = window.innerHeight;
  var draws = 0;
  var drawAnimation = null;

  if (window.ScrollCraft) window.ScrollCraft.mount(document.body);

  function clamp(value, low, high) { return Math.max(low, Math.min(high, value)); }

  function measure() {
    var rect = hero.getBoundingClientRect();
    heroHeight = rect.height;
    heroTop = rect.top + window.scrollY;
    viewportHeight = window.innerHeight;
    // On phones the portrait follows a long biography; its path finishes
    // drawing as that actual sketch enters, not before it is in view.
    sketchFinish = sketch.getBoundingClientRect().bottom + window.scrollY - viewportHeight * 0.84;
    schedule();
  }

  function paint() {
    frame = 0;
    var progress = reduced.matches ? 0 : clamp((window.scrollY - heroTop) / heroHeight, 0, 1);
    hero.style.setProperty('--hero-p', progress.toFixed(4));
    var reveal = reduced.matches || draws > 0 ? 1 : clamp(1 - (sketchFinish - window.scrollY) / (viewportHeight * 0.5), 0.28, 1);
    path.style.strokeDasharray = '1';
    path.style.strokeDashoffset = String(1 - reveal);
    endpoint.style.opacity = reveal >= 0.99 ? '1' : '0';
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(paint);
  }

  function newPath() {
    // An illustrative finite random walk. It is not a plotted research result.
    var y = 57;
    var d = 'M12 57';
    for (var i = 1; i <= 40; i++) {
      y += (Math.random() - 0.5) * 22;
      // Reflect at the paper edges to keep the sketch inside its frame.
      if (y < 14) y = 28 - y;
      if (y > 91) y = 182 - y;
      d += 'L' + (12 + i * 7.9).toFixed(1) + ' ' + y.toFixed(1);
    }
    if (drawAnimation) drawAnimation.cancel();
    path.setAttribute('d', d);
    endpoint.setAttribute('cy', y.toFixed(1));
    draws++;
    paint();
    if (!reduced.matches && path.animate) {
      drawAnimation = path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
        duration: 440, easing: 'cubic-bezier(.16,1,.3,1)'
      });
    }
    status.textContent = 'New random path drawn. Path ' + draws + '.';
  }

  function clearPointer() {
    if (pointerFrame) cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    hero.style.setProperty('--pointer-x', '0');
    hero.style.setProperty('--pointer-y', '0');
  }

  hero.addEventListener('pointermove', function (event) {
    if (reduced.matches || !fine.matches || event.pointerType === 'touch') return;
    var x = clamp(event.clientX / window.innerWidth - 0.5, -0.5, 0.5);
    var y = clamp((event.clientY + window.scrollY - heroTop) / heroHeight - 0.5, -0.5, 0.5);
    if (pointerFrame) cancelAnimationFrame(pointerFrame);
    pointerFrame = requestAnimationFrame(function () {
      pointerFrame = 0;
      hero.style.setProperty('--pointer-x', x.toFixed(3));
      hero.style.setProperty('--pointer-y', y.toFixed(3));
    });
  }, { passive: true });
  hero.addEventListener('pointerleave', clearPointer);
  reset.hidden = false;
  reset.addEventListener('click', newPath);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  reduced.addEventListener('change', function () {
    if (drawAnimation) drawAnimation.cancel();
    clearPointer();
    measure();
  });
  fine.addEventListener('change', clearPointer);
  if (window.ResizeObserver) new ResizeObserver(measure).observe(hero);
  // Clear the inherited section highlight on the return to the introduction.
  // The original observer only watches reference sections, so otherwise the
  // last visited section remains highlighted while the portrait is in view.
  if (window.IntersectionObserver) {
    new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      document.querySelectorAll('.index-link.is-here').forEach(function (link) {
        link.classList.remove('is-here');
      });
    }, { rootMargin: '-45% 0px -50% 0px' }).observe(hero);
  }
  if (document.fonts) document.fonts.ready.then(measure);
  measure();
})();
