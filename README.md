# INDICE Platform homepage

Responsive, buildless HTML/CSS/JavaScript. No runtime dependencies, external services, backend, or deployment configuration. `index.html` is pre-rendered so all substantive content and product presentations remain available without JavaScript.

## Run and verify

Open `index.html` directly, or run `python -m http.server 8080` and visit `http://localhost:8080`.

```sh
npm run build   # regenerate index.html after editing data or the template
npm run check   # syntax, copy, structure, assets, anchors and ARIA references
npm test        # scroll-story behavior tests with a mock DOM
```

No package installation is needed. Node 20 or newer is recommended for development checks.

## Editable sources

- `js/data.js`: approved copy, placeholder metrics, shared product IDs, assets, provisional colors, future product destinations and the deliberately empty demo action. Adding products here extends the generated grid, story, preview loop and navigation. Only the four supplied products are included.
- `scripts/render.js`: semantic page template and static/animated preview rendering. Run the build command after changing this file or data.
- `css/styles.css`: corporate tokens, layout, responsive alternatives, motion, floating bar and showcase styles. Main breakpoints are 1000px/720px for the enhanced story and 760px for the mobile bar.
- `js/main.js`: nonmodal navigation panel, anchor focus, active pillars and optional reveals.
- The main logo stays fixed at top-left: scrolling down shows `indice icon.svg`, scrolling up shows `indice top.svg`, and reaching the page top restores the main logo. The screen-level demo CTA is removed; the two in-content demo buttons retain their 12px corner radius.
- `js/hero-art.js`: both official hero slashes descend together over 3.8 seconds. Travel and perimeter tracing progress linearly together so the outlines do not appear to finish early as the artwork slows down. The outlines close on arrival, then fill grey and cycle grey, red and warm black. After both slashes land, fine-pointer cursor repulsion is enabled; touch and reduced motion stay static. The brand, heading, motto and pillar links enter in sequence. Pillar arrows sit beside their headlines and grow rightward to 3x size on hover or keyboard focus. CSS controls timing; this script manages artwork visibility and reduced motion.
- `js/foundation-art.js`: visible-only Foundation artwork float, cursor repulsion and reduced-motion handling. Float timing and per-layer movement are configured alongside the artwork styles in `css/styles.css`.
- `js/showcase.js`: shared state for native scrolling, grid links, local navigation, preview loop, resize and motion preference changes.
- `assets/logos/`: supplied SVGs copied intact, including `INDICE_slashes.svg`. The renderer inlines its original paths and viewBox for the hero, adding animation attributes without modifying the source asset. Hero strokes scale with the paths so normalized outline dashes cover the full perimeter at every responsive size.
- `assets/uis/`: approved dashboard screenshots for Cases, IAM and Messaging.
- `assets/fonts/`: self-hosted Manrope variable font and SIL Open Font License, obtained from the [Google Fonts Manrope source](https://github.com/google/fonts/tree/main/ofl/manrope).

The sticky desktop story uses a bounded native scroll area: panel introduction, panel transformation, then one reading segment per supplied product. Direct selection jumps to the matching segment and bypasses the introduction. Autoplay runs only while the introductory panel is visible, and pauses offscreen or when the tab is hidden. Animation play/pause controls are intentionally omitted throughout the page; automatic visibility handling and reduced-motion preferences remain supported. Mobile, short screens, reduced motion and missing sticky/inert support use static stacked presentations. The Services shortcut bypasses the visual sequence.

## Explicit placeholders and assumptions

- Cases, IAM and Messaging use their supplied dashboard screenshots. Risk still uses a neutral, labelled placeholder until an approved screenshot is available. Preview images are lazy-loaded.
- Approved chapter descriptions are missing. Each chapter uses its supplied product name and an explicit description placeholder. Product analyses informed factual understanding only.
- Metrics remain the supplied `[XX]` values; customer logos use the supplied approved placeholder label.
- Product pages do not exist. Explore buttons are disabled and described accessibly; menu entries are informational. Future URLs are centralized as `destination` fields.
- Both in-content demo buttons have normal button states and deliberately no business effect. Future wiring belongs in `config.demoAction`.
- The PDF's preferred secondary bare website wordmark was not supplied. The intact combined Platform lockup is used provisionally at a legible size. Replacement requires approved artwork.
- Corporate colors match the brand PDF. Product section backgrounds use verified primary icon colors from supplied SVGs provisionally; complete approved product palettes are still needed.
- Product SVGs retain original live-text font references (Commissioner, Geist, Manrope, IBM Plex Sans). Those product font files were not supplied; the original SVG fallback behavior is retained. Manrope is supplied locally for the page.
- The approved six-product suite wording is preserved while only Cases, IAM, Messaging and Risk are rendered. The obsolete carousel-placeholder instruction is superseded by the interactive showcase brief.

## Verification status

Build, JavaScript syntax, structural/content checks and 36 tests pass, including post-arrival slash repulsion and scroll-direction logo switching. Hero browser checks cover synchronized arrival/outline timing, staggered content, color changes, pillar arrow placement and 3x hover/focus growth, mobile overflow and reduced-motion visibility. Playback controls are absent; artwork and preview motion retain automatic visibility and reduced-motion handling. Full-page responsive screenshots and real-browser keyboard checks remain to be performed. The supplied brand PDF was rendered and visually inspected. Web reference pages were inspected as text; their live visual motion could not be reviewed.

No files were published or deployed.
