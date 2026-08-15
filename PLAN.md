# EverAfter Ring — Development Plan

**Last reviewed:** 2026-08-13
**Project type:** Static multi-page website in Polish (HTML, CSS, Vanilla JavaScript ES modules) with a Node-based production build into `dist/`; no runtime dependencies, no backend
**Plan status:** Required scope complete — only optional items remain

## Planning principles

- The plan reflects the current verified repository state.
- A main item is checked only when all required subtasks are complete and its completion condition is satisfied.
- Canonical sources are `partials/`, `css/main.css` and its imports, `js/app.js` and its modules, and the build configuration in `vite.config.js` with `scripts/html-shell.mjs`; `dist/` is generated output and is never edited directly.
- Completed significant changes are recorded separately in `CHANGELOG.md`.
- Findings referenced as `AUDIT.md — P1-xx` / `P2-xx` were re-verified against the current source before being entered here.
- `AUDIT.md` lists only findings that are still open; a `Source:` reference to a finding no longer listed there means the finding is resolved and the change is recorded in `CHANGELOG.md`.

## Current status

All required work in Phases 1–4 is complete; no required item remains open, and `AUDIT.md` lists no open `P0`, `P1` or `P2` finding.

The only unchecked entries left in this plan are `O-01`, `O-02` and `O-03` under "Optional future improvements". They are non-blocking refinements rather than outstanding remediation work, and none of them is scheduled.

## Phase 1 — Verifiable repository and build baseline

**Goal:** Make working-tree diffs reviewable and make the documented production build runnable without side effects, so every later change can be verified.

- [x] **PH1-01 — Establish a line-ending normalisation policy** — **Priority:** Medium
  - [x] add a root `.gitattributes` declaring text detection and the normalised committed form (no `.gitattributes` currently exists in the repository)
  - [x] renormalise the index so the eight files that currently differ from `HEAD` only by carriage returns no longer report whole-file diffs (`.gitignore`, `LICENSE`, `cookies.html`, `css/components/project-notice.css`, `js/modules/hero.js`, `js/modules/project-notice.js`, `polityka-prywatnosci.html`, `regulamin.html`)
  - [x] resolve the mixed line endings inside `js/modules/hero.js`, which currently contains a single CRLF line among LF lines
  - [x] re-check `git status` and `git diff --stat` after normalisation
  - **Source:** `AUDIT.md` — P2-03
  - **Completion condition:** editing one line in a source file produces a one-line diff, and `git diff --ignore-cr-at-eol --stat` and `git diff --stat` agree
  - **Note:** `css/components/project-notice.css` and `js/modules/project-notice.js` are also touched by `PH2-03`, so this item runs first to keep that review readable
  - **Delivered:** `054c1c9`. `.gitattributes` declares `* text=auto eol=lf` plus explicit `binary` for `.avif`, `.ico`, `.jpg`, `.png`, `.webp`, `.woff2`. `git ls-files --eol` reports `i/lf w/lf` for all eight files and no CRLF or mixed entry anywhere in the repository; `js/modules/hero.js` contains no carriage return; `git status` and `git diff --stat` are both clean, so `git diff --stat` and `git diff --ignore-cr-at-eol --stat` agree.

- [x] **PH1-02 — Separate image generation from the deployment build** — **Priority:** Medium
  - [x] change the `build` script in `package.json` so the deployment build no longer chains `optimize:images`
  - [x] keep `npm run optimize:images` as the explicit step run when sources under `assets/img-src/` change
  - [x] update the build sequence described in `README.md` ("Build produkcyjny" / "Production Build") to match the new script contract
  - [x] run the build once with dependencies installed and confirm it writes only into the ignored `dist/` directory
  - **Source:** `AUDIT.md` — P2-05
  - **Completion condition:** `npm run build` completes and `git status` remains clean afterwards
  - **Depends on:** `PH1-01`
  - **Delivered:** `85dc8e2`. `package.json` — `scripts.build` is now `node scripts/build.mjs build`; `optimize:images` is retained as a standalone script. Both language sections of `README.md` describe the five-step build and state that image generation is no longer part of it, replacing the note that the build was never run because it overwrote `assets/img/`. The implementing task ran `npm run build` against the new contract with dependencies installed: it completed, produced `dist/`, did not run image optimisation, and left `assets/img/` and `package-lock.json` untouched, so `git status` stayed clean. `scripts/build.mjs` writes only beneath `distRoot`, and `.gitignore:11` ignores `/dist/`.

