# Reader baseline

Captured on 2026-09-07 at `http://127.0.0.1:4519/thinking-in-measures.html`, using the saved pre-edit HTML so concurrent implementation could not contaminate the baseline. Supporting CSS, scripts and post fragments were served normally. The initial navigation attempt timed out at DOMContentLoaded after 30 seconds. A subsequent attempt succeeded without console errors, failed resources or mathematical rendering errors; the timeout is recorded as a transient observation rather than a reproducible site failure.

- Three original notes: Fractagon Convergence Theorem; How Liouville Theory Reveals the Fyodorov–Bouchaud Formula; From Borel Functional Calculus to the Bounded Spectral Theorem.
- Desktop 1440 x 1000: document width 1440; closed-note document height 3155.
- Phone 390 x 844: document width 390; closed-note document height 3544.
- Both JavaScript contexts rendered 144 MathJax containers with no MathJax errors. Per-note counts when open were 37, 40 and 58.
- Each note opened via pointer and closed via keyboard to zero content height. Initial note content was visually collapsed.
- The phone notes contained 5, 9 and 2 equations wider than their local boxes respectively. All were contained in horizontal scrolling regions; none enlarged the document width.
- All reader-local destinations returned 200, including `pdfs/fractagonCT.pdf`, `pdfs/PDM___Compact.pdf` and `pdfs/BT_Morera.pdf`.
- With JavaScript disabled, the original reader displayed no notes and no rendered MathJax. This is an inherited limitation, not a requirement to preserve.

Visual inspection confirmed the original reader is dark throughout, including the long theorem and article content. The title fits on both tested widths. Existing long theorem lines are horizontally scrollable on phone.

Source snapshots, source SHA-256 hashes, screenshots and detailed results are stored locally in gitignored `review/baseline/`. The original post-fragment hashes are preserved in `source-hashes.json` for final comparison. This establishes rendering and source provenance, not mathematical proof verification.
