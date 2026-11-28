# INDICE Platform microsite

A pre-rendered HTML/CSS/JavaScript site that presents the INDICE Platform. No backend and no deployment configuration. All content is in the HTML and stays readable without JavaScript.

The site has two pages:

| Page | What it is | Rendered by |
|---|---|---|
| `index.html` | The homepage: the three pillars of the platform | `scripts/render-home.js` |
| `cases-reference.html` | The Cases technical reference, generated from `cases-product.md` | `scripts/render-cases-reference.js` |

## Run and verify

Open `index.html` directly, or run `python -m http.server 8080` and visit `http://localhost:8080`.

```sh
npm install     # once; marked is the only dependency, used for the Cases reference
npm run build   # regenerate both pages and the generated logos
npm run check   # script syntax, ids, anchors, ARIA references and local files
npm test        # content and structure tests
```

Node 22.12 or newer is recommended. The generated pages are committed, and `npm test` fails if they are out of date, so run `npm run build` after every edit to `scripts/` or `cases-product.md`.

## What the homepage says

The page is organised around the three pillars. Each is linked from the hero and is a numbered chapter.

1. **Platform Foundation**: the Indice open-source libraries and engineering expertise, then what the foundation gives a team (start small and scale, deploy anywhere, choice of data store, OpenTelemetry, .NET and Angular) and the best practices built into the libraries, in groups.
2. **Platform Suite**: the six products, Agents, Cases, IAM, Messaging, Risk and Workers. Each has a card and an entry with what it does, its highlights, what it is built with and three screens.
3. **Platform Services**: the offer beside Plate II (the products stacked on the foundation), then the five services (software development, integration, DevOps, ongoing support and fintech experience), each with what it gives, and the path an engagement follows (consult, design, build, launch, operate). DevOps is set across the full row, with a column each for cloud, release management and monitoring.

Questions and Contact follow. Questions is not a list of quick answers: it is four questions a decision turns on, each with the answer in one line, the reasoning and a link to the part of the page that shows it. The hero headline is about what a client can build, not about the technology.

The page does not describe the pillars as mortar, bricks and a builder; that analogy was removed, and a test keeps it out.

## Editing the content

All copy lives in `scripts/content.js`, in page order: `hero`, `foundation`, `plate`, `suite`, `products`, `services`, `faq`, `contact`, `footer` and the interface labels in `ui`. Edit it and run `npm run build`.

- **Products** are listed in page order. A product has a `tagline` and `action` (its card), a `summary`, a `does` list and `features` (its entry), a `stack` and `screens`. Layouts, the Contents list, the ticker and Plate I are generated from this list.
- **Technical summary:** entries leave out implementation detail, with one exception. IAM is a security product, so it has a `technical` list ("Security in detail": standards, grant types, sessions, rate limiting, passwords, keys, extension points). Text between backticks in it is set as code. Give another product a `technical` list and it is rendered the same way.
- **Services** are in `services`: the offer (`intro`), Plate II (`plate`), the five `items` and the `process` steps. A service has a `tagline`, a `text` and, under a `pointsLabel`, either a list of `points` (set beside the text) or `groups` of points (set across the row; DevOps uses this). Every point repeats something the foundation or a product document already states, or a practice the team names as its own. Software development names no technology. The chapter gives no figures, client names or support terms, because no source gives them; add them here when they are confirmed.
- **Questions** are in `faq`. The chapter has no title, only its "Questions" label; add a `title` to `faq` to give it one. Keep the questions few and long: a question has `q`, the answer in one line (`short`), two or more `paragraphs` and a `see` link (`href`, `label`) to the chapter or entry that shows it.
- **Sources:** product facts come from the product documents in `Indice.Platform/docs/*-Product.md`. Features the documents mark "next release" are left out.
- **Technical details** links are enabled only for products with a `destination`. Today that is Cases; the other products show the link disabled.
- **Demo buttons** (`data-demo`) are deliberately unwired until the demo request flow is decided.
- **Cases technical reference:** edit `cases-product.md` and rebuild. The short "For developers" chapter heading is left out of the page; its chapters follow straight after chapter 3.

## Files

- `scripts/content.js`: all copy.
- `scripts/shared.js`: the page head, theme bootstrap, logos, icons, screens, the screen viewer and the fixed controls.
- `scripts/render-home.js`, `scripts/render-cases-reference.js`: the two page templates.
- `scripts/cases-article.js`: parses `cases-product.md` into the reference article and its contents list.
- `scripts/build.js`, `scripts/check.js`: build and structural checks.
- `css/common.css`: shared components and the cascade-layer order (`reset`, `common`, `page`). `css/site.css`: the design. `css/cases-reference.css`: the reference article.
- `js/common.js`: theme, reading progress, back to top, reveals, dialogs, screen galleries and the screen viewer. `js/plate.js`: pointer repulsion for Plate I. `js/cases-article.js`: contents highlighting, chapter links and Mermaid diagrams (Mermaid 11.12.1 from jsDelivr; without JavaScript or network access the diagram source stays readable).
- `assets/logos/`: supplied artwork, copied intact. Agents uses the supplied Dex logo and icon. `assets/logos/on-dark/` is generated by the build: only the neutral wordmark colours are lightened.
- `assets/logos/on-light/agents-logo.svg`: also generated. The supplied Dex logo reads "Dex, Knowledge assistant"; Agents is more than that, so the site shows a copy without the second line, with the name centred on the icon. Remove `logoDescriptor: false` from Agents in `scripts/content.js` to show the supplied logo as it is, or replace `dex logo.svg` when a new logo is drawn.
- `assets/uis/<product>/`: the supplied screenshots, three per product.
- `assets/fonts/`: Manrope and JetBrains Mono with their SIL OFL licences.
- `assets/og-image.png`: the link preview image (Open Graph and Twitter tags), 1200 × 630: Plate I on the dark theme, kept to a centred circle so a square crop still shows all of it. It is a screenshot and is not regenerated by the build, so capture it again when the products change. The site address used for the tags is `site.url` in `scripts/content.js`. Messaging apps cache previews, so give a replaced image a new name or add a query string such as `?v=2` to it.

## Design notes

- Dark by default, with a light theme. The visitor's choice is stored in `localStorage` under `indice-platform-theme` and applied by an inline script before styles load. Tokens use `light-dark()`.
- Motion (reveals, parallax, the ticker, Plate I) is skipped for `prefers-reduced-motion`.
- The masthead tightens once the page has scrolled. Its bottom margin grows by what its padding loses, so the page keeps its height; without that the browser's scroll anchoring makes the masthead flicker near the top.
- Hover bars (practice groups, product cards, services, questions) start at the left edge of their cell, in every column, and run its full width on hover. The meter beside each product entry fills as its sticky aside travels down the entry's text.
- Plate II is drawn from the product list: one block per product, placed from the bottom in rows of two and three, on a slab that stands for the foundation. The next place is the client's product; its block hangs above its place, and sits in it when motion is reduced.
- In Questions the question stays in view (sticky) while its answer is read; below 900px the two stack.
- Screen libraries scroll towards the pointer near either edge; arrow buttons page through them, and touch screens swipe and snap. Selecting a screen opens a viewer that pages through that product's screens.
- A deployment needs `index.html`, `cases-reference.html`, `css/`, `js/` and `assets/`.

## Unused supplied assets

These were used by earlier design versions and are not referenced by the site: `assets/logos/clients-logos/`, `assets/logos/technologies/`, `assets/logos/INDICE_slashes.svg`, `assets/logos/indice top.svg`, `assets/logos/indice platform white.svg`, the Space Grotesk font and the three `assets/uis/* dashboard.png` files.
