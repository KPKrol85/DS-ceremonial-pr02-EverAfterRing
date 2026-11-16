# EverAfterRing — UI Improvements

**Analysis date:** 2026-11-15
**Project type:** Polish static multi-page demonstration website using HTML, CSS, Vanilla JavaScript ES modules, Vite, and Netlify Forms; no runtime dependencies
**Analysis mode:** Evidence-based UI improvement review
**Focus:** Project-wide UI

## Improvement overview

The interface uses Cormorant Garamond and Inter, semantic theme tokens, shared page partials, reusable cards, and responsive grids. Inspection covered the eleven pages, shared navigation and footer, hero sections, packages, services, portfolio and lightbox, contact form, project notice, and legal documents.

Five source-supported opportunities were selected: dedicated reading typography, field-level validation styling, responsive section spacing, consistent package price placement, and control-specific card feedback. These proposals refine existing presentation without changing content, navigation flows, or functionality. The changelog and archived plan, audit, and improvement records were checked to exclude delivered work; no active root plan or existing UI improvement report was present.

## Proposed improvements

### IMP-UI-01 — Give legal documents a dedicated reading layout

- **Status:** COMPLETED — implemented and verified.
- **Result:** The terms, privacy policy, and cookies policy share a scoped `.legal-prose` layout in `css/components/legal.css`: headings, paragraphs, and lists use one 70ch measure, prose uses the 1rem and 1.7 line-height tokens, and spacing is owned by a 3rem section gap and the existing 1rem article gap instead of element margins. The cookies table region keeps the full container width and its scroll, label, and focus contracts.
- **Verification:** `npm run check`, `npm run build`, and `git diff --check` passed. Chromium measurements of the built pages at 320, 390, and 1280 px confirmed 16px/27.2px prose, a 706.6px desktop measure, no page overflow or clipped prose, a keyboard-focusable scrolling table region, and unchanged light and dark colors; eight other pages showed no computed-style changes at 1280 px. Screenshots, physical devices, and non-Chromium browsers were not checked.
- **Impact:** Medium
- **Effort:** Medium

### IMP-UI-02 — Style invalid form controls from their existing ARIA state

- **Status:** COMPLETED — implemented and verified.
- **Result:** Contact-form inputs, selects, and the textarea marked `aria-invalid="true"` now use the theme-aware `--color-error` border and return to the standard border when the attribute is removed. Border width, layout, validation logic, error text, and the `:focus-visible` ring are unchanged.
- **Verification:** `npm run check` passed, and `npm run test:smoke -- tests/form-validation.spec.js` passed 25 of 25 tests in Chromium, covering empty required values, email format, guest limits, select and textarea recovery, the untouched optional phone field, unchanged control sizes, and a keyboard-focused invalid field in light and dark themes. Control sizes were measured only at the default desktop viewport.
- **Impact:** Medium
- **Effort:** Small

### IMP-UI-03 — Scale section spacing with the existing responsive layouts

- **Status:** COMPLETED — implemented and verified.
- **Result:** The shared `--section-space` token in `css/tokens.css` is now `clamp(3rem, 7.5vw, 6rem)`, so `.section` top and bottom padding stays at 3rem up to a 640 px viewport, grows linearly, and reaches the existing 6rem at 1280 px and above. Hero, callout, header, footer, grid, component, and legal-prose spacing are unchanged.
- **Verification:** `npm run check`, `npm run build`, and `git diff --check` passed. Built-page measurements in the Chromium-based app browser gave equal top and bottom padding of 48, 48, 57.6, 76.8, and 96 px at 320, 390, 768, 1024, and 1280 px on all nine pages with sections in light and dark themes, a non-decreasing 48–96 px range across a 300–2400 px sweep, and no other computed-style, grid-column, content-height, or horizontal-overflow differences from the pre-change build. Screenshots, physical devices, and non-Chromium browsers were not checked.
- **Impact:** Medium
- **Effort:** Small

