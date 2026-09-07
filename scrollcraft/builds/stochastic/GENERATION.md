# Stochastic-analysis background

2026-09-07. The user requested stochastic analysis in place of the earlier glass-object artwork. This build uses the Scroll Craft technical-illustration direction in response to that specific correction. It deliberately departs from the prior photographic still life. The rejected artwork and its original files remain historical; neither new delivery image uses that artwork.

The generated layer is decorative academic context. Its lines are not a verified stochastic-process simulation, and its shaded fields are not a computed transition kernel. Separate deterministic SVG geometry supplies the crisp mathematical foreground in the site implementation.

## Generation method

- Authorized provider: Kie.ai unified jobs API.
- Model: `seedream/5-pro-text-to-image`, called through the requested Scroll Craft skill's unchanged `scripts/kie.mjs`.
- Parameters: aspect ratio `16:9`, quality `high`, PNG output.
- Prompt: [stochastic-prompt.txt](stochastic-prompt.txt).
- Art direction: fine open irregular trajectory ensembles and a pale transition-density field on cool white paper, with blue/teal marks restricted mainly to the right edge and generous space for live typography.
- Explicit exclusions include glass, bottles, knots, shiny tubes, topological sculptures, people, portraits, labels and formulas.
- No reference images or personal photographs were uploaded.
- The new [BRIEF.md](BRIEF.md) was read before the generation command was run.

The local [generate-stochastic.mjs](generate-stochastic.mjs) helper reads the local environment file inside Node and maps the supplied key name to process-only `KIE_AI_API_KEY`. It does not emit the key or write it into any asset or browser resource. Account balances and task identifiers are retained only in the ignored local `generation-audit.json`.

The first network attempt failed before returning any task ID. A subsequent probe showed no balance change. The cause was a Node connection timeout on the default address route; preferring IPv4 restored connectivity. The retry used the same provider, model and prompt. The helper refuses to overwrite an existing original, preventing an accidental paid rerun.

## Reproduction

1. `node scrollcraft/builds/stochastic/generate-stochastic.mjs probe` checks credentials and balance locally.
2. `node scrollcraft/builds/stochastic/generate-stochastic.mjs generate` generates only when an original is absent and the brief is present.
3. `python scrollcraft/builds/stochastic/prepare-assets.py` creates both WebP delivery images from the retained original using Pillow.

The delivery manifest records dimensions, bytes, crop bounds and SHA-256 hashes. Original PNG files remain in the ignored local `originals` directory.

## Delivered assets and visual inspection

One task completed successfully. No image rerolls or video requests were made.

| File | Dimensions | Bytes |
| --- | --- | ---: |
| `originals/stochastic-kie.png` | 2736 × 1520 | 4,837,004 |
| `assets/stochastic/stochastic-desktop.webp` | 1920 × 1067 | 68,526 |
| `assets/stochastic/stochastic-mobile.webp` | 768 × 1365 | 69,982 |

Desktop uses Lanczos resizing at WebP quality 85. Mobile uses the right-side source crop `(1881, 0, 2736, 1520)`, then Lanczos resizing at WebP quality 84. Both use encoder method 6 and remain below the 150 KB delivery target. No color correction or generated replacement content was introduced during preparation. Exact SHA-256 hashes are in [asset-manifest.json](asset-manifest.json).

The original and both delivery images were opened and visually inspected. The result has fine jagged open blue/teal trajectories, subtle pale density-shaped shading, a clean white left reading area and quiet upper space. There is no glass object, bottle, knot, tubular sculpture, person, text, formula, logo or watermark. The portrait crop retains the trajectory ensemble and substantial quiet space above and below it. Image-level acceptance is complete; browser compositing, text contrast and actual parallax are verified separately by the page implementation.

Git ignore checks passed for the retained original and private task/balance audit. An exact credential-content scan across the new assets and stochastic build files found no matches.