## Phase 2 — Interaction-state defects

**Goal:** Correct the four implemented behaviours that do not match the contract the project documents, establishing correct defaults instead of relying on JavaScript to repair them.

- [x] **PH2-01 — Resolve theme fallback in one shared place** — **Priority:** High
  - [x] remove the duplicated resolution: `js/theme-bootstrap.js` resolves stored value → `prefers-color-scheme: dark` → `light`, while `resolveTheme()` in `js/modules/theme.js` resolves stored value → `light` and `initTheme()` applies it unconditionally
  - [x] either share one fallback chain between both entry points or have `initTheme()` adopt the value already present on `<html data-theme>`
  - [x] confirm the toggle's `aria-pressed` and `aria-label` report the effective theme after load
  - **Source:** `AUDIT.md` — P1-01
  - **Completion condition:** with no `everafterring-theme` entry and a system dark preference, `<html data-theme>` stays `dark` after load and the toggle reports the dark state, matching the fallback documented in `README.md`
  - **Delivered:** `e5997f5`. The second resolution was removed by adoption rather than duplication: `resolveTheme()` in `js/modules/theme.js:34` is now `getStoredTheme() || getDocumentTheme() || "light"`, where `getDocumentTheme()` (`js/modules/theme.js:27-30`) reads and validates `<html data-theme>` — the value the bootstrap already wrote. `applyTheme()` routes through `updateToggle()` (`js/modules/theme.js:36-42`), so `aria-pressed` and `aria-label` are set from the effective theme. `js/theme-bootstrap.js:25-26` records the contract without changing its behaviour.

- [x] **PH2-02 — Make the closed state the mobile navigation default** — **Priority:** High
  - [x] author `[data-nav-panel]` in `partials/header.html` so it is closed by default at the mobile breakpoint
  - [x] correct the rule in `css/components/nav.css` where `.nav__panel:not([hidden])` resolves the base `translateX(-100%)` back to `translateX(0)`, making the open position the default below 1024 px
  - [x] reduce `initPanelState()` in `js/modules/nav.js` to managing ARIA state and the desktop case, so JavaScript is only required to open the panel
  - [x] verify the desktop breakpoint and the existing resize handling still expose the navigation correctly
  - **Source:** `AUDIT.md` — P1-02
  - **Completion condition:** a built page loaded at 375 px width with JavaScript disabled shows page content with no full-screen panel overlay, and with JavaScript enabled there is no open-panel frame before initialisation
  - **Delivered:** `c047695`. `partials/header.html:12` authors the panel with `hidden`; `.nav__panel:not([hidden])` is gone from both the mobile and the desktop selector list in `css/components/nav.css`, leaving `translateX(0)` to `[data-open="true"]` only, so the mobile default resolves to the base `translateX(-100%)`. `initPanelState()` (`js/modules/nav.js:24-32`) now only exposes the panel above the breakpoint and syncs `aria-expanded`. The desktop media query still neutralises `.nav__panel[hidden]`, and the resize, `Escape`, focus-trap and link-close paths (`js/modules/nav.js:36-102`) are unchanged.

