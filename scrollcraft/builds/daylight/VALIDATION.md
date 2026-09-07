# Daylight validation

2026-09-07. Local homepage preview: `http://127.0.0.1:4519/`.

The redesigned homepage passed the local visual and functional checks described below. The user also requested commit and push; repository publication is handled separately from this browser evidence.

## Browser coverage

Installed Google Chrome, driven headlessly by build-local Playwright. Native pointer lock and pointer capture were disabled before navigation in every context.

| Context | Viewport | Result |
| --- | --- | --- |
| Desktop | 1440 x 1000 | No document horizontal overflow, broken loaded images, script exceptions, console errors, or failed resource requests |
| Phone | 390 x 844 | Same |
| Compact phone | 360 x 800 | Same |
| Short phone | 360 x 640 | Same |
| Reduced motion desktop | 1440 x 1000 | Same; background/orbit transforms disabled and portrait's static placement preserved |
| Reduced motion phone | 390 x 844 | Same; composition and controls remain usable |
| JavaScript disabled | 390 x 844 | Same; all 42 reference lists visible, original links and text present, scripted New path button hidden |

These are browser viewport tests, not tests on a physical iPhone or Android device.

## Interactions and visual review

- All five section navigation links landed below the sticky header at every JavaScript-enabled viewport. No missing in-page anchor targets were found.
- A focused rerun checked 26 consecutive keyboard stops on desktop and phone after native scrolling settled. Each focused control was visible with a 3px focus outline; no invisible focused controls were found in those samples.
- The first, middle and last literature disclosures opened by pointer and closed by keyboard on desktop and phone. `aria-expanded` changed correctly and the closed reference region measured zero height after its transition.
- New path worked by keyboard in every JavaScript-enabled context, including reduced motion. The actual SVG path and captured pixels changed; its live status reported the newly drawn path. Reduced motion completed the change without the drawing animation.
- Desktop pointer screenshots showed changed pixels and independent portrait displacement. Scroll samples recorded different background, portrait and orbit transforms. Phone portrait movement is intentionally reduced, and its path reveals as the actual sketch comes into view.
- A final settled navigation check went from Recommended Literature back to home: `scrollY = 0`, no stale active section, and exactly one `ScrollCraft.instances` entry on both desktop and phone.
- Desktop, phone and reduced-motion contact sheets were visually inspected, together with opening frames, the mobile portrait composition, before/after path screenshots, final contact frames and no-JavaScript references. The title is intact, the portrait remains complete, real content is readable, and the contact ending holds on screen.

## Scroll Craft harness

The stock `shoot.mjs` and vendored engine files were not edited by QA. Final v2 passes produced 33 desktop, 35 phone and 33 reduced-motion section samples. All samples settled, and the harness reported no dead scroll.

This page uses ordinary document flow with no scrub video or fading copy cues. Consequently the harness's video/cue checks are not evidence of video playback or text contrast. Separate rendered contrast sampling was performed below.

The first desktop run incorrectly treated the offscreen, ordinary-flow hero as a persistent custom fixed stage because page-local code published `data-sc-verify-state`. That telemetry was removed, and the v2 runs resolve the resulting false dead-scroll reports. Original evidence is preserved in `review/scroll-desktop-v1/`.

## Rendered contrast

`qa-contrast.mjs` sampled backgrounds from actual desktop and phone screenshots with the text hidden, using text-node line bounds and size-aware contrast thresholds. It excluded `aria-hidden` graphical plus signs from text samples. The final pass covered 168 visible text samples across the six sections with no failures. The minimum sampled ratio was 4.51:1.

Two real initial findings were corrected: the small path label measured 4.08:1 and the phone EPFL address 4.39:1. The corrected measurements were 6.39:1 and 6.25:1 respectively. Initial module-label flags were traced to the sampler including the plus-icon's graphical strokes; true text-node bounds fixed that test geometry.

This is sampled evidence, not an accessibility certification or a measurement of every word, hover state and scroll pixel. Faint background mathematics is decorative and was not graded as reading content.

## Existing unavailable documents

The same 13 original PDF targets returned 404 before and after this design change. No new unavailable local link targets were found. The unchanged targets are listed in `qa/BASELINE.md` and in the baseline/final JSON reports. They include the existing Master's Thesis link and several older notes. QA did not replace or invent missing academic documents.

## Preview isolation

The local preview binds only `127.0.0.1`. Plain and URL-encoded `.env` requests returned 403, as did `.git`, `.codex`, dependencies and root build tooling. Public `assets/scrollcraft/` engine resources load successfully. This establishes the behavior of this preview server, not a remote host's configuration.

## Review impressions against the brief

The daylight image and paper portrait provide the intended warmer introduction. The operable random path supplies the playful moment. The original biography remains long on phone because the substantive writing was retained. Projects read as an organized document register, academic content stays deliberately dense, disclosures make the bibliography easier to browse, and the contact line gives a clear ending.

The introductory composition is the visual peak. The academic/reference sections naturally occupy more scroll distance because their actual content was preserved, as recorded in BRIEF.md. This was a brief-informed composition review, not a blind visitor test.

## Evidence and reproduction

All generated browser evidence is local and gitignored under `review/`:

- `baseline/`: original desktop/phone screenshots and original local-link results.
- `final-v1/`: seven-context functional matrix, opening/section/closing screenshots, pointer and New path pixel evidence.
- `scroll-desktop-v2/`, `scroll-phone-v2/`, `scroll-reduced-v2/`: final stock contact sheets and scroll reports.
- `contrast-v2/`: final rendered contrast samples and background screenshots.
- `focused-v2/`: settled keyboard, disclosure, engine and actual CSS scroll-property checks.
- `nav-final/`: final source opening screenshots and fully settled return-to-home checks.
- `semantic-final/`: final caption-layout spot-check, desktop/phone opening and portrait screenshots, and New path check after placing the experiment inside the figure's final caption.

The v1 custom pass sampled keyboard scrolling and disclosure closing before their transitions finished. `focused-v2` resolves those timing flags with settled measurements. `nav-final` resolves an additional fixed-wait snapshot taken while a long smooth scroll was still returning to the top. Final label/email color refinements are covered by `contrast-v2` and the `nav-final` opening screenshots; they do not change section geometry.

The final semantic caption change was checked separately: the caption is the figure's last child and contains the experiment, with no overflow or console exceptions. Desktop/phone hero heights remained 957/1509 pixels and the path areas measured 422.84/333.20 pixels wide. Opening and portrait screenshots were inspected with no incidental wrap. New path still updated the SVG and live status by keyboard in both contexts.

Run commands from `scrollcraft/builds/daylight/` after `npm.cmd ci`:

```powershell
node qa-server.mjs
```

In another terminal:

```powershell
node qa-final.mjs final-rerun
node qa-focused.mjs focused-rerun
node qa-contrast.mjs contrast-rerun
node qa-nav-final.mjs
$env:SCROLLCRAFT_FFMPEG = (Get-Command ffmpeg).Source
node ../../../.scroll-craft-source/plugins/nateherk-design/skills/scroll-craft/scripts/shoot.mjs --url http://127.0.0.1:4519/ --out review/scroll-rerun --width 1440 --height 1000
```

The last command uses the locally downloaded skill source. It is not part of the public website. Browser verification does not verify external destinations, academic PDF contents, a clean virtual machine, or remote deployment status.
