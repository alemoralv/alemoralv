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
  rule: "rgba(239, 234, 217, 0.20)"
  rule-mid: "rgba(239, 234, 217, 0.34)"
  rule-strong: "rgba(239, 234, 217, 0.58)"
  incumbent-bg: "#f0f0f3"
  incumbent-surface: "#ffffff"
  incumbent-primary: "#0073e6"
  incumbent-text: "#1a1a2e"
typography:
  display:
    fontFamily: "Archivo, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(2.4rem, 5.6vw, 4.1rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.022em"
    fontVariation: "'wdth' 104"
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
---

# Design System: Alejandro Morera Alvarez

> **Two worlds live in this repository.** Everything below documents **Hörsaal**, the system shipped by `index.html` + `board.css` + `chalkboard.js`. It is the current system and the one new surfaces inherit. A second, **incumbent** system — light neumorphic, defined in `style.css` + `vectorfield.js` — still serves `thinking-in-measures.html`, `auctiva.html` and `tim-posts/*.html`, untouched and by explicit scope. It is recorded here only so that neither world's tokens are ever applied to the other's pages. It is not deprecated and there is no migration plan.

## Overview

**Creative North Star: "Hörsaal"**

The page is not a site about a mathematician; it is his board. One continuous slate runs masthead to colophon, with yesterday's derivation ghosted behind today's argument. There is no card, no panel, no container and no shadow anywhere in this world. Hierarchy is built entirely from four devices: full-measure hairline rules, indentation, scale, and case. When something needs to be set apart, it gets a rule above it and a section address beside it — never a box around it.

The slate `#333C36` is sampled from `bpzcalc.jpg`, Alejandro's own photographed chalkboard, whose darkest chalk-free patches read `rgb(39,41,35)` — a warm olive-grey where red ≈ green > blue. The shipped value is that measurement deliberately lifted in lightness: a board in a lit room, not a screen in a dark one. That lift is the load-bearing decision of the whole palette. Near-black ground plus a saturated accent is the terminal console, and the console is the confirmed anti-reference. Emissive or glowing text, saturated green, and monospace type are all out of this world by decision.

Depth is material, not elevation. The slate carries a real dust grain, two eraser smudges, arcing wipe-bands, room light falling from the upper left, and the vignette of a surface that curves away at its edges — six fixed, cheap layers, none of them a gradient standing in for a material. Blur exists in this world, but only as chalk dust and as the soft edge of a scrim; it is never a drop shadow and never a glow. The one raster rule is that photographs are graded into the room's light before they are allowed on the board.

**Key Characteristics:**
- One continuous slate: no card, no panel, no container, no `box-shadow`, no `text-shadow`, no glass.
- Hierarchy from rules, indentation, scale and case only.
- Two type families total, no third: Archivo for every word of interface, Caveat for the board's residue.
- One motion device for the entire page: `clip-path`, in two orientations. No opacity fade exists anywhere.
- Chalk-tray palette: bone for text, blue for links, ochre for what is live — three sticks, nothing else.
- Every radius in the world is an asymmetric hand-drawn corner; there is no rounded container.

## Colors

A single lit-slate ground carrying a three-stick chalk tray: warm bone as the voice, blue chalk for anything you can open, ochre chalk for anything that is live or currently addressed.

### Primary
- **Blue Chalk** (`{colors.chalk-blue}`): every link, everywhere — masthead emails, project documents, note sets, the underline colour at 42% alpha, and the selection highlight at 30% alpha. Measured on the shipped render at 7.03:1 for a §2 document link and 7.05:1 for a §3 note link.
- **Ochre Chalk** (`{colors.chalk-ochre}`): the "live" stick. Section addresses (§1–§5), the active nav underline and its § number, the drawn list bullets, the `+/−` disclosure strokes, the uppercase email keys, §4 category headings, the focus ring, and the second traced outline on a hovered box. It is the only colour that ever marks state.

