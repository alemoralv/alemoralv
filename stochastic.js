/* Independent depth planes for both mathematical notebooks.
   Content stays in natural flow. All decoration is local and aria-hidden. */
(function () {
  'use strict';
  if (!document.body.classList.contains('stochastic')) return;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');
  var fine = matchMedia('(hover: hover) and (pointer: fine)');
  var worlds = Array.from(document.querySelectorAll('.stochastic-hero-world, [data-stochastic-global]')).map(function (el) {
    return { el: el, global: el.hasAttribute('data-stochastic-global'), host: el.closest('.masthead') || document.body,
      top: 0, height: 1, x: 0, y: 0,
      layers: Array.from(el.querySelectorAll('.stochastic-layer[data-depth]')).map(function (layer) {
        return { el: layer, depth: Number(layer.dataset.depth) || 0 };
      }) };
  });
  var frame = 0, measureFrame = 0, vh = innerHeight, docMax = 1;
  if (window.ScrollCraft && !window.ScrollCraft.instances.length) window.ScrollCraft.mount(document.body);

  function paint() {
    frame = 0;
    var y = scrollY;
    var mobile = innerWidth <= 700;
    worlds.forEach(function (world) {
      var p = world.global ? y / docMax : Math.max(0, Math.min(1.4, (y - world.top) / Math.max(vh, world.height)));
      world.layers.forEach(function (layer) {
        if (reduced.matches) { layer.el.style.transform = 'none'; return; }
        // Global fields span the full document, keeping finite travel even
        // when long notes are opened. Hero planes use local scroll distance.
        var travel = world.global ? (p - .5) * vh * 1.8 : p * vh;
        var amount = mobile ? .65 : 1;
        var dy = travel * layer.depth * amount + world.y * layer.depth * 30;
        var dx = (world.global ? p * 52 : p * 38) * layer.depth + world.x * layer.depth * 50;
        layer.el.style.transform = 'translate3d(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px,0)';
      });
    });
  }
  function schedule() {
    if (!document.hidden && !frame) frame = requestAnimationFrame(paint);
  }
  function measure() {
    measureFrame = 0;
    vh = innerHeight;
    docMax = Math.max(1, document.documentElement.scrollHeight - vh);
    worlds.forEach(function (world) {
      if (world.global) return;
      var bounds = world.host.getBoundingClientRect();
      world.top = bounds.top + scrollY;
      world.height = bounds.height;
    });
    schedule();
  }
  function queueMeasure() {
    if (!measureFrame) measureFrame = requestAnimationFrame(measure);
  }
  worlds.filter(function (world) { return !world.global; }).forEach(function (world) {
    world.host.addEventListener('pointermove', function (event) {
      if (reduced.matches || !fine.matches || event.pointerType === 'touch') return;
      world.x = event.clientX / innerWidth - .5;
      world.y = Math.max(-.5, Math.min(.5, (event.clientY + scrollY - world.top) / world.height - .5));
      schedule();
    }, { passive: true });
    world.host.addEventListener('pointerleave', function () { world.x = world.y = 0; schedule(); });
  });
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', queueMeasure, { passive: true });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; }
    else queueMeasure();
  });
  reduced.addEventListener('change', function () { worlds.forEach(function (w) { w.x = w.y = 0; }); schedule(); });
  fine.addEventListener('change', function () { worlds.forEach(function (w) { w.x = w.y = 0; }); schedule(); });
  if (window.ResizeObserver) new ResizeObserver(queueMeasure).observe(document.body);
  if (document.fonts) document.fonts.ready.then(queueMeasure);
  addEventListener('load', queueMeasure, { once: true });
  measure();
})();
