---
name: Alejandro Morera Alvarez
description: A mathematician's personal site rendered as one continuous lecture-hall board — lit green-grey slate, warm bone chalk, no cards and no shadow.
colors:
  board: "#333C36"
  board-deep: "#242A26"
  board-lit: "#3E4842"
  chalk: "#EFEAD9"
  chalk-body: "#D6D3C4"
  chalk-soft: "#C0BEAF"
  chalk-faint: "#8A9086"
  chalk-blue: "#A3CBDB"
  chalk-ochre: "#E0BE7A"
  slate-light: "rgba(255, 255, 255, 0.055)"
  rule: "rgba(239, 234, 217, 0.20)"
  rule-mid: "rgba(239, 234, 217, 0.34)"
  rule-strong: "rgba(239, 234, 217, 0.58)"
typography:
  display:
    fontFamily: "Archivo, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(2.4rem, 5.6vw, 4.1rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.022em"
    fontVariation: "'wdth' 104"
  display-long:
    fontFamily: "Archivo, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(1.9rem, 4.4vw, 3.3rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.012em"
  headline:
    fontFamily: "Archivo, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(1.25rem, 2.1vw, 1.8rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.035em"
    fontVariation: "'wdth' 108"
  mark:
    fontFamily: "Archivo, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 112"
  title:
    fontFamily: "Archivo, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.02rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "-0.005em"
  body:
    fontFamily: "Archivo, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "normal"
  ui:
    fontFamily: "Archivo, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.92rem"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "normal"
  meta:
    fontFamily: "Archivo, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.05em"
  label:
    fontFamily: "Archivo, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.11em"
  chalk-hand:
    fontFamily: "Caveat, 'Segoe Script', cursive"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "normal"
rounded:
  none: "0"
  hairline: "1px"
  drawn-box: "2px 4px 2px 5px / 4px 2px 5px 2px"
  drawn-box-trace: "5px 2px 4px 2px / 2px 5px 2px 4px"
  drawn-mark: "3px 5px 3px 6px / 5px 3px 6px 3px"
  drawn-theorem: "2px 5px 3px 6px / 5px 2px 6px 3px"
spacing:
  s-1: "0.25rem"
  s-2: "0.5rem"
  s-3: "0.75rem"
  s-4: "1rem"
  s-5: "1.5rem"
  s-6: "2rem"
  s-7: "3rem"
  s-8: "4rem"
  s-9: "6rem"
components:
  boxed:
    backgroundColor: "transparent"
    textColor: "{colors.chalk}"
    rounded: "{rounded.drawn-box}"
    padding: "0.62rem 1.35rem"
  boxed-hover:
    textColor: "{colors.chalk}"
    rounded: "{rounded.drawn-box}"
  boxed-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.chalk-soft}"
    rounded: "{rounded.drawn-box}"
    padding: "0.4rem 0.9rem"
  boxed-quiet-hover:
    textColor: "{colors.chalk}"
  chalkmark:
    backgroundColor: "transparent"
    textColor: "{colors.chalk-soft}"
    rounded: "{rounded.drawn-mark}"
    width: "40px"
    height: "40px"
  chalkmark-hover:
    textColor: "{colors.chalk}"
  index-link:
    backgroundColor: "transparent"
    textColor: "{colors.chalk-soft}"
    rounded: "{rounded.none}"
    padding: "0 0 3px 0"
  index-link-here:
    textColor: "{colors.chalk}"
  module-btn:
    backgroundColor: "transparent"
    textColor: "{colors.chalk-body}"
    rounded: "{rounded.none}"
    padding: "0.85rem 0"
  module-btn-hover:
    textColor: "{colors.chalk}"
  wire-row:
    backgroundColor: "transparent"
    textColor: "{colors.chalk-body}"
    rounded: "{rounded.none}"
    padding: "0.55rem 0"
  note-entry:
    backgroundColor: "transparent"
    textColor: "{colors.chalk-body}"
    typography: "{typography.headline}"
    rounded: "{rounded.none}"
    padding: "1.5rem 0"
  note-entry-hover:
    textColor: "{colors.chalk}"
  equation:
    backgroundColor: "transparent"
    textColor: "{colors.chalk}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0 0.5rem 1.5rem"
  equation-theorem:
    backgroundColor: "rgba(31, 37, 33, 0.34)"
    textColor: "{colors.chalk}"
    rounded: "{rounded.drawn-theorem}"
    padding: "1.5rem 1.5rem 1.5rem 2rem"
  diagram-print:
    backgroundColor: "{colors.chalk}"
    rounded: "{rounded.none}"
    padding: "1.5rem"
---

# Design System: Alejandro Morera Alvarez

