# Daylight homepage

The website is static HTML, CSS and JavaScript. It needs no build step. The optional tools in this folder support asset authoring and browser verification only.

- `BRIEF.md`: authored design direction, layer contract and scroll score.
- `STYLE-NOTES.md`: implementation decisions.
- `GENERATION.md`: KIE image provenance; the user's portrait is unchanged.
- `VALIDATION.md`: completed verification and known limitations.
- `../../../daylight.css` and `../../../daylight.js`: homepage enhancements.
- `../../../assets/scrollcraft/`: unmodified MIT Scroll Craft runtime.

## Preview and verification

From this folder:

```powershell
npm.cmd ci
node qa-server.mjs
```

Preview: http://127.0.0.1:4519/

The preview server binds to localhost and denies environment files, dotfiles and build tooling. Keep `.env` local. It is not needed by any browser code.

## Scroll Craft source and asset reproduction

The complete skill was read from https://github.com/nateherkai/scroll-craft at commit `0b816225945e45380397d6a0487efa3c98916858`. To restore the ignored local tooling, from the repository root:

```powershell
git clone https://github.com/nateherkai/scroll-craft.git .scroll-craft-source
git -C .scroll-craft-source checkout 0b816225945e45380397d6a0487efa3c98916858
```

`generate-atelier.mjs` reads `KIE_API_KEY` or `KIE_AI_API_KEY` from the root `.env` into process memory only. The `generate` command creates a paid KIE still and refuses to overwrite an existing original. The delivered WebP images are already in `assets/daylight`; regeneration is unnecessary to view or publish the site.

Original generated PNGs, private account audit, dependencies and screenshot evidence stay local and ignored. Source photographs and existing PDFs retain their original locations.
