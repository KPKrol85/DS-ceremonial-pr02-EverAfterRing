# EverAfterRing — UX Improvements

**Analysis date:** 2026-11-15
**Project type:** Static multi-page website in Polish (HTML, CSS, Vanilla JavaScript ES modules) with a Vite development server and production build into `dist/`; Netlify Forms contact submission; no runtime dependencies or backend
**Analysis mode:** Evidence-based UX improvement review
**Focus:** Project-wide UX

## Improvement overview

The site's core journeys are browsing the offer and services, viewing the portfolio, and sending an inquiry through the contact form. The shared navigation, theme toggle, mobile menu, project notice, portfolio lightbox, and form validation are implemented with sound focus and state handling. The opportunities below concern how clearly the existing interactions explain themselves and how smoothly visitors move between pages: an undisclosed lightbox gesture, two content pages without a next step, a lost package choice between the offer and the form, generic validation messages, and a notice that covers the legal documents it links to.

## Proposed improvements

### IMP-UX-01 — Disclose the portfolio lightbox opening gesture

- **Status:** COMPLETED — implemented and verified.
- **Result:** The "Wybrane historie" header on `realizacje.html` shows one Polish gesture hint, a double-click instruction for a fine primary pointer or a tap instruction for a coarse one, selected in CSS by the same `(pointer: coarse)` query the lightbox uses as its fallback. The hint is authored `hidden` and revealed by `initLightbox()` only after initialization completes; opening gestures, dialog behavior, and focus return are unchanged.
- **Verification:** `npm run check`, `npm run build`, and the unchanged `tests/portfolio-lightbox.spec.js` passed. A temporary Playwright probe passed 30 of 30 checks: one correct wording in Desktop Chrome and Pixel 5 emulation, light, dark, and system-dark contrast of 6.34:1 and 9.42:1, stable layout at 320, 393, and 1280 px, the hint kept hidden without JavaScript, without `showModal()`, and on incomplete initialization, and unchanged gestures on all nine cards. Real touch hardware and hybrid devices were not tested; on hybrids the primary pointer selects the wording.
- **Impact:** High
- **Effort:** Small

### IMP-UX-02 — Give the services and about pages a closing next step

- **Status:** COMPLETED — implemented and verified.
- **Result:** `uslugi.html` and `o-nas.html` now end with the existing `.callout` section, with page-specific Polish copy and actions to `kontakt.html` and `oferta.html`. The markup reuses the `index.html` pairing of `button--light` and `button--primary`, because the `button--ghost` action on `realizacje.html` measures 1.98:1 text contrast on the light-theme callout; no CSS, JavaScript, or navigation changed.
- **Verification:** `npm run check`, `npm run build`, and `git diff --check` passed. In the production preview, both callouts were the last child of `<main>`, both destinations returned HTTP 200, buttons stayed on one row without horizontal overflow at 320, 375, and 1280 px, colors matched the `index.html` callout in light, dark, and system themes (text contrast at least 5.67:1), and Tab, Shift+Tab, Enter, and the visible focus ring worked. Screenshots were unavailable because the browser pane does not composite.
- **Impact:** Medium
- **Effort:** Small

### IMP-UX-03 — Carry the selected package from the offer into the contact form

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added inquiry links to all three offer package cards and initialized the contact-form selection from exact, non-empty matches against its existing option values. The selection remains editable; missing or invalid parameters preserve the placeholder and required validation.
- **Verification:** `npm run check`, `npm run test:smoke -- tests/form-validation.spec.js` (17 Chromium tests, including 9 new regressions), and `git diff --check` passed. Production-preview checks verified 27 keyboard journeys in light, dark, and system-dark themes at 320, 390, and 1280 px, editable selections, visible focus, no horizontal overflow or JavaScript errors, and link text contrast of 7.73:1 in light and 9.76:1 in dark themes; screenshots confirmed the layout. Actual Netlify delivery, other browser engines, and physical mobile devices were not tested.
- **Impact:** Medium
- **Effort:** Small

### IMP-UX-04 — Make contact-form validation messages name the expected input

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added precise Polish email-format and guest-range messages, deriving the range from the input's `min` and `max` attributes. Preserved required-value messages, generic fallbacks, validation rules, and form interactions.
- **Verification:** `npm run check`, `npm run test:smoke -- tests/form-validation.spec.js` (production build and 22 Chromium tests), and `git diff --check` passed. Tests covered guest counts of 5 and 500, dynamic and missing boundaries, unsupported errors, blur validation, error clearing, ARIA descriptions, first-invalid focus, prevented invalid submission, package preselection, and the native POST payload. Actual Netlify delivery and other browser engines were not tested.
- **Impact:** Medium
- **Effort:** Small

### IMP-UX-05 — Stop the project notice from covering the legal pages it links to

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added `data-project-notice-skip` to the three legal documents and an early initialization guard that leaves the notice hidden without accessing acceptance storage, trapping focus, or locking scrolling. Unmarked pages retain existing notice and acceptance behavior.
- **Verification:** `npm run check`, `npm run test:smoke -- tests/project-notice.spec.js tests/storage-unavailable.spec.js` (production build and 12 Chromium tests), and `git diff --check` passed. Six new regressions verified initialized legal pages, direct visits, notice links, keyboard navigation, absent acceptance, and reopening on return; existing tests verified dismissal, focus handling, acceptance persistence, and unavailable storage. The sandbox blocked localhost access (`EACCES`), so smoke tests passed after rerunning outside it; other browser engines and physical devices were not tested.
- **Impact:** Medium
- **Effort:** Small

## Selection summary

- The proposals cover the portfolio, content-page exits, the offer-to-inquiry handover, form recovery, and the first-visit notice, without duplicating archived quality or technical improvements or the `docs/CHANGELOG.md` history. No active `PLAN.md` or `IMPROVEMENTS-UI.md` exists to conflict with.
- IMP-UX-03 and IMP-UX-04 both change `js/modules/form.js` and should be implemented one after the other. All other proposals are independent.
- All five are Small, bounded to existing pages, modules, and components, and suitable as a focused candidate backlog.
- Considered but not selected: a pending state on form submission (benefit limited for a native POST with redirect) and an in-page index for the five `uslugi.html` sections (would also need sticky-header anchor offsets; lower value than the selected items).

## Analysis limitations

- The analysis was static; no command, test, or browser session was run. The notice reopening on legal pages (IMP-UX-05) and the single-click behavior (IMP-UX-01) are established from source and existing tests, not observed at runtime.
- No user research or analytics exist; impact ratings are relative judgments.
- IMP-UX-01 deliberately keeps the documented mouse double-click decision; changing the gesture itself was not proposed.