> **Stochastic revision, 2026-09-07.** Both the homepage and Thinking in Measures now share a light stochastic-analysis direction. The user rejected the glass artwork and requested more independently scrolling layers plus the reading-page redesign. `stochastic.css`/`stochastic.js` add five hero planes and four quiet margin planes; `reading-daylight.css` protects the reading surface. See [the current brief](scrollcraft/builds/stochastic/BRIEF.md). The earlier Daylight and Hörsaal descriptions below are retained as history, not the current visual specification.

> **Homepage update, 2026-09-07.** The user requested a lighter, more playful presentation. `index.html` now loads the homepage-only `daylight.css` and `daylight.js` layer plus an unchanged Scroll Craft runtime. Its current direction, KIE asset provenance, and verification are documented in [the Daylight build](scrollcraft/builds/daylight/README.md). The original content, links, portrait, and mathematical notation are retained. The Hörsaal specification below remains the historical homepage design and the current reading-page design; do not reapply its dark palette to the Daylight homepage.

> **One world, two surfaces.** Everything below documents **Hörsaal**, shipped by `index.html` (Lecture mode) and `thinking-in-measures.html` (Read mode) over the same `board.css` and the same `chalkboard.js`. There is no second system: the reading page inherits every token, rule and motion unchanged and adds only a component vocabulary for notes and mathematics. The note fragments in `tim-posts/*.html` have no `<head>` — they are fetched and injected into the reading page and inherit whatever stylesheet that page loads, so they are Hörsaal too. **`style.css` and `vectorfield.js` are orphaned:** no page loads either one. They remain in the repository, untouched. That is a statement of fact, not a recommendation.

## Overview

**Creative North Star: "Hörsaal"**

The page is not a site about a mathematician; it is his board. One continuous slate runs masthead to colophon, with yesterday's derivation ghosted behind today's argument. There is no card, no panel, no container and no shadow anywhere in this world. Hierarchy is built entirely from four devices: full-measure hairline rules, indentation, scale, and case. When something needs to be set apart, it gets a rule and a title — never a box around it. The one exception the build makes is a theorem, which is boxed because a theorem is boxed on a board.

The slate `#333C36` is sampled from `bpzcalc.jpg`, Alejandro's own photographed chalkboard, whose darkest chalk-free patches read `rgb(39,41,35)` — a warm olive-grey where red ≈ green > blue. The shipped value is that measurement deliberately lifted in lightness: a board in a lit room, not a screen in a dark one. That lift is the load-bearing decision of the whole palette. Near-black ground plus a saturated accent is the terminal console, and the console is the confirmed anti-reference. Emissive or glowing text, saturated green, and monospace type are all out of this world by decision.

Depth is material, not elevation. The slate carries a real dust grain, two eraser smudges, arcing wipe-bands, room light falling from the upper left, and the vignette of a surface that curves away at its edges — six fixed, cheap layers, none of them a gradient standing in for a material. Blur exists in this world, but only as chalk dust, as the soft edge of a scrim, and as an erased patch of board behind the display name; it is never a drop shadow and never a glow. The one raster rule is that photographs are graded into the room's light before they are allowed on the board.

The two surfaces are the same board seen twice. The homepage is the board a lecturer covers; the reading page is the board you sit in front of, where the writing steps back and the argument takes the measure. They frame different panels of the same photograph (`center 26%` on the homepage, `22% 34%` on the reading page) so the two pages read as one room rather than one wall.

**Key Characteristics:**
- One continuous slate: no card, no panel, no container, no `box-shadow`, no `text-shadow`, no glass.
- Hierarchy from rules, indentation, scale and case only.
- Two type families total, no third: Archivo for every word of interface, Caveat for the board's residue.
- One motion device for the entire system: `clip-path`, in two orientations. No opacity fade exists anywhere.
- Chalk-tray palette: bone for text, blue for links, ochre for what is live — three sticks, nothing else.
- Every radius in the world is an asymmetric hand-drawn corner; there is no rounded container.
- One stylesheet and one engine serve every surface; a new page joins the world by loading them, not by forking them.

## Colors

A single lit-slate ground carrying a three-stick chalk tray: warm bone as the voice, blue chalk for anything you can open, ochre chalk for anything that is live or currently addressed.

### Primary
- **Blue Chalk** (`{colors.chalk-blue}`): every link, everywhere — masthead emails, project documents, note sets, in-note references, the underline colour at 42% alpha, and the selection highlight at 30% alpha. Measured on the shipped render at 7.03:1 for a Projects document link and 7.05:1 for a notes link.
- **Ochre Chalk** (`{colors.chalk-ochre}`): the "live" stick. The active nav underline, the drawn list bullets, the `+/−` disclosure strokes on both surfaces, the uppercase email keys, the reading page's `ABSTRACT` label and note subsection titles, module category headings, the focus ring, and the second traced outline on a hovered box. It is the only colour that ever marks state.

