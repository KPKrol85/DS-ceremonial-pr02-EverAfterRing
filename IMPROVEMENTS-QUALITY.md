# EverAfterRing — Quality Improvements

**Analysis date:** 2026-11-14
**Project type:** Static multi-page website in Polish (HTML, CSS, Vanilla JavaScript ES modules) with a Vite production build into `dist/`; no runtime dependencies, no backend
**Analysis mode:** Evidence-based quality improvement review
**Focus:** Project-wide quality

## Improvement overview

The implementation is defensive and well documented. Every module guards its own markup, both `localStorage` access paths are wrapped in `try`/`catch`, and the build enforces its shared-shell contracts. `npm run check` reruns those contracts in memory and resolves 392 local references. The Chromium smoke suite runs against the production preview and is deterministic by design.

The main gap is regression protection. Several behaviours that earlier audit work fixed and the changelog records as delivered have no executable check. These are the system-dark theme fallback, the project-notice focus containment and backdrop dismissal, and storage-blocked degradation. The contact form, the site's only data-entry workflow, is covered only for its first invalid field. `README.md` states this limitation itself. Separately, `npm run check` validates file references but not the in-document ID references that the runtime modules depend on.

All five proposals below extend existing mechanisms: the Playwright suite under `tests/` and `scripts/check.mjs`. None adds a tool, a dependency, or a change to runtime behaviour.

## Proposed improvements

### IMP-QUALITY-01 — Protect the theme fallback and synchronization contract

- **Status:** COMPLETED — implemented and verified.
- **Result:** `tests/theme.spec.js` now covers the system-dark fallback without a stored preference under a scoped `colorScheme: "dark"`, `meta[name="theme-color"]` values (`#faf7f2` light, `#171311` dark) in the existing toggle test and the system-dark test, and cross-tab synchronization between two pages of one browser context through the native `storage` event. No theme source, helper, or Playwright configuration was changed.
- **Verification:** `node --check tests/theme.spec.js` passed; `npm run test:smoke -- tests/theme.spec.js` built `dist/` with Vite and passed 4 of 4 theme tests in Chromium. The new tests were not run against a deliberately reintroduced regression.
- **Impact:** High
- **Effort:** Small

### IMP-QUALITY-02 — Extend contact-form regression coverage to its full validation and submission contract

- **Status:** COMPLETED — implemented and verified.
- **Result:** `tests/form-validation.spec.js` now covers email `typeMismatch`, the `guests` range below and above 10–400, an empty `budget` select, a prevented invalid submit with status message and focus, and a valid native POST to `/dziekujemy.html` intercepted with `page.route`. A short Polish note above the form names KP_Code Digital Studio as the recipient and states that the services and packages are demonstrational; the form markup and `js/modules/form.js` are unchanged.
- **Verification:** `node --check tests/form-validation.spec.js` passed and `npm run test:smoke -- tests/form-validation.spec.js` built `dist/` and passed 8/8 Chromium tests, including the payload check for `form-name`, all eight field values, and an empty `bot-field`. The POST was answered locally, so actual Netlify Forms delivery was not verified.
- **Impact:** High
- **Effort:** Medium

### IMP-QUALITY-03 — Cover the project-notice modal's focus containment and dismissal paths

- **Status:** COMPLETED — implemented and verified.
- **Result:** `tests/project-notice.spec.js` now covers `Tab`/`Shift+Tab` entry from the focused container, forward order, wraparound at both ends, and repeated navigation staying inside the dialog; a real backdrop click that hides the notice, removes the scroll lock, and leaves focus outside it; and acceptance through `Akceptuję` written to storage and honoured after `page.reload()`. No application source, partial, helper, or configuration was changed.
- **Verification:** `node --check tests/project-notice.spec.js` passed; `npm run test:smoke -- tests/project-notice.spec.js` built `dist/` with Vite and passed 5 of 5 project-notice tests in Chromium. The new tests were not run against a deliberately reintroduced regression.
- **Impact:** Medium
- **Effort:** Small

### IMP-QUALITY-04 — Verify graceful degradation when browser storage is unavailable

- **Status:** COMPLETED — implemented and verified.
- **Result:** `tests/storage-unavailable.spec.js` makes the `window.localStorage` getter throw a `SecurityError` through an init script and verifies, at a 390 px viewport, the `light` fallback, theme switching to dark and back with `aria-pressed` and `theme-color` synchronized, notice dismissal through `Akceptuję` despite the failed write, and mobile-navigation opening and `Escape` closing. No application source, helper, or Playwright configuration was changed.
- **Verification:** `node --check` passed; `npm run test:smoke -- tests/storage-unavailable.spec.js` built `dist/` with Vite and passed 1 of 1 tests with no `pageerror` events, and `npx playwright test --list` reports 24 tests in 8 files. The test was not run against a deliberately reintroduced unguarded storage access.
- **Impact:** Medium
- **Effort:** Small

