# A Forward Pass: asset contract

The homepage section `#network` shows a feed-forward neural network as an object. Built with the blender-to-web workflow (https://github.com/cth9191/blender-to-web): deterministic Blender Python is the source, a GLB is the handoff, and every motion is browser code.

## Files

| File | Role |
| --- | --- |
| `build.py` | Deterministic builder. `blender --background --python blender/neural-net/build.py` (add `-- --graybox` for the proportion study). Writes the GLB, `.blend`, `hero.png` and `authored-metrics.json` beside itself. |
| `validate.py` | Fresh import of the GLB: counts, shared meshes, extras, edge axis, endpoint error, six fixed views (`import-*.png`) and `import-validation.json`. |
| `neural-net.blend` | Editable scene with the poster camera and paper-light studio. |
| `neural-net.glb` | Runtime export, copied to `assets/neural/neural-net.glb` (76 KB). |
| `hero.png` | Cycles still, converted to `assets/neural/poster.webp` and `poster-small.webp`: the accessible image and the fallback for touch, reduced motion, data saving and WebGL failure. |
| `../../neural.js` | Three.js r186 runtime (vendored under `vendor/three/`). |
| `../../neural-boot.js` | Eligibility, lazy load near the viewport, offscreen and hidden-tab suspension, pause control, fallback. |
| `../../neural.css` | Section layout: stage of coordinate paper beside the copy, stacked under 900px. |

Blender 5.2.2 LTS, glTF exporter with `export_extras=True`, `export_apply=True`, CPU Cycles for the stills.

## Geometry

- Layers `[4, 7, 9, 7, 4]` along x, 1.45 apart. Each layer is a ring in the y-z plane with a seeded wobble (seed 20260915) so the object has depth when rotated.
- 31 `Node_<layer>_<index>` objects share one icosphere (radius 0.115, 320 triangles). Extras: `layer`, `index`.
- 182 `Edge_<layer>_<src>_<dst>` objects share one 10-sided unit cylinder that runs from local z = 0 to z = 1 in Blender, which becomes +Y in glTF. Location is the source neuron, rotation tracks the target, scale is `(0.55 + 0.9|w|, same, length)`. Extras: `layer`, `src`, `dst`, `weight` with `w ~ N(0, 0.55)` clipped to `[-1, 1]`.
- No text or letters exist in the geometry. Labels live in the page.
- Total 16,472 triangles; the browser draws two instanced batches.

Changing `LAYERS` in `build.py` requires the same change in `neural.js` (`LAYERS`), which derives the expected node and edge counts from it.

## Browser behaviour

- Forward pass: a random input in `[0.15, 1]`, `tanh` layers with the authored weights. Per-instance `aLevel` attributes carry each neuron's activation and each weight's signal; the shader lights a Gaussian wave along `position.y` of the edge as `uPulse - layer` sweeps 0 to 1, and each neuron peaks when the pulse reaches its layer. A soft pass fires on its own every 8.5 s of idle; a click or the Fire button fires at full gain and announces the output activations in the status line.
- Hover: neurons within 0.62 of the pointer ray are pushed away (spring 60, damping 11, fixed 120 Hz steps); edges are recomputed from the moved neurons every frame.
- Drag: rotation after a 6 px threshold, inertia on release, x clamped to plus or minus 1.1 rad. A click that did not move fires a pass; a drag never does. An idle turn of 0.07 rad/s is kept separate from the visitor's orientation; Reset restores the rest orientation.
- Eligibility: fine pointer, no reduced motion, no data saver, WebGL 2, not a software renderer. Otherwise the still stays. Rendering pauses offscreen, in hidden tabs and on Pause. Sustained low frame rate drops pixel ratio, then falls back to the still. Context loss falls back.

## Verified (2026-09-15)

Headless Chrome, ANGLE D3D11 on an Intel Arc 140V: 60 fps, 2 draw calls, 16,472 triangles. Checked: idle, click pass (gain 1.0, status text), hover displacement, drag rotation without firing, Reset, Fire and Pause buttons, keyboard Enter on Fire, offscreen suspension, reduced motion removes the canvas, GLB failure keeps the still, touch viewports (390, 820) never request the GLB, no horizontal overflow at 390 / 820 / 1024 / 1440 / 1920, and no bounding-box overlap between the hero, section head, stage, copy, controls, status and About Me. Report and captures in `verification/`.

## Limitations

- Mobile and touch get the still, not the live object.
- The Cycles still and the Three.js render differ in edge weight and lighting; both are the same geometry.
- Weights are random and untrained; the activations are illustrative, not a research result.