### Neutral
- **Lit Slate** (`{colors.board}`): the ground for both pages, set on `html` so overscroll is board too.
- **Deep Slate** (`{colors.board-deep}`): the sticky index bar and the scrollbar track — the one recessed value in the world.
- **Board Lit** (`{colors.board-lit}`): the lightest slate step, held for board surface that catches more room light.
- **Bone Chalk** (`{colors.chalk}`): headings, the name, entry titles, rendered mathematics, every hover destination, and the `.qed` tombstone. 9.5:1 on open board; measured 9.32:1 for ALEJANDRO and 8.11:1 for the reading page's title over the photographed board (a 3:1 large-text floor), 10.11:1 on the thesis line, 10.15:1 on a project title, 8.80:1 on the reading tagline.
- **Body Chalk** (`{colors.chalk-body}`): all running prose, list rows and resting note titles. Measured 8.10:1 on the thesis abstract, 7.90:1 on a note title, 8.12:1 on the Recommended Literature lede, 8.22:1 on a module row, 7.05:1 on both the homepage hero bio and the reading page's hero sub.
- **Soft Chalk** (`{colors.chalk-soft}`): secondary interface text — resting nav links, tallies, university tags, reference lines, note meta, figure captions. Measured 5.39:1 and 5.31:1 on nav links (homepage and reading page), 6.63:1 on a note's read-time and subject line, 5.00:1 on a section tally.
- **Faint Chalk** (`{colors.chalk-faint}`): **non-text only.** ~3.4:1 on the slate. It is the module micro-dash and nav chrome, and it is never the colour of a text run.
- **Chalk Rules** (`{colors.rule}` / `{colors.rule-mid}` / `{colors.rule-strong}`): all three are bone chalk at 20% / 34% / 58% alpha. Every horizontal rule, every border, every leader dot in the system is one of these — the system has no border *colour*.

### Named Rules

**The Three Sticks Rule.** The tray holds bone, blue and ochre. Blue means *you can open this*; ochre means *this is live or this is where you are*; bone is everything else. A fourth hue never enters the world, and neither accent is ever used decoratively.

**The No Border Colour Rule.** Borders and rules are chalk at low alpha, never a colour of their own. If a divider needs drawing, it is `--rule`, `--rule-mid` or `--rule-strong` — a hairline of chalk dust on slate, not a stroke of grey.

**The Measured-Render Rule.** Contrast in this world is verified against the shipped render — glyph extents, pseudo-elements intact, worst background patch under each text run — never computed from token pairs. The ground is a photograph under a soft-edged scrim; a token-pair calculation does not describe it. Body text clears 7:1 measured on both surfaces; secondary interface text clears 5:1; `--chalk-faint` clears neither and is barred from text. The reading page's `ABSTRACT` label measures 6.88:1 — the ochre stick is legible at label size, but only over its own scrim.

**The Not-A-Console Rule.** Never take the ground below the shipped slate toward black, never make chalk emissive (no `text-shadow` glow, no saturated green), and never set interface text in a monospace face. The lift from `rgb(39,41,35)` to the shipped slate is the entire difference between a lecture hall and a terminal.

**The Inherited Ink Rule.** Rendered mathematics takes its colour from the page rather than declaring its own: `mjx-container` is set to `color: inherit`, so an equation is chalk because everything around it is chalk. A typesetting engine that ships its own palette is a second voice on the board.

## Typography

**Display Font:** Archivo (variable, `wdth` 62–125 and `wght` 100–900), with `system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`
**Body Font:** Archivo — the same family, at the same optical sizing
**Hand Font:** Caveat (400/500/600), with `'Segoe Script', cursive` — the background chalk plane only, never interface text

**Character:** One grotesque carries every word a visitor reads, and its width axis does the work a second family would otherwise do: the name expands to `wdth` 104, section titles to 108, the wordmark to 112. Caveat is not a second voice — it is the board's residue, set behind the writing at 27–48% ink, and it never carries information the visitor is required to read.

Below the two display clamps, every `font-size` in the stylesheet resolves to one of six named steps (`--t-mark` 1.2rem, `--t-body` 1.0625rem, `--t-title` 1.02rem, `--t-ui` 0.92rem, `--t-meta` 0.82rem, `--t-label` 0.72rem). An earlier state of the build carried fourteen distinct small sizes, several of them a fraction of a pixel apart, which is noise rather than a scale.

