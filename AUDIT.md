# EverAfter Ring — Final Technical Front-End Audit

**Audit date:** 2026-08-13
**Status re-verified:** 2026-08-13, against the current source and Git history
**Optional items re-checked:** 2026-08-15, against `404.html`, `scripts/html-shell.mjs`, `js/modules/form.js`, `package.json`, `playwright.config.js` and `tests/`; both items that re-check confirmed — the accessibility-tree state and the standalone check command — have since been delivered, so section 7 lists none
**Project type:** Static multi-page website in Polish (HTML, CSS, Vanilla JavaScript ES modules) with a Node-based production build into `dist/`; no runtime dependencies, no backend
**Audit mode:** Final repository and implementation review
**Active findings:** 0 — no P0, no open P1, no open P2

## 1. Executive assessment

The repository is coherent and well-maintained. Architecture boundaries are explicit: `css/main.css` is the single stylesheet entry point, `js/app.js` is the single application entry point with a fixed module order, `partials/` holds the only copy of the shared shell, and the build configuration in `vite.config.js` together with `scripts/html-shell.mjs` owns the production output. Documentation is unusually accurate: `README.md` describes the delivered mechanisms rather than aspirations, and the legal pages describe the two `localStorage` entries, the Netlify Forms submission path, and the embedded Google Maps frame that the code actually implements.

The risk this audit identified was concentrated in client-side interaction state rather than in structure, content, or tooling, alongside two build- and repository-workflow items. All of those findings have since been delivered; the completed changes are recorded in `CHANGELOG.md` and their tasks in `docs/archive/plans/PLAN-2026-08-15.md`. No finding remains open here.

## 2. Audit scope and verification

The scope and results recorded below are those of the 2026-08-13 run and are kept as that run's record. `404.html` and the suite in `tests/` were added afterwards and were not part of it; where they change the current picture, that is stated in the verification limitations and in section 3.

### Areas inspected

- All 10 top-level HTML pages: `index.html`, `oferta.html`, `uslugi.html`, `realizacje.html`, `o-nas.html`, `kontakt.html`, `dziekujemy.html`, `polityka-prywatnosci.html`, `regulamin.html`, `cookies.html`
- Shared shell: `partials/header.html`, `partials/footer.html`
- Full CSS tree: `css/main.css`, `css/tokens.css`, `css/fonts.css`, `css/base.css`, `css/layout.css`, all files under `css/components/` and `css/sections/`
- Full JavaScript tree: `js/app.js`, `js/config.js`, `js/utils.js`, `js/theme-bootstrap.js`, all modules under `js/modules/`
- Build and asset tooling: `scripts/build.mjs`, `scripts/optimize-images.mjs`, `package.json`, `package-lock.json`, `start-local-preview.bat`, `.codex/environments/environment.toml`
- Metadata and delivery contract: `robots.txt`, `sitemap.xml`, `assets/favicon/site.webmanifest`, per-page `<head>` metadata and JSON-LD, `.gitignore`
- Documentation and licensing: `README.md`, `CHANGELOG.md`, `LICENSE`
- Repository state: current Git branch, status, and diff

### Verification performed

- `node --check` on all 14 `.js`/`.mjs` files — executed and passed
- JSON parse of `package.json`, `package-lock.json`, `assets/favicon/site.webmanifest` and all 20 JSON-LD blocks; XML parse of `sitemap.xml` — executed and passed
- Local reference resolution across all HTML, partials, and CSS (`src`, `href`, `srcset`, `url()`), resolving partial paths against the root as the runtime and build both do — executed, 322 references checked, 0 missing
- Duplicate-ID and ARIA/label reference check per page with `partials/header.html` and `partials/footer.html` injected — executed and passed; no duplicates, no dangling references
- `<img>` alternative-text presence check across all pages and partials — executed and passed
- Read-only in-memory simulation of the `build:html` stage contract (partial-host regex match, single-`aria-current` assertion, `.min` asset reference substitution) for all 10 pages — executed, all 10 would pass; no files written
- Contrast computation (WCAG 2.x relative luminance) for deterministic token pairs in both themes, including alpha compositing for the footer and callout — executed
- Image dimension check: all `assets/img-src/` sources and generated variants against the `width`/`height` attributes in markup — executed and passed (hero 1080×720, portfolio 1200×900)
- Generated-variant completeness: `assets/img/hero` (54 files) and `assets/img/portfolio-img` (81 files) match 6 and 9 sources × 3 widths × 3 formats — executed and passed
- Lockfile consistency against `package.json` devDependencies — executed and passed (esbuild 0.28.0, lightningcss 1.32.0, sharp 0.34.5)
- Unreferenced-asset scan across HTML, CSS, JS, manifest, and build scripts — executed and passed; every file under `assets/` outside `img-src/` resolves from source
- `TODO`/`FIXME`/`HACK`/`debugger`/`console.log` scan of shipped source — executed; none found outside the build scripts' intended CLI output

