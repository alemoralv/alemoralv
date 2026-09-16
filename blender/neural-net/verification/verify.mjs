/* Verification of the travelling network. Run from the repository root:
     node blender/neural-net/verification/server.mjs   (serves the site on :4520)
     node blender/neural-net/verification/verify.mjs
   Headless Chrome (channel chrome, ANGLE D3D11). Checks, at 390 / 820 / 1024 /
   1440 / 1920 px and eight scroll positions down the page: no overlap between
   the drawn network and any text, link, button or the portrait; the neuron
   count rises with scroll and falls on the way back; the frame rate with the
   full network; no horizontal overflow; the pointer gestures; the pause and
   keyboard reach; the live figure in flow on touch widths with a tap; reduced
   motion live but calm; the still only when the asset fails. Writes
   report.json and captures beside this file. */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const require = createRequire(path.join(root, 'scrollcraft/builds/daylight/package.json'));
const { chromium } = require('playwright-core');
const URL = process.env.NETWORK_QA_URL || 'http://127.0.0.1:4520/';
const POSITIONS = [0, 0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1];
const report = { date: new Date().toISOString(), url: URL, widths: {}, problems: [], errors: [] };
for (const f of fs.readdirSync(here)) if (/\.(png|jpg)$/.test(f)) fs.unlinkSync(path.join(here, f));

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const inPage = {
  // Every visible content box in the viewport: text, links, buttons, the portrait, the experiment.
  boxes() {
    const out = [];
    const sel = 'h1, h2, h3, p, li, a, button, strong, em, span, img:not(.network-poster), figure.masthead-plate, svg[data-chance-path], .network-controls';
    for (const el of document.querySelectorAll(sel)) {
      if (el.closest('.network-layer, .chalk-plane, .stochastic-layer, [aria-hidden="true"]:not(.sheet-tally):not(.network-controls)') && !el.matches('.sheet-tally')) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || el.hidden) continue;
      if (!el.matches('img, svg, figure, .network-controls') && !el.textContent.trim()) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1 || r.bottom < 0 || r.top > innerHeight) continue;
      out.push({ tag: el.tagName.toLowerCase(), text: (el.textContent || el.getAttribute('aria-label') || el.alt || '').trim().slice(0, 40), x: r.left, y: r.top, r: r.right, b: r.bottom });
    }
    return out;
  },
  state() {
    const host = document.querySelector('[data-network-layer]');
    const canvas = host?.querySelector('canvas');
    const d = canvas?.networkDiagnostics || null;
    const hr = host.getBoundingClientRect();
    const drawn = d ? { x: hr.left + d.bounds.left, y: hr.top + d.bounds.top, r: hr.left + d.bounds.right, b: hr.top + d.bounds.bottom } : null;
    const free = d ? { x: hr.left + d.free.x, y: hr.top + d.free.y, r: hr.left + d.free.x + d.free.w, b: hr.top + d.free.y + d.free.h } : null;
    return { live: host.classList.contains('is-live'), host: { x: hr.left, y: hr.top, r: hr.right, b: hr.bottom }, clip: host.style.clipPath, drawn, free, diag: d,
      scrollY, maxScroll: document.documentElement.scrollHeight - innerHeight, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      status: document.querySelector('[data-network-status]')?.textContent || '', poster: getComputedStyle(document.querySelector('.network-poster')).opacity };
  },
};

function overlaps(a, b, pad = 0) { return a.x < b.r - pad && a.r > b.x + pad && a.y < b.b - pad && a.b > b.y + pad; }
async function check(page, label, width) {
  const s = await page.evaluate(inPage.state);
  const boxes = await page.evaluate(inPage.boxes);
  const problems = [];
  if (s.overflow > 0) problems.push(`${label}: horizontal overflow ${s.overflow}px`);
  if (s.live && s.diag) {
    for (const b of boxes) if (overlaps(s.drawn, b)) problems.push(`${label}: network [${Math.round(s.drawn.x)},${Math.round(s.drawn.y)} ${Math.round(s.drawn.r)},${Math.round(s.drawn.b)}] overlaps <${b.tag}> "${b.text}" [${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.r)},${Math.round(b.b)}]`);
    const f = s.free, dr = s.drawn, tol = 1.5;
    if (dr.x < f.x - tol || dr.y < f.y - tol || dr.r > f.r + tol || dr.b > f.b + tol) problems.push(`${label}: drawn bounds leave the free rectangle by ${[f.x - dr.x, f.y - dr.y, dr.r - f.r, dr.b - f.b].map(v => Math.round(v)).join('/')}px`);
    if (s.diag.drawCalls > 4) problems.push(`${label}: ${s.diag.drawCalls} draw calls`);
    if (s.diag.active && s.diag.born !== s.diag.wanted) problems.push(`${label}: born ${s.diag.born} but wanted ${s.diag.wanted} after settling`);
  }
  report.problems.push(...problems);
  return { ...s, boxes: boxes.length, problems };
}