### Hierarchy
- **Display** (700, `clamp(2.4rem, 5.6vw, 4.1rem)`, 0.95, `wdth` 104, `-0.022em`): ALEJANDRO, once, on the photographed board. Tightens to `-0.028em` under 700px.
- **Display Long** (700, `clamp(1.9rem, 4.4vw, 3.3rem)`, 0.95, `-0.012em`, capped at a 16ch measure): the same masthead voice for a title that is a phrase rather than a name — the reading page's. A long title set at display size overruns the board top; the ramp gets a second step rather than the first one being weakened.
- **Headline** (700, `clamp(1.25rem, 2.1vw, 1.8rem)`, 1.2, `wdth` 108, `+0.035em`, uppercase): section titles. Reused at 1.25 line-height and `-0.012em` sentence case for a note's title on the reading page — the thing you open is the largest text in its region.
- **Mark** (700, 1.2rem, `wdth` 112, `-0.02em`): the wordmark in the index, identical on both surfaces.
- **Title** (600, 1.02rem, 1.5): project and resource entry names, the reading tagline, the thesis line, note section titles.
- **Body** (400, 1.0625rem, 1.75; drops to 1rem under 700px): all prose, capped at a 66ch measure; the hero bio at 58ch, 1.72.
- **UI** (500, 0.92rem, 1.45): interactive rows and dense list content — module buttons, email values, note subsection titles.
- **Meta** (500, 0.82rem, `+0.05em` to `+0.09em`): secondary text and small links — document links on a ledger line, colophon lines, note read-time and subject, figure captions.
- **Label** (600, 0.72rem, `+0.11em` to `+0.14em`, uppercase): the ochre email keys, module category headings, section tallies, university tags, the `ABSTRACT` head.
- **Chalk Hand** (Caveat 400, 1.5–2.9rem generated, 1.35): the background formula plane. Drops to a fixed 1.15rem under 700px, where the widest display equations are removed entirely rather than allowed to run off the board.

### Named Rules

**The Two Families Rule.** Archivo and Caveat. There is no third face. If a new surface seems to need another family, it needs the width axis instead.

**The Width-Before-Weight Rule.** Emphasis at large sizes comes from the `wdth` axis and from case, not from stacking weight. Above ~1.25rem, expand and capitalise before reaching past 700.

**The Tabular Rule.** `font-variant-numeric: tabular-nums` is set globally. Counts, tallies and section numbers line up down the page because this is a document of quantities.

**The Six Steps Rule.** Every size below the display clamps is one of the six named steps. A new component picks the nearest step; it does not introduce a seventh.

## Layout

A single 1040px reading shell (`--shell`) centred with a fluid gutter of `clamp(1rem, 4vw, 2.5rem)`, and a 66ch text measure (`--measure`) inside it. Vertical rhythm runs on a 4px base through a nine-step scale (`--s-1` 0.25rem through `--s-9` 6rem); anything larger than a section's internal spacing is expressed as a viewport-aware clamp instead of a token — sections are separated by `clamp(5.5rem, 13vh, 10rem)`, the work region opens at `clamp(3rem, 9vh, 6.5rem)`.

The background chalk plane deliberately ignores the shell: it is `min(1840px, 99vw)` wide so the writing runs into the true margins and off the edges, which is what a board does. That contrast between a narrow reading shell and a full-width hand is the page's core spatial idea. The plane also stops short of the foot — its `bottom` is set to the colophon's measured height plus 24px, so no formula runs through the page's last mark.

On the reading page the same shell and measure carry long-form mathematics: every direct child of a note body is capped at the 66ch measure, and only two things are exempt — a display equation and a pinned diagram, both of which are allowed their full width and scroll horizontally inside their own bounds rather than pushing the page sideways.

Multi-column blocks collapse in steps rather than at one breakpoint: the module lists run 3 columns, then 2 at 1080px, then 1 at 700px; the resource list runs 2 columns down to 700px; the masthead's 1.35fr / 0.9fr split becomes a single column at 900px. At 900px the nav links stop wrapping into stacked rows — which cost ~150px of an 844px viewport on every scroll — and become one horizontally scrolling line with a masked right edge. Anchors clear the sticky index via `scroll-padding-top: 6.5rem`.

Sections are held by their rule and their title alone. The build carried `§` addresses on the section heads and in the index and they were removed; the right-aligned tally on each section head stayed. Wayfinding in this system is the title over the hairline, not a numbering scheme.

### Named Rules

**The Full-Bleed Scrim Rule.** Every scrim spans the full viewport width using `left: calc(50% - 50vw); width: 100vw` with `vw`-based gradient stops, and fades out at both the left and right viewport edges as well as top and bottom via mask. A scrim drawn at shell width with a horizontal fade leaves a visible vertical seam down both sides of every section: a soft-edged panel is still a panel.

**The Open Board Rule.** The gaps between sections are open slate at full strength. Scrims belong to text runs, not to the page; scrim the whole column and you bury the board it sits on.

**The Overflows Inside Its Rule Rule.** A block wider than the measure — an equation, a diagram — scrolls within its own bounds (`overflow-x: auto`) and never widens the page. The rule or the paper that marks the block is what the reader scrolls inside.

