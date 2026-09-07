# Baseline browser evidence

Captured before the daylight implementation at `http://127.0.0.1:4519/` using installed Chrome through Playwright.

- Desktop: 1440 x 1000, document width 1440, document height 5598.
- Phone: 390 x 844, document width 390, document height 9645.
- No document horizontal overflow, broken loaded images, or missing in-page anchor targets in either context.
- Desktop emitted one generic 404 console message. The response listener did not attach a corresponding URL; this is unclassified baseline evidence, not a confirmed JavaScript error. No page exceptions or failed requests were observed.
- The opening screenshots were visually inspected. The original homepage uses dark slate and chalk texture throughout; the phone opens with a long biography and puts the portrait far below the initial viewport.

Screenshots and machine-readable evidence in the build folder: `review/baseline/desktop-opening.png`, `review/baseline/phone-opening.png`, both `*-full.png`, and `review/baseline/baseline.json`.

## Existing unavailable local document targets

The following original homepage links returned HTTP 404. Their targets were not changed as part of QA:

- `pdfs/MT_MoreraAlvarez.pdf`
- `pdfs/poincare_handout.pdf`
- `pdfs/bfc_thesis.pdf`
- `pdfs/pdm_moralv_full.pdf`
- `pdfs/pdm_moralv_mini.pdf`
- `pdfs/Ana3.pdf`
- `pdfs/BRW.pdf`
- `pdfs/DT.pdf`
- `pdfs/FG.pdf`
- `pdfs/LD.pdf`
- `pdfs/OT.pdf`
- `pdfs/PT.pdf`
- `pdfs/RDS.pdf`

## Preview isolation

The preview server binds only `127.0.0.1`. Requests for `.env`, `%2eenv`, `.git/config`, `.codex/`, `node_modules/`, and build tooling returned HTTP 403. It does not serve dotfiles, dependency folders, the scrollcraft build folder, or unknown file extensions. This verifies this local preview server only; it does not establish remote hosting configuration.
