# Enrique-S-J.github.io

Personal site and engineering case studies. Static HTML and one stylesheet, served from GitHub Pages.

## Lighthouse

The site's job, beyond hosting content, is to be its own proof: it targets 100 across Performance, Accessibility, Best Practices, and SEO.

**Measured 2026-08-14 on a local server** (`lighthouse` 13.4.1, headless Chrome) — all three pages:

| Page | Perf | A11y | Best practices | SEO |
|---|---|---|---|---|
| `/` | 100 | 100 | 100 | 100 |
| `/case-studies/llm-platform.html` | 100 | 100 | 100 | 100 |
| `/case-studies/ticket-triage.html` | 100 | 100 | 100 | 100 |

Contrast was verified separately by computing WCAG ratios for every foreground/background pair in **both** themes — headless Chrome audits light mode only, so dark mode would otherwise go unchecked. Every pair is AAA (lowest is 7.09:1).

Lighthouse reports CLS 0.044 under its throttled mobile simulation; a real Chrome session measured 0 across a full scroll of the page at both 320px and 412px. Both are inside the "good" threshold.

Live scores against the deployed URL have not been measured yet; this file will say so with a date once they have been.

## Running locally

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. There is no build step — what's in the repo is what's served.

To re-run the audits:

```bash
npx lighthouse http://localhost:8000 --only-categories=performance,accessibility,best-practices,seo --view
npx html-validate index.html 404.html case-studies/*.html
```

## Before linking this anywhere

1. **Export the resume to PDF** and drop it at `assets/Enrique_Sanchez_Resume.pdf`. The contact row links to that path and it is not in the repo.
2. **Fill in every "Edit me" block** in the two case studies. They are the scaffolded narrative sections — the specific obstacles, the benchmarking story, the retrospectives — and each carries two or three guiding questions. They are deliberately visible on the page so an unfinished case study can't be mistaken for a finished one. Find them with:

   ```bash
   grep -rn "EDIT ME" case-studies/
   ```

## Design notes

**No framework, and no build step.** The site is four HTML pages, one 9.6 KB stylesheet, and 1.3 KB of JavaScript. At this size a framework would add a build pipeline, a dependency tree, and a hydration cost in exchange for nothing — the fastest page is the one that ships no JavaScript it doesn't need.

**Zero runtime requests to anywhere else.** No fonts, no analytics, no CDNs, no trackers. Typography uses the system font stack, which means zero font downloads, no layout shift from a late-arriving webfont, and text that looks native on every platform instead of slightly foreign on all of them. The only two subresources are the stylesheet and the theme script, both same-origin.

**Type carries the structure.** The system sans is paired with `ui-monospace` used as the secondary voice throughout — section labels, metadata, stack lines, the 404 status. Field labels and spec plates are the native vernacular of infrastructure work, and using monospace structurally rather than decoratively is what keeps the page from reading as a template. Section labels hang in their own left column on wide screens and stack above the content on narrow ones.

**Numbered markers only where there's a sequence.** The case studies run Problem → Constraints → Architecture → Decisions → Result → Retrospective, which is a genuine progression, so those sections are numbered. The home page's sections aren't ordered, so they aren't numbered.

**Works with JavaScript disabled.** The palette comes from `prefers-color-scheme` in CSS. The theme toggle is progressive enhancement: the button ships with the `hidden` attribute and only the script reveals it, so a control that can't work is never shown. A tiny inline script in `<head>` applies a stored preference before first paint to avoid flashing the wrong theme; the toggle's own logic is deferred and never blocks rendering.

**Motion is opt-in.** Smooth scrolling is wrapped in `prefers-reduced-motion: no-preference`. Focus outlines are never removed. There is deliberately no scroll-linked entrance animation on the architecture diagram: a `view()` timeline whose from-state is `opacity: 0` strands the content invisible whenever the range fails to resolve — in a scroll container, in print, in a page capture — and a diagram that is sometimes missing is a worse diagram than one that does not move.

**The visuals are inline, not imported.** The architecture diagram is hand-written SVG using the same CSS custom properties as the rest of the page, so it follows the theme toggle. The terminal transcript is real selectable text in a `<pre>`, not a picture of text, so it is searchable and a screen reader can read it. The two n8n canvases are the only raster images on the site; they carry explicit dimensions and an `aspect-ratio`, and they are lazy-loaded, so they cost nothing until scrolled to and shift nothing when they arrive.

## Contribution grid

`scripts/build-contributions.mjs` fetches the GitHub contribution calendar and inlines it into `index.html` between two marker comments. [`.github/workflows/contributions.yml`](.github/workflows/contributions.yml) reruns it daily and commits any change.

It is built rather than embedded from one of the public chart services on purpose: a remote image would break the zero-third-party-requests property, add a render dependency on someone else's uptime, and hand a tracker every visitor's IP. Fetching at build time and committing static markup keeps all three promises, and because the grid is emitted as `<rect>` elements carrying CSS classes rather than baked-in fills, it follows the site's own light/dark palette.

To rebuild it by hand:

```bash
GITHUB_TOKEN=$(gh auth token) node scripts/build-contributions.mjs
```

## License

MIT