- [x] **PH2-03 — Complete the project-notice dialog against its declared modality** — **Priority:** High
  - [x] route the existing `data-project-notice-close` backdrop in `partials/footer.html` to a defined close path, or remove the attribute so no dismiss affordance is implied
  - [x] add `Escape` handling to `js/modules/project-notice.js`
  - [x] reuse `trapFocus` from `js/utils.js` while the dialog is open, as `js/modules/nav.js` already does, and release it on close
  - [x] keep the existing focus restore to `previousFocus`
  - **Source:** `AUDIT.md` — P1-03
  - **Completion condition:** while the notice is open, `Tab` and `Shift+Tab` cycle only within the dialog, `Escape` closes it, and the backdrop either closes it or carries no close-intent attribute
  - **Depends on:** `PH1-01`
  - **Delivered:** `61506c3`. `js/modules/project-notice.js` opens through `trapFocus(dialog)`, binds a document `keydown` listener for `Escape`, and wires every `[data-project-notice-close]` host to the same close path; the close path releases the trap and the listener before restoring focus to `previousFocus` when that target is still connected and outside the notice. `trapFocus` in `js/utils.js` gained the programmatically focused-container case so `Tab` from the dialog itself enters the cycle instead of leaving it.

- [x] **PH2-04 — Derive the select indicator colour from a theme token** — **Priority:** High
  - [x] replace the hardcoded `%23f4e7d2` stroke in the inline SVG chevron in `css/components/forms.css` with a value derived from `css/tokens.css`, so it inverts with the theme
  - [x] establish what this actually removes from the component layer: it clears the last raw hex literal outside `css/tokens.css`, but not every raw colour value — the `rgb()`/`rgba()` shadow and backdrop tints in `css/components/buttons.css` and `css/components/project-notice.css` predate this task and are outside its scope
  - [x] check the indicator against `var(--color-surface)` in both themes
  - **Source:** `AUDIT.md` — P1-04
  - **Completion condition:** the dropdown indicator on both required `<select>` fields in `kontakt.html` is clearly distinguishable against the field background in `data-theme="light"` and `data-theme="dark"`
  - **Delivered:** `0e19ea8`. The data URI was dropped rather than recoloured — a data URI is a separate document and cannot read a custom property, so the chevron is now drawn as two `linear-gradient` strokes that consume `var(--color-text-muted)` directly (`css/components/forms.css:71-99`). The indicator therefore inverts with `data-theme` on its own. Against `var(--color-surface)` the pair resolves to `#6f6864` on `#ffffff` in light and `#cbbbae` on `#241d1a` in dark — the token pairs already measured in `AUDIT.md` section 3 at 5.47:1 and 8.90:1, against the previous 1.22:1 in light.

## Phase 3 — Resilience and content integrity

**Goal:** Close the remaining source-visible risks and align the machine-readable disclosure with the project's stated demonstration character.

- [x] **PH3-01 — Guard storage access in the project-notice module** — **Priority:** Medium
  - [x] wrap the read and the write of `everafterringProjectNoticeAccepted` in `js/modules/project-notice.js` using the defensive pattern already established in `js/modules/theme.js` and `js/theme-bootstrap.js`
  - [x] ensure a storage failure cannot propagate out of the `onReady` callback in `js/app.js`
  - **Source:** `AUDIT.md` — P2-01
  - **Completion condition:** with site data blocked, the notice still renders, dismissal works for the current page, and no uncaught error is logged
  - **Depends on:** `PH2-03`
  - **Delivered:** `3a6da33`. `hasStoredAcceptance()` and `storeAcceptance()` (`js/modules/project-notice.js:7-21`) wrap both access points in `try`/`catch`; an unreadable store resolves to "not accepted" so the notice still renders, and the write is performed last in `closeNotice()` so dismissal, focus release and the scroll lock never depend on it.