### Neutral
- **Lit Slate** (`{colors.board}`): the ground for the entire page, set on `html` so overscroll is board too.
- **Deep Slate** (`{colors.board-deep}`): the sticky index bar and the scrollbar track — the one recessed value in the world.
- **Board Lit** (`{colors.board-lit}`): the lightest slate step, held for board surface that catches more room light.
- **Bone Chalk** (`{colors.chalk}`): headings, the name, project titles, and every hover destination. 9.5:1 on open board; measured 10.15:1 on a §2 project title and 9.32:1 for ALEJANDRO over the photographed board (a 3:1 large-text floor).
- **Body Chalk** (`{colors.chalk-body}`): all running prose and list rows. Measured 7.87:1 in §1, 8.12:1 on the §5 lede, 8.22:1 on a §4 module row, 7.05:1 on the hero bio, 8.84:1 on the hero email values.
- **Soft Chalk** (`{colors.chalk-soft}`): secondary interface text — resting nav links, tallies, university tags, reference lines. Measured 5.39:1 on a nav link, 5.23:1 on a nav § number, 5.00:1 on a section tally.
- **Faint Chalk** (`{colors.chalk-faint}`): **non-text only.** ~3.4:1 on the slate. It is the §4 micro-dash and nav chrome, and it is never the colour of a text run.
- **Chalk Rules** (`{colors.rule}` / `{colors.rule-mid}` / `{colors.rule-strong}`): all three are bone chalk at 20% / 34% / 58% alpha. Every horizontal rule, every border, every leader dot in the system is one of these — the system has no border *colour*.

### Incumbent (style.css only — not Hörsaal)
- **Neumorphic Ground** (`{colors.incumbent-bg}`) with **White Surface** (`{colors.incumbent-surface}`), **Signal Blue** (`{colors.incumbent-primary}`) and **Ink** (`{colors.incumbent-text}`): the light world that still serves `thinking-in-measures.html`, `auctiva.html` and `tim-posts/*.html`. It uses 12/16/20px radii, 50px pill buttons, soft double shadows (`8px 8px 20px #d1d5db, -8px -8px 20px #ffffff`) and Inter. `style.css` remains its source of truth; these entries exist so the two worlds are never confused, not so Hörsaal can borrow from them.

### Named Rules

**The Three Sticks Rule.** The tray holds bone, blue and ochre. Blue means *you can open this*; ochre means *this is live or this is where you are*; bone is everything else. A fourth hue never enters the world, and neither accent is ever used decoratively.

**The No Border Colour Rule.** Borders and rules are chalk at low alpha, never a colour of their own. If a divider needs drawing, it is `--rule`, `--rule-mid` or `--rule-strong` — a hairline of chalk dust on slate, not a stroke of grey.

**The Measured-Render Rule.** Contrast in this world is verified against the shipped render — glyph extents, pseudo-elements intact, worst background patch under each text run — never computed from token pairs. The ground is a photograph under a soft-edged scrim; a token-pair calculation does not describe it. Body text clears 7:1 measured; secondary interface text clears 5:1; `--chalk-faint` clears neither and is barred from text.

**The Not-A-Console Rule.** Never take the ground below the shipped slate toward black, never make chalk emissive (no `text-shadow` glow, no saturated green), and never set interface text in a monospace face. The lift from `rgb(39,41,35)` to the shipped slate is the entire difference between a lecture hall and a terminal.

## Typography

**Display Font:** Archivo (variable, `wdth` 62–125 and `wght` 100–900), with `system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`
**Body Font:** Archivo — the same family, at the same optical sizing
**Hand Font:** Caveat (400/500/600), with `'Segoe Script', cursive` — the background chalk plane only, never interface text

**Character:** One grotesque carries every word a visitor reads, and its width axis does the work a second family would otherwise do: the name expands to `wdth` 104, section titles to 108, the wordmark to 112. Caveat is not a second voice — it is the board's residue, set behind the writing at 27–48% ink, and it never carries information the visitor is required to read.