### Verification limitations

- No browser or assistive-technology verification was performed for this document. Findings about rendered layout, paint order, and focus behaviour are derived from the cascade and script sequence in the source; they are labelled accordingly. The repository has since gained the Chromium smoke suite described below, which closes part of the browser gap when it is run; no assistive-technology verification exists at any level.
- No deployment URL was supplied for this audit, so no live environment was inspected and no claim is made about whether the project is currently deployed. The origin declared in `robots.txt`, `sitemap.xml`, and the per-page canonical/`og:url` metadata is treated as configuration, not as evidence of an active deployment.
- The repository now carries an automated test suite: ten Chromium tests under `tests/`, run against the Vite production preview by `npm run test:smoke`. No results from it are reported here, because it was not executed for this document. Its scope is a smoke baseline by design — three of the eleven pages, one primary-navigation transition, the theme, the mobile navigation panel, the project notice, and one contact-form path. That last test is the only evidence the suite offers for the form: it submits with the required fields empty and checks the state, focus, and message of the first invalid field, then checks that a valid value clears them. It does not cover the remaining pages, the custom 404 page, the rest of the contact form — the other validated fields, the remaining validity types, or the submission path — responsive layout, visual regression, accessibility conformance, or any browser engine other than Chromium.
- Contrast was assessed only for deterministic token pairs. Surfaces composed with `color-mix()` over the modal backdrop and the hero gradient overlays were not evaluated.

## 3. Verified strengths

- Single, unambiguous source of truth per concern: `css/main.css` is the only stylesheet entry (`css/main.css:1-16`), `js/app.js` is the only application entry with an explicit module order (`js/app.js:9-16`), and `partials/` holds the only copy of the header, footer, and project notice.
- The build enforces its own contracts instead of assuming them: `scripts/html-shell.mjs:86-100` fails the build if a partial host is missing, and `scripts/html-shell.mjs:72-84` fails it if a primary-navigation page does not end up with exactly one `nav__link` carrying `aria-current="page"`.
- Those contracts are no longer reachable only through a build. `scripts/check.mjs`, run by `npm run check`, imports the same page registry and the same helpers and runs them in memory for all eleven pages, so the partial-host, single-`aria-current` and theme-bootstrap assertions keep one implementation and gain an output-free entry point; the command also resolves the local references declared by the pages, the partials, the stylesheets and the web manifest. Run against the current tree on 2026-08-15 it passes, resolving 390 local references with none missing — the reference check this audit performed ad hoc is now repeatable, and it writes nothing.
- Reference integrity is complete — all 322 local references resolve, with no duplicate IDs and no dangling ARIA or label targets across all 10 pages with partials injected.
- Metadata is consistent across the ten indexable pages: each has its own `title`, `description`, `canonical`, full Open Graph set with image dimensions and alt text, Twitter Card, and two JSON-LD blocks, all parsing cleanly. The eleventh page, `404.html`, deliberately carries none of that beyond its own title and description — an error document has no canonical address of its own, and it is held out of the index by `noindex, follow` and out of `sitemap.xml`.
- Image delivery is coherent: `<picture>` with AVIF/WebP/JPG, matching `srcset`/`sizes`, explicit `width`/`height` matching the real files, `decoding="async"`, and `loading="lazy"` on below-the-fold images only.
- Defensive initialisation is the norm in the JS modules: `js/modules/nav.js:4-9`, `js/modules/form.js:27-29`, `js/modules/hero.js:1-14`, and `js/modules/header-scroll.js:7-9` all guard on missing elements and on re-initialisation before binding.
- Theme persistence degrades safely: `js/theme-bootstrap.js:10-17` and `js/modules/theme.js:10-25` both wrap storage access so the toggle keeps working for the current page when storage is unavailable.
- Colour tokens hold up under measurement: body text 14.30:1, muted body copy 4.48–5.47:1, accent 7.24:1, primary button 7.73:1, footer text 9.18:1, and the dark theme 8.90–16.24:1 across the pairs checked.
- Legal documentation matches the implementation rather than a template: `cookies.html` lists exactly the two `localStorage` keys the code writes and explicitly states that no service worker, `sessionStorage`, or Cache Storage is used, which is correct for this repository; `polityka-prywatnosci.html` describes the Netlify Forms path and the Google Maps frame that `kontakt.html` actually contains.
- Repository hygiene in shipped source is clean: no `TODO`/`FIXME`/`debugger`/`console.log` outside the build scripts' intended output, and `.gitignore` documents which generated paths are intentionally tracked.
- Asset ownership is complete: every file under `assets/` outside `img-src/` resolves from source, so `vite.config.js:55-78` copies no file the site does not use, and each icon set has exactly one authoritative copy — inline in `partials/header.html` and `partials/footer.html`.
- Several of the runtime behaviours this audit could only reason about from source now have executable coverage in the repository. `tests/` holds a Chromium smoke suite that `npm run test:smoke` runs against the built preview rather than the development server, so it exercises the resolved shared shell and the inlined theme bootstrap that `dist/` actually ships. The suite is built to stay deterministic: it pins the preview host and port, refuses to attach to a preview server left over from an older build (`playwright.config.js:24-30`), pins `colorScheme` so the unstored-preference case does not depend on the runner's system setting, and seeds both `localStorage` preconditions through init scripts (`tests/support/app.js:8-13`) because both features read storage before the first paint.

