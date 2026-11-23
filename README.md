# Enrique-S-J.github.io

Personal site and engineering case studies. Static HTML and one stylesheet, served from GitHub Pages.

## Lighthouse

The site's job, beyond hosting content, is to be its own proof: it targets 100 across Performance, Accessibility, Best Practices, and SEO.

**Live scores: pending.** The site has not been deployed, so nothing has been measured against the public URL. Real hosting can behave differently from localhost, so the local numbers below are not a claim about the live site. This section will state live scores, with their date, once they have been measured.

**Local scores, measured 2026-11-12** against `python3 -m http.server` (`lighthouse` 12.8.2, headless Chrome 157, default mobile emulation):

| Page | Perf | A11y | Best practices | SEO |
|---|---|---|---|---|
| `/` | 100 | 100 | 100 | 100 |
| `/case-studies/llm-platform.html` | 100 | 100 | 100 | 100 |
| `/case-studies/ticket-triage.html` | 100 | 100 | 100 | 100 |

Headless Chrome follows the host's colour-scheme preference, so one Lighthouse run audits one theme. The table holds for both: the three pages were run once under the host's dark preference and once with the light scheme forced (`--blink-settings=preferredColorScheme=1`), and every score was 100 in both. A third pass with `lighthouse` 13.4.1 gave the same twelve scores.

The three pages were run again on 2026-11-23, after the home page was reorganized and the case studies were filled in (one pass, `lighthouse` 12.8.2, the host's colour scheme): all twelve scores were 100 again and layout shift was 0. The other checks below date from 2026-11-12 and have not been repeated since.

Contrast was also checked directly, by computing the WCAG ratio of every text element against its background in a Chrome session, in both themes on all four pages. Every one is AAA; the lowest is 7.09:1.

Layout shift is 0 in all nine Lighthouse runs. It was also measured directly, in a Chrome session with the network and CPU throttled so that the first paint lands before the deferred script runs: 0 on all four pages at 320px, 412px and 1280px. Before the theme toggle's space was reserved (see the design notes), that same measurement reported between 0.05 and 0.065 on every page at 1280px.

Also checked locally on 2026-11-12:

- `html-validate` 11.4.0 reports no errors on the four HTML files.
- With JavaScript disabled, every page renders its full content in both colour schemes and the theme toggle stays hidden.
- At 320px wide, no page scrolls horizontally. The transcript and the architecture diagram scroll inside their own boxes.
- Every page makes same-origin requests only, and logs nothing to the console.
- Tabbing through each page reaches every link and button, the skip link first, and each one shows a 2px focus outline.
- With `prefers-reduced-motion: reduce`, smooth scrolling is off and nothing animates.

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

1. **Keep the resume PDF current.** The contact row links to `assets/Enrique_Sanchez_Resume.pdf`. When the resume changes, export it to PDF again and replace that file, and check that the role line and the system cards on the home page still say what the resume says.
2. **Add open-source cards as repositories go public.** The open-source section lists only repositories that are public at the time of writing, because a card for an unpublished repository is a link that 404s. When another one is published, confirm it with `gh repo list Enrique-S-J --visibility public` and add its card in the same change.
3. **Measure the live site.** After deploying, re-run Lighthouse against the public URL and replace "pending" above with the scores and the date.

## Design notes

**No framework, and no build step.** The site is four HTML pages, one stylesheet of 14.5 KB (the budget is 15 KB), and 1.3 KB of JavaScript. At this size a framework would add a build pipeline, a dependency tree, and a hydration cost in exchange for nothing — the fastest page is the one that ships no JavaScript it doesn't need.

**Zero runtime requests to anywhere else.** No fonts, no analytics, no CDNs, no trackers. Typography uses the system font stack, which means zero font downloads, no layout shift from a late-arriving webfont, and text that looks native on every platform instead of slightly foreign on all of them. Every subresource is same-origin: the stylesheet, the theme script, the favicon, and on the home page the four screenshots (two front ends, two workflow canvases).

**Type carries the structure.** The system sans is paired with `ui-monospace` used as the secondary voice throughout — section labels, metadata, stack lines, the 404 status. Field labels and spec plates are the native vernacular of infrastructure work, and using monospace structurally rather than decoratively is what keeps the page from reading as a template. Section labels hang in their own left column on wide screens and stack above the content on narrow ones.

**Numbered markers only where there's a sequence.** The case studies run Problem → Constraints → Architecture → Decisions → Result, which is a genuine progression, so those sections are numbered. The home page's sections aren't ordered, so they aren't numbered.

**Works with JavaScript disabled.** The palette comes from `prefers-color-scheme` in CSS. The theme toggle is progressive enhancement: the button ships with the `hidden` attribute and only the script reveals it, so a control that can't work is never shown. A tiny inline script in `<head>` applies a stored preference before first paint to avoid flashing the wrong theme; the toggle's own logic is deferred and never blocks rendering. That inline script also sets a class on the root element, and with the class present the still-hidden button keeps its box, so when the deferred script reveals it nothing on the page moves. Without JavaScript the class is never set and the button takes no space at all.

**Motion is opt-in.** Smooth scrolling is wrapped in `prefers-reduced-motion: no-preference`. Focus outlines are never removed. There is deliberately no scroll-linked entrance animation on the architecture diagram: a `view()` timeline whose from-state is `opacity: 0` strands the content invisible whenever the range fails to resolve — in a scroll container, in print, in a page capture — and a diagram that is sometimes missing is a worse diagram than one that does not move.

**The visuals are inline, not imported.** The architecture diagram is hand-written SVG using the same CSS custom properties as the rest of the page, so it follows the theme toggle. Below 40rem it stops shrinking and scrolls sideways inside its own box: scaled down to a phone column its labels would render at under 4px, which passes every audit and cannot be read. The terminal transcript is real selectable text in a `<pre>`, not a picture of text, so it is searchable and a screen reader can read it. The two n8n canvases are the only raster images on the site; they carry explicit dimensions and an `aspect-ratio`, and they are lazy-loaded, so they cost nothing until scrolled to and shift nothing when they arrive.

## Contribution grid

`scripts/build-contributions.mjs` fetches the GitHub contribution calendar and inlines it into `index.html` between two marker comments. [`.github/workflows/contributions.yml`](.github/workflows/contributions.yml) is set up to rerun it daily and commit any change. The script has been run by hand, most recently on 2026-11-12; the workflow itself is pending, because it cannot run until the repository is on GitHub.

It is built rather than embedded from one of the public chart services on purpose: a remote image would break the zero-third-party-requests property, add a render dependency on someone else's uptime, and hand a tracker every visitor's IP. Fetching at build time and committing static markup keeps all three promises, and because the grid is emitted as `<rect>` elements carrying CSS classes rather than baked-in fills, it follows the site's own light/dark palette.

To rebuild it by hand:

```bash
GITHUB_TOKEN=$(gh auth token) node scripts/build-contributions.mjs
```

## License

MIT