## Elevation & Depth

**This system has no shadows.** There is no `box-shadow` and no `text-shadow` anywhere in `board.css`. Depth is entirely material and tonal: the slate's six fixed layers (dust grain, two wipe-band gradients, two eraser smudges, upper-left room light) plus a separately painted vignette that makes the board curve away at its edges, the deep-slate recess of the sticky index, the soft-edged scrims that lift text off the photograph, and the colophon's board foot — a bright ledge catching light with the tray falling away into shadow beneath it, so the page ends rather than stops.

Blur is used, but never as elevation: a 13px blurred elliptical wipe behind the display name, and 2.5px on the advancing chalk edge as dust. Both are material effects on a two-dimensional surface. Nothing in this world is ever lifted off the board.

### Named Rules

**The Flat Board Rule.** Nothing floats. If an element needs separation, give it a rule, a scrim, or more space — never a shadow, never a glow, never a translucent glass panel.

**The Erased Patch Rule.** Where a heading lands on the densest chalk in the photograph, the board is wiped rather than plated: a radial ellipse of near-board `rgba(27, 32, 29, …)` inset beyond the glyphs and blurred 13px, behind the text with `isolation: isolate`. It is the gesture a lecturer makes before writing, and it exists because the display name measured 2.07:1 against bright chalk. It is not a plate and not a shadow: it has no edge, no offset and no colour of its own, and it reads as board.

**The Graded Photograph Rule.** A raster is admitted only after it is graded into the room's light. `whiteboard.png` runs `grayscale(0.16) contrast(1.02) brightness(0.97) saturate(0.96)` under a soft-light board-tinted overlay — enough to seat it in the slate, and no more; an earlier `grayscale(0.72) brightness(0.8)` was a different photograph, not a graded one. `bpzcalc.jpg` runs `brightness(1.34) contrast(1.16) saturate(0.66)` and dissolves into the slate through a single mask, not a stack of gradient stops — stacked stops band visibly across a 500px ramp and read as two materials butted together instead of one board. An untreated daylight photograph at full saturation is a foreign object stuck to the slate; a photograph graded to grey is no longer the photograph.

## Shapes

The world is rectilinear and unrounded. The only radii that exist are four asymmetric, per-corner elliptical values that make a hand-drawn box's corners fail to meet — `{rounded.drawn-box}` on chalk-boxed links, `{rounded.drawn-box-trace}` on the second outline a hover traces slightly off-register, `{rounded.drawn-mark}` on the 40px social marks, `{rounded.drawn-theorem}` on a boxed theorem — plus a 1px softening on the focus ring. Everything else is a square corner or no corner at all.

Every line in the system is a hairline: 1px for rules, dividers and the pinned diagram's frame, 1.5px for drawn strokes (box outlines, list bullets, the `+/−` toggles, the active nav underline, a theorem's box). Markers are drawn, not glyphs: the list bullet is an ochre 1.05rem stroke rather than a `•`; the disclosure marker is two 1.5px chalk strokes, one of which is erased by rotating to horizontal and fading out; the end-of-proof mark is a filled 0.66×0.82rem bone rectangle rotated `-1.4deg`, because `∎` is a glyph Caveat does not carry and a tombstone is a shape before it is a character.

### Named Rules

**The Drawn Corner Rule.** If something is boxed, its corners are asymmetric and never meet cleanly. A uniform `border-radius` on a container does not exist in this world at any value.

**The Hand Not The Glyph Rule.** Bullets, markers, rules and the end-of-proof tombstone are drawn with pseudo-elements, borders and boxes. Brand marks are the platforms' own SVGs; where no platform mark exists, one is drawn to match the set rather than substituted with a stock glyph.

**The Boxed Theorem Rule.** The one thing in this world that gets a box drawn round it is a theorem, at 1.5px `--rule-mid` over a `rgba(31, 37, 33, 0.34)` wash. It is not a card and it does not generalise: no other content type earns a box, and the box carries no shadow, no fill colour of its own and no uniform radius.

## Components

### Buttons — the Chalk Box
- **Shape:** a hand-drawn rectangle, corners never quite meeting (`{rounded.drawn-box}`), 1.5px `--rule-strong` outline, transparent fill.
- **Primary (`boxed`):** bone chalk text, 600, 0.9rem, `+0.015em`, `0.62rem 1.35rem` (tightening to `0.55rem 1.05rem` / 0.85rem under 420px).
- **Hover / Focus:** a second outline is traced slightly off — an ochre 1.5px box inset `-3px -4px -4px -3px`, rotated `-0.35deg`, faded up to 0.85 opacity over 200ms. This is what a hand actually does when it re-boxes a result. The base outline does not change.
- **Quiet (`boxed--quiet`):** soft chalk text at 500, `--rule-mid` outline, `0.4rem 0.9rem`. Used for the nav CTA, the caption link under the pinned photograph, and the thesis button.
- **Never:** filled, pill-shaped, coloured, or shadowed.