## 4. P0 — Critical risks

None detected.

## 5. P1 — Important issues worth fixing next

None open. Resolved findings are recorded in `CHANGELOG.md`.

## 6. P2 — Minor refinements

None open. Resolved findings are recorded in `CHANGELOG.md`.

## 7. Extra quality improvements

None open. The standalone check command this section proposed has since been delivered as `scripts/check.mjs` behind `npm run check`; it is described in section 3 and recorded in `CHANGELOG.md`.

## 8. Current readiness conclusion

**Status:** No open findings at any priority, and no open recommendation.

Nothing blocks the project from being built, served, or read: content, structure, metadata, references, asset ownership, and documentation are all in good order. The source-level guarantees this document reasoned about are now executable rather than only inspectable — `npm run check` runs the build's own shared-shell contracts and the local-reference resolution without producing output, and `npm run build` still enforces the same contracts on the way to `dist/`.

This status is a repository-state assessment. It is not an accessibility certification, a security assessment, a guarantee of browser or assistive-technology behaviour, or a performance measurement — none of which were performed, as recorded in the verification limitations.

## 9. Senior rating

**Rating:** 8/10 — held at the 2026-08-15 reassessment made after the standalone check command landed; reassessed 2026-08-13 against the repository state with every finding closed (7/10 on the audit date)

**Active findings behind this rating:** P0 — 0. P1 — 0. P2 — 0.

The source-level work this audit called for is complete. The interaction layer establishes its own defaults instead of depending on scripting to repair them: the theme resolved before first paint survives runtime initialisation, the mobile navigation panel is closed in markup and CSS below the breakpoint, the project-notice dialog contains focus and closes on `Escape` and on the backdrop, and no raw hex literal remains anywhere under `css/` outside `css/tokens.css`. Asset ownership is now complete as well — every shipped file resolves from source, and each icon set has one authoritative copy. The build contract is verifiable as documented — `npm run build` writes only into the ignored `dist/` — and `.gitattributes` keeps diffs reviewable.

The rating holds at 8, and the reason it holds has narrowed again. Both factors the earlier reassessment named as gating a higher score have now been attempted, and the tooling half is genuinely settled: `npm run check` runs the build's own partial-host, single-`aria-current` and theme-bootstrap assertions plus local-reference resolution without writing a file, so those guarantees no longer require a build that produces `dist/`, and the reference sweep this document performed by hand is now a command anyone can repeat. That closes the section 7 condition outright, and it does so by reusing the existing helpers rather than adding a dependency or a second implementation.

What has not moved is the other half, and it is the half that carries the remaining risk. The browser evidence is still the same smoke baseline, with the limits recorded in the verification limitations: one browser engine, three of the eleven pages, a single contact-form path — the invalid state, focus, and message the module produces for the first invalid field — and nothing for the rest of that form, the custom 404 page, responsive layout, or accessibility conformance; assistive-technology behaviour remains unverified at any level. A source-level checker cannot substitute for any of that: it validates what the source declares, not what a browser renders or what a screen reader announces. Those are material limitations rather than formalities, so the rating does not rise on the tooling alone. What lifts it from here is browser and assistive-technology coverage wide enough to stand behind — which is now the only outstanding factor, and not a change to the source.
