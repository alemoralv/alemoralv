# Daylight background generation

Generated 2026-09-07 through the user's authorized Kie.ai account. The existing personal portrait was neither uploaded nor modified. This image is decorative generated scenery, not a photograph of an actual office or a research diagram.

## Source and request

- Provider: Kie.ai unified jobs API, `https://api.kie.ai/api/v1/jobs/createTask`.
- Generator: the requested Scroll Craft skill's unchanged `scripts/kie.mjs`.
- Model: `seedream/5-pro-text-to-image`.
- Parameters: aspect ratio `16:9`, quality `high`, output format `png`.
- Prompt: [atelier-prompt.txt](atelier-prompt.txt), with one shared high-key editorial style preamble and an explicit scene composition.
- One still request, no rerolls, no video requests, no reference-image uploads.
- The project brief existed and was read before this paid request.

The helper [generate-atelier.mjs](generate-atelier.mjs) reads the project-local environment file in Node, maps either supported key name into process-only `KIE_AI_API_KEY`, then calls the skill. It never writes the key to a file or includes it in browser code. Run `node scrollcraft/builds/daylight/generate-atelier.mjs probe` for a credit check. The `generate` command refuses to overwrite an existing original, preventing an accidental paid rerun.

## Local audit

The local helper submitted exactly one successful generation task. Account balances, timestamps and task identifiers are retained in the ignored local `generation-audit.json`; account metadata is not part of the public website.

## Files and delivery preparation

| File | Dimensions | Bytes |
| --- | --- | ---: |
| `originals/atelier-kie.png` | 2736 × 1520 | 5,838,566 |
| `assets/daylight/atelier-desktop.webp` | 1920 × 1067 | 44,220 |
| `assets/daylight/atelier-mobile.webp` | 768 × 1365 | 40,394 |

The original is retained locally under the ignored build originals directory. The mobile composition uses the original crop rectangle `(1881, 0, 2736, 1520)`, preserving the complete cobalt loop, coral detail, and a quiet upper paper field. Desktop WebP quality is 85; mobile quality is 84. Lanczos resizing and WebP method 6 are used. No color correction or generated content replacement was applied during preparation.

[prepare-assets.py](prepare-assets.py) reproduces both delivery files with Pillow. [asset-manifest.json](asset-manifest.json) records dimensions, exact sizes, crop bounds and SHA-256 digests.

## Visual review

The original and both delivered WebP images were opened and visually inspected. The plate has pale natural daylight, tactile paper, authentic-looking glass refraction, a complete glass loop with safe margins, restrained cobalt and coral accents, and wide quiet desktop space for live text. No people, words, logos, formulas, or baked-in interface elements are present. The portrait crop retains the full focal object and remains bright. This is image-level review; the page's final desktop, mobile, scroll and reduced-motion compositing are checked separately in the build verification.