### Navigation — the Index
The line of section titles a lecturer writes across the top of the board, not a nav bar sitting on the page. Sticky, deep slate with its own dust grain, `--rule-mid` bottom hairline. Each link is soft chalk at 0.82rem/500, with a 1.5px transparent bottom border reserved so the active state adds no layout shift. Hover lifts the text to bone and the border to `--rule-mid`; the current section lifts the text to bone and the border to ochre. Under 900px the list becomes one horizontally scrolling row with a masked right edge and a hidden scrollbar. Scroll spy drives `.is-here` from an IntersectionObserver, not from scroll arithmetic. The reading page carries the same index, its links pointing back into the homepage's anchors — one nav for the world, not one per page.

### Cards / Containers — the Sheet
- **Corner Style:** none. There is no card.
- **Background:** a full-bleed scrim at 0.66–0.74 alpha, soft-edged on all four sides. At 0.8 across the shell it covered 89% of the page width and buried the board it is supposed to sit on; the shipped alphas keep body copy above 6.4:1 while the writing still reads through as the residue of yesterday's lecture.
- **Border:** the section head only — a `--rule-mid` hairline under a baseline-aligned grid of expanded uppercase title and right-aligned tally. Under 700px the tally drops to its own full-width row.
- **Internal Padding:** none. Sheets are spaced, not padded.

### Lists — the Ledger Line
Project and resource entries are one ruled fact line: an ochre drawn bullet at the left, the title, a dotted leader (`repeating-linear-gradient` of `--rule-mid`, 2px on / 5px off) that expands to fill the row, then the documents it opens as small tracked blue links — all sitting on one `--rule` hairline. The leader is suppressed under 700px, where the row wraps instead. Eight short titles down one full-width column left a very long rule under a very short link, so the resource list runs two columns until 700px.

### Disclosure — the Module
A full-width borderless button in body chalk with a drawn `+/−` at the right; hover lifts to bone and travels `0.45rem` right. The open state rotates the vertical stroke to horizontal and fades it, and the panel opens with `grid-template-rows: 0fr → 1fr` (260ms closing, 420ms opening) rather than a measured `max-height` — nothing to measure, nothing to go stale on reflow, and it opens to its true height instead of a number JS guessed. The grid item carries no padding of its own: with `border-box`, a `0fr` row still reserves the item's padding, leaving a 16px seam under every closed module, so the spacing lives inside the clipped child. References then write in one by one at 55ms intervals with the same device as the rest of the page.

### Disclosure — the Note (Read surface)
The same device, one size up, at reading scale. A note is a ruled entry, not a card: a `--rule` hairline at the bottom (and a second on the first child, so the set is closed top and bottom) with no background, no border and no radius. The title is the headline clamp in body chalk, lifting to bone on hover with the same `0.45rem` travel; the drawn `+/−` is 18px instead of 13px. The body opens on `grid-template-rows: 0fr → 1fr` at 280ms closing / 480ms opening — slower than a module because there is far more to arrive — and each direct child writes across at 460ms on a 46ms stagger capped at 15 items. The read time and subject sit in the header, above the fold of the collapsed row, so a reader chooses a note without opening it.

### Mathematics on the Board (Read surface)
- **Display equation:** set off by space (`2rem` above and below) and a single 1px `--rule-mid` hairline at the left, `1.5rem` of indent, bone chalk, scrolling inside its own rule. MathJax centres a display container by default; here it is forced back to `text-align: left` with `margin-left: 0`, because a centred equation against a left-ranged measure and a left hairline reads as a detached float rather than as part of the argument.
- **Theorem:** the same equation block given the drawn box — 1.5px `--rule-mid`, `{rounded.drawn-theorem}`, a `rgba(31, 37, 33, 0.34)` wash, `1.5rem`–`2rem` of padding. Under 700px it flattens to a uniform `1rem`.
- **Pinned diagram:** an authored figure whose inks are `#111827` and `#1f4db8` — drawn for a white page and invisible on slate. It is pinned up as the print it is: a bone-chalk `#EFEAD9` paper panel with a 1px `--rule-mid` frame, `1.5rem` of padding, scrolling horizontally. The drawing is preserved exactly and the note file is never touched. This is the single place in the world where a light surface is allowed on the board, and it is allowed because it is *paper*, not a card.
- **Note section heads:** a bone uppercase title at `--t-title` over a `--rule` hairline; subsections in ochre at `--t-ui`, uppercase, no rule. The closing "impact" paragraph is bone at 500 over a `--rule-mid` top hairline — a conclusion is ruled off, not boxed.

