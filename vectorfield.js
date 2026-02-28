(function () {
  'use strict';

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
    MOUSE_LERP_BOOST: 0.22,
    LERP_SPEED: 0.12,
    COLOR: '0, 0, 0',
    MOBILE_BREAKPOINT: 768,
  };

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

  // ---- Angle helpers ----

  function lerpAngle(a, b, t) {
    var diff = b - a;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return a + diff * t;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  // ---- Needle (fixed-position line segment) ----

  function Needle(x, y) {
    this.x = x;
    this.y = y;
    this.angle = Math.random() * Math.PI * 2;
    this.targetAngle = this.angle;
  }

  // ---- Vector Field ----

  function VectorField() {
    this.canvas = document.getElementById('vector-field-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.needles = [];
    this.width = 0;
    this.height = 0;
    this.mouseX = -9999;
    this.mouseY = -9999;
    this.mouseActive = false;
    this.animId = null;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.layoutMap = {
      startYAbsolute: 0,
      endYAbsolute: Number.POSITIVE_INFINITY,
      blockedRects: []
    };
    this._layoutTimer = null;
    this._resizeTimer = null;
    this._layoutObserver = null;
    this._onLayoutChange = this._scheduleLayoutRebuild.bind(this);

    this._onResize = this._handleResize.bind(this);
    this._onScroll = this._handleScroll.bind(this);
    this._onMouse = this._handleMouse.bind(this);
    this._onMouseLeave = this._handleMouseLeave.bind(this);
    this._onTouch = this._handleTouch.bind(this);
    this._onTouchEnd = this._handleTouchEnd.bind(this);
    this._tick = this._animate.bind(this);

    this._setup();
  }

  VectorField.prototype._setup = function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this._resize();
    this._rebuildLayoutMap();
    window.addEventListener('resize', this._onResize);
    window.addEventListener('scroll', this._onScroll, { passive: true });
    window.addEventListener('mousemove', this._onMouse);
    window.addEventListener('mouseleave', this._onMouseLeave);
    window.addEventListener('touchmove', this._onTouch, { passive: true });
    window.addEventListener('touchend', this._onTouchEnd);
    this.animId = requestAnimationFrame(this._tick);
  };

  VectorField.prototype._handleResize = function () {
    clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(function () {
      this._resize();
      this._scheduleLayoutRebuild();
    }.bind(this), 200);
  };

  VectorField.prototype._handleScroll = function () {
    this._scheduleLayoutRebuild();
  };

  VectorField.prototype._scheduleLayoutRebuild = function () {
    clearTimeout(this._layoutTimer);
    this._layoutTimer = setTimeout(this._rebuildLayoutMap.bind(this), 90);
  };

  VectorField.prototype._resize = function () {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
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
  };

  VectorField.prototype._rebuildLayoutMap = function () {
    var scrollY = window.scrollY || window.pageYOffset || 0;
    var hero = document.getElementById('home');
    var cards = document.querySelectorAll('.card');
    var main = document.querySelector('main');
    var footer = document.querySelector('footer');

    var startYAbsolute = 0;
    if (hero) {
      var heroRect = hero.getBoundingClientRect();
      startYAbsolute = heroRect.bottom + scrollY;
    }

    var endYAbsolute = Number.POSITIVE_INFINITY;
    if (footer) {
      var footerRect = footer.getBoundingClientRect();
      endYAbsolute = footerRect.bottom + scrollY;
    } else if (main) {
      var mainRect = main.getBoundingClientRect();
      endYAbsolute = mainRect.bottom + scrollY;
    }

    var blockedRects = [];
    for (var i = 0; i < cards.length; i++) {
      var rect = cards[i].getBoundingClientRect();
      blockedRects.push({
        left: rect.left,
        right: rect.right,
        top: rect.top + scrollY,
        bottom: rect.bottom + scrollY
      });
    }

    this.layoutMap = {
      startYAbsolute: startYAbsolute,
      endYAbsolute: endYAbsolute,
      blockedRects: blockedRects
    };

    this._refreshLayoutObserverTargets();
  };

  VectorField.prototype._refreshLayoutObserverTargets = function () {
    if (typeof ResizeObserver === 'undefined') return;
    if (!this._layoutObserver) {
      this._layoutObserver = new ResizeObserver(this._onLayoutChange);
    }
    this._layoutObserver.disconnect();

    var targets = [];
    var hero = document.getElementById('home');
    var main = document.querySelector('main');
    var footer = document.querySelector('footer');
    var cards = document.querySelectorAll('.card');

    if (hero) targets.push(hero);
    if (main) targets.push(main);
    if (footer) targets.push(footer);
    for (var i = 0; i < cards.length; i++) targets.push(cards[i]);

    for (var j = 0; j < targets.length; j++) {
      this._layoutObserver.observe(targets[j]);
    }
  };

  VectorField.prototype._isInRenderZone = function (x, yViewport) {
    var map = this.layoutMap;
    var absY = yViewport + (window.scrollY || window.pageYOffset || 0);

    if (absY < map.startYAbsolute || absY > map.endYAbsolute) return false;

    var rects = map.blockedRects;
    for (var i = 0; i < rects.length; i++) {
      var r = rects[i];
      if (x >= r.left && x <= r.right && absY >= r.top && absY <= r.bottom) {
        return false;
      }
    }
    return true;
  };

  VectorField.prototype._handleMouse = function (e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    this.mouseActive = true;
  };

  VectorField.prototype._handleMouseLeave = function () {
    this.mouseActive = false;
  };

  VectorField.prototype._handleTouch = function (e) {
    if (e.touches.length > 0) {
      this.mouseX = e.touches[0].clientX;
      this.mouseY = e.touches[0].clientY;
      this.mouseActive = true;
    }
  };

  VectorField.prototype._handleTouchEnd = function () {
    this.mouseActive = false;
  };

  VectorField.prototype._animate = function (timestamp) {
    this.animId = requestAnimationFrame(this._tick);

    var ctx = this.ctx;
    var w = this.width, h = this.height;
    ctx.clearRect(0, 0, w, h);

    var needles = this.needles;
    var len = needles.length;
    var mx = this.mouseX, my = this.mouseY;
    var active = this.mouseActive;
    var mouseR = CONFIG.MOUSE_RADIUS;
    var mouseR2 = mouseR * mouseR;
    var baseAlpha = CONFIG.BASE_ALPHA;
    var maxAlpha = CONFIG.MAX_ALPHA;
    var halfLen = CONFIG.LINE_LENGTH * 0.5;
    var color = CONFIG.COLOR;
    var lerpSpd = CONFIG.LERP_SPEED;
    var mouseAttrStrength = CONFIG.MOUSE_ATTRACTION_STRENGTH;
    var mouseFalloffPower = CONFIG.MOUSE_FALLOFF_POWER;
    var mouseLerpBoost = CONFIG.MOUSE_LERP_BOOST;
    var noiseScale = CONFIG.NOISE_SCALE;
    var zOff = timestamp * CONFIG.TIME_SPEED;

    ctx.lineWidth = CONFIG.LINE_WIDTH;
    ctx.lineCap = 'round';

    for (var i = 0; i < len; i++) {
      var n = needles[i];
      if (!this._isInRenderZone(n.x, n.y)) continue;

      var noiseAngle = noise3D(n.x * noiseScale, n.y * noiseScale, zOff) * Math.PI * 2;

      var drawAlpha = baseAlpha;
      var targetAngle = noiseAngle;
      var localLerpSpd = lerpSpd;

      if (active) {
        var dx = mx - n.x;
        var dy = my - n.y;
        var dist2 = dx * dx + dy * dy;

        if (dist2 < mouseR2) {
          var dist = Math.sqrt(dist2);
          var t = easeOutCubic(1 - dist / mouseR);
          t = Math.pow(t, mouseFalloffPower);
          var influence = Math.min(1, t * mouseAttrStrength);
          var mouseAngle = Math.atan2(dy, dx);
          targetAngle = lerpAngle(noiseAngle, mouseAngle, influence);
          drawAlpha = baseAlpha + (maxAlpha - baseAlpha) * influence;
          localLerpSpd = Math.min(1, lerpSpd + mouseLerpBoost * influence);
        }
      }

      n.angle = lerpAngle(n.angle, targetAngle, localLerpSpd);

      var cdx = Math.cos(n.angle) * halfLen;
      var cdy = Math.sin(n.angle) * halfLen;

      ctx.beginPath();
      ctx.moveTo(n.x - cdx, n.y - cdy);
      ctx.lineTo(n.x + cdx, n.y + cdy);
      ctx.strokeStyle = 'rgba(' + color + ',' + drawAlpha + ')';
      ctx.stroke();
    }
  };

  VectorField.prototype.destroy = function () {
    if (this.animId) cancelAnimationFrame(this.animId);
    clearTimeout(this._resizeTimer);
    clearTimeout(this._layoutTimer);
    if (this._layoutObserver) this._layoutObserver.disconnect();
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('scroll', this._onScroll);
    window.removeEventListener('mousemove', this._onMouse);
    window.removeEventListener('mouseleave', this._onMouseLeave);
    window.removeEventListener('touchmove', this._onTouch);
    window.removeEventListener('touchend', this._onTouchEnd);
  };

  // ---- Init ----

  var instance = null;

  function init() {
    instance = new VectorField();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('beforeunload', function () {
    if (instance) instance.destroy();
  });
})();
