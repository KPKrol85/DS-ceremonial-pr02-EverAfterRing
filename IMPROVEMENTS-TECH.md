# EverAfterRing — Technical Improvements

**Analysis date:** 2026-11-14
**Project type:** Static multi-page website in Polish (HTML, CSS, Vanilla JavaScript ES modules) with a Vite development server and production build into `dist/`; no runtime dependencies, no backend
**Analysis mode:** Evidence-based technical improvement review
**Focus:** Project-wide technical implementation

## Improvement overview

The architecture is small and coherent. `js/app.js` is the single application entry point, `css/main.css` the single stylesheet entry point, `partials/` the only copy of the shared shell, and `scripts/html-shell.mjs` the shared page registry and shell contract for both `vite.config.js` and `scripts/check.mjs`. The opportunities below do not concern defects in that structure. They concern places where one responsibility is still implemented twice or split between two owners: shared-shell resolution (development versus build), the navigation breakpoint (JavaScript versus CSS), and the hero image transform (script versus stylesheet). Two smaller items concern a selector registry that no longer matches its documented role and theme-independent color literals that sit outside `css/tokens.css`.

## Proposed improvements

### IMP-TECH-01 — Resolve the shared shell through one implementation in development and production

- **Status:** COMPLETED — implemented and verified.
- **Result:** Unified shell resolution and primary-navigation state through the existing Vite HTML transformation in development and production. Removed runtime partial loading while preserving synchronous theme initialization and reloading development pages after shared-partial edits.
- **Verification:** Passed `npm run check` (11 pages, 392 local references, 65 ID references), `npm run build`, and all 24 Chromium smoke tests. Verified initial development HTML and navigation for all maintained pages plus `/`, representative interactions, synchronous theme initialization, no runtime partial requests, and reloads after both partial edits. Confirmed production HTML and assets matched the original-source baseline apart from the application bundle and its hashed filename.
- **Impact:** High
- **Effort:** Medium

### IMP-TECH-02 — Derive the mobile-navigation mode from one media query aligned with the CSS breakpoint

- **Status:** COMPLETED — implemented and verified.
- **Result:** Replaced both `innerWidth <= 1024` comparisons and the `resize` listener in `js/modules/nav.js` with one `matchMedia("(min-width: 1024px)")` query mirroring `css/components/nav.css`. Its `change` listener reconciles the panel state only when the mode changes and is removed by the module cleanup, so viewports below 1024 px use the mobile navigation and 1024 px and wider receive no mobile-only state or focus handling.
- **Verification:** Passed `npm run check`, all 24 Chromium smoke tests including `tests/mobile-nav.spec.js` and `tests/storage-unavailable.spec.js`, and `git diff --check`. A temporary Playwright probe against the production preview passed 50 of 50 checks at 1023, 1024 and 1280 px and across the breakpoint in both directions with the menu open and closed, covering state attributes, focus trap and restoration, no attribute writes within a mode, and no page errors; it failed 10 checks against the previous implementation and was not added to the repository.
- **Impact:** Medium
- **Effort:** Small

### IMP-TECH-03 — Give the hero image transform a single owner and stop the idle animation loop

- **Status:** COMPLETED — implemented and verified.
- **Result:** `js/modules/hero.js` now requests at most one frame at a time, only while the interpolated position differs from its target, restarting on `mousemove`/`mouseleave` and snapping below a 0.05 px threshold; factors, resting scale and transform order are unchanged. With motion allowed the script alone owns the image transform; the stylesheet hover scale applies only under `prefers-reduced-motion: reduce`, and the image no longer carries a competing `transform` transition.
- **Verification:** Passed `npm run check`, `npm run build`, all 24 Chromium smoke tests and `git diff --check`. A temporary Playwright probe measured hero frames dropping from ~61/s to 0 when idle and after settling, at most one pending frame during rapid movement, settled targets identical to the original, correct initial and live reduced-motion switching in both directions, all eight hero pages working, and identical screenshots at rest and under reduced motion. Limitation: without the CSS transition, movement follows the script interpolation directly and is slightly less lagged than before; without JavaScript, the motion-allowed hover scale no longer applies.
- **Impact:** Medium
- **Effort:** Small