async function settle(page) {
  // Births cascade at 14 ms each and the composition eases; wait until the count and the frame stop changing.
  let prev = null;
  for (let i = 0; i < 40; i++) {
    await sleep(250);
    const d = await page.evaluate(() => document.querySelector('[data-network-layer] canvas')?.networkDiagnostics || null);
    if (!d) return;
    const key = d.born + ':' + d.wanted + ':' + Math.round(d.view.d * 20) + ':' + Math.round(d.bounds.left) + ':' + Math.round(d.bounds.top);
    if ((!d.active || d.born === d.wanted) && key === prev && i > 3) return;
    prev = key;
  }
}
async function scrollTo(page, fraction) {
  await page.evaluate(f => scrollTo({ top: Math.round((document.documentElement.scrollHeight - innerHeight) * f), behavior: 'instant' }), fraction);
  await settle(page);
}

for (const width of [1920, 1440, 1024, 820, 390]) {
  const height = width >= 900 ? 900 : Math.round(width * 1.9);
  const touch = width < 900;
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, hasTouch: touch, isMobile: touch });
  const page = await context.newPage();
  const requests = [];
  page.on('request', r => { if (/neural-net\.glb/.test(r.url())) requests.push(r.url()); });
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') report.errors.push(`${width}: ${m.text().slice(0, 200)}`); });
  page.on('pageerror', e => report.errors.push(`${width}: ${e.message}`));
  await page.goto(URL, { waitUntil: 'networkidle' });
  const entry = { width, height, touch, positions: {}, descent: [], ascent: [] };
  report.widths[width] = entry;
  try { await page.waitForSelector('[data-network-layer].is-live', { timeout: 20000 }); } catch { report.problems.push(`${width}: renderer never became live`); }
  await sleep(600);
  for (const f of POSITIONS) {
    await scrollTo(page, f);
    const r = await check(page, `${width}@${f}`, width);
    entry.positions[f] = { scrollY: r.scrollY, live: r.live, overflow: r.overflow, boxes: r.boxes, drawn: r.drawn, free: r.free, host: r.host,
      born: r.diag?.born, bornEdges: r.diag?.bornEdges, wanted: r.diag?.wanted, fps: r.diag?.fps, drawCalls: r.diag?.drawCalls, triangles: r.diag?.triangles, problems: r.problems };
    entry.descent.push(r.diag ? r.diag.born : null);
    if (width === 1440 || (f === 0 || f === 1) || (width === 1024 && f === 0.4)) {
      await page.screenshot({ path: path.join(here, `w${width}-p${String(Math.round(f * 100)).padStart(3, '0')}.jpg`), type: 'jpeg', quality: 72 });
    }
  }
  // Full network: hold and read the frame rate.
  if (!touch) {
    await sleep(3500);
    const d = await page.evaluate(() => document.querySelector('[data-network-layer] canvas').networkDiagnostics);
    entry.full = { born: d.born, bornEdges: d.bornEdges, fps: d.fps, drawCalls: d.drawCalls, triangles: d.triangles, gpu: d.gpu };
    if (d.born !== d.nodes || d.bornEdges !== d.edges) report.problems.push(`${width}: the full network has ${d.born}/${d.nodes} neurons and ${d.bornEdges}/${d.edges} weights at the foot of the page`);
    if (d.fps < 50) report.problems.push(`${width}: ${d.fps.toFixed(1)} fps with the full network`);
    if (d.drawCalls > 4) report.problems.push(`${width}: ${d.drawCalls} draw calls`);
  }
  // Back up: the count must fall again.
  for (const f of [...POSITIONS].reverse()) {
    await scrollTo(page, f);
    const d = await page.evaluate(() => document.querySelector('[data-network-layer] canvas')?.networkDiagnostics || null);
    entry.ascent.push(d ? d.born : null);
  }
  if (!touch) {
    const up = entry.descent, down = entry.ascent;
    if (up[0] === null || up.some((v, i) => i && v < up[i - 1])) report.problems.push(`${width}: neuron count is not monotone on the way down: ${up.join(' ')}`);
    if (down.some((v, i) => i && v > down[i - 1])) report.problems.push(`${width}: neuron count is not monotone on the way up: ${down.join(' ')}`);
    if (up[0] >= up[up.length - 1]) report.problems.push(`${width}: no growth from top to bottom`);
    if (up[0] > 16) report.problems.push(`${width}: ${up[0]} neurons at the top of the page; only the first few should exist`);
  } else {
    // Touch: the figure in flow is live, builds as it passes through the viewport, pauses off screen, and a tap fires.
    await page.evaluate(() => document.querySelector('[data-network-layer]').scrollIntoView({ block: 'center', behavior: 'instant' }));
    await settle(page);
    let s = await page.evaluate(inPage.state);
    const boxes = await page.evaluate(inPage.boxes);
    for (const b of boxes) if (overlaps(s.drawn, b)) report.problems.push(`${width}: the figure overlaps <${b.tag}> "${b.text}"`);
    entry.figure = { host: s.host, born: s.diag.born, active: s.diag.active, position: await page.evaluate(() => getComputedStyle(document.querySelector('[data-network-layer]')).position), glbRequests: requests.length };
    if (!s.live || !s.diag.active || s.diag.born < 24) report.problems.push(`${width}: the figure in flow is not live (${s.diag?.born} neurons)`);
    const before = s.diag.passes;
    await page.touchscreen.tap((s.drawn.x + s.drawn.r) / 2, (s.drawn.y + s.drawn.b) / 2); await sleep(400);
    s = await page.evaluate(inPage.state);
    entry.tap = { passes: s.diag.passes, status: s.status.slice(0, 60) };
    if (s.diag.passes !== before + 1) report.problems.push(`${width}: a tap did not fire a pass`);
    await page.screenshot({ path: path.join(here, `w${width}-tap.jpg`), type: 'jpeg', quality: 72 });
    await scrollTo(page, 0.6);
    s = await page.evaluate(inPage.state);
    entry.offscreen = { active: s.diag.active };
    if (s.diag.active) report.problems.push(`${width}: the figure kept rendering off screen`);
  }

  // Pointer gestures at the widest layout, with a large network on screen.
  if (width === 1440) {
    await scrollTo(page, 0.7);
    const s = await page.evaluate(inPage.state);
    const cx = (s.drawn.x + s.drawn.r) / 2, cy = (s.drawn.y + s.drawn.b) / 2;
    const passesBefore = s.diag.passes;
    // Hover across the object: springs, lean, a trail, warmer weights, a tilt.
    await page.mouse.move(cx - 120, cy - 60);
    for (let i = 1; i <= 24; i++) { await page.mouse.move(cx - 120 + i * 10, cy - 60 + i * 5); await sleep(30); }
    await sleep(120);
    let d = await page.evaluate(() => document.querySelector('[data-network-layer] canvas').networkDiagnostics);
    entry.hover = { disturbed: d.disturbed, hotNodes: d.hotNodes, hotEdges: d.hotEdges, maxDisplacement: d.maxDisplacement, tilt: d.tilt, passes: d.passes };
    if (d.hotNodes === 0 && d.hotEdges === 0) report.problems.push('1440: hover lit nothing');
    if (Math.hypot(...d.tilt) < 0.005) report.problems.push('1440: no tilt toward the cursor');
    if (d.maxDisplacement < 0.01) report.problems.push('1440: hover displaced nothing');
    await page.screenshot({ path: path.join(here, 'w1440-hover.jpg'), type: 'jpeg', quality: 72 });
    await sleep(900);
    d = await page.evaluate(() => document.querySelector('[data-network-layer] canvas').networkDiagnostics);
    entry.trailFades = { hotNodes: d.hotNodes, hotEdges: d.hotEdges };
    // Drag: rotation without a pass.
    const rotBefore = d.rotation;
    await page.mouse.move(cx, cy); await page.mouse.down();
    for (let i = 1; i <= 12; i++) { await page.mouse.move(cx + i * 18, cy + i * 6); await sleep(25); }
    await page.mouse.up(); await sleep(400);
    d = await page.evaluate(() => document.querySelector('[data-network-layer] canvas').networkDiagnostics);
    entry.drag = { rotationBefore: rotBefore, rotationAfter: d.rotation, passes: d.passes };
    if (Math.abs(d.rotation[1] - rotBefore[1]) < 0.3) report.problems.push('1440: drag did not rotate');
    if (d.passes !== passesBefore) report.problems.push('1440: a drag fired a pass');
    await page.mouse.move(cx - 400, cy - 300); await sleep(700);
    // Click on a neuron: find one under a probe grid, then click there.
    const probe = await page.evaluate(({ cx, cy }) => {
      const host = document.querySelector('[data-network-layer]'), canvas = host.querySelector('canvas'), hr = host.getBoundingClientRect();
      for (let r = 0; r < 260; r += 6) for (let a = 0; a < Math.PI * 2; a += 0.35) {
        const x = cx + r * Math.cos(a) - hr.left, y = cy + r * Math.sin(a) - hr.top;
        const hit = canvas.networkProbe(x, y);
        if (hit) return { x: x + hr.left, y: y + hr.top, hit };
      }
      return null;
    }, { cx, cy });
    entry.probe = probe;
    if (!probe) report.problems.push('1440: no neuron found under the probe grid');
    else {
      await page.mouse.move(probe.x, probe.y); await sleep(60);
      const beforeClick = (await page.evaluate(inPage.state)).diag.passes; // idle passes may have fired since the hover
      await page.mouse.down(); await sleep(40); await page.mouse.up(); await sleep(300);
      const after = await page.evaluate(inPage.state);
      entry.clickNeuron = { status: after.status, passes: after.diag.passes, pulse: after.diag.pulse, from: probe.hit };
      if (after.diag.passes !== beforeClick + 1) report.problems.push('1440: clicking a neuron did not fire exactly one pass');
      if (!/from neuron/.test(after.status)) report.problems.push('1440: the pass did not start from the clicked neuron: ' + after.status);
      await sleep(250);
      await page.screenshot({ path: path.join(here, 'w1440-click.jpg'), type: 'jpeg', quality: 72 });
    }
    // Click on empty space inside the object: a full pass from the input layer.
    await page.mouse.move(cx - 400, cy - 300); await sleep(300);
    const empty = await page.evaluate(({ cx, cy }) => {
      const host = document.querySelector('[data-network-layer]'), canvas = host.querySelector('canvas'), hr = host.getBoundingClientRect();
      const d = canvas.networkDiagnostics;
      for (let y = d.bounds.top + 4; y < d.bounds.bottom; y += 9) for (let x = d.bounds.left + 4; x < d.bounds.right; x += 9) if (!canvas.networkProbe(x, y)) return { x: x + hr.left, y: y + hr.top };
      return null;
    }, { cx, cy });
    if (empty) {
      const before = (await page.evaluate(inPage.state)).diag.passes;
      await page.mouse.click(empty.x, empty.y); await sleep(300);
      const after = await page.evaluate(inPage.state);
      entry.clickEmpty = { status: after.status, passes: after.diag.passes };
      if (after.diag.passes !== before + 1 || /from neuron/.test(after.status)) report.problems.push('1440: a click beside the neurons should fire a full pass: ' + after.status);
    }
    // Keyboard: Enter on Fire; Pause stops the frames and Resume restarts them.
    await page.focus('[data-network-fire]');
    const before = (await page.evaluate(inPage.state)).diag.passes;
    await page.keyboard.press('Enter'); await sleep(200);
    entry.keyboardFire = (await page.evaluate(inPage.state)).diag.passes;
    if (entry.keyboardFire !== before + 1) report.problems.push('1440: Enter on Fire did not fire');
    await page.click('[data-network-pause]'); await sleep(300);
    const f1 = (await page.evaluate(inPage.state)).diag.frames; await sleep(500);
    const paused = await page.evaluate(inPage.state);
    entry.pause = { active: paused.diag.active, framesFrozen: paused.diag.frames === f1, label: await page.textContent('[data-network-pause]') };
    if (paused.diag.active || paused.diag.frames !== f1) report.problems.push('1440: Pause did not stop the frames');
    await page.click('[data-network-pause]'); await sleep(500);
    const resumed = await page.evaluate(inPage.state);
    if (!resumed.diag.active || resumed.diag.frames === f1) report.problems.push('1440: Resume did not restart the frames');
    // The controls never sit under the network.
    const cs = await page.evaluate(inPage.state);
    const controls = await page.evaluate(() => { const r = document.querySelector('[data-network-controls]').getBoundingClientRect(); return { x: r.left, y: r.top, r: r.right, b: r.bottom }; });
    if (overlaps(cs.drawn, controls)) report.problems.push('1440: the network overlaps the controls');
    // Keyboard on the object itself: arrows turn it, Enter fires.
    await page.focus('[data-network-layer]');
    const kb0 = (await page.evaluate(inPage.state)).diag;
    await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await sleep(150);
    await page.keyboard.press('Enter'); await sleep(200);
    const kb1 = (await page.evaluate(inPage.state)).diag;
    entry.keyboardObject = { rotated: kb1.rotation[1] - kb0.rotation[1], passes: kb1.passes - kb0.passes };
    if (kb1.rotation[1] - kb0.rotation[1] < 0.3) report.problems.push('1440: arrow keys did not turn the object');
    if (kb1.passes !== kb0.passes + 1) report.problems.push('1440: Enter on the object did not fire');
    // Reduced motion: live but calm. Nothing moves on its own; the visitor still gets an answer.
    const rm = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    const rp = await rm.newPage();
    await rp.goto(URL, { waitUntil: 'networkidle' });
    try { await rp.waitForSelector('[data-network-layer].is-live', { timeout: 20000 }); } catch { report.problems.push('1440: reduced motion never became live'); }
    await rp.evaluate(f => scrollTo({ top: Math.round((document.documentElement.scrollHeight - innerHeight) * f), behavior: 'instant' }), 0.5);
    await sleep(1500);
    const c0 = await rp.evaluate(inPage.state); await sleep(2500);
    const c1 = await rp.evaluate(inPage.state);
    entry.reducedMotion = { live: c1.live, calm: c1.diag?.calm, born: c1.diag?.born, passes: c1.diag?.passes, turned: c1.diag && c1.diag.rotation[1] - c0.diag.rotation[1], poster: c1.poster };
    if (!c1.live || !c1.diag?.calm) report.problems.push('1440: reduced motion is not live and calm');
    if (c1.diag && (c1.diag.passes > 0 || Math.abs(c1.diag.rotation[1] - c0.diag.rotation[1]) > 1e-6)) report.problems.push('1440: reduced motion moved on its own');
    const cBoxes = await rp.evaluate(inPage.boxes);
    for (const b of cBoxes) if (overlaps(c1.drawn, b)) report.problems.push(`1440 reduced motion: the network overlaps <${b.tag}> "${b.text}"`);
    const cx2 = (c1.drawn.x + c1.drawn.r) / 2, cy2 = (c1.drawn.y + c1.drawn.b) / 2;
    await rp.mouse.click(cx2, cy2); await sleep(300);
    const c2 = await rp.evaluate(inPage.state);
    entry.reducedMotion.clickFired = c2.diag.passes;
    if (c2.diag.passes !== 1) report.problems.push('1440: reduced motion did not answer a click');
    await rp.screenshot({ path: path.join(here, 'w1440-reduced-motion.jpg'), type: 'jpeg', quality: 72 });
    await rm.close();
    // A failing GLB keeps the still.
    const fc = await browser.newContext({ viewport: { width, height } });
    const fp = await fc.newPage();
    await fp.route(/neural-net\.glb/, r => r.abort());
    await fp.goto(URL, { waitUntil: 'networkidle' }); await sleep(1500);
    entry.glbFailure = await fp.evaluate(() => ({ canvas: Boolean(document.querySelector('[data-network-layer] canvas')), live: document.querySelector('[data-network-layer]').classList.contains('is-live'), poster: getComputedStyle(document.querySelector('.network-poster')).opacity }));
    if (entry.glbFailure.live || entry.glbFailure.canvas) report.problems.push('1440: a GLB failure left the renderer live');
    await fc.close();
  }
  await context.close();
}
await browser.close();
report.status = report.problems.length ? 'failed' : 'passed';
fs.writeFileSync(path.join(here, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ status: report.status, problems: report.problems, errors: report.errors.slice(0, 8) }, null, 2));
process.exit(report.problems.length ? 1 : 0);
