# AGENTS.md

Guidance for AI coding agents working in this repository.

## What this repo is

A personal portfolio site for Emily Xie, deployed via **GitHub Pages** at
`emilyxietty.github.io`. It is a **static site** — plain HTML, CSS, and
vanilla JS. There is no build step, no package manager, no Jekyll config.

## Layout

- `index.html` — main landing page (sidebar profile + About/Resume sections).
- `pages/` — sub-pages linked from sub-page navbars:
  `swift.html`, `tempo.html`, `tempoapp.html`, `debateresume.html`, `newtab.html`.
- `css/style.css` — primary stylesheet for `index.html`. The bottom of the
  file contains a "Light Blue Theme" block that redefines the original
  palette variables to light/cute equivalents; the cascade carries the new
  colors through every selector (including `::before` surface overlays).
- `js/script.js` — landing-page interactivity (sidebar toggle, page nav,
  testimonials modal).
- `images/` — assets for `index.html` (currently just `avatar.jpeg`, the
  favicon `soot_48.png`, and `projects/` if re-added).
- `static/` — assets for the sub-pages in `pages/` (their own CSS, JS,
  plugins, and images).
- `swift-quotes/`, `tempo/` — self-contained mini-sites/projects linked
  from `pages/swift.html` and `pages/tempo.html`.
- `ghiblify/imgur/` — `.webp` mirror of Ghibli stills served from
  `https://emilyxietty.github.io/ghiblify/imgur/...`. Likely consumed by
  the **Ghiblify v1 Chrome extension** for backgrounds. v2 bundles its
  own images, so this is only kept alive for v1 users in the wild — do
  not delete without confirming v1 is sunset.
- `chromeprivacy.html`, `privacypolicy.html`, `termsconditions.html` —
  standalone legal pages for shipped apps.

## How to work in this repo

- **Preview locally**: `python3 -m http.server 8000` from the repo root,
  then visit `http://localhost:8000`. Use a real server (not `file://`)
  so relative paths and Google Fonts work.
- **Edits go to the source files** — no compile/bundle step. A change to
  `css/style.css` or `index.html` is what ships once pushed to `main`.
- **Deployment**: pushing to `main` auto-deploys via GitHub Pages.

## Conventions

- Keep the site framework-free. Don't introduce React, a bundler, or a
  package manager workflow unless explicitly asked — it would break the
  zero-build GitHub Pages deploy model.
- Relative paths (`./css/...`, `./images/...`, `../static/...`) — keep
  them relative so the site works from any base URL.
- New sub-pages live in `pages/` and should link back to `../index.html`.
- Images should be reasonably sized for web (don't commit multi-MB
  originals; prefer WebP/optimized JPEG/PNG).
- When editing `index.html`, watch for stale selectors in `js/script.js`:
  the script queries elements like `[data-select]` directly and will
  throw a TypeError if those elements are removed from the DOM, which
  halts all script execution below the failure point.

## Theme notes

- The light-blue theme works by **redefining variables at the bottom of
  `css/style.css`**, not by overriding individual rules. If you need to
  recolor something globally, edit those variable values rather than
  adding `!important` overrides.
- The original theme uses `::before` pseudo-elements with `inset: 1px`
  to paint card surfaces. Any rule that hardcodes an `hsl()`/`hsla()`
  color (instead of using a variable) will bypass the palette swap and
  needs its own targeted override — e.g. `.navbar` does this.
- Font is **Quicksand** (loaded via Google Fonts in `index.html`),
  falling back to Poppins.

## Things to be careful with

- Many of the commented-out HTML sections (testimonials, blog, contact,
  service grid, clients) reference assets that have been deleted.
  **Don't uncomment them blindly** — verify the assets exist first.
- The portfolio article (`<article class="portfolio">`) was removed
  from `index.html` along with its filter/select markup. The matching
  JS handlers in `js/script.js` were also removed; don't re-add one
  without the other.
- `pages/*.html` sub-pages use a completely different stylesheet stack
  (`static/css/styles.css` + Bootstrap plugins). The light-blue theme
  only applies to `index.html`.
- `ghiblify/imgur/` exists for the extension, not the portfolio. No
  HTML in this repo links to it.