### IMP-UI-04 — Share the package price-placement contract across both presentations

- **Affected area:** Package summaries on the home page and detailed packages on the offer page.
- **Evidence:** `index.html:185-214`; `oferta.html:119-163`; `css/components/cards.css:194-204`.
- **Current state:** Both presentations reuse package names, titles, and `.card__price`. Offer cards additionally use `.card--package` as a flex column, allowing the price's auto top margin to absorb spare height. Home-page package cards use ordinary block layout, so the shared price rule does not provide the same alignment behavior there.
- **Proposed improvement:** Apply one package layout contract to both presentations so prices occupy a consistent lower region within each grid row despite different description lengths. Retain the existing detailed and summary content variants.
- **Expected value:** Make repeated package information more consistent across pages and keep price placement independent of incidental text wrapping.
- **Implementation scope:** Reuse `.card--package` in the home-page package section and make only necessary scoped refinements in `css/components/cards.css`. Preserve offer benefits, all prices, typography and colors, the three existing inquiry links and their exact query values, and the home page's shared offer link.
- **Acceptance criteria:** All six package cards use the shared layout. Within a multi-column row, price baselines align when descriptions wrap to different heights; offer CTAs retain a consistent bottom position. Single-column cards size naturally without fixed heights. Other home-page cards remain unchanged, and package preselection continues to use the existing links.
- **Impact:** Medium
- **Effort:** Small

### IMP-UI-05 — Tie card emphasis to the controls inside each card

- **Affected area:** Informational cards and portfolio image controls.
- **Evidence:** `css/components/cards.css:1-15,60-71`; `index.html:126-150`; `o-nas.html:143-158`; `realizacje.html:128-157`; `css/base.css:107-118`.
- **Current state:** The generic `.card:hover` translates every card upward and changes its shadow, including feature and team articles without controls. Portfolio cards receive that same whole-card hover effect, while their actual image button has its own zoom cursor and keyboard focus outline.
- **Proposed improvement:** Keep informational card surfaces stable and concentrate hover and keyboard emphasis on existing interactive elements, particularly the portfolio image trigger. Use the existing borders, colors, and shadows rather than adding a new visual style.
- **Expected value:** Make visual feedback correspond more closely to the actual control boundary while keeping surrounding descriptive content stable.
- **Implementation scope:** Refine scoped states in `css/components/cards.css`, preserving static card variants and the image's inset focus outline. Keep all existing buttons, links, `data-*` hooks, lightbox gestures, gesture hint, dialog behavior, and focus restoration; do not make entire cards clickable or alter hero effects.
- **Acceptance criteria:** Hovering feature or team copy leaves its card position and shadow unchanged. Portfolio image controls show localized feedback on hover and keyboard focus, with the inset outline remaining visible. Touch activation remains unchanged, and reduced-motion mode adds no translation or scaling. Package and contact controls retain their existing states in both themes.
- **Impact:** Medium
- **Effort:** Small

## Selection summary

The proposals address repeated, existing presentation patterns and reuse current tokens, markup, and state contracts. Ordering reflects engineering judgment about scope and practical value, not measured user outcomes. None duplicates the completed UX changes, ARIA validation work, or color-token consolidation.

All five can be implemented independently. IMP-UI-04 and IMP-UI-05 share `css/components/cards.css` and should be coordinated; IMP-UI-01 should be visually reviewed with IMP-UI-03 if both are adopted. No dependency, asset generation, framework change, or new feature is required.

## Analysis limitations

- This review used current canonical sources and documentation. No browser rendering, current screenshots, contrast measurements, physical-device checks, or usability research were performed; responsive and visual acceptance criteria describe future verification, not observed failures or measured gains.
- `npm run check` passed for 11 pages, 399 local references, 65 ID references, two partials, 20 stylesheets, and one manifest. This confirms source consistency and shared-shell contracts, not rendered UI quality. No build or browser suite was run.
- Impact and effort are relative engineering estimates. No implementation was performed; only this report was created.