### Hierarchy
- **Display** (700, `clamp(2.4rem, 5.6vw, 4.1rem)`, 0.95, `wdth` 104, `-0.022em`): ALEJANDRO, once, on the photographed board. Tightens to `-0.028em` under 700px.
- **Headline** (700, `clamp(1.25rem, 2.1vw, 1.8rem)`, 1.2, `wdth` 108, `+0.035em`, uppercase): section titles. Expanded, tracked out and capitalised because a board title is drawn large, not weighted heavy.
- **Title** (600, 1.02rem, 1.5): project and resource entry names, set in bone chalk.
- **Body** (400, 1.0625rem, 1.75; drops to 1rem under 700px): all prose, capped at a 66ch measure; the hero bio at 58ch, 1.72.
- **Label** (500–600, 0.68–0.78rem, `+0.07em` to `+0.14em`, uppercase): the ochre email keys, §4 category headings, section tallies, university tags. Tracking scales with smallness.
- **Chalk Hand** (Caveat 400, 1.5–2.9rem generated, 1.35): the background formula plane. Drops to a fixed 1.15rem under 700px, where the widest display equations are removed entirely rather than allowed to run off the board.

### Named Rules

**The Two Families Rule.** Archivo and Caveat. There is no third face, and Inter — the incumbent world's face — is deliberately absent from Hörsaal. If a new surface seems to need another family, it needs the width axis instead.

**The Width-Before-Weight Rule.** Emphasis at large sizes comes from the `wdth` axis and from case, not from stacking weight. Above ~1.25rem, expand and capitalise before reaching past 700.

**The Tabular Rule.** `font-variant-numeric: tabular-nums` is set globally. Counts, tallies and section numbers line up down the page because this is a document of quantities.

## Layout

A single 1040px reading shell (`--shell`) centred with a fluid gutter of `clamp(1rem, 4vw, 2.5rem)`, and a 66ch text measure (`--measure`) inside it. Vertical rhythm runs on a 4px base through a nine-step scale (`--s-1` 0.25rem through `--s-9` 6rem); anything larger than a section's internal spacing is expressed as a viewport-aware clamp instead of a token — sections are separated by `clamp(5.5rem, 13vh, 10rem)`, the work region opens at `clamp(3rem, 9vh, 6.5rem)`.

The background chalk plane deliberately ignores the shell: it is `min(1840px, 99vw)` wide so the writing runs into the true margins and off the edges, which is what a board does. That contrast between a narrow reading shell and a full-width hand is the page's core spatial idea.

Multi-column blocks collapse in steps rather than at one breakpoint: §4's module lists run 3 columns, then 2 at 1080px, then 1 at 700px; §5's resource list runs 2 columns down to 700px; the masthead's 1.35fr / 0.9fr split becomes a single column at 900px. At 900px the five nav addresses stop wrapping into three stacked rows — which cost ~150px of an 844px viewport on every scroll — and become one horizontally scrolling line with a masked right edge. Anchors clear the sticky index via `scroll-padding-top: 6.5rem`.

### Named Rules

**The Full-Bleed Scrim Rule.** Every scrim spans the full viewport width using `left: calc(50% - 50vw); width: 100vw` with `vw`-based gradient stops, and fades out at both the left and right viewport edges as well as top and bottom via mask. A scrim drawn at shell width with a horizontal fade leaves a visible vertical seam down both sides of every section: a soft-edged panel is still a panel.

**The Open Board Rule.** The gaps between sections are open slate at full strength. Scrims belong to text runs, not to the page; scrim the whole column and you bury the board it sits on.

## Elevation & Depth

**This system has no shadows.** There is no `box-shadow` and no `text-shadow` anywhere in `board.css`. Depth is entirely material and tonal: the slate's six fixed layers (dust grain, two wipe-band gradients, two eraser smudges, upper-left room light) plus a separately painted vignette that makes the board curve away at its edges, the deep-slate recess of the sticky index, the soft-edged scrims that lift text off the photograph, and the colophon's board foot — a bright ledge catching light with the tray falling away into shadow beneath it, so the page ends rather than stops.

