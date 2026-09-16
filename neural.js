import * as THREE from 'three';
import { GLTFLoader } from './vendor/three/GLTFLoader.js';

/* A feed-forward network as a live object.
   Blender authored the geometry (blender/neural-net/build.py); this file
   instances it and adds the motion: a forward pass that travels the weights
   layer by layer, hover springs, drag rotation with inertia, and an idle turn.
   Asset contract: 31 Node_<layer>_<i> spheres, 182 Edge_<layer>_<i>_<j> unit
   cylinders (local +Y from 0 to 1), extras carry layer / index / weight. */

const LAYERS = [4, 7, 9, 7, 4];
const PULSE = { speed: 1.9, width: 0.075, idleEvery: 8.5, idleGain: 0.55 };
const ACCENT = '#285ec7';

export async function createNetwork(host, options) {
  const { onFailure, hint, status, fireButton, resetButton } = options;
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  host.append(canvas);
  let scene, env, pmrem, nodesMesh, edgesMesh, disposed = false, active = false, raf = 0, observer;
  const cleanup = [];

  function dispose() {
    if (disposed) return;
    disposed = true; active = false;
    cancelAnimationFrame(raf);
    observer?.disconnect();
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
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
    camera.position.set(0, 0, 14);
    camera.lookAt(0, 0, 0);

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
    const nodeObjects = [], edgeObjects = [];
    gltf.scene.traverse(o => {
      if (!o.isMesh) return;
      if (/^Node_/.test(o.name)) nodeObjects.push(o);
      else if (/^Edge_/.test(o.name)) edgeObjects.push(o);
    });
    const nodeCount = LAYERS.reduce((a, b) => a + b, 0);
    let edgeCount = 0;
    for (let l = 0; l < LAYERS.length - 1; l++) edgeCount += LAYERS[l] * LAYERS[l + 1];
    if (nodeObjects.length !== nodeCount || edgeObjects.length !== edgeCount) throw Error('Incomplete network asset');
    const nodeGeometry = nodeObjects[0].geometry, edgeGeometry = edgeObjects[0].geometry;
    if (!nodeObjects.every(o => o.geometry === nodeGeometry) || !edgeObjects.every(o => o.geometry === edgeGeometry)) throw Error('Network meshes are not shared');
    edgeGeometry.computeBoundingBox();
    const bb = edgeGeometry.boundingBox;
    if (Math.abs(bb.min.y) > 1e-3 || Math.abs(bb.max.y - 1) > 1e-3) throw Error('Edge mesh must run along +Y from 0 to 1');

    // Index nodes by layer/index and edges by their endpoints from the authored extras.
    const nodeAt = new Map();
    const nodes = nodeObjects.map(o => {
      const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
      o.matrixWorld.decompose(p, q, s);
      const layer = Number(o.userData.layer), index = Number(o.userData.index);
      if (!Number.isFinite(layer) || !Number.isFinite(index)) throw Error('Node extras missing');
      const n = { p, s, layer, index, id: 0 };
      nodeAt.set(layer + '_' + index, n);
      return n;
    });
    nodes.sort((a, b) => a.layer - b.layer || a.index - b.index);
    nodes.forEach((n, i) => { n.id = i; });
    const edges = edgeObjects.map(o => {
      const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
      o.matrixWorld.decompose(p, q, s);
      const layer = Number(o.userData.layer), src = Number(o.userData.src), dst = Number(o.userData.dst), weight = Number(o.userData.weight);
      const a = nodeAt.get(layer + '_' + src), b = nodeAt.get((layer + 1) + '_' + dst);
      if (!a || !b || !Number.isFinite(weight)) throw Error('Edge extras missing');
      return { a, b, layer, weight, radius: s.x };
    });

    const accent = new THREE.Color(ACCENT);
    const pulseUniforms = { pulse: { value: -5 }, gain: { value: 0 }, accent: { value: accent } };
    function patch(material, kind) {
      material.onBeforeCompile = shader => {
        shader.uniforms.uPulse = pulseUniforms.pulse;
        shader.uniforms.uGain = pulseUniforms.gain;
        shader.uniforms.uAccent = pulseUniforms.accent;
        shader.vertexShader = shader.vertexShader
          .replace('#include <common>', '#include <common>\nattribute float aLayer;\nattribute float aLevel;\nvarying float vLayer;\nvarying float vLevel;\nvarying float vAlong;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLayer=aLayer;\nvLevel=aLevel;\nvAlong=position.y;');
        shader.fragmentShader = shader.fragmentShader
          .replace('#include <common>', '#include <common>\nvarying float vLayer;\nvarying float vLevel;\nvarying float vAlong;\nuniform float uPulse;\nuniform float uGain;\nuniform vec3 uAccent;\nfloat networkGlow(){\n' + (kind === 'edge'
            ? `float t=uPulse-vLayer;float wave=exp(-pow((vAlong-t)/${PULSE.width.toFixed(3)},2.0));float trail=smoothstep(vAlong-0.03,vAlong+0.3,t)*0.3;return clamp((wave+trail)*vLevel*uGain,0.0,1.0);`
            : 'float d=uPulse-vLayer;float peak=exp(-pow(d/0.16,2.0));float lit=smoothstep(-0.14,0.14,d)*0.36;return clamp((peak+lit)*vLevel*uGain,0.0,1.0);') + '\n}')
          .replace('#include <color_fragment>', '#include <color_fragment>\nfloat glow=networkGlow();\ndiffuseColor.rgb=mix(diffuseColor.rgb,uAccent,glow);')
          .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\ntotalEmissiveRadiance+=uAccent*glow*${kind === 'edge' ? '0.85' : '0.5'};`);
      };
      material.customProgramCacheKey = () => 'network-' + kind + '-v1';
    }

    const nodeMaterial = new THREE.MeshStandardMaterial({ color: '#20363e', roughness: 0.4, metalness: 0.08, envMapIntensity: 0.9 });
    const edgeMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.65, metalness: 0, envMapIntensity: 0.5 });
    patch(nodeMaterial, 'node'); patch(edgeMaterial, 'edge');
    nodeGeometry.setAttribute('aLayer', new THREE.InstancedBufferAttribute(Float32Array.from(nodes, n => n.layer), 1));
    const nodeLevel = new THREE.InstancedBufferAttribute(new Float32Array(nodeCount).fill(0.6), 1).setUsage(THREE.DynamicDrawUsage);
    nodeGeometry.setAttribute('aLevel', nodeLevel);
    edgeGeometry.setAttribute('aLayer', new THREE.InstancedBufferAttribute(Float32Array.from(edges, e => e.layer), 1));
    const edgeLevel = new THREE.InstancedBufferAttribute(new Float32Array(edgeCount).fill(0.4), 1).setUsage(THREE.DynamicDrawUsage);
    edgeGeometry.setAttribute('aLevel', edgeLevel);

    nodesMesh = new THREE.InstancedMesh(nodeGeometry, nodeMaterial, nodeCount);
    edgesMesh = new THREE.InstancedMesh(edgeGeometry, edgeMaterial, edgeCount);
    for (const m of [nodesMesh, edgesMesh]) { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; assembly.add(m); }
    // Weight strength shades each edge from faint to firm graphite; the geometry already scales its radius.
    const weak = new THREE.Color('#c3cfd4'), firm = new THREE.Color('#5a7080');
    edges.forEach((e, i) => edgesMesh.setColorAt(i, weak.clone().lerp(firm, Math.min(1, Math.abs(e.weight) * 1.15))));
    edgesMesh.instanceColor.needsUpdate = true;

    // Motion state. Offsets are local displacements from the authored rest pose.
    const offsets = new Float32Array(nodeCount * 3), velocities = new Float32Array(nodeCount * 3), targets = new Float32Array(nodeCount * 3);
    const axes = nodes.map(n => new THREE.Vector3(hash(n.id + 3) - 0.5, hash(n.id + 5) - 0.5, hash(n.id + 7) - 0.5).normalize());
    let gesture = null, hover = false, last = 0, time = 0, frameCounter = 0, elapsed = 0, slow = 0, quality = 1.5;
    let pulse = { t: -5, gain: 0, target: 0, running: false, sinceIdle: 0 };
    let passes = 0, lastOutputs = null;
    const rotation = new THREE.Vector2(0.28, -0.55), inertia = new THREE.Vector2(), restRotation = rotation.clone();
    let spin = 0; // accumulated idle turn, separate from the visitor's orientation
    const pointer = new THREE.Vector2(5, 5), raycaster = new THREE.Raycaster(), localRay = new THREE.Ray(), inverse = new THREE.Matrix4();
    const closest = new THREE.Vector3(), point = new THREE.Vector3(), delta = new THREE.Vector3(), a = new THREE.Vector3(), b = new THREE.Vector3(), dir = new THREE.Vector3();
    const matrix = new THREE.Matrix4(), q = new THREE.Quaternion(), identity = new THREE.Quaternion(), scale = new THREE.Vector3(), yAxis = new THREE.Vector3(0, 1, 0);
    const positions = nodes.map(() => new THREE.Vector3());
    const diag = { active: false, frames: 0, nodes: nodeCount, edges: edgeCount, drawCalls: 0, triangles: 0, maxDisplacement: 0, disturbed: 0, rotation: [0, 0], fps: 0, gpu, pulse: -5, pulseGain: 0, passes: 0, outputs: null };
    Object.defineProperty(canvas, 'networkDiagnostics', { get: () => ({ ...diag }) });

    function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
    function listen(target, type, fn, opts) { target.addEventListener(type, fn, opts); cleanup.push(() => target.removeEventListener(type, fn, opts)); }

    // One forward pass: a random input, tanh layers, weights exactly as authored.
    function forward(gainTarget) {
      let act = Array.from({ length: LAYERS[0] }, () => 0.15 + 0.85 * Math.random());
      const levels = new Float32Array(nodeCount), signals = new Float32Array(edgeCount);
      act.forEach((v, i) => { levels[nodeAt.get('0_' + i).id] = 0.35 + 0.65 * v; });
      for (let l = 0; l < LAYERS.length - 1; l++) {
        const next = new Array(LAYERS[l + 1]).fill(0);
        edges.forEach((e, k) => {
          if (e.layer !== l) return;
          const s = act[e.a.index] * e.weight;
          next[e.b.index] += s;
          signals[k] = Math.min(1, 0.22 + 1.3 * Math.abs(s));
        });
        act = next.map(v => Math.tanh(v * 1.7 / Math.sqrt(LAYERS[l])));
        act.forEach((v, j) => { levels[nodeAt.get((l + 1) + '_' + j).id] = 0.3 + 0.7 * Math.abs(v); });
      }
      nodeLevel.array.set(levels); nodeLevel.needsUpdate = true;
      edgeLevel.array.set(signals); edgeLevel.needsUpdate = true;
      pulse = { t: -0.3, gain: pulse.gain, target: gainTarget, running: true, sinceIdle: 0 };
      lastOutputs = act.map(v => (v + 1) / 2);
      passes++;
      diag.passes = passes; diag.outputs = lastOutputs;
      return lastOutputs;
    }
    function fire(fromVisitor) {
      if (!active) return;
      const out = forward(fromVisitor ? 1 : PULSE.idleGain);
      if (fromVisitor && status) status.textContent = 'Forward pass ' + passes + '. Output activations ' + out.map(v => v.toFixed(2)).join(', ') + '.';
    }
    function reset() {
      if (!active) return;
      rotation.copy(restRotation); inertia.set(0, 0); spin = 0; hover = false;
      if (status) status.textContent = 'View reset.';
    }
    function coordinates(e) { const r = host.getBoundingClientRect(); pointer.set((e.clientX - r.left) / r.width * 2 - 1, 1 - (e.clientY - r.top) / r.height * 2); }
    function updateRay() { assembly.updateMatrixWorld(true); raycaster.setFromCamera(pointer, camera); inverse.copy(assembly.matrixWorld).invert(); localRay.copy(raycaster.ray).applyMatrix4(inverse); }
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
      if (clicked) fire(true);
    }
    listen(host, 'pointerdown', down);
    listen(host, 'pointermove', move, { passive: true });
    listen(host, 'pointerup', up);
    listen(host, 'pointercancel', cancel);
    listen(host, 'lostpointercapture', () => { if (gesture) cancel(); });
    listen(host, 'pointerleave', () => { if (!gesture) hover = false; });
    if (fireButton) listen(fireButton, 'click', () => fire(true));
    if (resetButton) listen(resetButton, 'click', reset);
    cleanup.push(cancel);

    function resize() {
      const r = host.getBoundingClientRect(), aspect = Math.max(0.2, r.width / Math.max(1, r.height));
      camera.aspect = aspect;
      const vfov = THREE.MathUtils.degToRad(camera.fov), hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
      // Fit the object's rest extents (half-width 3.3, half-height 2.3) whatever the stage shape.
      camera.position.z = Math.max(3.35 / Math.tan(hfov / 2), 2.35 / Math.tan(vfov / 2)) * 1.04;
      camera.updateProjectionMatrix();
      renderer.setSize(r.width, r.height, false);
      if (!active) renderer.render(scene, camera);
    }
    observer = new ResizeObserver(resize); observer.observe(host); resize();

    function tick(now) {
      if (!active || disposed) return;
      if (now - last < 1000 / 60 - 0.5) { raf = requestAnimationFrame(tick); return; }
      const wall = (now - last) / 1000, dt = Math.min(wall || 1 / 60, 0.05);
      last = now; time += dt;

      if (!gesture) {
        rotation.addScaledVector(inertia, dt); inertia.multiplyScalar(Math.exp(-dt * 5));
        rotation.x = THREE.MathUtils.clamp(rotation.x, -1.1, 1.1);
        spin += dt * 0.07;
      }
      assembly.rotation.set(rotation.x + Math.sin(time * 0.31) * 0.02, rotation.y + spin, Math.sin(time * 0.19) * 0.015);
      assembly.position.y = Math.sin(time * 0.6) * 0.03;

      // Signal timing: rise quickly, travel, then fade after the output layer.
      const end = LAYERS.length - 1 + 0.35;
      if (pulse.running) {
        pulse.t += dt * PULSE.speed;
        const want = pulse.t > end ? 0 : pulse.target;
        pulse.gain += (want - pulse.gain) * (1 - Math.exp(-dt * (pulse.t > end ? 2.2 : 9)));
        if (pulse.t > end && pulse.gain < 0.01) { pulse.running = false; pulse.gain = 0; }
      } else {
        pulse.sinceIdle += dt;
        if (pulse.sinceIdle > PULSE.idleEvery && !gesture && !hover) fire(false);
      }
      pulseUniforms.pulse.value = pulse.t; pulseUniforms.gain.value = pulse.gain;

      updateRay();
      let touched = 0;
      for (let i = 0; i < nodeCount; i++) {
        const k = i * 3, n = nodes[i];
        let influence = 0;
        if (hover && !gesture) {
          point.copy(n.p); point.x += offsets[k]; point.y += offsets[k + 1]; point.z += offsets[k + 2];
          localRay.closestPointToPoint(point, closest);
          delta.copy(point).sub(closest);
          const d = delta.length();
          influence = Math.max(0, 1 - d / 0.62); influence *= influence;
          if (influence > 0.01) touched++;
          if (d > 0.001) delta.multiplyScalar(1 / d); else delta.copy(axes[i]);
        }
        targets[k] = (delta.x * 0.3 + axes[i].x * 0.05) * influence;
        targets[k + 1] = (delta.y * 0.3 + axes[i].y * 0.05) * influence;
        targets[k + 2] = (delta.z * 0.3 + axes[i].z * 0.05) * influence;
      }
      for (let t = 0; t < dt; t += 1 / 120) {
        const h = Math.min(1 / 120, dt - t);
        for (let k = 0; k < offsets.length; k++) { velocities[k] += (60 * (targets[k] - offsets[k]) - 11 * velocities[k]) * h; offsets[k] += velocities[k] * h; }
      }
      let maximum = 0;
      for (let i = 0; i < nodeCount; i++) {
        const k = i * 3, n = nodes[i], distance = Math.hypot(offsets[k], offsets[k + 1], offsets[k + 2]);
        maximum = Math.max(maximum, distance);
        positions[i].copy(n.p); positions[i].x += offsets[k]; positions[i].y += offsets[k + 1]; positions[i].z += offsets[k + 2];
        matrix.compose(positions[i], identity, n.s);
        nodesMesh.setMatrixAt(i, matrix);
      }
      for (let i = 0; i < edgeCount; i++) {
        const e = edges[i];
        a.copy(positions[e.a.id]); b.copy(positions[e.b.id]);
        dir.copy(b).sub(a); const len = dir.length(); dir.multiplyScalar(1 / len);
        q.setFromUnitVectors(yAxis, dir); scale.set(e.radius, len, e.radius);
        matrix.compose(a, q, scale);
        edgesMesh.setMatrixAt(i, matrix);
      }
      nodesMesh.instanceMatrix.needsUpdate = true; edgesMesh.instanceMatrix.needsUpdate = true;
      renderer.render(scene, camera);
      frameCounter++; elapsed += wall;
      if (frameCounter >= 60) {
        diag.fps = frameCounter / elapsed; slow = diag.fps < 30 ? slow + elapsed : 0;
        if (slow > 4 && quality > 1) { quality = 1; renderer.setPixelRatio(Math.min(devicePixelRatio, 1)); resize(); slow = 0; }
        else if (slow > 6) { setActive(false); onFailure(Error('Sustained low frame rate')); return; }
        frameCounter = 0; elapsed = 0;
      }
      Object.assign(diag, { active, frames: diag.frames + 1, drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles, maxDisplacement: maximum, disturbed: touched, rotation: [rotation.x, rotation.y + spin], pulse: pulse.t, pulseGain: pulse.gain });
      raf = requestAnimationFrame(tick);
    }
    function setActive(value) {
      if (disposed) return;
      if (value === active) return;
      active = value; diag.active = value;
      if (fireButton) fireButton.disabled = !active;
      if (resetButton) resetButton.disabled = !active;
      if (value) { last = performance.now(); raf = requestAnimationFrame(tick); }
      else { cancel(); cancelAnimationFrame(raf); }
    }
    listen(canvas, 'webglcontextlost', e => { e.preventDefault(); setActive(false); onFailure(Error('WebGL context lost')); });
    await renderer.compileAsync(scene, camera);
    // First frame at rest with the matrices in place, then the idle pass starts on activation.
    for (let i = 0; i < nodeCount; i++) { matrix.compose(nodes[i].p, identity, nodes[i].s); nodesMesh.setMatrixAt(i, matrix); }
    edges.forEach((e, i) => { dir.copy(e.b.p).sub(e.a.p); const len = dir.length(); dir.multiplyScalar(1 / len); q.setFromUnitVectors(yAxis, dir); scale.set(e.radius, len, e.radius); matrix.compose(e.a.p, q, scale); edgesMesh.setMatrixAt(i, matrix); });
    nodesMesh.instanceMatrix.needsUpdate = true; edgesMesh.instanceMatrix.needsUpdate = true;
    assembly.rotation.set(rotation.x, rotation.y, 0);
    renderer.render(scene, camera);
    if (!renderer.info.programs.every(p => p.diagnostics?.runnable !== false)) throw Error('Shader compilation failed');
    pulse.sinceIdle = PULSE.idleEvery - 1.2; // first soft pass shortly after the object appears
    if (hint) hint.textContent = 'Click to fire a forward pass · Drag to rotate · Hover to nudge a neuron';
    return { setActive, fire: () => fire(true), reset, dispose };
  } catch (e) {
    dispose();
    throw e;
  }
}