### IMP-QUALITY-05 — Add in-document ID reference integrity to `npm run check`

- **Affected area:** Source consistency check (`scripts/check.mjs`) and the ID-based contracts the runtime modules resolve.
- **Evidence:** `scripts/check.mjs:118-164`, `scripts/check.mjs:226-251`, `js/modules/form.js:9-14`, `partials/header.html:12`, `partials/header.html:58`, `partials/footer.html:104`, `realizacje.html:436`, `kontakt.html:118-194`
- **Current implementation:** `npm run check` validates file references (`src`, `href`, `srcset`, `data-partial-src`, form `action`, CSS `url()`/`@import`, manifest `src`) and the shell contracts. It does not check same-document references. Examples are `aria-describedby`, which `form.js` resolves with `getElementById` to show messages, `aria-controls` on the navigation toggle, `aria-labelledby`/`aria-describedby` on both dialogs, `label[for]`, and fragment links such as the `#main` skip link. The archived audit ran such a check by hand once; it is not repeatable. A read-only scan run during this analysis on the eleven pages with the shell resolved found 65 such references and no duplicate IDs or dangling targets.
- **Proposed improvement:** Extend `scripts/check.mjs` to check, per page with the shared shell resolved in memory, that IDs are unique and that every `aria-labelledby`, `aria-describedby`, `aria-controls`, `label[for]`, and fragment-only `href` points to an existing ID.
- **Expected quality value:** Edits to the partials or to individual pages that rename or duplicate an ID would be caught before a build or browser run. This matters because the shell is merged into eleven documents and the runtime fails quietly when a target is missing: `form.js` returns early and shows no message, and dialogs lose their accessible name.
- **Implementation scope:** `scripts/check.mjs` only. Reuse `resolveSharedShell` and the existing comment and script stripping, collect failures through the existing `fail()` path, and add the count to the summary output. Keep Node built-ins only, write no files, and leave `scripts/html-shell.mjs`, `vite.config.js`, and the build unchanged.
- **Acceptance criteria:** `npm run check` reports the number of ID references checked and passes on the current tree. In a throwaway copy of the tree, the following each produce a named failure and a non-zero exit: a removed `name-error` element, a duplicated ID across a page and a partial, a renamed `site-menu`, and a broken `#main` target. `node --check scripts/check.mjs` passes, and no file is written by the command.
- **Impact:** Medium
- **Effort:** Small

## Selection summary

These five were selected because each protects a behaviour that already works and is documented as a contract, yet has no repeatable check. Three of them (01, 03, 04) guard fixes recorded in `docs/CHANGELOG.md`, so a regression in those areas would currently go undetected.

- **Quality areas:** regression protection for state resolution (01), the input and submission workflow (02), and modal accessibility (03); resilience under blocked storage (04); static verification of accessibility references (05).
- **Dependencies:** none between proposals. Each can be implemented and verified on its own. 01, 03, and 04 all touch storage-related tests; implementing them in sequence avoids conflicting edits to the shared helper in `tests/support/app.js` if any of them extends it.
- **Scope:** four are Small and one is Medium. All use existing tooling, so together they form a realistic backlog for one focused development session.
- **Considered and not selected:** coverage for `404.html`, which already has the shell, `noindex` and reference checks, so its remaining value was lower; checks for all nine lightbox cards, judged lower-risk because every card shares one markup pattern; and isolating module initialization failures in `js/app.js`, for which no realistic failure source was found.

## Analysis limitations

- No Playwright test was run for this analysis. Statements about existing tests describe their source, not passing results. Checks actually performed: `npm run check` passed (11 pages, 392 local references, no files written), and a read-only in-memory ID-reference scan, run from the scratchpad, found no problems.
- The JavaScript mobile breakpoint (`window.innerWidth <= 1024`, `js/modules/nav.js:11` and `:71`) and the CSS desktop query (`@media (min-width: 1024px)`, `css/components/nav.css:315`) overlap at exactly 1024 px. This is a possible source inconsistency rather than an improvement opportunity, so it is excluded here and should be evaluated in an audit. No proposal above depends on it.
- No other `IMPROVEMENTS-*.md` reports, active `PLAN.md`, or active audit exist in the repository. Duplication was checked only against `docs/CHANGELOG.md`, `docs/archive/audits/AUDIT-2026-08-15.md`, and `docs/archive/plans/PLAN-2026-08-15.md`.
