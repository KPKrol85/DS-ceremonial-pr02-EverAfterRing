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

- **Affected area:** Privacy policy, cookies policy, and terms body content.
- **Evidence:** `polityka-prywatnosci.html:90-131`, `cookies.html:90-126`, `regulamin.html:88-120`; `css/layout.css:1-3,40-43`; `css/base.css:80-84`; `css/tokens.css:54-74,118`.
- **Current state:** Legal articles use the same container, capped at 1100 px, as marketing grids. Paragraphs inherit the general 0.85rem size, while nested `.stack` layouts add gaps alongside the default paragraph and heading margins. There is no dedicated prose measure or typography variant.
- **Proposed improvement:** Introduce a shared legal-prose treatment with a narrower text measure, base-size body text, relaxed line height, and explicitly owned heading and paragraph spacing. Keep the existing fonts and theme colors.
- **Expected value:** Give sustained reading a distinct typographic scale and more consistent grouping than the compact copy used inside cards.
- **Implementation scope:** Scope styles to the three legal content regions through their canonical HTML and the existing CSS import structure. Preserve Polish wording, numbered headings, links, `data-project-notice-skip`, and the cookies table's independently scrollable region; do not narrow the global container.
- **Acceptance criteria:** At desktop widths, prose has a maximum measure of approximately 70ch, uses the existing 1rem and 1.7 line-height tokens, and has one consistent spacing rule between headings, paragraphs, and lists. At 320 and 390 px, text fits the available width; the cookies table retains its focusable scroll wrapper and may use the wider outer container. Marketing content and both themes retain their existing styling.
- **Impact:** Medium
- **Effort:** Medium

### IMP-UI-02 — Style invalid form controls from their existing ARIA state

- **Affected area:** Contact-form inputs, selects, and textarea.
- **Evidence:** `js/modules/form.js:6-24,43-76`; `kontakt.html:125-187`; `css/components/forms.css:28-48`; `css/base.css:49-55`.
- **Current state:** Validation already sets and clears `aria-invalid` together with descriptive error messages. Error text uses the error token, but control styling keeps the same border and surface in all validation states; no stylesheet selector consumes `aria-invalid`.
- **Proposed improvement:** Add a consistent invalid border treatment keyed to `[aria-invalid="true"]`, using the existing theme-aware error token while retaining the textual explanation and separate focus ring.
- **Expected value:** Strengthen the visual association between each validation message and its control when several fields need correction.
- **Implementation scope:** Limit implementation to `css/components/forms.css`; retain current validation timing, messages, ARIA relationships, reserved error space, package preselection, focus handling, and native Netlify submission. Do not use unconditional `:invalid` styling that marks untouched required fields.
- **Acceptance criteria:** Inputs, selects, and the textarea receive the same invalid treatment only after the existing attribute is set and return to their normal border when it is removed. Invalid focused controls retain a distinguishable focus ring; error text remains present. Check empty required values, email format, guest limits, and select recovery in both themes without changing field dimensions or layout.
- **Impact:** Medium
- **Effort:** Small

### IMP-UI-03 — Scale section spacing with the existing responsive layouts

- **Affected area:** Shared `.section` regions, especially the repeated sections on the home and services pages.
- **Evidence:** `css/tokens.css:87-94,117-121`; `css/layout.css:6-8,27-38`; `index.html:119-183`; `uslugi.html:111-162,259-313`.
- **Current state:** Grids adapt to available width, but every `.section` uses the same 6rem top and bottom padding at all viewport sizes. The section-spacing token has no responsive override.
- **Proposed improvement:** Give the existing section-spacing token a bounded responsive value, with a smaller narrow-screen spacing drawn from the current spacing scale and the existing 6rem desktop maximum.
- **Expected value:** Keep section separation proportional to the narrower, often stacked layouts while retaining the spacious desktop presentation.
- **Implementation scope:** Prefer a change confined to the section-spacing token in `css/tokens.css`, using the existing `.section` consumer. Preserve section order, alternating surfaces, grid rules, component padding, and the separate hero, callout, header, and footer spacing.
- **Acceptance criteria:** At 320 and 390 px, computed section padding is lower than 6rem and no lower than the existing 3rem spacing step; at 1280 px, it remains 6rem. Intermediate widths follow a bounded, non-decreasing scale. Representative home, services, and contact sections retain readable separation in both themes, with unchanged grid transitions and no content clipping.
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
