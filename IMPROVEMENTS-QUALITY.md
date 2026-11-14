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

- **Affected area:** Contact form on `kontakt.html` (`js/modules/form.js`).
- **Evidence:** `js/modules/form.js:35-89`, `kontakt.html:118-194`, `tests/form-validation.spec.js:7-30`, `README.md:240`, `README.md:566`
- **Current implementation:** The module sets `novalidate`, validates eight `[data-validate]` fields through `field.validity`, and maps outcomes to three Polish messages: `valueMissing`, `typeMismatch`, and a generic fallback used by the `guests` `min`/`max` range. On an invalid submit it writes a message to the `aria-live` status region and focuses the first invalid field. On a valid submit it clears the status and allows the native Netlify Forms POST to `/dziekujemy.html`, which includes the hidden `form-name` and the honeypot. The only test covers the first field's `valueMissing` state. The README states that the other fields, validity types, and submission are not covered.
- **Proposed improvement:** Add focused tests for the remaining validation paths and the valid submission path. Cover email `typeMismatch`, the `guests` range fallback, a `select` with `valueMissing`, the status-region message, and a valid submit that is not prevented. Intercept the submission at the request level.
- **Expected quality value:** Protects the site's only user-input workflow end to end. This includes the Netlify Forms payload contract (`form-name`, field names, empty honeypot), which no current check observes and which would otherwise only fail once deployed.
- **Implementation scope:** Extend `tests/form-validation.spec.js`. Intercept `POST /dziekujemy.html` with `page.route` so the test depends on neither Netlify nor how Vite preview handles POST requests. No change to `js/modules/form.js`, the messages, or the form markup.
- **Acceptance criteria:** An invalid email produces `aria-invalid="true"` and the description `Wprowadź poprawny format.`. A `guests` value outside 10–400 produces `Sprawdź poprawność pola.`. An empty `budget` select produces `To pole jest wymagane.`. An invalid submit shows `Uzupełnij zaznaczone pola, aby wysłać zapytanie.` in the status region. A fully valid submit issues one POST to `/dziekujemy.html` whose body contains `form-name=kontakt-everafterring` and every validated field name, with no field left `aria-invalid`. All of these pass against a fresh build.
- **Impact:** High
- **Effort:** Medium

### IMP-QUALITY-03 — Cover the project-notice modal's focus containment and dismissal paths

- **Affected area:** Project notice dialog (`js/modules/project-notice.js`, `trapFocus` in `js/utils.js`, `partials/footer.html`).
- **Evidence:** `js/modules/project-notice.js:70-100`, `js/utils.js:35-49`, `partials/footer.html:101-117`, `tests/project-notice.spec.js:6-29`, `docs/CHANGELOG.md:43`
- **Current implementation:** The notice opens on a first visit and focuses its `tabindex="-1"` container. It holds a focus trap that also handles `Tab` pressed while the container itself is focused. It closes via `Escape`, the `Akceptuję` button, or the `[data-project-notice-close]` backdrop, and persists acceptance last. The tests cover opening, `Escape` dismissal, and a pre-seeded acceptance. They do not cover `Tab`/`Shift+Tab` containment, backdrop dismissal, or acceptance written through the button.
- **Proposed improvement:** Add tests for the three remaining contract paths of this modal: keyboard focus containment, backdrop dismissal, and acceptance persisted through the button and honoured on reload.
- **Expected quality value:** The changelog records containment and backdrop dismissal as delivered fixes, but no executable check protects them. The container-entry case in `trapFocus` is subtle and shared with the mobile navigation, so a regression there would affect both.
- **Implementation scope:** Extend `tests/project-notice.spec.js` only. No change to the module, `trapFocus`, the partial, or the storage key.
- **Acceptance criteria:** From the focused dialog container, `Tab` focuses the first focusable element in the dialog and `Shift+Tab` focuses the last one. Repeated `Tab` presses never move focus outside the dialog. A click on the backdrop outside the dialog panel hides the notice. Pressing `Akceptuję` hides the notice, and after `page.reload()` the notice stays hidden. These pass against a fresh build.
- **Impact:** Medium
- **Effort:** Small

### IMP-QUALITY-04 — Verify graceful degradation when browser storage is unavailable

- **Affected area:** Storage-dependent features: theme bootstrap, theme toggle, project notice.
- **Evidence:** `js/theme-bootstrap.js:10-17`, `js/modules/theme.js:10-25`, `js/modules/project-notice.js:5-21`, `js/modules/project-notice.js:92-93`, `tests/support/app.js:8-13`, `docs/CHANGELOG.md:45`
- **Current implementation:** Every `localStorage` read and write is wrapped in `try`/`catch`. An unreadable store resolves to no stored theme and no acceptance, so the notice still renders and dismissal works for the current page. The acceptance write runs last so the close path never depends on it. The changelog records this resilience as a delivered fix. Every existing test runs with a working `localStorage`.
- **Proposed improvement:** Add one focused test that makes `window.localStorage` throw before any page script runs. It then verifies that the documented degradation holds without uncaught errors.
- **Expected quality value:** Converts a source-level guarantee into an executable one for the browsers and privacy settings that block site data. Any new unguarded storage access added later in these modules would then fail the suite instead of halting `js/app.js` initialization.
- **Implementation scope:** One new spec file, or one test in an existing spec, that uses an init script to make the `localStorage` getter throw a `SecurityError`. No change to application source or to the existing storage-seeding helpers.
- **Acceptance criteria:** With storage blocked, loading `/` records no `pageerror` events. `<html data-theme>` resolves to `light` under the pinned light scheme. The project notice opens and closes with `Akceptuję`. The theme toggle switches the document to dark and back for the current page. The header navigation, initialized after the notice in `js/app.js`, remains operable. These pass against a fresh build.
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