### IMP-TECH-04 — Replace the single-consumer selector registry in `js/config.js` with module-owned selectors

- **Status:** COMPLETED — implemented and verified.
- **Result:** `js/modules/nav.js` now declares `[data-nav-toggle]` and `[data-nav-panel]` and `js/modules/form.js` declares `[data-contact-form]` locally, with unchanged values, and `js/config.js` with its `SELECTORS` registry was removed. Both README languages now document module-owned selectors, and both structure trees no longer list `config.js`.
- **Verification:** Passed `npm run check` (11 pages, 392 local references, 65 ID references), `npm run build`, all 24 Chromium smoke tests including `tests/mobile-nav.spec.js` and `tests/form-validation.spec.js`, and `git diff --check`; no source under `js/` references `config.js` or `SELECTORS`, and the built bundle contains the three selectors unchanged. Limitation: the first smoke run under heavy machine load timed out on three focus assertions, including the unaffected lightbox spec, with closed browser sessions; those specs and the full suite passed on rerun.
- **Impact:** Low
- **Effort:** Small

### IMP-TECH-05 — Move the remaining component color literals into design tokens

- **Status:** COMPLETED — implemented and verified.
- **Result:** `css/tokens.css` now owns the shared backdrop channels with separate lightbox (0.72) and project-notice (0.58) backdrop tokens, the project-notice border color, and complete light-button and project-notice shadow tokens, all with unchanged values inherited by the dark theme. The three component stylesheets reference these tokens, leaving no `rgb()`, `rgba()` or hex literal under `css/components/` or `css/sections/`.
- **Verification:** Passed `npm run check`, `npm run build`, all 24 Chromium smoke tests and `git diff --check`. A temporary Playwright probe found all 157 computed values identical in light and dark themes and after runtime theme switches, and all 12 settled screenshots pixel-identical on the development server. Limitations: the production minifier no longer quantizes the `var()`-composed backdrop alpha to 8-bit hex, which changed 26 pixels of the light-theme lightbox by one channel level; the lightbox backdrop relies on `::backdrop` custom-property inheritance, and only Chromium was tested.
- **Impact:** Low
- **Effort:** Small

## Selection summary

The proposals are ordered by engineering value. IMP-TECH-01 removes the largest duplicated responsibility in the codebase. IMP-TECH-02 and IMP-TECH-03 settle two property-ownership conflicts in interactive modules, and IMP-TECH-04 and IMP-TECH-05 align smaller ownership rules with what the project already does elsewhere. All five are independent and touch disjoint files, apart from shared README edits in IMP-TECH-01 and IMP-TECH-04, which should be coordinated if both are approved. All are Small or Medium in effort, preserve public behaviour and existing `data-*` contracts, and can be verified with the existing `npm run check`, `npm run build` and focused Playwright specs, which makes the set a realistic candidate backlog for one focused development day.

The duplicated theme constants in `js/theme-bootstrap.js` and `js/modules/theme.js` were considered and excluded. The README already documents them as an accepted limitation, and removing the duplication would require bundling the classic, synchronously inlined bootstrap, which is disproportionate to the drift risk.

## Analysis limitations

- The analysis was static. The only check executed was `npm run check`, which passed (11 pages, 392 local references, 65 ID references). No Playwright test, build or development-server session was run, so the 1024 px behaviour in IMP-TECH-02 and the frame loop in IMP-TECH-03 are derived from source, not observed in a browser.
- IMP-TECH-01 assumes the Vite development server applies `transformIndexHtml` to the served MPA pages and reloads after a partial edit. Both must be confirmed during implementation.
- Netlify deployment configuration is not tracked in the repository, so the analysis assumes that only `dist/` is deployed, as the README states.