Blur is used, but never as elevation: 7px behind the display name to lift it off the densest chalk in the photograph, 2.5px on the advancing chalk edge as dust. Both are material effects on a two-dimensional surface. Nothing in this world is ever lifted off the board.

### Named Rules

**The Flat Board Rule.** Nothing floats. If an element needs separation, give it a rule, a scrim, or more space — never a shadow, never a glow, never a translucent glass panel.

**The Graded Photograph Rule.** A raster is admitted only after it is graded into the room's light. `whiteboard.png` runs `grayscale(0.72) contrast(1.1) brightness(0.8)` under a soft-light board-tinted overlay; `bpzcalc.jpg` runs `brightness(1.34) contrast(1.16) saturate(0.66)` and dissolves into the slate through a single mask, not a stack of gradient stops — stacked stops band visibly across a 500px ramp and read as two materials butted together instead of one board. An untreated daylight photograph at full saturation is a foreign object stuck to the slate.

## Shapes

The world is rectilinear and unrounded. The only radii that exist are three asymmetric, per-corner elliptical values that make a hand-drawn box's corners fail to meet — `{rounded.drawn-box}` on chalk-boxed links, `{rounded.drawn-box-trace}` on the second outline a hover traces slightly off-register, `{rounded.drawn-mark}` on the 40px social marks — plus a 1px softening on the focus ring. Everything else is a square corner or no corner at all.

Every line in the system is a hairline: 1px for rules and dividers, 1.5px for drawn strokes (box outlines, list bullets, the `+/−` toggle, the active nav underline). Markers are drawn, not glyphs: the list bullet is an ochre 1.05rem stroke rather than a `•`; the disclosure marker is two 1.5px chalk strokes, one of which is erased by rotating to horizontal and fading out.

### Named Rules

**The Drawn Corner Rule.** If something is boxed, its corners are asymmetric and never meet cleanly. A uniform `border-radius` on a container does not exist in this world at any value.

**The Hand Not The Glyph Rule.** Bullets, markers and rules are drawn with pseudo-elements and borders. Brand marks are the platforms' own SVGs; where no platform mark exists, one is drawn to match the set rather than substituted with a stock glyph.

## Components

### Buttons — the Chalk Box
- **Shape:** a hand-drawn rectangle, corners never quite meeting (`{rounded.drawn-box}`), 1.5px `--rule-strong` outline, transparent fill.
- **Primary (`boxed`):** bone chalk text, 600, 0.9rem, `+0.015em`, `0.62rem 1.35rem` (tightening to `0.55rem 1.05rem` / 0.85rem under 420px).
- **Hover / Focus:** a second outline is traced slightly off — an ochre 1.5px box inset `-3px -4px -4px -3px`, rotated `-0.35deg`, faded up to 0.85 opacity over 200ms. This is what a hand actually does when it re-boxes a result. The base outline does not change.
- **Quiet (`boxed--quiet`):** soft chalk text at 500, `--rule-mid` outline, `0.4rem 0.9rem`. Used for the nav CTA and the caption link under the pinned photograph.
- **Never:** filled, pill-shaped, coloured, or shadowed.

### Navigation — the Index
The line of section addresses a lecturer writes across the top of the board, not a nav bar sitting on the page. Sticky, deep slate with its own dust grain, `--rule-mid` bottom hairline. Each link is a `§n` number plus a name, soft chalk at 0.82rem/500, with a 1.5px transparent bottom border reserved so the active state adds no layout shift. Hover lifts the text to bone and the border to `--rule-mid`; the current section lifts the text to bone, the border to ochre, and the `§` number to ochre. Under 900px the list becomes one horizontally scrolling row with a masked right edge and a hidden scrollbar. Scroll spy drives `.is-here` from an IntersectionObserver, not from scroll arithmetic.

