# Product

> **Homepage presentation update, 2026-09-07.** The current page uses `board.css` plus a homepage-only `daylight.css`/`daylight.js` layer, an unchanged Scroll Craft engine, and optimized KIE-generated decorative backgrounds. Existing copy and link targets remain fixed. The latest user request supersedes the historical dark visual direction below. The site remains static with no build step; optional browser/asset tools are isolated in `scrollcraft/builds/daylight`.

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Plain static HTML/CSS/JS, no build step, no framework, no package manager. Files are
authored and served directly: `index.html`, `style.css`, `vectorfield.js`, sibling pages,
and a `pdfs/` directory. MathJax is loaded from CDN on the pages that typeset mathematics.
This is an existing constraint, not a fresh choice — anything added must run from a file
opened over plain HTTP with no toolchain.

## Users

Two audiences of equal weight, arriving at the same single page:

- **Mathematicians** — PhD supervisors, collaborators, and academic peers assessing
  research depth. Their job is to judge whether the work is real: what the thesis proves,
  what the seminars and projects covered, how the reading list is composed.
- **AI/ML technical evaluators** — recruiters, clients, and engineering leads assessing
  Alejandro as a practitioner. Their job is to place him: what he builds, where, and with
  what rigour behind it.

Neither may read as an afterthought. The page must let a mathematician find the thesis and
a hiring manager find the industry work without either scrolling past a section addressed
to somebody else.

## Product Purpose

A personal site that presents Alejandro Morera Alvarez's mathematical and applied work in
one place: who he is, what he has written, what he has studied, and what he recommends
reading. Success is a visitor who leaves with the correct impression of the depth of the
work and a PDF open in another tab.

## Positioning

The combination is the position: a working mathematician in stochastic analysis, dynamical
systems, and mathematical physics who is simultaneously shipping production AI systems.
Neither half is decoration for the other. The site is also, itself, evidence — hand-built,
no framework, no template.

## Operating Context

- Visitors arrive from a CV, a LinkedIn profile, an email signature, or a handed-over link.
- The dominant action is **opening a PDF**: theses, handouts, slides, lecture notes,
  the AI manual. Most sections are, functionally, a link surface.
- `Recommended Literature` is a reference tool — a long list of modules whose citations
  expand on click. It is browsed and searched, not read top to bottom.
- `Thinking in Measures` (`thinking-in-measures.html`) is a separate reading surface with
  its own posts under `tim-posts/`.
- `Auctiva` (`auctiva.html`) is a separate business landing page for a different audience
  (SMEs) and a different job. It shares `style.css` today but not its purpose.

## Capabilities and Constraints

- Sections on the homepage, in order: hero, About Me, Projects (essays/seminars/theses),
  Notes (lecture summaries), Academic Background (completed modules by degree),
  Recommended Literature (expandable per-module citation lists).
- `Recommended Literature` and the blog cards are the only interactive components:
  click-to-expand disclosure, currently driven by inline `onclick` and `max-height`.
- `style.css` is shared by `index.html`, `thinking-in-measures.html`, `auctiva.html`, and
  the `tim-posts/` pages. **Confirmed scope: the new visual world applies to `index.html`
  only.** Shared rules the other pages depend on must keep working unchanged.
- 11 PDF links on the homepage point at files that do not exist yet
  (`Ana3`, `BRW`, `DT`, `FG`, `LD`, `MT_MoreraAlvarez`, `OT`, `PT`, `RDS`, `bfc_thesis`,
  `pdm_moralv_full`, `pdm_moralv_mini`, `poincare_handout`). **Confirmed: these links stay
  exactly as authored.** Do not remove them, do not relabel them, do not add a
  "coming soon" state.
- Content is fixed. Copy, section order within a section's own text, citations, module
  names, and link targets are product truth and may not be rewritten.

## Brand Commitments

- Name and wordmark: `alemoralv.`
- Real assets on hand and in use: `whiteboard.png` (Alejandro at a whiteboard),
  `bpzcalc.jpg` (a photographed chalkboard of BPZ-equation calculations, currently the
  hero backdrop), `bpznew.png`, `IMG_7879.JPG`.
- **Binding visual constraint set by the user:** the scroll-driven background for the page
  below the hero is the chalkboard formula-writing animation in
  `Chalkboard scrolling formulas animation/`. Formulas are written left-to-right by an
  advancing chalk edge as the visitor scrolls. The previous vector-field canvas
  (`vectorfield.js`) is removed from this page. The chalk background must cover the entire
  region below the hero; if the existing formulas run out, more are added.
- The mathematics rendered on the site is the user's own subject matter and must stay
  correct. Formulas are content, not ornament.

## Evidence on Hand

- 14 PDFs present in `pdfs/`: `AI_Manual`, `GVP`, `RNSRG`, `convtoeq_project`,
  `convtoeq_slides`, `lapme_handout`, `lapme_slides`, `lpspaces_handout`,
  `lpspaces_slides`, `poincare_slides`, `specres_handout`, `specres_slides`,
  `BT_Morera`, `fractagonCT`, `PDM___Compact`.
- A real, written Master's thesis abstract (on `thinking-in-measures.html`).
- A real module record across two TUM bachelor's degrees and a TUM/EPFL double master's.
- Real employment: Profuturo (AI, LLMs, RAG, automation) and Novalan (AI/ML Foresight).
- Real external profiles: LinkedIn, Spotify (original compositions), Strava, GitHub.
- **No testimonials, metrics, client logos, press, or endorsements exist.** Do not invent
  any. There is no analytics data and no user research.

## Product Principles

1. **The link is the product.** Every section is ultimately a way to reach a document.
   Scannability of titles and reachability of links outrank expressive layout.
2. **Two audiences, one page, no ghetto.** Neither the mathematics nor the applied AI work
   may be styled as secondary.
3. **The mathematics is real, so render it as real.** Formulas and citations are content
   with correct typography, not texture.
4. **Content is fixed; the container is free.** Any amount of visual reinvention is
   permitted, and no word of the copy may change.
5. **It must run from a plain file.** No build step, no framework, no dependency that
   needs installing.

## Accessibility & Inclusion

No project-specific standard was established by the user. The site is a public personal
page reached from CVs and profiles, so it must remain usable at ordinary web
expectations: real text (never text baked into images), keyboard-operable disclosures,
visible focus, a `prefers-reduced-motion` path for the scroll-driven chalk animation, and
contrast that survives whatever backdrop sits behind the content.
