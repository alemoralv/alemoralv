import * as THREE from 'three';
import { GLTFLoader } from './vendor/three/GLTFLoader.js';

/* A feed-forward network as a live object that travels the whole page.
   Blender authored the geometry (blender/neural-net/build.py); this file
   instances it and adds every motion: the scroll-driven construction in the
   authored birth order, a forward pass that travels the weights layer by
   layer, pointer springs, a cursor trail, drag rotation with inertia and an
   idle turn. Asset contract (blender/neural-net/CONTRACT.md): 320
   Node_<layer>_<index> spheres with extras layer / index / birth / src / w and
   one WeightProto unit cylinder (local +Y from 0 to 1). Weights are not
   objects in the GLB; they are rebuilt here from each neuron's src / w. */

const LAYERS = [8, 24, 40, 56, 64, 56, 40, 24, 8];
const FAN_IN = 12;
const MIN_NODES = 12;                // present at the top of the page: the input layer and four of the next, so weights exist from the start
const BIRTH_EVERY = 0.014;           // seconds between births when the scroll jumps
const DEATH_EVERY = 0.008;
const PULSE = { speed: 2.4, width: 0.075, idleEvery: 5, idleGain: 0.6 };
const ACCENT = '#285ec7';

export async function createNetwork(host, options) {
  const { onFailure, status, fireButton } = options;
  const calm = options.calm || (() => false); // reduced motion: nothing moves on its own, everything still answers the visitor
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  host.append(canvas);
  let scene, env, pmrem, nodesMesh, edgesMesh, disposed = false, active = false, raf = 0;
  const cleanup = [];

  function dispose() {
    if (disposed) return;
    disposed = true; active = false;
    cancelAnimationFrame(raf);
    cleanup.forEach(f => f());
    for (const m of [nodesMesh, edgesMesh]) { if (!m) continue; m.geometry.dispose(); m.material.dispose(); m.dispose(); }
    env?.dispose(); pmrem?.dispose();
    renderer.dispose(); renderer.forceContextLoss();
    canvas.remove();
    host.classList.remove('is-live');
  }

  try {
    const gl = renderer.getContext();
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const gpu = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : '';
    if (/swiftshader|llvmpipe|software/i.test(gpu)) throw Error('Software rendering');
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;

    scene = new THREE.Scene();
    const assembly = new THREE.Group();
    scene.add(assembly);
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 120);
    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, -1);

    // A paper-light studio for soft reflections on the ink spheres.
    const studio = new THREE.Scene();
    studio.background = new THREE.Color('#e9eee9');
    function panel(pos, w, h, strength, color = 0xffffff) {
      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(strength), side: THREE.DoubleSide });
      const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      p.position.fromArray(pos); p.lookAt(0, 0, 0); studio.add(p);
    }
    panel([-4, 6, 4], 6, 5, 3.2, 0xfff9ee); panel([5, 2, -3], 3, 6, 2.2); panel([0, -5, 5], 6, 1.5, 1.4, 0xdde8ff);
    pmrem = new THREE.PMREMGenerator(renderer);
    env = pmrem.fromScene(studio, 0.05, 0.1, 100, { size: 128 });
    scene.environment = env.texture;
    studio.traverse(o => { o.geometry?.dispose(); o.material?.dispose(); });
    scene.add(new THREE.HemisphereLight(0xffffff, 0xc4d1cc, 0.9));
    const key = new THREE.DirectionalLight(0xfff8ec, 2.0); key.position.set(-3, 5, 6); scene.add(key);
    const fill = new THREE.DirectionalLight(0xeaf2ff, 0.8); fill.position.set(4, 1, -3); scene.add(fill);

    const gltf = await new GLTFLoader().loadAsync('./assets/neural/neural-net.glb');
    gltf.scene.updateMatrixWorld(true);
    const nodeObjects = []; let proto = null;
    gltf.scene.traverse(o => {
      if (!o.isMesh) return;
      if (/^Node_/.test(o.name)) nodeObjects.push(o);
      else if (o.name === 'WeightProto') proto = o;
    });
    const nodeCount = LAYERS.reduce((a, b) => a + b, 0);
    if (nodeObjects.length !== nodeCount || !proto) throw Error('Incomplete network asset');
    const nodeGeometry = nodeObjects[0].geometry, edgeGeometry = proto.geometry;
    if (!nodeObjects.every(o => o.geometry === nodeGeometry)) throw Error('Neuron meshes are not shared');
    edgeGeometry.computeBoundingBox();
    const bb = edgeGeometry.boundingBox;
    if (Math.abs(bb.min.y) > 1e-3 || Math.abs(bb.max.y - 1) > 1e-3) throw Error('Weight mesh must run along +Y from 0 to 1');
    const edgeRadius = 1; // the prototype is exported at unit scale; |w| shapes the radius below

    // Neurons in the authored birth order; weights from each neuron's incoming table.
    const nodeAt = new Map();
    const nodes = nodeObjects.map(o => {
      const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
      o.matrixWorld.decompose(p, q, s);
      const { layer, index, birth } = o.userData;
      if (![layer, index, birth].every(Number.isFinite)) throw Error('Node extras missing');
      const n = { p, s, layer: Number(layer), index: Number(index), birth: Number(birth), id: 0, src: o.userData.src || [], w: o.userData.w || [] };
      if (n.src.length !== n.w.length || n.src.length > FAN_IN || (n.layer === 0) !== (n.src.length === 0)) throw Error('Weight extras malformed');
      nodeAt.set(n.layer + '_' + n.index, n);
      return n;
    });
    nodes.sort((a, b) => a.birth - b.birth);
    nodes.forEach((n, i) => { if (n.birth !== i) throw Error('Birth order is not a permutation'); n.id = i; });
    for (let i = 1; i < nodes.length; i++) if (nodes[i].layer < nodes[i - 1].layer) throw Error('Birth order must be layer-major');
    const edges = [];
    for (const b of nodes) b.src.forEach((si, k) => {
      const a = nodeAt.get((b.layer - 1) + '_' + si);
      const weight = Number(b.w[k]);
      if (!a || !Number.isFinite(weight)) throw Error('Weight source missing');
      edges.push({ a, b, layer: a.layer, weight, radius: edgeRadius * (0.55 + 0.9 * Math.abs(weight)) });
    });
    edges.sort((x, y) => x.b.id - y.b.id || x.a.id - y.a.id); // born with their destination
    const edgeCount = edges.length;
    const expectedEdges = LAYERS.slice(1).reduce((sum, n, l) => sum + n * Math.min(FAN_IN, LAYERS[l]), 0);
    if (edgeCount !== expectedEdges) throw Error('Weight count does not match the contract');

    const accent = new THREE.Color(ACCENT);
    const pulseUniforms = { pulse: { value: -5 }, gain: { value: 0 }, accent: { value: accent } };
    function patch(material, kind) {
      material.onBeforeCompile = shader => {
        shader.uniforms.uPulse = pulseUniforms.pulse;
        shader.uniforms.uGain = pulseUniforms.gain;
        shader.uniforms.uAccent = pulseUniforms.accent;
        shader.vertexShader = shader.vertexShader
          .replace('#include <common>', '#include <common>\nattribute float aLayer;\nattribute float aLevel;\nattribute float aHot;\nvarying float vLayer;\nvarying float vLevel;\nvarying float vHot;\nvarying float vAlong;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLayer=aLayer;\nvLevel=aLevel;\nvHot=aHot;\nvAlong=position.y;');
        shader.fragmentShader = shader.fragmentShader
          .replace('#include <common>', '#include <common>\nvarying float vLayer;\nvarying float vLevel;\nvarying float vHot;\nvarying float vAlong;\nuniform float uPulse;\nuniform float uGain;\nuniform vec3 uAccent;\nfloat networkGlow(){\n' + (kind === 'edge'
            ? `float t=uPulse-vLayer;float wave=exp(-pow((vAlong-t)/${PULSE.width.toFixed(3)},2.0));float trail=smoothstep(vAlong-0.03,vAlong+0.3,t)*0.3;return clamp((wave+trail)*vLevel*uGain+vHot,0.0,1.0);`
            : 'float d=uPulse-vLayer;float peak=exp(-pow(d/0.16,2.0));float lit=smoothstep(-0.14,0.14,d)*0.36;return clamp((peak+lit)*vLevel*uGain+vHot*0.9,0.0,1.0);') + '\n}')
          .replace('#include <color_fragment>', '#include <color_fragment>\nfloat glow=networkGlow();\ndiffuseColor.rgb=mix(diffuseColor.rgb,uAccent,glow);')
          .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\ntotalEmissiveRadiance+=uAccent*glow*${kind === 'edge' ? '0.85' : '0.5'};`);
      };
      material.customProgramCacheKey = () => 'network-' + kind + '-v2';
    }

    const nodeMaterial = new THREE.MeshStandardMaterial({ color: '#20363e', roughness: 0.4, metalness: 0.08, envMapIntensity: 0.9 });
    const edgeMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.65, metalness: 0, envMapIntensity: 0.5 });
    patch(nodeMaterial, 'node'); patch(edgeMaterial, 'edge');
    function dynamic(n, fillValue) { return new THREE.InstancedBufferAttribute(new Float32Array(n).fill(fillValue), 1).setUsage(THREE.DynamicDrawUsage); }
    nodeGeometry.setAttribute('aLayer', new THREE.InstancedBufferAttribute(Float32Array.from(nodes, n => n.layer), 1));
    const nodeLevel = dynamic(nodeCount, 0.6), nodeHot = dynamic(nodeCount, 0);
    nodeGeometry.setAttribute('aLevel', nodeLevel); nodeGeometry.setAttribute('aHot', nodeHot);
    edgeGeometry.setAttribute('aLayer', new THREE.InstancedBufferAttribute(Float32Array.from(edges, e => e.layer), 1));
    const edgeLevel = dynamic(edgeCount, 0.4), edgeHot = dynamic(edgeCount, 0);
    edgeGeometry.setAttribute('aLevel', edgeLevel); edgeGeometry.setAttribute('aHot', edgeHot);

    nodesMesh = new THREE.InstancedMesh(nodeGeometry, nodeMaterial, nodeCount);
    edgesMesh = new THREE.InstancedMesh(edgeGeometry, edgeMaterial, edgeCount);
    for (const m of [nodesMesh, edgesMesh]) { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; assembly.add(m); }
    // Weight strength shades each edge from faint to firm graphite; |w| already shapes its radius.
    const weak = new THREE.Color('#c3cfd4'), firm = new THREE.Color('#5a7080');
    edges.forEach((e, i) => edgesMesh.setColorAt(i, weak.clone().lerp(firm, Math.min(1, Math.abs(e.weight) * 1.15))));
    edgesMesh.instanceColor.needsUpdate = true;

    // Motion state. Offsets are local displacements from the authored rest pose.
    const offsets = new Float32Array(nodeCount * 3), velocities = new Float32Array(nodeCount * 3), targets = new Float32Array(nodeCount * 3);
    const grow = new Float32Array(nodeCount), hot = nodeHot.array, edgeHeat = edgeHot.array;
    const axes = nodes.map(n => new THREE.Vector3(hash(n.id + 3) - 0.5, hash(n.id + 5) - 0.5, hash(n.id + 7) - 0.5).normalize());
    let gesture = null, hover = false, last = 0, time = 0, frameCounter = 0, elapsed = 0, slow = 0, quality = 0;
    const ratios = [1.5, 1, 0.75]; // dropped one step at a time when the frame rate stays low; the object never gives way to the still for speed
    let pulse = { t: -5, gain: 0, target: 0, running: false, sinceIdle: 0, from: 0 };
    let passes = 0, lastOutputs = null;
    const rotation = new THREE.Vector2(0.34, -0.5), inertia = new THREE.Vector2(), restRotation = rotation.clone();
    let spin = 0; // accumulated idle turn, separate from the visitor's orientation
    const tilt = new THREE.Vector2(), tiltTarget = new THREE.Vector2();
    // Construction: how many neurons the scroll asks for, and how many exist.
    let progress = 0, wanted = MIN_NODES, born = 0, sinceBirth = 0, sinceDeath = 0, drawnNodes = 0, drawnEdges = 0;
    // Composition: the free rectangle of the host (px) the object must stay inside.
    let frame = { free: { x: 0, y: 0, w: 1, h: 1 }, w: 1, h: 1 };
    const view = { d: 24, x: 0, y: 0 }, viewTarget = { d: 24, x: 0, y: 0 };
    const pointer = new THREE.Vector2(5, 5), raycaster = new THREE.Raycaster(), localRay = new THREE.Ray(), inverse = new THREE.Matrix4();
    const closest = new THREE.Vector3(), point = new THREE.Vector3(), delta = new THREE.Vector3(), a = new THREE.Vector3(), b = new THREE.Vector3(), dir = new THREE.Vector3(), mid = new THREE.Vector3();
    const matrix = new THREE.Matrix4(), q = new THREE.Quaternion(), identity = new THREE.Quaternion(), scale = new THREE.Vector3(), yAxis = new THREE.Vector3(0, 1, 0), spun = new THREE.Vector3();
    const positions = nodes.map(() => new THREE.Vector3());
    const bounds = { left: 0, top: 0, right: 0, bottom: 0 };
    const diag = { active: false, calm: false, quality: 1.5, frames: 0, nodes: nodeCount, edges: edgeCount, born: 0, bornEdges: 0, wanted: MIN_NODES, drawCalls: 0, triangles: 0, maxDisplacement: 0, disturbed: 0, hotEdges: 0, hotNodes: 0, rotation: [0, 0], tilt: [0, 0], fps: 0, gpu, pulse: -5, pulseGain: 0, passes: 0, outputs: null, progress: 0, bounds: { ...bounds }, free: { ...frame.free }, view: { ...view } };
    Object.defineProperty(canvas, 'networkDiagnostics', { get: () => ({ ...diag, bounds: { ...bounds }, free: { ...frame.free }, view: { ...view } }) });
    // Verification probe: the id of the neuron under a host pixel, or -1.
    Object.defineProperty(canvas, 'networkProbe', { value: (x, y) => { pointer.set(x / frame.w * 2 - 1, 1 - y / frame.h * 2); const n = pick(); return n ? { id: n.id, layer: n.layer, index: n.index } : null; } });

    function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
    function listen(target, type, fn, opts) { target.addEventListener(type, fn, opts); cleanup.push(() => target.removeEventListener(type, fn, opts)); }
    function bornLayers() { return born ? nodes[born - 1].layer : -1; }

    // One forward pass through the neurons that exist: a random input, tanh
    // layers, weights exactly as authored. From a clicked neuron, that neuron
    // alone carries the signal and everything above it stays quiet.
    function forward(gainTarget, from) {
      const deepest = bornLayers();
      if (deepest < 0) return [];
      const startLayer = from ? from.layer : 0;
      const act = new Map();
      const levels = new Float32Array(nodeCount), signals = new Float32Array(edgeCount);
      for (let i = 0; i < born; i++) {
        const n = nodes[i];
        if (n.layer !== startLayer) continue;
        const v = from ? (n === from ? 1 : 0) : 0.15 + 0.85 * Math.random();
        act.set(n, v);
        levels[n.id] = from ? v : 0.35 + 0.65 * v;
      }
      for (let l = startLayer + 1; l <= deepest; l++) {
        const sums = new Map(), width = Math.sqrt(Math.min(FAN_IN, LAYERS[l - 1]));
        for (let i = 0; i < born; i++) { const n = nodes[i]; if (n.layer === l) sums.set(n, 0); }
        edges.forEach((e, k) => {
          if (e.layer !== l - 1 || !sums.has(e.b)) return;
          const s = (act.get(e.a) || 0) * e.weight;
          sums.set(e.b, sums.get(e.b) + s);
          signals[k] = Math.min(1, 0.22 + 1.3 * Math.abs(s));
        });
        for (const [n, sum] of sums) { const v = Math.tanh(sum * 1.7 / width); act.set(n, v); levels[n.id] = 0.3 + 0.7 * Math.abs(v); }
      }
      nodeLevel.array.set(levels); nodeLevel.needsUpdate = true;
      edgeLevel.array.set(signals); edgeLevel.needsUpdate = true;
      pulse = { t: startLayer - 0.3, gain: pulse.gain, target: gainTarget, running: true, sinceIdle: 0, from: startLayer };
      lastOutputs = nodes.filter(n => n.layer === deepest && n.id < born).map(n => ((act.get(n) || 0) + 1) / 2);
      passes++;
      diag.passes = passes; diag.outputs = lastOutputs;
      return lastOutputs;
    }
    function fire(fromVisitor, from) {
      if (!active) return;
      const out = forward(fromVisitor ? 1 : PULSE.idleGain, from);
      if (fromVisitor && status) status.textContent = 'Forward pass ' + passes + (from ? ' from neuron ' + (from.index + 1) + ' of layer ' + (from.layer + 1) : '') + '. Output activations ' + out.map(v => v.toFixed(2)).join(', ') + '.';
    }
    function reset() {
      if (!active) return;
      rotation.copy(restRotation); inertia.set(0, 0); spin = 0; hover = false;
    }
    function coordinates(e) { const r = host.getBoundingClientRect(); pointer.set((e.clientX - r.left) / r.width * 2 - 1, 1 - (e.clientY - r.top) / r.height * 2); }
    function updateRay() { assembly.updateMatrixWorld(true); raycaster.setFromCamera(pointer, camera); inverse.copy(assembly.matrixWorld).invert(); localRay.copy(raycaster.ray).applyMatrix4(inverse); }
    // The neuron under the pointer, if any: the nearest born sphere the ray passes close to.
    function pick() {
      updateRay();
      let best = null, bestAlong = Infinity;
      for (let i = 0; i < born; i++) {
        point.copy(positions[i]);
        localRay.closestPointToPoint(point, closest);
        const reach = Math.max(0.3, nodes[i].s.x * 2.4);
        if (closest.distanceTo(point) > reach) continue;
        const along = closest.distanceTo(localRay.origin);
        if (along < bestAlong) { bestAlong = along; best = nodes[i]; }
      }
      return best;
    }
    function down(e) {
      if (!active || e.button !== 0) return;
      coordinates(e);
      gesture = { id: e.pointerId, sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY, t: e.timeStamp, moved: false };
      inertia.set(0, 0);
      host.setPointerCapture(e.pointerId);
      e.preventDefault();
    }
    function move(e) {
      coordinates(e); hover = true;
      if (gesture && gesture.id === e.pointerId) {
        if (Math.hypot(e.clientX - gesture.sx, e.clientY - gesture.sy) > 6) gesture.moved = true;
        if (gesture.moved) {
          const dx = e.clientX - gesture.x, dy = e.clientY - gesture.y, dt = Math.max(0.008, (e.timeStamp - gesture.t) / 1000);
          rotation.x = THREE.MathUtils.clamp(rotation.x + dy * 0.005, -1.1, 1.1);
          rotation.y += dx * 0.005;
          inertia.set(THREE.MathUtils.clamp(dy * 0.005 / dt, -1.6, 1.6), THREE.MathUtils.clamp(dx * 0.005 / dt, -2.5, 2.5));
          host.classList.add('is-dragging');
        }
        gesture.x = e.clientX; gesture.y = e.clientY; gesture.t = e.timeStamp;
      }
    }
    function cancel() {
      const id = gesture?.id; gesture = null;
      if (id !== undefined && host.hasPointerCapture(id)) host.releasePointerCapture(id);
      inertia.set(0, 0); hover = false; host.classList.remove('is-dragging');
    }
    function up(e) {
      if (!gesture || gesture.id !== e.pointerId) return;
      const clicked = !gesture.moved; gesture = null;
      if (host.hasPointerCapture(e.pointerId)) host.releasePointerCapture(e.pointerId);
      host.classList.remove('is-dragging');
      if (clicked) { coordinates(e); fire(true, pick()); }
    }
    listen(host, 'pointerdown', down);
    listen(host, 'pointermove', move, { passive: true });
    listen(host, 'pointerup', up);
    listen(host, 'pointercancel', cancel);
    listen(host, 'lostpointercapture', () => { if (gesture) cancel(); });
    listen(host, 'pointerleave', () => { if (!gesture) hover = false; });
    listen(host, 'pointerup', e => { if (e.pointerType === 'touch') hover = false; });
    // Keyboard reach on the object itself: arrows turn it, Enter or Space fires a pass.
    listen(host, 'keydown', e => {
      if (!active) return;
      const step = 0.18;
      if (e.key === 'ArrowLeft') rotation.y -= step; else if (e.key === 'ArrowRight') rotation.y += step;
      else if (e.key === 'ArrowUp') rotation.x = THREE.MathUtils.clamp(rotation.x - step, -1.1, 1.1); else if (e.key === 'ArrowDown') rotation.x = THREE.MathUtils.clamp(rotation.x + step, -1.1, 1.1);
      else if (e.key === 'Enter' || e.key === ' ') fire(true); else return;
      e.preventDefault();
    });
    if (fireButton) listen(fireButton, 'click', () => fire(true));
    cleanup.push(cancel);

    function resize() {
      const w = Math.max(1, frame.w), h = Math.max(1, frame.h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      if (!active) renderer.render(scene, camera);
    }
    function setFrame(next) {
      if (disposed) return;
      const resized = next.w !== frame.w || next.h !== frame.h;
      frame = next;
      if (resized) resize();
    }
    function setProgress(p) {
      if (disposed) return;
      progress = THREE.MathUtils.clamp(p, 0, 1);
      wanted = Math.round(MIN_NODES + (nodeCount - MIN_NODES) * progress);
      diag.progress = progress; diag.wanted = wanted;
    }

    // Keep the object inside the free rectangle: measure the born neurons in
    // view space and choose a distance and offset that frame them, eased in
    // time. The host clip is the hard guarantee; this is the composition.
    function compose(dt) {
      const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2), tanH = tanV * camera.aspect;
      const fw = frame.free.w / frame.w, fh = frame.free.h / frame.h;   // free half-extents in NDC units
      const cx = (frame.free.x + frame.free.w / 2) / frame.w * 2 - 1, cy = 1 - (frame.free.y + frame.free.h / 2) / frame.h * 2;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, maxZ = -Infinity, radius = 0;
      const count = Math.max(1, drawnNodes);
      for (let i = 0; i < count; i++) {
        spun.copy(positions[i]).applyQuaternion(assembly.quaternion);
        const r = nodes[i].s.x * 1.5;
        minX = Math.min(minX, spun.x - r); maxX = Math.max(maxX, spun.x + r);
        minY = Math.min(minY, spun.y - r); maxY = Math.max(maxY, spun.y + r);
        maxZ = Math.max(maxZ, spun.z + r); radius = Math.max(radius, r);
      }
      const halfW = (maxX - minX) / 2 + 0.1, halfH = (maxY - minY) / 2 + 0.1;
      const margin = 0.92; // use 92 percent of the free rectangle
      const dX = maxZ + halfW / (tanH * fw * margin), dY = maxZ + halfH / (tanV * fh * margin);
      viewTarget.d = Math.max(6, dX, dY);
      viewTarget.x = cx * tanH * viewTarget.d - (minX + maxX) / 2;
      viewTarget.y = cy * tanV * viewTarget.d - (minY + maxY) / 2;
      // Shrinking to fit is quick; growing into new room is gentle.
      const rate = calm() ? 20 : viewTarget.d > view.d ? 12 : 4;
      const k = 1 - Math.exp(-dt * rate);
      view.d += (viewTarget.d - view.d) * k; view.x += (viewTarget.x - view.x) * k; view.y += (viewTarget.y - view.y) * k;
      assembly.position.set(view.x, view.y + (calm() ? 0 : Math.sin(time * 0.6) * 0.03), -view.d);
      // Projected bounds of what is drawn, in host pixels, for the page and the verification.
      let l = Infinity, t = Infinity, r = -Infinity, bt = -Infinity;
      for (let i = 0; i < count; i++) {
        spun.copy(positions[i]).applyQuaternion(assembly.quaternion);
        const depth = view.d - spun.z, px = (spun.x + view.x) / (depth * tanH), py = (spun.y + assembly.position.y) / (depth * tanV);
        const rp = nodes[i].s.x * 1.3 / (depth * tanH) * frame.w / 2;
        const sx = (px + 1) / 2 * frame.w, sy = (1 - py) / 2 * frame.h;
        l = Math.min(l, sx - rp); r = Math.max(r, sx + rp); t = Math.min(t, sy - rp); bt = Math.max(bt, sy + rp);
      }
      bounds.left = l; bounds.top = t; bounds.right = r; bounds.bottom = bt;
    }

    function tick(now) {
      if (!active || disposed) return;
      if (now - last < 1000 / 60 - 0.5) { raf = requestAnimationFrame(tick); return; }
      const wall = (now - last) / 1000, dt = Math.min(wall || 1 / 60, 0.05);
      last = now; time += dt;

      // Construction follows the scroll: births in the authored order, deaths in reverse.
      sinceBirth += dt; sinceDeath += dt;
      const quiet = calm();
      if (quiet) { born = wanted; }
      while (born < wanted && sinceBirth >= BIRTH_EVERY) { born++; sinceBirth -= BIRTH_EVERY; }
      if (born >= wanted) sinceBirth = Math.min(sinceBirth, BIRTH_EVERY);
      while (born > wanted && sinceDeath >= DEATH_EVERY) { born--; sinceDeath -= DEATH_EVERY; }
      if (born <= wanted) sinceDeath = Math.min(sinceDeath, DEATH_EVERY);
      drawnNodes = 0;
      for (let i = 0; i < nodeCount; i++) {
        const target = i < born ? 1 : 0;
        grow[i] += (target - grow[i]) * (1 - Math.exp(-dt * (target ? 7 : 11)));
        if (grow[i] > 0.002) drawnNodes = i + 1; else grow[i] = 0;
      }

      if (!gesture) {
        rotation.addScaledVector(inertia, dt); inertia.multiplyScalar(Math.exp(-dt * 5));
        rotation.x = THREE.MathUtils.clamp(rotation.x, -1.1, 1.1);
        if (!quiet) spin += dt * 0.16;
      }
      // The whole object leans a little toward the cursor and settles back when it leaves.
      if (hover && !gesture) tiltTarget.set(-pointer.y * 0.09, pointer.x * 0.13); else tiltTarget.set(0, 0);
      tilt.lerp(tiltTarget, 1 - Math.exp(-dt * 4));
      const sway = quiet ? 0 : 1;
      assembly.rotation.set(rotation.x + tilt.x + Math.sin(time * 0.31) * 0.02 * sway, rotation.y + spin + tilt.y + progress * 2.2, Math.sin(time * 0.19) * 0.015 * sway);

      // Signal timing: rise quickly, travel, then fade after the deepest layer that exists.
      const end = bornLayers() + 0.35;
      if (pulse.running) {
        pulse.t += dt * PULSE.speed;
        const want = pulse.t > end ? 0 : pulse.target;
        pulse.gain += (want - pulse.gain) * (1 - Math.exp(-dt * (pulse.t > end ? 2.2 : 9)));
        if (pulse.t > end && pulse.gain < 0.01) { pulse.running = false; pulse.gain = 0; }
      } else {
        pulse.sinceIdle += dt;
        if (pulse.sinceIdle > PULSE.idleEvery && !gesture && !hover && !quiet) fire(false);
      }
      pulseUniforms.pulse.value = pulse.t; pulseUniforms.gain.value = pulse.gain;

      updateRay();
      let touched = 0;
      const pointing = hover && !gesture;
      for (let i = 0; i < drawnNodes; i++) {
        const k = i * 3, n = nodes[i];
        let push = 0, pull = 0;
        if (pointing) {
          point.copy(n.p); point.x += offsets[k]; point.y += offsets[k + 1]; point.z += offsets[k + 2];
          localRay.closestPointToPoint(point, closest);
          delta.copy(point).sub(closest);
          const d = delta.length();
          // Near the ray a neuron is nudged away; from further out it leans toward the cursor.
          push = Math.max(0, 1 - d / 0.6); push *= push;
          pull = d > 0.6 ? Math.max(0, 1 - (d - 0.6) / 2.2) : 0; pull *= pull;
          if (push > 0.01) touched++;
          if (d > 0.001) delta.multiplyScalar(1 / d); else delta.copy(axes[i]);
          // The cursor leaves a trail: a neuron it passes stays lit and fades.
          const heat = Math.max(0, 1 - d / 0.42);
          if (heat > hot[i]) hot[i] = heat * heat;
        }
        hot[i] *= Math.exp(-dt / 0.55);
        if (hot[i] < 0.003) hot[i] = 0;
        const amount = push * 0.36 - pull * 0.18;
        targets[k] = (delta.x * amount + axes[i].x * 0.05 * push);
        targets[k + 1] = (delta.y * amount + axes[i].y * 0.05 * push);
        targets[k + 2] = (delta.z * amount + axes[i].z * 0.05 * push);
      }
      for (let t = 0; t < dt; t += 1 / 120) {
        const h = Math.min(1 / 120, dt - t);
        for (let k = 0; k < drawnNodes * 3; k++) { velocities[k] += (60 * (targets[k] - offsets[k]) - 11 * velocities[k]) * h; offsets[k] += velocities[k] * h; }
      }
      let maximum = 0, hotNodes = 0;
      for (let i = 0; i < drawnNodes; i++) {
        if (hot[i] > 0.01) hotNodes++;
        const k = i * 3, n = nodes[i], distance = Math.hypot(offsets[k], offsets[k + 1], offsets[k + 2]);
        maximum = Math.max(maximum, distance);
        positions[i].copy(n.p); positions[i].x += offsets[k]; positions[i].y += offsets[k + 1]; positions[i].z += offsets[k + 2];
        const g = grow[i], pop = g * (1 + 0.35 * Math.sin(Math.PI * g));
        scale.copy(n.s).multiplyScalar(pop);
        matrix.compose(positions[i], identity, scale);
        nodesMesh.setMatrixAt(i, matrix);
      }
      drawnEdges = 0; let hotEdges = 0;
      for (let i = 0; i < edgeCount; i++) {
        const e = edges[i];
        if (e.b.id >= drawnNodes) break;
        drawnEdges = i + 1;
        a.copy(positions[e.a.id]); b.copy(positions[e.b.id]);
        dir.copy(b).sub(a); const len = dir.length(); dir.multiplyScalar(1 / len);
        const g = grow[e.b.id];
        if (pointing) {
          mid.copy(a).addScaledVector(dir, len * 0.5);
          localRay.closestPointToPoint(mid, closest);
          const d = closest.distanceTo(mid), heat = Math.max(0, 1 - d / 0.8);
          if (heat > edgeHeat[i]) edgeHeat[i] = heat * heat;
        }
        edgeHeat[i] *= Math.exp(-dt / 0.35);
        if (edgeHeat[i] < 0.003) edgeHeat[i] = 0; else hotEdges++;
        q.setFromUnitVectors(yAxis, dir); scale.set(e.radius * Math.min(1, g * 1.5), len * g, e.radius * Math.min(1, g * 1.5));
        matrix.compose(a, q, scale);
        edgesMesh.setMatrixAt(i, matrix);
      }
      nodesMesh.count = drawnNodes; edgesMesh.count = drawnEdges;
      nodesMesh.instanceMatrix.needsUpdate = true; edgesMesh.instanceMatrix.needsUpdate = true;
      nodeHot.needsUpdate = true; edgeHot.needsUpdate = true;
      compose(dt);
      renderer.render(scene, camera);
      frameCounter++; elapsed += wall;
      if (frameCounter >= 60) {
        diag.fps = frameCounter / elapsed; slow = diag.fps < 30 ? slow + elapsed : 0;
        if (slow > 4 && quality < ratios.length - 1) { quality++; renderer.setPixelRatio(Math.min(devicePixelRatio, ratios[quality])); resize(); slow = 0; diag.quality = ratios[quality]; }
        frameCounter = 0; elapsed = 0;
      }
      Object.assign(diag, { active, calm: quiet, frames: diag.frames + 1, born, bornEdges: drawnEdges, drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles, maxDisplacement: maximum, disturbed: touched, hotEdges, hotNodes, rotation: [rotation.x, rotation.y + spin], tilt: [tilt.x, tilt.y], pulse: pulse.t, pulseGain: pulse.gain });
      raf = requestAnimationFrame(tick);
    }
    function setActive(value) {
      if (disposed) return;
      if (value === active) return;
      active = value; diag.active = value;
      if (fireButton) fireButton.disabled = !active;
      if (value) { last = performance.now(); raf = requestAnimationFrame(tick); }
      else { cancel(); cancelAnimationFrame(raf); }
    }
    listen(canvas, 'webglcontextlost', e => { e.preventDefault(); setActive(false); onFailure(Error('WebGL context lost')); });
    await renderer.compileAsync(scene, camera);
    // First frame at rest: the rest matrices in place, nothing born yet, then the tick builds.
    for (let i = 0; i < nodeCount; i++) { positions[i].copy(nodes[i].p); matrix.compose(nodes[i].p, identity, scale.set(0, 0, 0)); nodesMesh.setMatrixAt(i, matrix); }
    edges.forEach((e, i) => { matrix.compose(e.a.p, identity, scale.set(0, 0, 0)); edgesMesh.setMatrixAt(i, matrix); });
    nodesMesh.count = 0; edgesMesh.count = 0;
    nodesMesh.instanceMatrix.needsUpdate = true; edgesMesh.instanceMatrix.needsUpdate = true;
    assembly.rotation.set(rotation.x, rotation.y, 0);
    assembly.position.set(0, 0, -view.d);
    renderer.render(scene, camera);
    if (!renderer.info.programs.every(p => p.diagnostics?.runnable !== false)) throw Error('Shader compilation failed');
    pulse.sinceIdle = PULSE.idleEvery - 2.5; // first soft pass shortly after the object appears
    return { setActive, setFrame, setProgress, fire: () => fire(true), reset, dispose };
  } catch (e) {
    dispose();
    throw e;
  }
}
