/* =============================================================
   HÖRSAAL — index.html only.

   One motion grammar: everything on this page arrives the way
   chalk arrives. The background plane is written by the scroll
   itself; section heads are written once on entry; references are
   written when their module is opened.

   vectorfield.js is untouched and still serves the other pages.
   ============================================================= */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* -----------------------------------------------------------
     Notation

     The bank is written in a compact subscript/superscript syntax
     so the mathematics stays legible in source. Escape first,
     then mark up: the inequalities contain real `<`.
     ----------------------------------------------------------- */

  function tex(s) {
    return s
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/_\{([^}]*)\}/g, '<sub>$1</sub>')
      .replace(/\^\{([^}]*)\}/g, '<sup>$1</sup>')
      .replace(/_([A-Za-z0-9αβγδεθλμνρσταφω*+−-])/g, '<sub>$1</sub>')
      .replace(/\^([A-Za-z0-9αβγδεθλμνρσταφω*+−-])/g, '<sup>$1</sup>');
  }

  /* -----------------------------------------------------------
     The bank

     Alejandro's own subject matter, drawn from the thesis, the
     completed modules and the BPZ calculation photographed in
     bpzcalc.jpg. `L` marks the line that leads its band; `W` marks
     a line too wide for a phone, which the stylesheet drops there.
     ----------------------------------------------------------- */

  var BANDS = [
    { // Itô calculus
      L: 'dX_t = b(t, X_t) dt + σ(t, X_t) dW_t ,   X_0 = x',
      r: ['⟨W^i, W^j⟩_t = δ_{ij} t',
          '‖b(t,x) − b(t,y)‖ + ‖σ(t,x) − σ(t,y)‖ ≤ K‖x − y‖'],
      W: ['X_t = x + ∫_0^t b(s, X_s) ds + ∫_0^t σ(s, X_s) dW_s',
          'df(X_t) = ∂_i f(X_t) dX^i_t + ½ ∂_{ij} f(X_t) d⟨X^i, X^j⟩_t']
    },
    { // the finite particle system — the thesis
      L: 'du_i(t) = L u_i(t) dt + 1/N Σ_{j=1}^N A^N_{ij} g(u_i, u_j) dt + 1/N Σ_{j=1}^N Â^N_{ij} h(u_i, u_j) dW^Q_i(t)',
      r: ['μ^N_t = 1/N Σ_{i=1}^N δ_{u_i(t)} ⟹ μ̄_t',
          'b^α_μ(t, u) = ∫_H g(u, v) dμ^α_t(v)'],
      W: ['sup_{i≤N} 𝔼 sup_{t≤T} ‖u^N_i(t) − ū_i(t)‖²_H ≤ C_T / N',
          'α_A = sup_N 1/N Σ_{ij} |A^N_{ij}|']
    },
    { // C₀-semigroups
      L: 'S(t+s) = S(t) S(s) ,   S(0) = I ,   ‖S(t)‖ ≤ M e^{ωt}',
      r: ['A x = lim_{t↓0} ( S(t)x − x ) / t ,  x ∈ D(A)',
          '‖R(λ, A)^n‖ ≤ M / (λ − ω)^n'],
      W: ['R(λ, A) = (λI − A)^{−1} = ∫_0^∞ e^{−λt} S(t) dt',
          'e^{tA} = lim_{n→∞} ( I − tA/n )^{−n}']
    },
    { // Q-Wiener process, BDG
      L: 'W(t) = Σ_{j=1}^∞ √λ_j β_j(t) e_j',
      r: ['Q e_j = λ_j e_j ,  tr Q = Σ_j λ_j < ∞',
          '‖(−A)^γ S(t)‖ ≤ C_γ t^{−γ}'],
      W: ['𝔼 sup_{t≤T} ‖∫_0^t Φ_s dW_s‖^p ≤ C_p 𝔼 ( ∫_0^T ‖Φ_s‖²_{L²_Q} ds )^{p/2}']
    },
    { // optimal transport
      L: 'W_p(μ, ν)^p = inf_{π∈Π(μ,ν)} ∫ d(x, y)^p dπ(x, y)',
      r: ['T_#μ = ν', '∂_t ρ + ∇·(ρ v) = 0'],
      W: ['sup_{‖φ‖_{Lip}≤1} ∫ φ d(μ − ν) = W_1(μ, ν)']
    },
    { // spectral theory
      L: 'A = ∫_{σ(A)} λ dE(λ)',
      r: ['⟨Ax, y⟩ = ⟨x, A*y⟩', 'σ(A) ⊂ { λ : Re λ ≤ ω }'],
      W: ['D(A) = { x : lim_{t↓0} (S(t)x − x)/t exists } ⊂ E',
          '‖T‖ = sup_{‖x‖=1} ‖Tx‖']
    },
    { // large deviations
      L: 'lim_{n→∞} 1/n log ℙ( X_n ∈ A ) = − inf_{x∈A} I(x)',
      r: ['I(x) = sup_λ ( ⟨λ, x⟩ − Λ(λ) )',
          'ℙ( ‖μ^N − μ̄‖ > ε ) ≤ e^{−cNε²}'],
      W: ['Λ(λ) = lim_{n→∞} 1/n log 𝔼 e^{⟨λ, X_n⟩}']
    },
    { // Gaussian multiplicative chaos, BPZ — the board in the photograph
      L: 'M_γ(d²z) = lim_{ε→0} ε^{γ²/2} e^{γ X_ε(z)} d²z',
      r: ['Δ_α = α/2 ( Q − α/2 ) ,  Q = 2/γ + γ/2',
          '𝔼[ X(z) X(w) ] = log 1/|z − w| + O(1)'],
      W: ['( 1/b² ∂²_z + Σ_i [ Δ_i/(z − z_i)² + ∂_{z_i}/(z − z_i) ] ) ⟨ V(z) Π_i V_{α_i}(z_i) ⟩ = 0',
          '𝔼[ ( ∫_0^{2π} e^{γX(θ)} dθ/2π )^s ] = Γ(1 − sγ²/4) / Γ(1 − γ²/4)^s']
    },
    { // fractal geometry
      L: 'dim_H(E) = inf { s : ℋ^s(E) = 0 }',
      r: ['Σ_i r_i^s = 1', 'dim_B E = lim_{δ→0} log N(δ) / log(1/δ)'],
      W: ['ℋ^s(E) = lim_{δ→0} inf { Σ_i (diam U_i)^s : E ⊂ ∪_i U_i , diam U_i ≤ δ }']
    },
    { // random dynamical systems
      L: 'Φ(t+s, ω) = Φ(t, θ_s ω) ∘ Φ(s, ω)',
      r: ['θ_{t+s} = θ_t ∘ θ_s', 'λ = lim_{t→∞} 1/t log ‖Φ(t, ω) v‖'],
      W: ['μ_ω = lim_{t→∞} Φ(t, θ_{−t}ω)_# ν']
    },
    { // martingales, Girsanov
      L: 'dℚ/dℙ |_{ℱ_T} = exp( ∫_0^T θ_s dW_s − ½ ∫_0^T |θ_s|² ds )',
      r: ['M_t = 𝔼[ M_T | ℱ_t ]', 'τ_D = inf { t > 0 : X_t ∉ D }'],
      W: ['⟨X, X⟩_t = lim_{|π|→0} Σ_i | X_{t_{i+1}} − X_{t_i} |²',
          'W̃_t = W_t − ∫_0^t θ_s ds']
    },
    { // SPDE in mild form
      L: 'du = ( Au + F(u) ) dt + G(u) dW^Q(t)',
      r: ['∂_t u = Δu + ξ ,  ξ space-time white noise',
          '‖u‖_{H_γ} = ‖(−A)^γ u‖_H'],
      W: ['u(t) = S(t) u_0 + ∫_0^t S(t−s) F(u(s)) ds + ∫_0^t S(t−s) G(u(s)) dW^Q(s)']
    },
    { // branching random walk, lattice models
      L: 'M_n = max_{|v|=n} V(v) ,   M_n / n → γ  a.s.',
      r: ['𝔼 Σ_{|v|=1} e^{−λ V(v)} = 1', 'Z_n(β) = Σ_{|v|=n} e^{−β V(v)}'],
      W: ['⟨σ_x σ_y⟩ − ⟨σ_x⟩⟨σ_y⟩ ≤ C e^{−|x−y|/ξ}']
    },
    { // Kolmogorov / Fokker–Planck
      L: '∂_t μ_t = L^* μ_t',
      r: ['L φ = ⟨b, ∇φ⟩ + ½ tr( σσ^* ∇²φ )', 'P_{t+s} = P_t P_s'],
      W: ['⟨μ_t, φ⟩ = ⟨μ_0, φ⟩ + ∫_0^t ⟨μ_s, L_s φ⟩ ds',
          'P_t f(x) = ∫ f(y) p_t(x, dy)']
    },
    { // label regularity — the thesis' main theorem
      L: 'W_{2,T}( μ_{α_1}, μ_{α_2} ) ≤ L | α_1 − α_2 |',
      r: ['μ̄ = ∫_I μ_α dα', 'C([0,T]; H) ↪ C([τ,T]; H_γ) ,  τ > 0'],
      W: ['W_{2,t}( μ^{(n+1)}_{α_1}, μ^{(n+1)}_{α_2} )² ≤ δ² [ A_0 + A_1 ∫_0^t (D^{(n)}_s)² ds ]']
    },
    { // convergence to equilibrium
      L: 'Var_μ(f) ≤ C_P ∫ |∇f|² dμ',
      r: ['Ent_μ(f²) ≤ 2 C_{LS} ∫ |∇f|² dμ',
          '‖g(u,v)‖_H ≤ B_g ( 1 + ‖u‖_H + ‖v‖_H )'],
      W: ['‖P_t f − μ(f)‖_{L²(μ)} ≤ e^{−t/C_P} ‖f − μ(f)‖_{L²(μ)}']
    }
  ];

  /* Deterministic jitter: the same line always gets the same tilt
     and weight, so a rebuild after a resize does not reshuffle the
     board under the reader. */
  function jitter(seed) {
    var x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  /* -----------------------------------------------------------
     Build the plane to the measured height of the region

     Bands are emitted until the region is covered, cycling the
     bank and offsetting the start each cycle so the same three
     lines never sit directly above one another.
     ----------------------------------------------------------- */

  var plane = document.querySelector('[data-chalk-plane]');
  var region = plane && plane.parentNode;
  var lines = [];
  var builtFor = 0;
  var docMax = 0;

  function line(text, cls, i) {
    var j = jitter(i);
    var k = jitter(i * 7.13);
    var el = document.createElement('span');
    el.className = 'chalk-line' + (cls ? ' ' + cls : '');
    el.style.setProperty('--tilt', ((j - 0.5) * 0.9).toFixed(2) + 'deg');

    /* The tray holds three sticks and a lecturer reaches for the
       other two. Without this the board is bone from top to bottom
       and the blue and ochre live only in the interface. */
    var tint = jitter(i * 3.77);
    if (cls === 'chalk-line--lead' && tint > 0.72) el.style.color = 'var(--chalk-ochre)';
    else if (tint < 0.13) el.style.color = 'var(--chalk-blue)';

    if (cls === 'chalk-line--lead') {
      el.style.setProperty('--ink', (0.42 + k * 0.13).toFixed(3));
      el.style.setProperty('--size', (2.2 + k * 0.7).toFixed(2) + 'rem');
    } else {
      el.style.setProperty('--ink', (0.27 + k * 0.15).toFixed(3));
      el.style.setProperty('--size', (1.5 + k * 0.6).toFixed(2) + 'rem');
    }
    el.innerHTML = '<i>' + tex(text) + '</i><b></b>';
    return el;
  }

  function band(spec, index) {
    var el = document.createElement('div');
    el.className = 'chalk-band';
    var n = index * 100;

    var top = document.createElement('div');
    top.className = 'chalk-row ' + (index % 2 ? 'chalk-row--right' : '');
    (spec.r || []).forEach(function (t, i) { top.appendChild(line(t, '', n + i)); });
    el.appendChild(top);

    var mid = document.createElement('div');
    mid.className = 'chalk-row';
    mid.style.marginLeft = (index % 3) * 2.5 + 'vw';
    mid.appendChild(line(spec.L, 'chalk-line--lead', n + 20));
    el.appendChild(mid);

    var bot = document.createElement('div');
    bot.className = 'chalk-row ' + (index % 2 ? '' : 'chalk-row--right');
    (spec.W || []).forEach(function (t, i) {
      bot.appendChild(line(t, 'chalk-line--wide', n + 40 + i));
    });
    el.appendChild(bot);

    return el;
  }

  function buildPlane() {
    if (!plane || !region) return;

    /* The board stops above the colophon. The tombstone is the page's
       last mark, and a formula running past it — or through it — is
       not an ending. */
    var colophon = document.querySelector('.colophon');
    var foot = colophon ? colophon.offsetHeight + 24 : 0;
    plane.style.bottom = foot + 'px';

    var h = region.offsetHeight - foot;
    if (h <= 0) return;
    /* Rebuild only on a real change; a 1px reflow is not one. */
    if (Math.abs(h - builtFor) < 120 && lines.length) return;
    builtFor = h;

    /* One band roughly every 400px. Sparser than this and the
       writing arrives in clumps with bare slate between them; the
       board should read as continuously worked. */
    var want = Math.max(5, Math.min(56, Math.round(h / 400)));

    plane.textContent = '';
    for (var i = 0; i < want; i++) {
      plane.appendChild(band(BANDS[i % BANDS.length], i));
    }

    lines = Array.prototype.map.call(
      plane.querySelectorAll('.chalk-line'),
      function (el) {
        return { el: el, body: el.firstChild, edge: el.lastChild, top: 0, live: false, p: -1 };
      }
    );
    measure();
    observeLines();
    paint();
  }

  /* -----------------------------------------------------------
     Writing

     Offsets are measured once per layout, so the scroll handler
     performs zero layout reads: with ~90 lines a per-frame
     getBoundingClientRect() on each is 90 forced reflows a frame.
     ----------------------------------------------------------- */

  function measure() {
    var y = window.pageYOffset;
    /* Cached here, never in the scroll handler: reading scrollHeight is
       a layout read, and the whole point of this engine is that a frame
       performs none. */
    docMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    for (var i = 0; i < lines.length; i++) {
      lines[i].top = lines[i].el.getBoundingClientRect().top + y;
    }
  }

  var lineObserver = null;

  function observeLines() {
    if (typeof IntersectionObserver === 'undefined') {
      for (var i = 0; i < lines.length; i++) lines[i].live = true;
      return;
    }
    if (lineObserver) lineObserver.disconnect();
    var map = new WeakMap();
    for (var j = 0; j < lines.length; j++) map.set(lines[j].el, lines[j]);

    lineObserver = new IntersectionObserver(function (entries) {
      for (var k = 0; k < entries.length; k++) {
        var rec = map.get(entries[k].target);
        if (!rec) continue;
        rec.live = entries[k].isIntersecting;
        if (!rec.live) {
          /* Park it at its terminal state so a line scrolled past
             stays written and one not yet reached stays blank. */
          set(rec, entries[k].boundingClientRect.top < 0 ? 1 : 0);
        }
      }
      schedule();
    }, { rootMargin: '45% 0px 45% 0px' });

    for (var m = 0; m < lines.length; m++) lineObserver.observe(lines[m].el);
  }

  function smooth(t) { return t * t * (3 - 2 * t); }

  function set(rec, p) {
    if (Math.abs(p - rec.p) < 0.004) return;
    rec.p = p;
    var e = smooth(p);
    rec.body.style.clipPath = 'inset(-8% ' + ((1 - e) * 100).toFixed(2) + '% -8% 0)';
    rec.edge.style.left = (e * 100).toFixed(2) + '%';
    rec.edge.style.opacity = (e > 0.015 && e < 0.985) ? '0.9' : '0';
  }

  var frame = 0;

  function paint() {
    frame = 0;
    if (reduced.matches) return;
    var vh = window.innerHeight;
    var y = window.pageYOffset;
    var span = 0.3 * vh;
    for (var i = 0; i < lines.length; i++) {
      var rec = lines[i];
      if (!rec.live) continue;
      /* A line normally finishes when it has risen to 0.6vh from the
         top of the viewport. For the last lines on the board that point
         sits past the furthest anyone can scroll, so they would stay
         half-written forever, chalk edge frozen mid-stroke. Their window
         is pulled back to end at the last reachable scroll position, so
         every formula on the page finishes. */
      var finish = rec.top - 0.6 * vh;
      if (finish > docMax) finish = docMax;
      var raw = (y - (finish - span)) / span;
      set(rec, raw < 0 ? 0 : raw > 1 ? 1 : raw);
    }
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(paint);
  }

  /* -----------------------------------------------------------
     Section arrival
     ----------------------------------------------------------- */

  var STAGGER = 70, LEAD = 150, CAP = 8, LEAF_CAP = 16;

  /* One grammar, two orientations. A line is written across; a
     paragraph is written down. Containers carry no ink and arrive
     without ceremony, so only the leaves are armed. */
  function arm(sheet) {
    var kids = sheet.children;
    var tier = 0;
    for (var i = 0; i < kids.length; i++) {
      var kid = kids[i];
      if (kid.classList.contains('sheet-head')) continue;

      var leaves = kid.matches('p, li, h3')
        ? [kid]
        : Array.prototype.slice.call(kid.querySelectorAll('p, li, h3, .module-item'));

      /* References inside a module are written when that module is
         opened, not when the section arrives. */
      leaves = leaves.filter(function (el) { return !el.closest('.module-references'); });

      var limit = Math.min(leaves.length, LEAF_CAP);
      for (var q = 0; q < limit; q++) {
        leaves[q].classList.add(leaves[q].tagName === 'P' ? 'writes-down' : 'writes-across');
        leaves[q].style.setProperty('--delay',
          (LEAD + Math.min(tier, CAP) * STAGGER + q * 42) + 'ms');
      }
      tier++;
    }
  }

  function armSheets() {
    var sheets = document.querySelectorAll('.sheet');
    if (!sheets.length) return;

    if (typeof IntersectionObserver === 'undefined') {
      for (var i = 0; i < sheets.length; i++) sheets[i].classList.add('is-written');
      return;
    }

    for (var j = 0; j < sheets.length; j++) arm(sheets[j]);

    var io = new IntersectionObserver(function (entries, obs) {
      for (var k = 0; k < entries.length; k++) {
        if (!entries[k].isIntersecting) continue;
        entries[k].target.classList.add('is-written');
        obs.unobserve(entries[k].target);
      }
    }, { threshold: 0.04, rootMargin: '0px 0px -8% 0px' });

    for (var m = 0; m < sheets.length; m++) io.observe(sheets[m]);
  }

  /* -----------------------------------------------------------
     The index knows where you are
     ----------------------------------------------------------- */

  /* The tombstone is written once the page's last line is reached. */
  function armQed() {
    var colophon = document.querySelector('.colophon');
    if (!colophon) return;
    if (typeof IntersectionObserver === 'undefined') {
      colophon.classList.add('is-written');
      return;
    }
    var io = new IntersectionObserver(function (entries, obs) {
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting) continue;
        entries[i].target.classList.add('is-written');
        obs.unobserve(entries[i].target);
      }
    }, { threshold: 0.35 });
    io.observe(colophon);
  }

  function spy() {
    var links = document.querySelectorAll('.index-link');
    if (!links.length || typeof IntersectionObserver === 'undefined') return;

    var byId = {};
    for (var i = 0; i < links.length; i++) byId[links[i].dataset.indexFor] = links[i];

    var io = new IntersectionObserver(function (entries) {
      for (var k = 0; k < entries.length; k++) {
        var link = byId[entries[k].target.id];
        if (!link) continue;
        if (entries[k].isIntersecting) {
          for (var m = 0; m < links.length; m++) links[m].classList.remove('is-here');
          link.classList.add('is-here');
        }
      }
    }, { rootMargin: '-45% 0px -50% 0px' });

    for (var j = 0; j < links.length; j++) {
      var sec = document.getElementById(links[j].dataset.indexFor);
      if (sec) io.observe(sec);
    }
  }

  /* -----------------------------------------------------------
     Disclosures

     Kept on the global name the markup calls, with the state the
     original never reported to assistive technology.
     ----------------------------------------------------------- */

  window.toggleModule = function (btn) {
    var item = btn.parentElement;
    var open = !item.classList.contains('expanded');

    item.classList.toggle('expanded', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');

    /* Re-measure: an opened module lengthens the region, and the
       chalk plane is sized to it. */
    clearTimeout(window.__chalkRemeasure);
    window.__chalkRemeasure = setTimeout(function () {
      measure();
      schedule();
    }, 520);
  };

  function numberReferences() {
    var lists = document.querySelectorAll('.module-references ul');
    for (var i = 0; i < lists.length; i++) {
      var items = lists[i].children;
      for (var j = 0; j < items.length; j++) items[j].style.setProperty('--i', j);
    }
  }

  /* -----------------------------------------------------------
     Boot
     ----------------------------------------------------------- */

  var resizeTimer;

  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      buildPlane();
      measure();
      schedule();
    }, 200);
  }

  function init() {
    window.__chalkBooted = true;
    numberReferences();
    armSheets();
    armQed();
    spy();
    buildPlane();

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', onResize);

    /* Archivo and Caveat change every measured offset when they
       land, so the board is rebuilt against the real layout. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        builtFor = 0;
        buildPlane();
        measure();
        schedule();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('pagehide', function () {
    if (lineObserver) lineObserver.disconnect();
    if (frame) cancelAnimationFrame(frame);
  });
})();
