# Thinking in Measures: reading surface

The reading page shares the homepage's new light stochastic world, with separate illustration, grid, path, density, and particle planes. Four further depth planes live in the fixed margins. The world is masked away from the title and reading column. Each article sits on stable opaque pale paper, with dark blue equations and local horizontal scrolling for wide mathematical displays.

The page keeps its original title, tagline, thesis, mathematical statements, note content, outbound links, and original note files. An additive Thesis/Notes jump row gives readers local wayfinding. The quiet path study beside the introduction is decorative, not a research plot. The mobile introduction and artwork stack independently of the desktop layout.

The previous loader could miss MathJax's first pass when note fetching and mathematical startup raced. The reader now exposes one note-fetch promise and waits for it before MathJax's default initial typesetting. MathJax loads asynchronously so its CDN cannot block DOMContentLoaded. All notes are typeset once in that coordinated startup pass. Opening a note changes disclosure state and refreshes geometry through the existing toggle handler; it does not reprocess unchanged mathematical source. Collapsed note content is inert and marked aria-hidden until opened.

An intermediate QA run found that calling typesetPromise again on opened, already typeset content doubled equation containers. That open-time call was removed. The final repeated-opening and resize checks supersede the intermediate implementation; its initial 144-container count alone was insufficient validation.

Focused post-fix browser verification passed 21 sampled states: three open/close cycles for each of the three notes, followed by resizing an open note through 390px, 760px, and 1440px widths after fonts settled. Total equation containers remained 144 throughout; note counts remained 37/40/58. Collapsed notes returned to height zero and inert state. No JavaScript errors or document-width overflow occurred. Evidence: review/math-idempotence/results.json. These checks use headless Chrome with native pointer lock and capture disabled; they do not claim physical-phone testing.

Without JavaScript, the original note files remain directly linked. The same links survive fetch failure, with an honest error message. The document has no hidden first-paint text or dependency on scroll reveals for reading.

Validation at authoring: the complete thesis section matches HEAD after normalizing whitespace and removing the added data-sc-act attribute. Git reports no changes under tim-posts. All nine requested hero/global depth values are present. Final shared-asset, browser, MathJax, keyboard, phone and reduced-motion evidence is recorded by the root QA pass; static comparison is not a claim of those checks.
