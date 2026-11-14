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

- **Affected area:** Navigation controller `js/modules/nav.js` and its relationship to `css/components/nav.css`.
- **Evidence:** `js/modules/nav.js:11` (`isMobileNav = () => window.innerWidth <= 1024`), `js/modules/nav.js:71` (a second inline `window.innerWidth <= 1024` that bypasses `isMobileNav`), `js/modules/nav.js:89-102` (`resize` listener), `css/components/nav.css:315` (`@media (min-width: 1024px)`), `docs/archive/improvements/IMPROVEMENTS-QUALITY-2026-11-14.md` (unresolved observation).
- **Current implementation:** The CSS switches to the desktop header at `min-width: 1024px`. The script defines the mobile mode independently as `innerWidth <= 1024`, repeats that literal in the link-click handler, and re-evaluates it on every `resize` event. At exactly 1024 px the stylesheet renders the desktop navigation while the script still treats the viewport as mobile: it sets `hidden` on the CSS-visible panel, and a navigation-link click calls `closeNav()`, which moves focus to the `display: none` toggle. The previous quality report recorded this overlap as unevaluated. Its practical impact is limited to that single width.
- **Proposed improvement:** Have `nav.js` own one `matchMedia` query that mirrors the CSS breakpoint and use it for every mobile/desktop decision, reacting to its `change` event instead of polling `resize`.
- **Expected engineering value:** The breakpoint is expressed once in the script and is the exact complement of the stylesheet query, so the two can no longer disagree at the boundary. The duplicated literal disappears, and state reconciliation runs only when the mode actually changes.
- **Implementation scope:** `js/modules/nav.js` only; a short comment may reference `css/components/nav.css` as the paired breakpoint. Keep unchanged: the `hidden`/`data-open`/`aria-expanded` state model, focus trap, `Escape` and link-click closing, the markup-authored closed state, and `data-initialized` on the toggle, which the tests use as a readiness signal.
- **Acceptance criteria:** `nav.js` contains no `innerWidth` comparison and a single breakpoint definition. At 1023 px the panel is closed by default and opens, traps focus and closes as today. At 1024 px and above the panel has no `hidden` attribute and link clicks do not move focus. Crossing the breakpoint with the menu open or closed leaves consistent `aria-expanded` and `hidden` states. `tests/mobile-nav.spec.js` and `tests/storage-unavailable.spec.js` pass.
- **Impact:** Medium
- **Effort:** Small

### IMP-TECH-03 — Give the hero image transform a single owner and stop the idle animation loop

- **Affected area:** Hero parallax module `js/modules/hero.js` and `css/sections/hero.css`.
- **Evidence:** `js/modules/hero.js:33-51` (`animate` re-requests a frame unconditionally once `startMotion` runs), `js/modules/hero.js:39` (inline `transform: scale(1.03) translate(…)` written every frame), `css/sections/hero.css:85-98` (`transition: transform` and `.hero__media:hover img { transform: scale(1.03) }` on the same element), `[data-hero-image]` present on eight pages (`index.html:96` and seven subpages).
- **Current implementation:** Without a reduced-motion preference, `startMotion()` starts a `requestAnimationFrame` loop on page load that runs for the lifetime of the page and writes the image's inline `transform` on every frame, even when no pointer is over the hero or the device has no mouse. The stylesheet declares its own hover `transform` and a `transform` transition for the same `img`. While the script is active its inline style overrides the hover rule, so the image transform has two owners whose interaction depends on the motion preference.
- **Proposed improvement:** Make one layer the explicit owner of the image transform for each motion state. Let the script request frames only while the interpolated position has not yet settled, restarting on pointer movement, instead of keeping a permanent loop.
- **Expected engineering value:** The hero behaviour can be read from a single place, the stylesheet no longer contains a rule that the script silently overrides, and frame callbacks run only while there is motion to apply. No performance figure is claimed; the change removes unconditional per-frame work.
- **Implementation scope:** `js/modules/hero.js` and the hero image rules in `css/sections/hero.css`. Preserve the current rendered result in both states: the parallax and resting scale with motion allowed, and no script-driven motion with `prefers-reduced-motion: reduce`, including live switching of that preference.
- **Acceptance criteria:** With motion allowed and the pointer outside the hero, no further animation frames are requested once the image has returned to rest. Pointer movement over the hero resumes the parallax with the current factors. Exactly one source defines the image `transform` for each motion state, and the visible resting and hover appearance matches the current behaviour. With reduced motion, the inline transform is cleared and no loop runs.
- **Impact:** Medium
- **Effort:** Small

### IMP-TECH-04 — Replace the single-consumer selector registry in `js/config.js` with module-owned selectors

