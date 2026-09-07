# Daylight notebook

2026-09-07. Authored implementation decisions based on the user's requested redesign; no additional interview. Existing personal writing and links are source content. This homepage update supersedes the dark visual direction in DESIGN.md, without changing the reading page's shared styles.

## Supplied direction and authored decisions

1. Vibe. User: "more professional for the background and stuff" and "more light and perhaps even a bit playful, seems too formal". Decision: bright, curious, lucid, personal. Cool white paper, blue ink, sunlit glass and pencil marks.
2. Journey. Preserve the existing order: introduction, About Me, Projects, Notes, Academic Background, Recommended Literature. Finish with a friendly contact line and existing copyright.
3. Energy. A welcoming, dimensional introduction, then a quiet reading rhythm; small interactions reward curiosity without adding scroll length.
4. Feeling and memorable moment. A real mathematician beside a line that takes a different random path when you ask it to. The portrait and the playful experiment share one frame.
5. Signature. An operable, keyboard-accessible "New path" control redraws a decorative random walk beside the portrait. Scroll reveals the drawing. It is explicitly a small experiment in chance, not research evidence.
6. Range. Light editorial with playful details. Preserve authentic academic substance; soften the formal presentation rather than rewriting the biography.
7. Structure. Distinct sections in natural document flow. No cinematic pinning or artificial scroll runway; visitors must be able to jump straight to any reference.
8. Assets. Keep the real whiteboard.png portrait untouched. Use the provided KIE_API_KEY locally for one custom photographic background. Do not upload personal assets. Retain mathematics from chalkboard.js as a faint pencil layer. Credentials never belong to the served page.

## Feeling curve (before the score)

- Introduction: curiosity and warmth, from daylight, a real portrait and an operable sketch.
- About: familiarity, from calm readable personal prose.
- Projects: confidence, from organized work and clear document links.
- Notes: invitation, from a more open, compact reference spread.
- Academic background: depth, from well-spaced columns and precise existing module labels.
- Literature: discovery, from opening real reading recommendations.
- Close: connection, from a short contact invitation beside the existing signature.

Peak: "The little line beside his photo takes a new route every time." The introduction owns the generated asset budget and the strongest visual composition. Its height is content-led, with no extra pinning. The existing long reference sections remain naturally longer because preserving their substance is more important than forcing cinematic peak proportions.

Tell-someone sentence: "It's the site where a mathematician's little sketch takes a different path every time."

Authored silence: the long academic/reference lists stay still while being read. Native scrolling through different content is not dead scroll.

## Grammar and fingerprint

Custom grammar: **research notebook**. Jumpable sticky table of contents, a dimensional portrait introduction, five original reference sections, and a contact colophon. The visitor alternates between browsing and reading. Explicit bans: video/pinning, horizontal content rails, repeated card grids, text fading under scroll, fabricated statistics, rewritten research claims.

The eight stock grammars do not fit the retained document: filmic and continuous-world prevent direct reference access; live-surface misrepresents a portfolio as software; chaptered-editorial bans this authentic photo introduction and sticky index; poster lacks the required real image; gallery flattens long prose into labels; split-stage falsely implies a comparison; rhythmic cutlist is too abrupt for academic reading.

Gate: the project-local registry is empty. No previous local fingerprint to collide with. This does not claim uniqueness against every public site.

## Scroll score

| Beat | Device | Purpose |
| --- | --- | --- |
| Introduction | Independent parallax planes + pointer response | Separate daylight plate, real portrait and fine sketch |
| About | Reveal of decorative section rule | Quiet arrival, all prose remains fully opaque |
| Projects | Static document register + link underline | Keep the substantial work immediately readable |
| Notes | Static inset paper with hover underline | Slow the rhythm for a short collection |
| Academic | Pencil notation written with scroll | Echo actual study subjects at the page margins |
| Literature | Native disclosure interaction | Reveal recommendations only when requested |
| Close | Static contact line | Resolve into a useful next action |

Four interaction families across the page: parallax, decorative reveal, scroll-written pencil notation, pointer/button response. No additional motion is imposed just to fill a kit quota.

## Layer contract

- Back: KIE photographic white atelier plate with side light, generous blank left/center, glass at the far right. Small scroll displacement, no pointer reaction.
- Middle: real DOM heading and biography on an opaque or near-opaque light reading surface. Never transformed for parallax.
- Subject: authentic portrait mounted on slightly rotated white paper, soft offset shadow and paper edge; subtle pointer response only on fine-pointer devices.
- Front: separate SVG orbit and randomized path, cropped to the portrait region on small screens. The contact anchor is the portrait mat.
- Mobile: independent portrait-oriented plate and compact one-column composition. Touch controls need at least 44px targets. Reduced motion keeps the composition without continuous animation; no JS keeps all authored content and links visible.

## Validation contract

Check 1440px desktop, 390px and 360px phones, reduced motion, no JS, keyboard, disclosures, nav anchors, console errors, resource failures, horizontal overflow, sampled rendered contrast, and initial/middle/exit scroll frames. Run the supplied Scroll Craft screenshot harness and inspect its contact sheet. Report inherited missing PDFs separately. The user subsequently requested commit and push after completion; publish the reviewed scope after verification.