### The Colophon Mark — `.qed`
A filled bone-chalk rectangle, `0.66rem × 0.82rem`, 0.8 opacity, rotated `-1.4deg`, sitting at the far right of the colophon's flex row on both surfaces. It writes itself in with `clip-path: inset(0 100% 0 0) → inset(0)` over 520ms after a 260ms delay when the colophon comes into view. It is the page's last mark, and the chalk plane is stopped above the colophon precisely so nothing runs through it.

### Signature Component — the Chalk Plane
The background of the whole work region is a generated plane of Alejandro's own mathematics — the thesis, the completed modules, the BPZ calculation in the masthead photograph — set in Caveat at 27–48% ink, each line carrying its own deterministically jittered weight, size and sub-degree tilt so it reads as accumulated writing rather than rendered text. Bands are emitted roughly one per 400px of measured region height (5–56 bands), alternating left / right / centre rows and offsetting each cycle so the same lines never stack. A small deterministic fraction of lines are blue or ochre — the lecturer reaching for the other two sticks in the tray. Each line is written by the scroll itself: `clip-path` opens left-to-right across a 0.3vh band, with a bright 12px leading stroke and the dust that trails it. Offsets are measured once per layout and the scroll handler performs zero layout reads, because a per-frame `getBoundingClientRect()` across ~50 chalk lines is ~50 forced reflows per frame; the shipped engine measures a median of 16.7ms and a p95 of 16.7ms, with zero frames over 33ms. On the reading page the plane is rebuilt 560ms after a note opens or closes, because an opened note changes the region's height by thousands of pixels.

### Named Rules

**The One Motion Device Rule.** Everything in this world arrives by `clip-path`, in two orientations: `.writes-across` (`inset(-10% 100% -10% 0)` → `inset(-10% 0 -10% 0)`) for single-line things, `.writes-down` (`inset(0 0 102% 0)` → `inset(0 0 -2% 0)`) for wrapped prose. A left-to-right wipe across wrapped text uncovers every line's left edge at once and reads like a curtain rather than a hand — so the orientation is chosen by the shape of the text, not by taste. **No opacity fade exists anywhere.** Timing is `--write` 620ms / `--write-fast` 360ms on `--ease-chalk` `cubic-bezier(0.16, 1, 0.3, 1)`: chalk arrives fast and settles long.

**The Every Line Finishes Rule.** A scroll-written line normally completes when it has risen to 0.6vh from the top of the viewport. For lines near the foot that point sits past the furthest anyone can scroll, so the window is clamped to the last reachable scroll position (`docMax`, cached at measure time, never read in a frame). Without the clamp the final formulas stay half-written forever with the chalk edge frozen mid-stroke.

**The Armed Entrance Rule.** Any first-paint-hidden state is keyed on a `.js` class set synchronously in `<head>`, paired with a 3s failsafe that removes it if the script never boots. Both surfaces carry both halves; without them, a script failure leaves the page permanently blank.