- [x] **PH3-02 — Resolve the cookies table scroll-region contract** — **Priority:** Medium
  - [x] decide between giving the `role="region" tabindex="0"` wrapper in `cookies.html` the overflow behaviour its semantics promise, or removing the region and `tabindex`
  - [x] if the region is kept, add the missing `table`, `th`, `td` and overflow rules — no such rule exists anywhere under `css/` today — consistent with the existing component layer
  - [x] keep the change scoped to this one table, the only table in the project
  - **Source:** `AUDIT.md` — P2-02
  - **Completion condition:** at 360 px width the table content is reachable within its own region without horizontal page overflow, and the focus stop performs an actual scroll or is removed
  - **Delivered:** `589e5a9`. The region was kept and made real: `css/components/table.css` gives `.table-scroll` `overflow-x: auto` with a `:focus-visible` state, and styles `.table`, `th` and `td` in the component layer; `cookies.html:126-127` carries the `.table-scroll` and `.table` classes, and `css/main.css:13` imports the new file.

- [x] **PH3-03 — Resolve ownership of unreferenced assets** — **Priority:** Low
  - [x] decide per file whether to remove or document: `assets/svg/sun.svg`, `assets/svg/moon.svg`, `assets/svg/facebook.svg`, `assets/svg/x.svg`, `assets/svg/linkedin.svg`, `assets/svg/github.svg`, `assets/logo/logo.png`, `assets/placeholders/placeholder.jpg` — none is referenced from any HTML, CSS, JS, `assets/favicon/site.webmanifest`, or build script
  - [x] state which icon copy is authoritative, given that the theme and social icons also exist inline in `partials/header.html` and `partials/footer.html`
  - [x] record the decision in `README.md` if any file is retained
  - **Source:** `AUDIT.md` — P2-04
  - **Completion condition:** every file under `assets/` outside `img-src/` is either referenced from source or documented as intentionally retained
  - **Delivered:** All eight candidates were removed; none was retained, so no retention record was needed. The inline copy is authoritative for both icon sets: the six standalone SVGs carried path data byte-identical to the icons in `partials/header.html:41-54` and `partials/footer.html:44-78`, and the inline form is what the implementation requires — the theme toggle shows and hides its two icons through `css/components/nav.css:183-199`, and the social icons inherit `currentColor` from the footer link. `assets/logo/logo.png` was a 512×512 raster twin of the referenced `assets/logo/logo.svg`, with every raster size the project actually uses already provided by `assets/favicon/`; `assets/placeholders/placeholder.jpg` was a 1200×900 key visual superseded by the 1200×630 `assets/og-img/og-img.jpg` that every page's `og:image` and `twitter:image` point to, and no fallback path exists anywhere in the source that could consume it. `assets/svg/` and `assets/placeholders/` are gone, so the `README.md` structure trees no longer list them. Verified after removal: 383 local references across the pages, partials, CSS, and the manifest all resolve; `npm run build` passes both of its contract assertions; and the copied payload drops from 161 files (18 750 KB) to 153 (18 240 KB), with no `assets/svg`, `assets/placeholders`, `logo.png`, or `placeholder.jpg` anywhere in `dist/`.

- [x] **PH3-04 — Align structured data with the project's demonstration character** — **Priority:** Medium
  - [x] review the `LocalBusiness` JSON-LD block that all ten pages publish with real contact details, while the demonstration framing appears only in `partials/footer.html` and the legal pages
  - [x] bring the structured data into line with that framing — for example by relying on the `WebSite` block every page already carries, or by qualifying the business entity
  - [x] apply the decision consistently across all ten pages and keep `README.md`'s SEO section accurate
  - **Source:** `AUDIT.md` — P2-06
  - **Completion condition:** no page publishes structured data asserting an operating business that the project's own documents state does not exist
  - **Delivered:** `4c51e29`. The `LocalBusiness` entity was dropped rather than qualified: all ten pages now publish a `WebPage` block linked by `isPartOf` to the shared `WebSite` block, whose `description` states the demonstration character and the fictional brand. No `LocalBusiness` markup and no telephone, email or postal address remain in any page's JSON-LD, and the structured-data section of `README.md` describes the new contract.

## Phase 4 — Documentation contracts

**Goal:** Keep the documented contracts accurate once the implementation changes land.

