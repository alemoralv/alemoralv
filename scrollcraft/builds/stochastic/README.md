# Stochastic notebooks

This revision replaces the rejected glass artwork, adds independently scrolling stochastic layers, and brings the lighter design to Thinking in Measures. The two production pages remain static HTML/CSS/JS with no build step.

- `BRIEF.md`: current user direction, layer contract and revision scope.
- `GENERATION.md`: KIE imagery provenance. Original and private account audit stay ignored.
- `READING-NOTES.md`: reading-page layout and mathematical typesetting decisions.
- `VALIDATION.md`: final visual, functional and content-preservation evidence.
- `generate-layers.mjs`: deterministic illustrative Gaussian-increment paths, Gaussian density curves, and discrete observations of those same paths. Seed 70926. These are decorative numerical illustrations, not research figures or exact continuous Brownian paths.

Production styles: `../../../stochastic.css` and `../../../reading-daylight.css`; independent layer behavior: `../../../stochastic.js`. The prior Daylight base and unchanged Scroll Craft engine are reused. Each hero has five data-depth layers; each long document has four fixed margin layers. Reduced motion disables decorative displacements.

## Preview and tools

From the repository root:

```powershell
node scrollcraft/builds/daylight/qa-server.mjs
```

Preview routes:

- http://127.0.0.1:4519/index.html
- http://127.0.0.1:4519/thinking-in-measures.html

The safe preview server denies dotfiles and root build tooling. QA reuses the preceding build's optional Playwright installation. Restore it with `npm.cmd ci --prefix scrollcraft/builds/daylight` if necessary. The complete local Scroll Craft skill source can be restored using the preceding build's README; the unchanged runtime is already included in production assets.

To reproduce the crisp SVG layers without generation credits:

```powershell
node scrollcraft/builds/stochastic/generate-layers.mjs
```

No key or remote generation API is needed to display either page. The formerly generated atelier WebPs remain in Git history and the prior build documentation, but neither current route loads them.

After a GitHub Pages deployment completes, run the focused live check from the repository root:

```powershell
node scrollcraft/builds/stochastic/qa-published.mjs <commit-sha>
```

It checks both public routes at their actual base path, including image loading, independent layer count, one engine instance, responsive layout, note disclosures and stable mathematical rendering. Live screenshots and results stay in the ignored `review/published-<commit-sha>/` directory.