**The Containers Carry No Ink Rule.** Only leaves (`p`, `li`, `h3`, `.module-item`, a note body's direct children) are armed and staggered; wrappers arrive without ceremony. Stagger is 70ms per tier capped at 8 tiers and 42ms per leaf capped at 16 leaves, after a 150ms lead; inside an opened note it is 46ms per child capped at 15.

**The Note Is Restyled, Not Rewritten Rule.** Injected note fragments keep their authored `.blog-*` class names; `board.css` restyles them. Two DOM moves happen at load in `prepareNotes()` and neither edits a note's words: the body is wrapped in a generated `.blog-body` so the `0fr` row has exactly one child to clip and the note's own spacing can never prop the collapsed row open, and `.blog-meta` is lifted out of the body into the header so it can be read while the note is closed. A note author writes plain sectioned HTML and never needs to know `board.css` exists.

**The Reduce Don't Erase Rule.** Under `prefers-reduced-motion`, travel, scroll-linked writing and staggered choreography go; colour, the chalk plane, the `.qed` and the board itself stay. The formulas are simply already written — the way a board looks when you walk into the room after the class.

## Do's and Don'ts

### Do:
- **Do** join the world by loading `board.css` and `chalkboard.js`; a new surface is a new mode of the same board, not a new stylesheet.
- **Do** build hierarchy from full-measure hairline rules, indentation, scale and case.
- **Do** draw every rule and border as bone chalk at low alpha (`--rule` / `--rule-mid` / `--rule-strong`).
- **Do** reserve ochre for what is live or currently addressed, and blue for anything that opens.
- **Do** size everything below the display clamps from the six named type steps.
- **Do** verify contrast against the shipped render with pseudo-elements intact, using the worst background patch under each text run.
- **Do** span scrims the full viewport width with `vw`-based stops and fade all four edges.
- **Do** wipe the board behind a heading that lands on bright chalk, rather than plating it.
- **Do** grade every photograph into the room's light before it goes on the board, and frame a shared photograph on a different panel per surface so two pages read as one room.
- **Do** let rendered mathematics inherit its colour, and range display equations left with their rule.
- **Do** use `clip-path` for arrival, in whichever of the two orientations the text's shape calls for.
- **Do** open disclosures with `grid-template-rows: 0fr → 1fr` and keep the grid item's padding on a single generated child.
- **Do** restyle authored content classes rather than rewriting the content.
- **Do** measure scroll-linked offsets once per layout, so the scroll handler performs zero layout reads.
- **Do** clamp any scroll-linked animation window to the last reachable scroll position.
- **Do** pair any first-paint-hidden state with a boot failsafe that reveals it if the script dies.

### Don't:
- **Don't** add a `box-shadow` or a `text-shadow` — this world has neither, at any elevation.
- **Don't** put a card, panel or glass surface on the board; a soft-edged panel is still a panel. A theorem's drawn box and a pinned paper print are the two shipped exceptions and neither generalises.
- **Don't** apply a uniform `border-radius` to a container. The only radii are the four asymmetric drawn-corner values.
- **Don't** use `--chalk-faint` for any text run; it is ~3.4:1 on the slate and is reserved for rules and nav chrome.
- **Don't** take the ground toward black, make chalk emissive, introduce a saturated green, or set interface text in a monospace face — that is the terminal console, and the console is the anti-reference.
- **Don't** introduce a third type family, or a seventh small type step.
- **Don't** set a label, kicker or eyebrow above a title. A tagline goes beneath the thing it describes.
- **Don't** animate anything with an opacity fade; there is not one in this world, and adding one breaks the single motion grammar.
- **Don't** let a wide block widen the page; scroll it inside its own rule.
- **Don't** call `getBoundingClientRect()` inside a scroll or `requestAnimationFrame` handler.
- **Don't** open a disclosure with a JS-measured `max-height`.
- **Don't** use a `•` or `∎` glyph or an icon font; bullets, markers and the tombstone are drawn, and brand marks are real SVG.
- **Don't** recolour or edit an authored note fragment to make it fit the board; pin it, wrap it, or restyle its classes.
- **Don't** re-activate `style.css` or `vectorfield.js` on any page. They are orphaned, not a second world to borrow from.

---

<!--
RECORDING NOTES — provenance, not guidance.

Rasters: no rasters were generated in the sessions that produced this system. Both
images in use are pre-existing, user-supplied assets — bpzcalc.jpg (Alejandro's own
photographed chalkboard, source of the slate sample and of the masthead board top on
both surfaces, framed `center 26%` on the homepage and `22% 34%` on the reading page)
and whiteboard.png (the user at a whiteboard, graded into the room's light).

Orphaned files: style.css and vectorfield.js are in the repository and no page loads
either one. auctiva.html was deleted from the site at the user's request; the reading
page moved into Hörsaal; tim-posts/*.html are head-less fragments that never loaded a
stylesheet of their own. This is recorded as the shipped state. It is not a deletion
recommendation, and the neumorphic tokens that were carried in an earlier revision of
this file are dropped because no surface uses them.

Capture caveat: thinking-in-measures.html fetches its notes and typesets 144 MathJax
containers, so it paints late. A screenshot taken on the homepage's timing shows the
hero photograph as flat slate and reads as a broken background; it is not. With roughly
2.5s more, the band renders correctly. Anyone verifying this page needs the longer wait.

Review: the mechanical detector returns [] across board.css, index.html, chalkboard.js
and thinking-in-measures.html, but runs DEGRADED — regex fallback, no computed contrast
— so its clean result is an undercount, not a guarantee. Three narrow suppressions live
in .impeccable/config.json with reasons: design-system-color #000 (mask alpha, not a
colour) and design-system-radius 4px / 6px (sub-values of the asymmetric drawn-corner
shorthands).

Contract gap: the homepage's OWN-WORLD block states "no radius." The build ships four
asymmetric hand-drawn corner values. The build wins; the intent behind the line survives
as "no rounded container," which the build does honour. The reading page's OWN-WORLD
block states inheritance "without exception" and the build honours it exactly — every
token, rule and motion on that surface comes from the same file.

Not canonized: the inline `onclick="toggleModule(this)"` / `onclick="toggleBlog(this)"`
handlers and the globals `window.toggleModule` / `window.toggleBlog` they bind to; and
`ul.project-list br { display: none; }`, a stylesheet patch over authored markup rather
than a form rule. Both are shipped implementation the build carries, not system rules
for future surfaces to inherit.
-->