### Cards / Containers — the Sheet
- **Corner Style:** none. There is no card.
- **Background:** a full-bleed scrim at 0.66–0.68 alpha, soft-edged on all four sides. At 0.8 across the shell it covered 89% of the page width and buried the board it is supposed to sit on; 0.66 keeps body copy above 6.4:1 while the writing still reads through as the residue of yesterday's lecture.
- **Border:** the section head only — a `--rule-mid` hairline under a three-column baseline-aligned grid of ochre address, expanded uppercase title, and right-aligned tally. Under 700px the tally drops to its own full-width row.
- **Internal Padding:** none. Sheets are spaced, not padded.

### Lists — the Ledger Line
Project and resource entries are one ruled fact line: an ochre drawn bullet at the left, the title, a dotted leader (`repeating-linear-gradient` of `--rule-mid`, 2px on / 5px off) that expands to fill the row, then the documents it opens as small tracked blue links — all sitting on one `--rule` hairline. The leader is suppressed under 700px, where the row wraps instead. Eight short titles down one full-width column left a very long rule under a very short link, so the resource list runs two columns until 700px.

### Disclosure — the Module
A full-width borderless button in body chalk with a drawn `+/−` at the right; hover lifts to bone and travels `0.45rem` right. The open state rotates the vertical stroke to horizontal and fades it, and the panel opens with `grid-template-rows: 0fr → 1fr` (260ms closing, 420ms opening) rather than a measured `max-height` — nothing to measure, nothing to go stale on reflow, and it opens to its true height instead of a number JS guessed. The grid item carries no padding of its own: with `border-box`, a `0fr` row still reserves the item's padding, leaving a 16px seam under every closed module, so the spacing lives inside the clipped child. References then write in one by one at 55ms intervals with the same device as the rest of the page.

### Signature Component — the Chalk Plane
The background of the whole work region is a generated plane of Alejandro's own mathematics — the thesis, the completed modules, the BPZ calculation in the masthead photograph — set in Caveat at 27–48% ink, each line carrying its own deterministically jittered weight, size and sub-degree tilt so it reads as accumulated writing rather than rendered text. Bands are emitted roughly one per 400px of measured region height (5–56 bands), alternating left / right / centre rows and offsetting each cycle so the same lines never stack. A small deterministic fraction of lines are blue or ochre — the lecturer reaching for the other two sticks in the tray. Each line is written by the scroll itself: `clip-path` opens left-to-right across a 0.3vh band starting at 0.9vh from the bottom, with a bright 12px leading stroke and the dust that trails it. Offsets are measured once per layout and the scroll handler performs zero layout reads, because a per-frame `getBoundingClientRect()` across ~50 chalk lines is ~50 forced reflows per frame; the shipped engine measures a median of 16.7ms and a p95 of 16.7ms, with zero frames over 33ms.

### Named Rules

**The One Motion Device Rule.** Everything on this page arrives by `clip-path`, in two orientations: `.writes-across` (`inset(-10% 100% -10% 0)` → `inset(-10% 0 -10% 0)`) for single-line things, `.writes-down` (`inset(0 0 102% 0)` → `inset(0 0 -2% 0)`) for wrapped prose. A left-to-right wipe across wrapped text uncovers every line's left edge at once and reads like a curtain rather than a hand — so the orientation is chosen by the shape of the text, not by taste. **No opacity fade exists anywhere on this page.** Timing is `--write` 620ms / `--write-fast` 360ms on `--ease-chalk` `cubic-bezier(0.16, 1, 0.3, 1)`: chalk arrives fast and settles long.

**The Armed Entrance Rule.** Any first-paint-hidden state is keyed on a `.js` class set synchronously in `<head>`, paired with a 3s failsafe that removes it if the script never boots. Without both halves, a script failure leaves the page permanently blank.

**The Containers Carry No Ink Rule.** Only leaves (`p`, `li`, `h3`, `.module-item`) are armed and staggered; wrappers arrive without ceremony. Stagger is 70ms per tier capped at 8 tiers and 42ms per leaf capped at 16 leaves, after a 150ms lead.