- **Affected area:** JavaScript module organization: `js/config.js`, `js/modules/nav.js`, `js/modules/form.js`.
- **Evidence:** `js/config.js:1-5`, `js/modules/nav.js:2,5-6`, `js/modules/form.js:2,28`; module-local selectors in `js/modules/theme.js:57`, `js/modules/lightbox.js:9-20`, `js/modules/project-notice.js:24-32`, `js/modules/header-scroll.js:8`; `README.md:77` and `README.md:316` ("Selektory współdzielone między modułami są zdefiniowane w `js/config.js`").
- **Current implementation:** `SELECTORS` holds three selectors. `navToggle` and `navPanel` are used only by `nav.js` and `contactForm` only by `form.js`, so none of them is shared between modules. Every other module, including those added later, declares its `data-*` hooks locally. The README describes `config.js` as the home of shared selectors, a role no entry currently fulfils.
- **Proposed improvement:** Move the three selectors into their only consumers, remove `js/config.js`, and state the actual convention in the README: modules own their selectors.
- **Expected engineering value:** Selector ownership follows one consistent rule across all modules, a level of indirection with no shared benefit disappears, and the documented convention matches the code.
- **Implementation scope:** `js/config.js` (removal), `js/modules/nav.js`, `js/modules/form.js`, and the two README statements plus the structure trees that list `config.js`. Selector values and the `data-nav-toggle`, `data-nav-panel` and `data-contact-form` attribute contracts stay unchanged.
- **Acceptance criteria:** No module imports `js/config.js` and the file no longer exists. `nav.js` and `form.js` use identical selector strings, declared locally. The README no longer describes a shared selector registry. `npm run build` succeeds, and `tests/mobile-nav.spec.js` and `tests/form-validation.spec.js` pass.
- **Impact:** Low
- **Effort:** Small

### IMP-TECH-05 — Move the remaining component color literals into design tokens

- **Affected area:** CSS token ownership: `css/tokens.css` and the component stylesheets that bypass it.
- **Evidence:** `css/components/buttons.css:45,54-55` (`rgba(44, 24, 16, …)` shadows), `css/components/lightbox.css:27` (`rgb(12 10 9 / 0.72)` backdrop), `css/components/project-notice.css:8` (`rgb(12 10 9 / 0.58)` backdrop), `css/components/project-notice.css:25,30-31` (dialog border and shadows), `css/tokens.css:31-43` and `css/tokens.css:116-150` (existing semantic color and shadow tokens with dark-theme values).
- **Current implementation:** Colors and shadows elsewhere are drawn from `css/tokens.css`, which also holds the dark-theme overrides. These five declarations still carry raw `rgb()`/`rgba()` values in component files. The lightbox and project-notice scrims share one base color with different opacities, and the button shadow uses a brown that matches no existing token. None of them takes part in the token-level theme switch.
- **Proposed improvement:** Declare semantic tokens for the scrim, the light-button shadows and the project-notice dialog border and shadow in `css/tokens.css`, set to the current values, and reference them from the three component files.
- **Expected engineering value:** Every component color has one owner in the token layer, the shared scrim is defined once, and a future theme adjustment to these surfaces becomes a token change instead of a search through component files.
- **Implementation scope:** `css/tokens.css`, `css/components/buttons.css`, `css/components/lightbox.css`, `css/components/project-notice.css`. Rendered colors stay identical in both themes; choosing different dark-theme values is a separate UI decision and is outside this proposal.
- **Acceptance criteria:** No `rgb()`, `rgba()` or hex color literal remains under `css/components/` or `css/sections/`. The new tokens are declared in `css/tokens.css` with the current values, the computed styles of the affected elements are unchanged in light and dark themes, and `npm run check` and `npm run build` pass.
- **Impact:** Low
- **Effort:** Small

## Selection summary

The proposals are ordered by engineering value. IMP-TECH-01 removes the largest duplicated responsibility in the codebase. IMP-TECH-02 and IMP-TECH-03 settle two property-ownership conflicts in interactive modules, and IMP-TECH-04 and IMP-TECH-05 align smaller ownership rules with what the project already does elsewhere. All five are independent and touch disjoint files, apart from shared README edits in IMP-TECH-01 and IMP-TECH-04, which should be coordinated if both are approved. All are Small or Medium in effort, preserve public behaviour and existing `data-*` contracts, and can be verified with the existing `npm run check`, `npm run build` and focused Playwright specs, which makes the set a realistic candidate backlog for one focused development day.

The duplicated theme constants in `js/theme-bootstrap.js` and `js/modules/theme.js` were considered and excluded. The README already documents them as an accepted limitation, and removing the duplication would require bundling the classic, synchronously inlined bootstrap, which is disproportionate to the drift risk.

## Analysis limitations

- The analysis was static. The only check executed was `npm run check`, which passed (11 pages, 392 local references, 65 ID references). No Playwright test, build or development-server session was run, so the 1024 px behaviour in IMP-TECH-02 and the frame loop in IMP-TECH-03 are derived from source, not observed in a browser.
- IMP-TECH-01 assumes the Vite development server applies `transformIndexHtml` to the served MPA pages and reloads after a partial edit. Both must be confirmed during implementation.
- Netlify deployment configuration is not tracked in the repository, so the analysis assumes that only `dist/` is deployed, as the README states.