- [x] **PH4-01 — Synchronise `README.md` with the delivered implementation** — **Priority:** Medium
  - [x] update the build documentation, including the statement that the build was not run because `npm run build` overwrites versioned files in `assets/img/`, once `PH1-02` changes that contract — delivered with `PH1-02` in `85dc8e2`
  - [x] re-check the theme description ("przy braku zapisanego wyboru bierze pod uwagę `prefers-color-scheme`" / its EN counterpart) against the resolution unified in `PH2-01` — re-checked against the current source; the description matches the effective behaviour and needs no change
  - [x] re-check the accessibility section's claim about the project-notice modal against the behaviour delivered in `PH2-03`
  - [x] add `AUDIT.md` and `PLAN.md` to the project structure trees in both language sections, which currently list `CHANGELOG.md` and `LICENSE` only
  - **Depends on:** `PH1-02`, `PH2-01`, `PH2-03`
  - **Completion condition:** every mechanism described in `README.md` matches the current implementation, and the documented structure lists the tracked root documents
  - **Delivered:** The single accessibility bullet that described the notice as restoring the previous focus was replaced, in both language sections, by two bullets covering the dialog as `PH2-03` delivers it: `role="dialog"` and `aria-modal="true"` with the associated title and description, initial focus moved to the `tabindex="-1"` dialog container, `trapFocus` from `js/utils.js` held for the lifetime of the dialog, and a close path — `Escape`, the accept button, or the `[data-project-notice-close]` backdrop — that releases the trap and restores focus to the previously focused element when it is still connected and outside the notice. Every claim was read back from `js/modules/project-notice.js`, `js/utils.js` and `partials/footer.html` before being written; no behaviour was documented that the source does not implement. Both project structure trees now list `AUDIT.md` and `PLAN.md` alongside `CHANGELOG.md` and `LICENSE`, keeping the root documents in the alphabetical order the trees already used. The key-features entry for the modal was re-checked and left unchanged — its `role`, `aria-modal`, storage-key and focus-restore statements all still match the source.

- [x] **PH4-02 — Record completed changes in `CHANGELOG.md`** — **Priority:** Low
  - [x] add entries under `[Unreleased]` for the Phase 1–3 changes that meet the changelog significance standard
  - [x] keep pending plan items out of the changelog
  - **Depends on:** `PH1-02`, `PH2-04`, `PH3-04`
  - **Completion condition:** `CHANGELOG.md` describes the delivered changes and contains no entry for work that is still open in this plan
  - **Note:** `PH3-03` was the last Phase 1–3 item to land and now carries its own entry, so every completed Phase 1–3 change is recorded.

## Optional future improvements

These items sit outside the required Phase 1–4 remediation scope and were never part of it. They stay unchecked by design: none of them corrects a defect, none is required for the plan's completion, and none is scheduled.

- [ ] **O-01 — Add a custom 404 page**
  - **Value:** an unknown path lands on a page consistent with the site's own design and navigation instead of the hosting platform's default, reusing the existing partial hosts and the `htmlPages` list in `scripts/html-shell.mjs`
  - **Scope boundary:** non-blocking; current behaviour is not a defect and hosting configuration is intentionally maintained outside this repository
  - **Source:** `AUDIT.md` — section 7

- [ ] **O-02 — Reflect invalid form state in the accessibility tree**
  - **Value:** `aria-invalid` on the fields in `js/modules/form.js` would let screen readers announce a field as invalid on entry, rather than relying on the `aria-describedby` message alone; the attribute is currently absent from the repository
  - **Scope boundary:** non-blocking refinement to a working implementation; no change to the validation logic or the Netlify Forms contract
  - **Source:** `AUDIT.md` — section 7

- [ ] **O-03 — Promote the build's consistency checks into a standalone check command**
  - **Value:** the partial-host and single-`aria-current` assertions in `scripts/html-shell.mjs` could run without writing any output, together with cheap additions such as local-reference resolution
  - **Scope boundary:** non-blocking; reuses logic that already exists and introduces no test framework or new dependency
  - **Source:** `AUDIT.md` — section 7
  - **Depends on:** `PH1-02`