**The Reduce Don't Erase Rule.** Under `prefers-reduced-motion`, travel, scroll-linked writing and staggered choreography go; colour, the chalk plane and the board itself stay. The formulas are simply already written — the way a board looks when you walk into the room after the class.

## Do's and Don'ts

### Do:
- **Do** build hierarchy from full-measure hairline rules, indentation, scale and case.
- **Do** draw every rule and border as bone chalk at low alpha (`--rule` / `--rule-mid` / `--rule-strong`).
- **Do** reserve ochre for what is live or currently addressed, and blue for anything that opens.
- **Do** verify contrast against the shipped render with pseudo-elements intact, using the worst background patch under each text run.
- **Do** span scrims the full viewport width with `vw`-based stops and fade all four edges.
- **Do** grade every photograph into the room's light before it goes on the board.
- **Do** use `clip-path` for arrival, in whichever of the two orientations the text's shape calls for.
- **Do** open disclosures with `grid-template-rows: 0fr → 1fr` and keep the grid item's padding on its child.
- **Do** measure scroll-linked offsets once per layout, so the scroll handler performs zero layout reads.
- **Do** pair any first-paint-hidden state with a boot failsafe that reveals it if the script dies.
- **Do** leave the incumbent light world in `style.css` and `vectorfield.js` exactly as it is when editing Hörsaal.

### Don't:
- **Don't** add a `box-shadow` or a `text-shadow` — this world has neither, at any elevation.
- **Don't** put a card, panel or glass surface on the board; a soft-edged panel is still a panel.
- **Don't** apply a uniform `border-radius` to a container. The only radii are the three asymmetric drawn-corner values.
- **Don't** use `--chalk-faint` for any text run; it is ~3.4:1 on the slate and is reserved for rules and nav chrome.
- **Don't** take the ground toward black, make chalk emissive, introduce a saturated green, or set interface text in a monospace face — that is the terminal console, and the console is the anti-reference.
- **Don't** introduce a third type family, and don't bring Inter (the incumbent world's face) into Hörsaal.
- **Don't** animate anything with an opacity fade; there is not one on the page, and adding one breaks the single motion grammar.
- **Don't** call `getBoundingClientRect()` inside a scroll or `requestAnimationFrame` handler.
- **Don't** open a disclosure with a JS-measured `max-height`.
- **Don't** use a `•` glyph or an icon font; bullets and markers are drawn strokes and brand marks are real SVG.
- **Don't** apply Hörsaal tokens to `thinking-in-measures.html`, `auctiva.html` or `tim-posts/*.html`, and don't apply `style.css`'s neumorphic tokens to `index.html`. The two worlds share nothing.

---

<!--
RECORDING NOTES — provenance, not guidance.

Rasters: no rasters were generated in the session that produced this system. Both
images in use are pre-existing, user-supplied assets — bpzcalc.jpg (Alejandro's own
photographed chalkboard, source of the slate sample and of the masthead board top)
and whiteboard.png (the user at a whiteboard, graded into the room's light).

Review: two finish-review rounds. Round 1 raised six material findings, all scored
resolved. Round 2 raised two regressions plus three contrast failures, all scored
resolved, disposition `ship` scoped to those eight fixes. The mechanical detector
returned [] but ran DEGRADED — regex fallback, no computed contrast — so its clean
result is an undercount and must not be read as a guarantee.

Contract gap: the direction contract's OWN-WORLD block states "no radius." The build
ships three asymmetric hand-drawn corner values on the boxed links and the social
marks. The build wins; the intent behind the line survives as "no rounded container,"
which the build does honour.

Not canonized: the inline `onclick="toggleModule(this)"` handlers and the global
`window.toggleModule` they bind to; and `ul.project-list br { display: none; }`, a
stylesheet patch over authored markup rather than a form rule. Both are shipped
implementation the build carries, not system rules for future surfaces to inherit.
-->
