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

- **Affected journey:** Choosing a package on `oferta.html` and sending an inquiry on `kontakt.html`.
- **Evidence:** `oferta.html:121-160` (three package cards with no per-package action); `oferta.html:190-192` (one generic contact button below the add-ons); `kontakt.html:169-176` (required "Preferowany pakiet" select with Essential, Signature, and Full Service options, empty by default); `js/modules/form.js:26-32` (form initialization without any preselection).
- **Current experience:** A visitor who has chosen a package on the offer page has no action on that card. They must find the generic contact button, then pick the same package again in a required select on the contact page.
- **Proposed improvement:** Give each package card an inquiry link to `kontakt.html` that identifies the package, and preselect the matching `package` option when the contact form loads with a recognized value.
- **Expected user value:** The choice made on the offer page carries over to the form, which removes a repeated decision and a likely validation stop in the main inquiry journey.
- **Implementation scope:** Three links in `oferta.html`. A small preselection step in `js/modules/form.js` that accepts only values matching an existing option and otherwise leaves the select at "Wybierz pakiet". Required validation, field order, Netlify Forms attributes, and the submitted payload format must not change. Home-page package cards may reuse the same links only if this stays within the same change.
- **Acceptance criteria:** Following each package link opens the contact form with the corresponding package selected and still editable. Opening `kontakt.html` directly, or with an unknown value, leaves the select empty and the existing required-field validation applies. `tests/form-validation.spec.js` continues to pass.
- **Impact:** Medium
- **Effort:** Small

### IMP-UX-04 — Make contact-form validation messages name the expected input

- **Affected journey:** Correcting invalid input in the contact form on `kontakt.html`.
- **Evidence:** `js/modules/form.js:34-49` (three generic messages: `To pole jest wymagane.`, `Wprowadź poprawny format.`, `Sprawdź poprawność pola.`); `kontakt.html:133` (`type="email"`); `kontakt.html:178-182` (`guests` with `min="10"` and `max="400"`, no visible hint of the range); `tests/form-validation.spec.js:79-97` (current messages asserted).
- **Current experience:** An invalid email address shows "Wprowadź poprawny format." without saying which format is expected. A guest count outside 10–400 shows "Sprawdź poprawność pola." without stating the allowed range, which is not displayed anywhere on the page.
- **Proposed improvement:** Produce validity-specific Polish messages that state the expected input: an email example for `typeMismatch`, and the field's own `min`/`max` values for range errors.
- **Expected user value:** Visitors can correct a rejected value on the first attempt instead of guessing what the field requires.
- **Implementation scope:** `js/modules/form.js` message selection, deriving range values from the field's attributes rather than hard-coding them. Update the asserted messages in `tests/form-validation.spec.js`. Validation rules, timing (blur, input, submit), `aria-invalid` handling, `aria-describedby` associations, the status message, and focus on the first invalid field must not change.
- **Acceptance criteria:** Entering `5` or `500` guests and leaving the field shows a message stating the 10–400 range. An invalid email shows a message with an example address. Required-field messages are unchanged. The updated `tests/form-validation.spec.js` passes.
- **Impact:** Medium
- **Effort:** Small

### IMP-UX-05 — Stop the project notice from covering the legal pages it links to

- **Affected journey:** First visit, reading "Regulamin", "Polityka prywatności", or "Cookies" from the project notice.
- **Evidence:** `partials/footer.html:166-186` (notice on every page via the shared footer, with links to the three legal pages); `js/modules/project-notice.js:41-43` and `js/modules/project-notice.js:82-102` (acceptance is stored only through accept, backdrop, or `Escape`; the notice opens on every page load until then); `cookies.html:85` and `regulamin.html:133` (legal pages state the demonstrational character themselves).
- **Current experience:** A first-time visitor who follows a legal link inside the notice navigates without dismissing it. Because acceptance was not stored, the same modal opens again on the destination page and covers the document the visitor chose to read, so they must dismiss it before reading.
- **Proposed improvement:** Do not open the notice automatically on the three legal pages, so a visitor can read them directly. The notice continues to appear on other pages until it is dismissed.
- **Expected user value:** The links offered inside the notice lead straight to readable content instead of back into the same dialog.
- **Implementation scope:** A page-level opt-out marker on `regulamin.html`, `polityka-prywatnosci.html`, and `cookies.html`, read by `js/modules/project-notice.js` before opening. The notice markup in the shared footer, the storage key, acceptance semantics, focus containment, and dismissal paths must not change. The notice must not be treated as accepted merely because a legal page was visited.
- **Acceptance criteria:** With no stored acceptance, opening any of the three legal pages shows no notice and no scroll lock. Opening any other page afterwards still shows the notice. `tests/project-notice.spec.js` and `tests/storage-unavailable.spec.js` continue to pass.
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
