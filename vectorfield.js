(function () {
  'use strict';

  var TAU = Math.PI * 2;
  var HALF_PI = Math.PI * 0.5;
  var INV_PI = 1 / Math.PI;

  var CONFIG = {
    GRID_SPACING: 28,
    JITTER: 8,
    LINE_LENGTH: 12,
    LINE_WIDTH: 1,
    NOISE_SCALE: 0.003,
    TIME_SPEED: 0.00008,
    BASE_ALPHA: 0.045,
    MAX_ALPHA: 0.32,
    MOUSE_RADIUS: 380,
    MOUSE_ATTRACTION_STRENGTH: 1.3,
    MOUSE_FALLOFF_POWER: 0.75,
    MOBILE_BREAKPOINT: 768,

    /* Damping rates are per millisecond and consumed as
       1 - exp(-rate * dt), so a needle takes the same wall-clock time to
       settle at 60 Hz, 120 Hz, or across a dropped frame. A fixed
       per-frame lerp — the previous approach — runs twice as fast on a
       144 Hz display and visibly hitches whenever a frame is late. */
    ANGLE_RATE: 0.0075,
    ANGLE_RATE_FOCUS: 0.024,
    POINTER_RATE: 0.014,
    /* Asymmetric on purpose: the field answers the cursor quickly and lets go
       slowly, so entering feels responsive and leaving feels like a wake. */
    PRESENCE_RATE_IN: 0.02,
    PRESENCE_RATE_OUT: 0.005,
    MAX_FRAME_MS: 50,

    INTRO_MS: 1500,

    /* Hue follows the needle's own direction. A needle is a symmetric
       segment, so theta and theta+PI draw the same mark; the ramp
       therefore has period PI and closes back on its first stop so the
       wrap carries no seam. */
    RAMP: [[78, 70, 130], [0, 115, 230], [16, 176, 186]],  // indigo, accent, teal
    NEUTRAL: [74, 74, 106],
    FOCUS: [0, 115, 230],
    IDLE_SATURATION: 0.18,
    /* Partial, not total. A full lock flattens the whole cursor radius to one
       blue and throws away the directional hue the field just earned. */
    FOCUS_HUE_LOCK: 0.35,

    /* Needles collapse into quantised buckets: measured at ~150 stroke calls
       per frame for ~1200 needles, and every rgba() string is built once and
       cached for the life of the page instead of being reallocated a thousand
       times per frame. */
    HUE_STEPS: 16,
    FOCUS_STEPS: 16,
    ALPHA_STEPS: 24,
    FALLOFF_LUT_SIZE: 256,

    /* Distance over which needles fade out against a card or section edge.
       A hard in/out test makes them pop as the page scrolls. On a narrow
       viewport the gutter beside a card is only ~16px, so a 44px feather would
       hold the whole field down near zero alpha and the field would vanish. */
    ZONE_FEATHER: 44,
    /* Narrow viewports leave only ~16px of gutter beside a card. A 44px
       feather there holds the entire field below a tenth of its base alpha —
       measured 250 lit pixels on a 780x1688 canvas, dimmer than the hard-edged
       original. 6px keeps the edge soft without erasing the field. */
    ZONE_FEATHER_NARROW: 6,

    /* The authored moment. A block does not simply arrive on top of the field
       — it lands in it. Each reveal emits a wavefront that expands from the
       block's own edges, and needles caught in the front swing tangential, so
       the flow visibly parts and circulates around the arriving mass before
       relaxing back into the noise. The two animations on this page are one
       system: a field, and a perturbation of it. */
    IMPULSE_MS: 1800,
    IMPULSE_DELAY: 180,
    /* Reach is tuned to the width of the visible gutter beside a card, not to
       the viewport. With an exponential ease and a 560px reach the front
       crossed the gutter in the first 15% of its life and spent the rest
       expanding through territory where no needle is ever drawn. The gentle
       p^0.7 ease keeps the swell inside the visible band for most of its life. */
    IMPULSE_REACH: 300,
    IMPULSE_EASE: 0.7,
    /* The front is one-sided. A symmetric band only lit needles sitting at
       almost exactly the current radius, so in a 236px gutter a thin ring
       swept past and the rest of the field never participated — measured peak
       alpha 0.07 against a 0.045 floor, which is invisible. A short leading
       edge with a long trailing glow keeps everything the wave has already
       passed lit while it decays, so the gutter reads as one swell. */
    IMPULSE_LEAD: 90,
    IMPULSE_TRAIL: 260,
    IMPULSE_STRENGTH: 1,
    IMPULSE_ATTACK: 0.08,
    IMPULSE_MAX_LIVE: 4
  };

  var REVEAL_SECTION_SELECTORS = ['#about', '#notes', '#projects', '#academic-background', '#modules'];

  var REVEAL = {
    CHILD_LEAD_MS: 70,
    CHILD_STAGGER_MS: 55,
    CHILD_STAGGER_CAP: 3,
    SETTLE_MS: 950,
    THRESHOLD: 0.15,
    ROOT_MARGIN: '0px 0px -10% 0px'
  };

  var reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ---- Simplex Noise 3D ----

  var F3 = 1 / 3, G3 = 1 / 6;
  var grad3 = [
    [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
    [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
    [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
  ];
  var perm = new Uint8Array(512);
  var permMod12 = new Uint8Array(512);

  (function seedNoise() {
    var p = new Uint8Array(256);
    for (var i = 0; i < 256; i++) p[i] = i;
    for (var i = 255; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = p[i]; p[i] = p[j]; p[j] = tmp;
    }
    for (var i = 0; i < 512; i++) {
      perm[i] = p[i & 255];
      permMod12[i] = perm[i] % 12;
    }
  })();

  function noise3D(xin, yin, zin) {
    var s = (xin + yin + zin) * F3;
    var i = Math.floor(xin + s), j = Math.floor(yin + s), k = Math.floor(zin + s);
    var t = (i + j + k) * G3;
    var x0 = xin - (i - t), y0 = yin - (j - t), z0 = zin - (k - t);
    var i1, j1, k1, i2, j2, k2;
    if (x0 >= y0) {
      if (y0 >= z0)      { i1=1;j1=0;k1=0;i2=1;j2=1;k2=0; }
      else if (x0 >= z0) { i1=1;j1=0;k1=0;i2=1;j2=0;k2=1; }
      else               { i1=0;j1=0;k1=1;i2=1;j2=0;k2=1; }
    } else {
      if (y0 < z0)       { i1=0;j1=0;k1=1;i2=0;j2=1;k2=1; }
      else if (x0 < z0)  { i1=0;j1=1;k1=0;i2=0;j2=1;k2=1; }
      else               { i1=0;j1=1;k1=0;i2=1;j2=1;k2=0; }
    }
    var x1 = x0-i1+G3, y1 = y0-j1+G3, z1 = z0-k1+G3;
    var x2 = x0-i2+2*G3, y2 = y0-j2+2*G3, z2 = z0-k2+2*G3;
    var x3 = x0-1+3*G3, y3 = y0-1+3*G3, z3 = z0-1+3*G3;
    var ii = i & 255, jj = j & 255, kk = k & 255;
    var n0 = 0, n1 = 0, n2 = 0, n3 = 0;
    var t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
    if (t0 >= 0) { var g = grad3[permMod12[ii+perm[jj+perm[kk]]]]; t0*=t0; n0=t0*t0*(g[0]*x0+g[1]*y0+g[2]*z0); }
    var t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
    if (t1 >= 0) { var g = grad3[permMod12[ii+i1+perm[jj+j1+perm[kk+k1]]]]; t1*=t1; n1=t1*t1*(g[0]*x1+g[1]*y1+g[2]*z1); }
    var t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
    if (t2 >= 0) { var g = grad3[permMod12[ii+i2+perm[jj+j2+perm[kk+k2]]]]; t2*=t2; n2=t2*t2*(g[0]*x2+g[1]*y2+g[2]*z2); }
    var t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
    if (t3 >= 0) { var g = grad3[permMod12[ii+1+perm[jj+1+perm[kk+1]]]]; t3*=t3; n3=t3*t3*(g[0]*x3+g[1]*y3+g[2]*z3); }
    return 32 * (n0 + n1 + n2 + n3);
  }

  // ---- Math helpers ----

  function lerpAngle(a, b, t) {
    var diff = b - a;
    while (diff > Math.PI) diff -= TAU;
    while (diff < -Math.PI) diff += TAU;
    return a + diff * t;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function smoothstep(t) {
    return t * t * (3 - 2 * t);
  }

  function mix(a, b, t) {
    return [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t
    ];
  }

  /* Cyclic sample of CONFIG.RAMP: u wraps from the last stop back to the
     first, so hue is continuous where the direction wraps. */
  function rampSample(u) {
    var stops = CONFIG.RAMP;
    var n = stops.length;
    var pos = u * n;
    var base = Math.floor(pos);
    var f = pos - base;
    var i = ((base % n) + n) % n;
    return mix(stops[i], stops[(i + 1) % n], f);
  }

  /* Document-absolute box of an element, measured from the offset chain
     rather than getBoundingClientRect. Two reasons: it needs no scroll
     offset, and it ignores transforms — so a card that is mid-reveal
     reports where it will land, not where it currently sits. */
  function offsetBox(el) {
    var x = 0, y = 0, node = el;
    while (node) {
      x += node.offsetLeft;
      y += node.offsetTop;
      node = node.offsetParent;
    }
    return {
      left: x,
      top: y,
      right: x + el.offsetWidth,
      bottom: y + el.offsetHeight
    };
  }

  // ---- Needle (fixed-position line segment) ----

  function Needle(x, y) {
    this.x = x;
    this.y = y;
    this.angle = 0;
  }

  // ---- Vector Field ----

  function VectorField() {
    this.canvas = document.getElementById('vector-field-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.needles = [];
    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.rawX = 0;
    this.rawY = 0;
    this.pointerX = 0;
    this.pointerY = 0;
    this.pointerSeen = false;
    this.pointerInside = false;
    this.presence = 0;

    this.animId = null;
    this.lastTime = null;
    this.elapsed = 0;
    this.zOff = 0;
    this.staticMode = false;
    this.blank = false;

    this.layoutMap = {
      startYAbsolute: 0,
      endYAbsolute: Number.POSITIVE_INFINITY,
      blockedRects: []
    };
    this._activeRects = [];
    this.impulses = [];
    this._liveImpulses = [];
    this._buckets = [];
    this._activeKeys = [];
    this._styleCache = [];
    this._dampLUT = new Float64Array(CONFIG.FOCUS_STEPS);
    this._falloffLUT = buildFalloffLUT();

    this.feather = CONFIG.ZONE_FEATHER;
    this._layoutTimer = null;
    this._resizeTimer = null;
    this._layoutObserver = null;
    this._observed = null;

    this._onLayoutChange = this._scheduleLayoutRebuild.bind(this);
    this._onResize = this._handleResize.bind(this);
    this._onPointerMove = this._handlePointerMove.bind(this);
    this._onPointerOut = this._handlePointerOut.bind(this);
    this._onVisibility = this._handleVisibility.bind(this);
    this._onMotionPreference = this._handleMotionPreference.bind(this);
    this._tick = this._animate.bind(this);

    this._setup();
  }

  /* Radial profile of the cursor's pull, indexed by squared distance so the
     hot loop needs neither a sqrt nor a pow. */
  function buildFalloffLUT() {
    var n = CONFIG.FALLOFF_LUT_SIZE;
    var lut = new Float64Array(n);
    for (var i = 0; i < n; i++) {
      var u = i / (n - 1);
      var dist = Math.sqrt(u);
      var t = Math.pow(easeOutCubic(1 - dist), CONFIG.MOUSE_FALLOFF_POWER);
      lut[i] = Math.min(1, t * CONFIG.MOUSE_ATTRACTION_STRENGTH);
    }
    return lut;
  }

  VectorField.prototype._setup = function () {
    this.staticMode = reducedMotionQuery.matches;

    this._resize();
    this._rebuildLayoutMap();

    window.addEventListener('resize', this._onResize);
    window.addEventListener('pointermove', this._onPointerMove, { passive: true });
    window.addEventListener('pointerdown', this._onPointerMove, { passive: true });
    window.addEventListener('pointerup', this._onPointerOut);
    window.addEventListener('pointercancel', this._onPointerOut);
    document.addEventListener('pointerleave', this._onPointerOut);
    document.addEventListener('visibilitychange', this._onVisibility);

    if (reducedMotionQuery.addEventListener) {
      reducedMotionQuery.addEventListener('change', this._onMotionPreference);
    } else if (reducedMotionQuery.addListener) {
      reducedMotionQuery.addListener(this._onMotionPreference);
    }

    this._start();
  };

  VectorField.prototype._start = function () {
    if (this.staticMode) {
      /* Reduced motion keeps the field as an image: the flow is still drawn
         and still coloured by direction, it simply does not move or react. */
      this.zOff = this.elapsed * CONFIG.TIME_SPEED;
      this._seedAngles(false);
      this._render(0);
      return;
    }
    this.lastTime = null;
    if (this.animId === null) this.animId = requestAnimationFrame(this._tick);
  };

  VectorField.prototype._stop = function () {
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  };

  VectorField.prototype._handleMotionPreference = function () {
    var wantsStatic = reducedMotionQuery.matches;
    if (wantsStatic === this.staticMode) return;
    this.staticMode = wantsStatic;
    this._stop();
    this.presence = 0;
    this.pointerInside = false;
    this.elapsed = CONFIG.INTRO_MS;
    this._start();
  };

  VectorField.prototype._handleVisibility = function () {
    if (this.staticMode) return;
    if (document.hidden) {
      this._stop();
    } else {
      this._start();
    }
  };

  VectorField.prototype._handleResize = function () {
    clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(function () {
      this._resize();
      this._rebuildLayoutMap();
      if (this.staticMode) {
        this._seedAngles(false);
        this._render(0);
      }
    }.bind(this), 200);
  };

  VectorField.prototype._scheduleLayoutRebuild = function () {
    clearTimeout(this._layoutTimer);
    this._layoutTimer = setTimeout(function () {
      this._rebuildLayoutMap();
      if (this.staticMode) this._render(0);
    }.bind(this), 90);
  };

  VectorField.prototype._resize = function () {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.feather = this.width < CONFIG.MOBILE_BREAKPOINT
      ? CONFIG.ZONE_FEATHER_NARROW
      : CONFIG.ZONE_FEATHER;
    this._createNeedles();
  };

  VectorField.prototype._createNeedles = function () {
    this.needles = [];
    var spacing = CONFIG.GRID_SPACING;
    var jitter = CONFIG.JITTER;
    var w = this.width, h = this.height;
    if (w < CONFIG.MOBILE_BREAKPOINT) spacing = Math.floor(spacing * 1.4);
    for (var gy = spacing * 0.5; gy < h; gy += spacing) {
      for (var gx = spacing * 0.5; gx < w; gx += spacing) {
        var nx = gx + (Math.random() - 0.5) * jitter * 2;
        var ny = gy + (Math.random() - 0.5) * jitter * 2;
        this.needles.push(new Needle(nx, ny));
      }
    }
    this._seedAngles(!this.staticMode);
  };

  /* Seed each needle on the flow field rather than at a random angle, so the
     field fades in already coherent. `settle` adds a small offset that the
     intro then eases away — a quiet arrival instead of a thousand needles
     swinging into place. */
  VectorField.prototype._seedAngles = function (settle) {
    var needles = this.needles;
    var scale = CONFIG.NOISE_SCALE;
    var z = this.zOff;
    for (var i = 0; i < needles.length; i++) {
      var n = needles[i];
      var target = noise3D(n.x * scale, n.y * scale, z) * TAU;
      n.angle = settle ? target + (Math.random() - 0.5) * 0.9 : target;
    }
  };

  VectorField.prototype._rebuildLayoutMap = function () {
    var hero = document.getElementById('home');
    var main = document.querySelector('main');
    var footer = document.querySelector('footer');
    var cards = document.querySelectorAll('.card');

    var startYAbsolute = 0;
    if (hero) startYAbsolute = offsetBox(hero).bottom;

    var endYAbsolute = Number.POSITIVE_INFINITY;
    if (footer) endYAbsolute = offsetBox(footer).bottom;
    else if (main) endYAbsolute = offsetBox(main).bottom;

    var blockedRects = [];
    for (var i = 0; i < cards.length; i++) {
      blockedRects.push(offsetBox(cards[i]));
    }

    this.layoutMap = {
      startYAbsolute: startYAbsolute,
      endYAbsolute: endYAbsolute,
      blockedRects: blockedRects
    };

    this._refreshLayoutObserverTargets();
  };

  VectorField.prototype.refreshLayout = function () {
    this._scheduleLayoutRebuild();
  };

  /* Register a wavefront expanding from `box`. `spin` (+1 / -1) sets which way
     the flow circulates, so the swirl agrees with the direction the block
     travelled in. Called by the scroll reveal as a block starts to land. */
  VectorField.prototype.emitImpulse = function (box, spin) {
    if (this.staticMode || !box) return;
    if (this.impulses.length >= CONFIG.IMPULSE_MAX_LIVE) this.impulses.shift();
    this.impulses.push({
      box: box,
      spin: spin < 0 ? -1 : 1,
      t0: this.elapsed + CONFIG.IMPULSE_DELAY,
      ring: 0,
      rMin2: 0,
      rMax2: 0,
      env: 0
    });
  };

  VectorField.prototype._refreshLayoutObserverTargets = function () {
    if (typeof ResizeObserver === 'undefined') return;

    var targets = [];
    var hero = document.getElementById('home');
    var main = document.querySelector('main');
    var footer = document.querySelector('footer');
    var cards = document.querySelectorAll('.card');

    if (hero) targets.push(hero);
    if (main) targets.push(main);
    if (footer) targets.push(footer);
    for (var i = 0; i < cards.length; i++) targets.push(cards[i]);

    /* Bail out when the target set is unchanged. ResizeObserver delivers an
       entry immediately on observe(), so disconnecting and re-observing from
       inside a rebuild — which is itself scheduled by the observer — spins a
       permanent 90ms rebuild loop, each pass forcing layout across every card.
       Measured before this guard: a rebuild every ~110ms forever, on an idle
       page with nothing resizing. */
    var same = this._observed !== null && this._observed.length === targets.length;
    if (same) {
      for (var s = 0; s < targets.length; s++) {
        if (this._observed[s] !== targets[s]) { same = false; break; }
      }
    }
    if (same) return;

    if (!this._layoutObserver) {
      this._layoutObserver = new ResizeObserver(this._onLayoutChange);
    }
    this._layoutObserver.disconnect();
    for (var j = 0; j < targets.length; j++) {
      this._layoutObserver.observe(targets[j]);
    }
    this._observed = targets;
  };

  VectorField.prototype._handlePointerMove = function (e) {
    this.rawX = e.clientX;
    this.rawY = e.clientY;
    if (!this.pointerSeen) {
      /* Snap on first sight. Easing in from an offscreen sentinel would
         drag a bright wake across the whole viewport. */
      this.pointerSeen = true;
      this.pointerX = this.rawX;
      this.pointerY = this.rawY;
    }
    this.pointerInside = true;
  };

  VectorField.prototype._handlePointerOut = function (e) {
    if (e && e.type === 'pointerup' && e.pointerType === 'mouse') return;
    this.pointerInside = false;
  };

  VectorField.prototype._animate = function (timestamp) {
    this.animId = requestAnimationFrame(this._tick);

    var dt = this.lastTime === null ? 16.7 : timestamp - this.lastTime;
    this.lastTime = timestamp;
    if (!(dt > 0)) dt = 0;
    else if (dt > CONFIG.MAX_FRAME_MS) dt = CONFIG.MAX_FRAME_MS;

    this.elapsed += dt;
    this._render(dt);
  };

  VectorField.prototype._render = function (dt) {
    var ctx = this.ctx;
    var w = this.width, h = this.height;

    if (dt > 0) {
      var pAlpha = 1 - Math.exp(-CONFIG.POINTER_RATE * dt);
      this.pointerX += (this.rawX - this.pointerX) * pAlpha;
      this.pointerY += (this.rawY - this.pointerY) * pAlpha;
      var presenceTarget = this.pointerInside ? 1 : 0;
      var presenceRate = this.pointerInside ? CONFIG.PRESENCE_RATE_IN : CONFIG.PRESENCE_RATE_OUT;
      this.presence += (presenceTarget - this.presence) * (1 - Math.exp(-presenceRate * dt));
    }

    this.zOff = this.elapsed * CONFIG.TIME_SPEED;

    var intro = this.staticMode ? 1 : easeOutCubic(Math.min(1, this.elapsed / CONFIG.INTRO_MS));

    var feather = this.feather;
    var scrollY = window.scrollY || window.pageYOffset || 0;
    var map = this.layoutMap;
    var startY = map.startYAbsolute;
    var endY = map.endYAbsolute;
    var bandTop = scrollY - feather;
    var bandBottom = scrollY + h + feather;

    /* Whole-viewport early out: inside the hero or below the footer there is
       nothing to draw, so skip the needle pass entirely. */
    if (bandBottom < startY || bandTop > endY) {
      if (!this.blank) {
        ctx.clearRect(0, 0, w, h);
        this.blank = true;
      }
      return;
    }
    this.blank = false;
    ctx.clearRect(0, 0, w, h);

    var rects = map.blockedRects;
    var active = this._activeRects;
    active.length = 0;
    for (var r = 0; r < rects.length; r++) {
      var rect = rects[r];
      if (rect.bottom + feather < bandTop || rect.top - feather > bandBottom) continue;
      active.push(rect);
    }
    var aLen = active.length;

    var hueSteps = CONFIG.HUE_STEPS;
    var focusSteps = CONFIG.FOCUS_STEPS;
    var alphaSteps = CONFIG.ALPHA_STEPS;
    var lastFocus = focusSteps - 1;
    var lastAlpha = alphaSteps - 1;

    /* Damping is a function of focus only, so resolve it once per frame for
       each focus bucket instead of calling exp() per needle. */
    var damp = this._dampLUT;
    for (var f = 0; f < focusSteps; f++) {
      var infF = f / lastFocus;
      var rate = CONFIG.ANGLE_RATE + (CONFIG.ANGLE_RATE_FOCUS - CONFIG.ANGLE_RATE) * infF;
      damp[f] = dt > 0 ? 1 - Math.exp(-rate * dt) : 0;
    }

    /* Advance and prune wavefronts. Each carries its own annulus, so the
       needle loop only has to test the thin front, not the whole disc. */
    var impulses = this.impulses;
    var live = this._liveImpulses;
    var impulseLead = CONFIG.IMPULSE_LEAD;
    var impulseTrail = CONFIG.IMPULSE_TRAIL;
    var invLead = 1 / impulseLead;
    var invTrail = 1 / impulseTrail;
    live.length = 0;
    for (var im = impulses.length - 1; im >= 0; im--) {
      var pulse = impulses[im];
      var p = (this.elapsed - pulse.t0) / CONFIG.IMPULSE_MS;
      if (p >= 1) { impulses.splice(im, 1); continue; }
      if (p < 0) continue;

      pulse.ring = Math.pow(p, CONFIG.IMPULSE_EASE) * CONFIG.IMPULSE_REACH;
      var attack = p < CONFIG.IMPULSE_ATTACK ? p / CONFIG.IMPULSE_ATTACK : 1;
      pulse.env = (1 - p) * attack * CONFIG.IMPULSE_STRENGTH;

      var inner = pulse.ring - impulseTrail;
      if (inner < 0) inner = 0;
      pulse.rMin2 = inner * inner;
      var outer = pulse.ring + impulseLead;
      pulse.rMax2 = outer * outer;

      if (pulse.box.bottom + outer < bandTop) continue;
      if (pulse.box.top - outer > bandBottom) continue;
      live.push(pulse);
    }
    var liveLen = live.length;

    var buckets = this._buckets;
    var activeKeys = this._activeKeys;
    for (var q = 0; q < activeKeys.length; q++) buckets[activeKeys[q]].length = 0;
    activeKeys.length = 0;

    var needles = this.needles;
    var len = needles.length;
    var halfLen = CONFIG.LINE_LENGTH * 0.5;
    var noiseScale = CONFIG.NOISE_SCALE;
    var zOff = this.zOff;
    var baseAlpha = CONFIG.BASE_ALPHA;
    var alphaSpan = CONFIG.MAX_ALPHA - CONFIG.BASE_ALPHA;
    var invMaxAlpha = 1 / CONFIG.MAX_ALPHA;
    var presence = this.presence;
    var px = this.pointerX, py = this.pointerY;
    var mouseR2 = CONFIG.MOUSE_RADIUS * CONFIG.MOUSE_RADIUS;
    var falloff = this._falloffLUT;
    var falloffMax = CONFIG.FALLOFF_LUT_SIZE - 1;
    var invMouseR2 = falloffMax / mouseR2;
    var pointerLive = presence > 0.002 && this.pointerSeen;

    for (var i = 0; i < len; i++) {
      var n = needles[i];
      var absY = n.y + scrollY;

      // --- soft render zone ---
      var zone = 1;
      if (absY < startY + feather) zone = (absY - startY) / feather;
      if (absY > endY - feather) {
        var zEnd = (endY - absY) / feather;
        if (zEnd < zone) zone = zEnd;
      }
      if (zone <= 0) continue;

      for (var c = 0; c < aLen; c++) {
        var box = active[c];
        var dx = box.left - n.x;
        var dxr = n.x - box.right;
        if (dxr > dx) dx = dxr;
        if (dx < 0) dx = 0;
        if (dx >= feather) continue;
        var dy = box.top - absY;
        var dyb = absY - box.bottom;
        if (dyb > dy) dy = dyb;
        if (dy < 0) dy = 0;
        if (dy >= feather) continue;
        var edge = Math.sqrt(dx * dx + dy * dy) / feather;
        if (edge < zone) zone = edge;
        if (zone <= 0) break;
      }
      if (zone <= 0) continue;
      if (zone < 1) zone = smoothstep(zone);

      // --- target direction ---
      var noiseAngle = noise3D(n.x * noiseScale, n.y * noiseScale, zOff) * TAU;
      var targetAngle = noiseAngle;
      var influence = 0;

      if (pointerLive) {
        var mdx = px - n.x;
        var mdy = py - n.y;
        var dist2 = mdx * mdx + mdy * mdy;
        if (dist2 < mouseR2) {
          influence = falloff[(dist2 * invMouseR2) | 0] * presence;
          if (influence > 0) targetAngle = lerpAngle(noiseAngle, Math.atan2(mdy, mdx), influence);
        }
      }

      /* Wavefronts from landing blocks. Distance is measured to the block's
         box rather than its centre, so the front keeps the block's shape and
         the flow parts along its edges. */
      for (var iw = 0; iw < liveLen; iw++) {
        var wave = live[iw];
        var wbox = wave.box;
        var sx = 0;
        if (n.x < wbox.left) sx = n.x - wbox.left;
        else if (n.x > wbox.right) sx = n.x - wbox.right;
        var sy = 0;
        if (absY < wbox.top) sy = absY - wbox.top;
        else if (absY > wbox.bottom) sy = absY - wbox.bottom;

        var wd2 = sx * sx + sy * sy;
        if (wd2 <= 0 || wd2 > wave.rMax2 || wd2 < wave.rMin2) continue;

        var wd = Math.sqrt(wd2);
        var front = wd > wave.ring
          ? 1 - (wd - wave.ring) * invLead     // ahead of the wave: steep edge
          : 1 - (wave.ring - wd) * invTrail;   // already swept: long decay
        if (front <= 0) continue;
        var push = smoothstep(front) * wave.env;
        if (push <= 0.004) continue;

        // Tangential to the block's outward normal: the flow circulates.
        targetAngle = lerpAngle(targetAngle, Math.atan2(sy, sx) + wave.spin * HALF_PI, push);
        if (push > influence) influence = push;
      }

      var focusIdx = (influence * lastFocus + 0.5) | 0;
      n.angle = lerpAngle(n.angle, targetAngle, damp[focusIdx]);

      // --- quantise colour and opacity ---
      var alpha = zone * (baseAlpha + alphaSpan * influence) * intro;
      var alphaIdx = (alpha * invMaxAlpha * lastAlpha + 0.5) | 0;
      if (alphaIdx <= 0) continue;
      if (alphaIdx > lastAlpha) alphaIdx = lastAlpha;

      var u = n.angle * INV_PI;
      u -= Math.floor(u);
      var hueIdx = (u * hueSteps) | 0;
      if (hueIdx > hueSteps - 1) hueIdx = hueSteps - 1;

      var key = (hueIdx * focusSteps + focusIdx) * alphaSteps + alphaIdx;
      var bucket = buckets[key];
      if (bucket === undefined) bucket = buckets[key] = [];
      if (bucket.length === 0) activeKeys.push(key);

      var cdx = Math.cos(n.angle) * halfLen;
      var cdy = Math.sin(n.angle) * halfLen;
      bucket.push(n.x - cdx, n.y - cdy, n.x + cdx, n.y + cdy);
    }

    // --- one path and one stroke per bucket ---
    ctx.lineWidth = CONFIG.LINE_WIDTH;
    ctx.lineCap = 'round';

    for (var k = 0; k < activeKeys.length; k++) {
      var bKey = activeKeys[k];
      var seg = buckets[bKey];
      ctx.strokeStyle = this._styleFor(bKey);
      ctx.beginPath();
      for (var s = 0; s < seg.length; s += 4) {
        ctx.moveTo(seg[s], seg[s + 1]);
        ctx.lineTo(seg[s + 2], seg[s + 3]);
      }
      ctx.stroke();
    }
  };

  /* Bucket key -> rgba string, memoised. Steady state allocates nothing. */
  VectorField.prototype._styleFor = function (key) {
    var cached = this._styleCache[key];
    if (cached !== undefined) return cached;

    var alphaSteps = CONFIG.ALPHA_STEPS;
    var focusSteps = CONFIG.FOCUS_STEPS;

    var alphaIdx = key % alphaSteps;
    var rest = (key - alphaIdx) / alphaSteps;
    var focusIdx = rest % focusSteps;
    var hueIdx = (rest - focusIdx) / focusSteps;

    var u = (hueIdx + 0.5) / CONFIG.HUE_STEPS;
    var inf = focusIdx / (focusSteps - 1);

    // Saturation lifts and hue locks toward the accent as the cursor closes in.
    var saturation = CONFIG.IDLE_SATURATION + (1 - CONFIG.IDLE_SATURATION) * inf;
    var colour = mix(CONFIG.NEUTRAL, rampSample(u), saturation);
    colour = mix(colour, CONFIG.FOCUS, inf * CONFIG.FOCUS_HUE_LOCK);

    var alpha = (alphaIdx / (alphaSteps - 1)) * CONFIG.MAX_ALPHA;

    var style = 'rgba(' + (colour[0] | 0) + ',' + (colour[1] | 0) + ',' + (colour[2] | 0) +
      ',' + alpha.toFixed(4) + ')';
    this._styleCache[key] = style;
    return style;
  };

  VectorField.prototype.destroy = function () {
    this._stop();
    clearTimeout(this._resizeTimer);
    clearTimeout(this._layoutTimer);
    if (this._layoutObserver) this._layoutObserver.disconnect();
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerdown', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerOut);
    window.removeEventListener('pointercancel', this._onPointerOut);
    document.removeEventListener('pointerleave', this._onPointerOut);
    document.removeEventListener('visibilitychange', this._onVisibility);
    if (reducedMotionQuery.removeEventListener) {
      reducedMotionQuery.removeEventListener('change', this._onMotionPreference);
    } else if (reducedMotionQuery.removeListener) {
      reducedMotionQuery.removeListener(this._onMotionPreference);
    }
  };

  // ---- Scroll reveal ----

  var instance = null;
  var revealObserver = null;
  var revealTimers = [];

  /* Collect everything that should reveal: the named sections on the homepage,
     plus any element that already carries .scroll-reveal from its own markup.
     Other pages (auctiva.html) author the class and direction by hand and had
     no observer at all, which left their whole body stranded at opacity 0. */
  function collectRevealTargets() {
    var found = [];
    function add(el) { if (el && found.indexOf(el) < 0) found.push(el); }

    for (var i = 0; i < REVEAL_SECTION_SELECTORS.length; i++) {
      add(document.querySelector(REVEAL_SECTION_SELECTORS[i]));
    }
    var authored = document.querySelectorAll('.scroll-reveal');
    for (var j = 0; j < authored.length; j++) add(authored[j]);

    return found;
  }

  function armSection(section, index) {
    // A direction written into the markup is the page's own choice; keep it.
    var authored = section.classList.contains('from-left') || section.classList.contains('from-right');
    section.classList.add('scroll-reveal', 'reveal-armed');
    section.classList.remove('is-visible');
    if (!authored) {
      section.classList.add(index % 2 === 0 ? 'from-right' : 'from-left');
    }

    var kids = section.children;
    var tier = 0;
    for (var i = 0; i < kids.length; i++) {
      var kid = kids[i];
      var position = window.getComputedStyle(kid).position;
      if (position === 'absolute' || position === 'fixed') continue;
      kid.classList.add('reveal-child');
      var delay = REVEAL.CHILD_LEAD_MS +
        Math.min(tier, REVEAL.CHILD_STAGGER_CAP) * REVEAL.CHILD_STAGGER_MS;
      kid.style.setProperty('--reveal-delay', delay + 'ms');
      tier++;
    }
  }

  /* At rest the reveal transform is identity, opacity 1 and blur 0 — so every
     reveal class can simply be removed once the entrance lands. The element
     returns to a pristine .card with its own fast hover transition, holding no
     compositing layer and no 640 ms transition that would make hover sluggish. */
  function landSection(section) {
    section.classList.remove(
      'scroll-reveal', 'reveal-armed', 'is-revealing', 'is-visible', 'from-left', 'from-right'
    );
    var kids = section.querySelectorAll('.reveal-child');
    for (var i = 0; i < kids.length; i++) {
      kids[i].classList.remove('reveal-child');
      kids[i].style.removeProperty('--reveal-delay');
    }
  }

  function revealSection(section) {
    if (section.dataset.revealState) return;
    section.dataset.revealState = 'running';
    section.classList.add('is-revealing');
    section.classList.add('is-visible');

    /* The block lands in the field. offsetBox ignores the in-flight transform,
       so the wave originates where the block comes to rest. */
    if (instance) {
      instance.emitImpulse(offsetBox(section), section.classList.contains('from-left') ? -1 : 1);
    }

    var timer = setTimeout(function () {
      landSection(section);
      section.dataset.revealState = 'done';
    }, REVEAL.SETTLE_MS);
    revealTimers.push(timer);
  }

  function setupAlternatingScrollReveal() {
    var sections = collectRevealTargets();
    if (!sections.length) return;

    if (reducedMotionQuery.matches) {
      /* Reduced motion keeps an arrival — content fades in place — but drops
         every spatial move, the blur, and the stagger. */
      for (var j = 0; j < sections.length; j++) {
        sections[j].classList.add('scroll-reveal', 'reveal-armed');
      }
    } else {
      for (var k = 0; k < sections.length; k++) {
        armSection(sections[k], k);
      }
    }

    if (typeof IntersectionObserver === 'undefined') {
      for (var m = 0; m < sections.length; m++) {
        sections[m].classList.add('is-visible');
        landSection(sections[m]);
      }
      return;
    }

    if (revealObserver) revealObserver.disconnect();

    revealObserver = new IntersectionObserver(function (entries, observer) {
      for (var e = 0; e < entries.length; e++) {
        var entry = entries[e];
        if (!entry.isIntersecting) continue;
        // Fire once. Re-hiding on exit made every scroll pass replay the entrance.
        observer.unobserve(entry.target);
        revealSection(entry.target);
      }
    }, {
      threshold: REVEAL.THRESHOLD,
      rootMargin: REVEAL.ROOT_MARGIN
    });

    for (var p = 0; p < sections.length; p++) {
      revealObserver.observe(sections[p]);
    }
  }

  // ---- Init ----

  function init() {
    setupAlternatingScrollReveal();
    instance = new VectorField();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('pagehide', function () {
    if (revealObserver) revealObserver.disconnect();
    for (var i = 0; i < revealTimers.length; i++) clearTimeout(revealTimers[i]);
    if (instance) instance.destroy();
  });
})();
