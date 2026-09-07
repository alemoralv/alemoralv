# Stochastic notebooks: local validation

2026-09-07. Both `index.html` and `thinking-in-measures.html` were tested at `http://127.0.0.1:4519/`. The results below concern local files and browser behavior; publication verification is recorded separately.

## Coverage and results

Both routes were checked at 1440 x 1000, 390 x 844 and 360 x 800, plus reduced motion and JavaScript disabled at 390 x 844. The completed ten-context matrix found no document horizontal overflow or new unavailable local resources. No route requested an `atelier` image. The original portrait remained intact.

- Homepage: original section anchors remain present and land below the sticky navigation; sampled keyboard controls stay visible with focus outlines; New path changes the SVG and live status by keyboard; reference disclosures still open and close. All 42 reference lists are visible without JavaScript.
- Reader: three notes load; 144 MathJax containers render with no mathematical rendering errors. Corrected per-note counts remain 37, 40 and 58. Disclosures synchronize `aria-expanded`, `aria-hidden` and `inert`, and closed content measures zero height. Long equations scroll inside their own containers rather than expanding the page.
- Open-note testing covered deep article positions, equation horizontal scrolling and viewport resizing. At compact-phone article positions around 6,567, 9,806 and 13,046 pixels, all four margin fields remained fixed to the viewport.
- Reduced motion produces `transform: none` on every stochastic plane at every sampled scroll position. Pointer effects stop. The static composition and native content remain available.
- Without JavaScript the reader provides three direct original-note links. TeX remains source text without a JavaScript math engine; this is disclosed as a fallback, not claimed as typesetting.
- Original reader PDF destinations return 200. The homepage retains the same 13 historically unavailable PDF targets documented by the Daylight baseline; no missing research files were invented or replaced.

Evidence: `review/final-home-v1/`, `final-reader-v1/`, `final-home-v2/` and `final-reader-v2/`. The v2 runs complete only previously unfinished compact/reduced/no-JavaScript contexts and exited successfully.

## Actual independent motion

Measurements use computed DOM transform matrices, not an arbitrary progress counter. Each route has five separate hero planes and four fixed margin planes. The measured displacements are unequal in both desktop and phone contexts.

| Hero plane | Homepage desktop vertical change | Reader desktop vertical change |
| --- | ---: | ---: |
| Generated art | -18.45 px | -10.26 px |
| Coordinate grid | +28.70 px | +15.96 px |
| Sample paths | -82.00 px | -45.60 px |
| Density field | +53.30 px | +29.64 px |
| Particles | -139.40 px | -77.52 px |

These compare the opening against half of each hero's own measured height. The different hero sizes intentionally yield different absolute distances. At document progress 25% to 85%, homepage desktop margin displacements were +64.80, -259.22, +183.61 and -453.63 pixels. Reader measurements were correspondingly +64.78, -259.11, +183.54 and -453.45 pixels. All four margin parents computed to `position: fixed`.

Desktop pointer tests changed both computed hero-plane matrices and screenshot pixels. The reduced-motion pointer comparison stayed static. Expanded-article screenshots show that the central reading surface stays stable while the separate decorative fields continue in the margins. Opacities were subsequently reduced for quieter reading; this did not change the measured motion rates.

## Contrast and visual evidence

Composited-background sampling covered 168 visible homepage text samples and 78 reader text samples at desktop and phone sizes. All 246 samples passed their size-aware contrast thresholds. Minimum ratios were 5.55:1 on the homepage and 4.88:1 on the reader.

The sampler photographs the actual backgrounds with reading text temporarily hidden, then evaluates true text-node line bounds. Decorative stochastic artwork and aria-hidden glyphs are excluded from reading-text grading. This is sampled contrast evidence, not a certification of every possible pixel or accessibility behavior.

Opening, intermediate, deep-article, compact-phone, no-JavaScript and closing screenshots were visually inspected. The stochastic imagery replaces the glass motif on both routes. The phone title fits, mathematical material remains within the reading panels, and the ending does not fade away.

Stock Scroll Craft results:

- `stock-home-desktop-v2`: 33 samples, settled, no dead-scroll or resource-error reports.
- `stock-reader-phone-v2`: 12 samples after genuine MathJax readiness (144 containers), settled, no dead-scroll or resource-error reports. Its contact sheet was inspected with typeset equations.
- `stock-home-phone`: 35 samples and no dead-scroll report, but an external Google Fonts socket failure occurred. This is preserved as fallback-font evidence; final phone appearance is supported by the clean custom matrix and contrast captures.
- `stock-reader-desktop-v2`: 12 samples after MathJax readiness and no dead-scroll report, but an external Google Fonts socket failure occurred. The sheet was inspected as fallback-font evidence, alongside the clean custom desktop rendering.

The upstream `shoot.mjs` and engine were not edited. `qa-harness-ready.mjs` is a separate Node preload that lets the real reader finish `body[data-math-ready="true"]` before the stock harness samples it. It does not inject a false readiness flag. Ordinary flow sections contain no pinned video or fading copy, so generic dead-scroll/cue checks alone do not establish this page's custom motion or contrast; the independent measurements above provide that evidence.

## Failures found and resolved

1. The first reader run reported an automatic favicon 404. A local favicon was added; the corrected compact/reduced runs have no console or resource errors.
2. An unnecessary note-open `typesetPromise` call doubled previously typeset math counts to 74/80/116. It was removed. The fetch-coordinated initial MathJax pass covers all notes once. Corrected compact/reduced runs return 37/40/58 with no errors; `review/math-idempotence/results.json` additionally records 21 repeat-open/close and resize states with stable counts. That agent's assertions completed but its browser teardown stalled; the independent v2 reader process subsequently completed with exit 0.
3. Initial parallel stock runs encountered external socket failures and navigation timeouts. The first reader-phone stock sheet contains raw TeX and is explicitly superseded by `stock-reader-phone-v2`; it is not final typesetting evidence.
4. One compact homepage key sequence raced a long native smooth scroll. The unfinished context was rerun with settled focus and a targeted button key event; New path then passed. No website change was needed for this automation timing issue.

Failed and superseded artifacts were retained in `review/`; results were not overwritten to hide them.

The independent final `qa-math-clean.mjs` check also recorded nine states across two open/close cycles for each of the first two notes at 390 pixels. Every state retained total 144 and per-note counts 37/40/58, with no page-width growth or console errors. It confirmed the reader's local favicon and saved final opening and expanded-equation screenshots in `review/math-clean/`.

## Content and limits

`qa-preservation.py` confirms the homepage biography and all five original sections retain the same normalized text, the entire reader thesis retains its original text, every original href remains, and all three post fragments match their original SHA-256 hashes byte-for-byte. See `review/preservation.json` and `BASELINE.md`.

The safe preview continues to deny dotfiles and root build tooling; it binds only localhost. Existing Daylight `.env` isolation remains unchanged. Verification uses installed Chrome with native pointer lock and pointer capture disabled; it does not reproduce a physical iPhone/Android device. No mathematical claims were re-proved, external destinations comprehensively audited, or remote deployment inferred from local checks.

## Reproduction

The build reuses `../daylight/node_modules/playwright-core`; no second install or root toolchain was introduced. With the existing safe preview server running, execute from this build:

```powershell
node qa-final.mjs rerun-home index.html
node qa-final.mjs rerun-reader thinking-in-measures.html
node qa-contrast.mjs contrast-home
node qa-contrast.mjs contrast-reader reader
python qa-preservation.py
```

For the reader stock harness, run from the Daylight build so its existing Playwright dependency resolves:

```powershell
$env:SCROLLCRAFT_FFMPEG = 'C:\Users\alexm\ffmpeg\bin\ffmpeg.exe'
node --import ../stochastic/qa-harness-ready.mjs ../../../.scroll-craft-source/plugins/nateherk-design/skills/scroll-craft/scripts/shoot.mjs --url http://127.0.0.1:4519/thinking-in-measures.html --out ../stochastic/review/stock-reader-rerun --width 390 --height 844
```

Browser evidence is gitignored. The downloaded skill source is local authoring tooling, not a website dependency.
