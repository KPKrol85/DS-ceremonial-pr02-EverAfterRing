# EverAfter Ring — Development Plan

**Last reviewed:** 2026-08-13
**Project type:** Static multi-page website in Polish (HTML, CSS, Vanilla JavaScript ES modules) with a Node-based production build into `dist/`; no runtime dependencies, no backend
**Plan status:** Active

## Planning principles

- The plan reflects the current verified repository state.
- A main item is checked only when all required subtasks are complete and its completion condition is satisfied.
- Canonical sources are `partials/`, `css/main.css` and its imports, `js/app.js` and its modules, and `scripts/build.mjs`; `dist/` is generated output and is never edited directly.
- Completed significant changes are recorded separately in `CHANGELOG.md`.
- Findings referenced as `AUDIT.md — P1-xx` / `P2-xx` were re-verified against the current source before being entered here.

## Current priorities

1. `PH1-01` — Establish a line-ending normalisation policy so subsequent changes produce reviewable diffs.
2. `PH1-02` — Separate image generation from the deployment build so `npm run build` writes only to `dist/`.
3. `PH2-02` — Make the closed state the mobile navigation default in markup and CSS.
4. `PH2-01` — Resolve the theme fallback in one place shared by the bootstrap and the runtime module.
5. `PH2-03` — Complete the project-notice dialog against its declared modality.

## Phase 1 — Verifiable repository and build baseline

**Goal:** Make working-tree diffs reviewable and make the documented production build runnable without side effects, so every later change can be verified.

- [ ] **PH1-01 — Establish a line-ending normalisation policy** — **Priority:** Medium
  - [ ] add a root `.gitattributes` declaring text detection and the normalised committed form (no `.gitattributes` currently exists in the repository)
  - [ ] renormalise the index so the eight files that currently differ from `HEAD` only by carriage returns no longer report whole-file diffs (`.gitignore`, `LICENSE`, `cookies.html`, `css/components/project-notice.css`, `js/modules/hero.js`, `js/modules/project-notice.js`, `polityka-prywatnosci.html`, `regulamin.html`)
  - [ ] resolve the mixed line endings inside `js/modules/hero.js`, which currently contains a single CRLF line among LF lines
  - [ ] re-check `git status` and `git diff --stat` after normalisation
  - **Source:** `AUDIT.md` — P2-03
  - **Completion condition:** editing one line in a source file produces a one-line diff, and `git diff --ignore-cr-at-eol --stat` and `git diff --stat` agree
  - **Note:** `css/components/project-notice.css` and `js/modules/project-notice.js` are also touched by `PH2-03`, so this item runs first to keep that review readable

- [ ] **PH1-02 — Separate image generation from the deployment build** — **Priority:** Medium
  - [ ] change the `build` script in `package.json` so the deployment build no longer chains `optimize:images`
  - [ ] keep `npm run optimize:images` as the explicit step run when sources under `assets/img-src/` change
  - [ ] update the build sequence described in `README.md` ("Build produkcyjny" / "Production Build") to match the new script contract
  - [ ] run the build once with dependencies installed and confirm it writes only into the ignored `dist/` directory
  - **Source:** `AUDIT.md` — P2-05
  - **Completion condition:** `npm run build` completes and `git status` remains clean afterwards
  - **Depends on:** `PH1-01`

## Phase 2 — Interaction-state defects

**Goal:** Correct the four implemented behaviours that do not match the contract the project documents, establishing correct defaults instead of relying on JavaScript to repair them.

- [ ] **PH2-01 — Resolve theme fallback in one shared place** — **Priority:** High
  - [ ] remove the duplicated resolution: `js/theme-bootstrap.js` resolves stored value → `prefers-color-scheme: dark` → `light`, while `resolveTheme()` in `js/modules/theme.js` resolves stored value → `light` and `initTheme()` applies it unconditionally
  - [ ] either share one fallback chain between both entry points or have `initTheme()` adopt the value already present on `<html data-theme>`
  - [ ] confirm the toggle's `aria-pressed` and `aria-label` report the effective theme after load
  - **Source:** `AUDIT.md` — P1-01
  - **Completion condition:** with no `everafterring-theme` entry and a system dark preference, `<html data-theme>` stays `dark` after load and the toggle reports the dark state, matching the fallback documented in `README.md`

- [ ] **PH2-02 — Make the closed state the mobile navigation default** — **Priority:** High
  - [ ] author `[data-nav-panel]` in `partials/header.html` so it is closed by default at the mobile breakpoint
  - [ ] correct the rule in `css/components/nav.css` where `.nav__panel:not([hidden])` resolves the base `translateX(-100%)` back to `translateX(0)`, making the open position the default below 1024 px
  - [ ] reduce `initPanelState()` in `js/modules/nav.js` to managing ARIA state and the desktop case, so JavaScript is only required to open the panel
  - [ ] verify the desktop breakpoint and the existing resize handling still expose the navigation correctly
  - **Source:** `AUDIT.md` — P1-02
  - **Completion condition:** a built page loaded at 375 px width with JavaScript disabled shows page content with no full-screen panel overlay, and with JavaScript enabled there is no open-panel frame before initialisation

- [ ] **PH2-03 — Complete the project-notice dialog against its declared modality** — **Priority:** High
  - [ ] route the existing `data-project-notice-close` backdrop in `partials/footer.html` to a defined close path, or remove the attribute so no dismiss affordance is implied
  - [ ] add `Escape` handling to `js/modules/project-notice.js`
  - [ ] reuse `trapFocus` from `js/utils.js` while the dialog is open, as `js/modules/nav.js` already does, and release it on close
  - [ ] keep the existing focus restore to `previousFocus`
  - **Source:** `AUDIT.md` — P1-03
  - **Completion condition:** while the notice is open, `Tab` and `Shift+Tab` cycle only within the dialog, `Escape` closes it, and the backdrop either closes it or carries no close-intent attribute
  - **Depends on:** `PH1-01`

- [ ] **PH2-04 — Derive the select indicator colour from a theme token** — **Priority:** High
  - [ ] replace the hardcoded `%23f4e7d2` stroke in the inline SVG chevron in `css/components/forms.css` with a value derived from `css/tokens.css`, so it inverts with the theme
  - [ ] confirm this removes the only raw colour literal in the component layer
  - [ ] check the indicator against `var(--color-surface)` in both themes
  - **Source:** `AUDIT.md` — P1-04
  - **Completion condition:** the dropdown indicator on both required `<select>` fields in `kontakt.html` is clearly distinguishable against the field background in `data-theme="light"` and `data-theme="dark"`

## Phase 3 — Resilience and content integrity

**Goal:** Close the remaining source-visible risks and align the machine-readable disclosure with the project's stated demonstration character.

- [ ] **PH3-01 — Guard storage access in the project-notice module** — **Priority:** Medium
  - [ ] wrap the read and the write of `everafterringProjectNoticeAccepted` in `js/modules/project-notice.js` using the defensive pattern already established in `js/modules/theme.js` and `js/theme-bootstrap.js`
  - [ ] ensure a storage failure cannot propagate out of the `onReady` callback in `js/app.js`
  - **Source:** `AUDIT.md` — P2-01
  - **Completion condition:** with site data blocked, the notice still renders, dismissal works for the current page, and no uncaught error is logged
  - **Depends on:** `PH2-03`

- [ ] **PH3-02 — Resolve the cookies table scroll-region contract** — **Priority:** Medium
  - [ ] decide between giving the `role="region" tabindex="0"` wrapper in `cookies.html` the overflow behaviour its semantics promise, or removing the region and `tabindex`
  - [ ] if the region is kept, add the missing `table`, `th`, `td` and overflow rules — no such rule exists anywhere under `css/` today — consistent with the existing component layer
  - [ ] keep the change scoped to this one table, the only table in the project
  - **Source:** `AUDIT.md` — P2-02
  - **Completion condition:** at 360 px width the table content is reachable within its own region without horizontal page overflow, and the focus stop performs an actual scroll or is removed

- [ ] **PH3-03 — Resolve ownership of unreferenced assets** — **Priority:** Low
  - [ ] decide per file whether to remove or document: `assets/svg/sun.svg`, `assets/svg/moon.svg`, `assets/svg/facebook.svg`, `assets/svg/x.svg`, `assets/svg/linkedin.svg`, `assets/svg/github.svg`, `assets/logo/logo.png`, `assets/placeholders/placeholder.jpg` — none is referenced from any HTML, CSS, JS, `assets/favicon/site.webmanifest`, or build script
  - [ ] state which icon copy is authoritative, given that the theme and social icons also exist inline in `partials/header.html` and `partials/footer.html`
  - [ ] record the decision in `README.md` if any file is retained
  - **Source:** `AUDIT.md` — P2-04
  - **Completion condition:** every file under `assets/` outside `img-src/` is either referenced from source or documented as intentionally retained

- [ ] **PH3-04 — Align structured data with the project's demonstration character** — **Priority:** Medium
  - [ ] review the `LocalBusiness` JSON-LD block that all ten pages publish with real contact details, while the demonstration framing appears only in `partials/footer.html` and the legal pages
  - [ ] bring the structured data into line with that framing — for example by relying on the `WebSite` block every page already carries, or by qualifying the business entity
  - [ ] apply the decision consistently across all ten pages and keep `README.md`'s SEO section accurate
  - **Source:** `AUDIT.md` — P2-06
  - **Completion condition:** no page publishes structured data asserting an operating business that the project's own documents state does not exist

## Phase 4 — Documentation contracts

**Goal:** Keep the documented contracts accurate once the implementation changes land.

- [ ] **PH4-01 — Synchronise `README.md` with the delivered implementation** — **Priority:** Medium
  - [ ] update the build documentation, including the statement that the build was not run because `npm run build` overwrites versioned files in `assets/img/`, once `PH1-02` changes that contract
  - [ ] re-check the theme description ("przy braku zapisanego wyboru bierze pod uwagę `prefers-color-scheme`" / its EN counterpart) against the resolution unified in `PH2-01`
  - [ ] re-check the accessibility section's claim about the project-notice modal against the behaviour delivered in `PH2-03`
  - [ ] add `AUDIT.md` and `PLAN.md` to the project structure trees in both language sections, which currently list `CHANGELOG.md` and `LICENSE` only
  - **Depends on:** `PH1-02`, `PH2-01`, `PH2-03`
  - **Completion condition:** every mechanism described in `README.md` matches the current implementation, and the documented structure lists the tracked root documents

- [ ] **PH4-02 — Record completed changes in `CHANGELOG.md`** — **Priority:** Low
  - [ ] add entries under `[Unreleased]` for the Phase 1–3 changes that meet the changelog significance standard
  - [ ] keep pending plan items out of the changelog
  - **Depends on:** `PH1-02`, `PH2-04`, `PH3-04`
  - **Completion condition:** `CHANGELOG.md` describes the delivered changes and contains no entry for work that is still open in this plan

## Optional future improvements

- [ ] **O-01 — Add a custom 404 page**
  - **Value:** an unknown path lands on a page consistent with the site's own design and navigation instead of the hosting platform's default, reusing the existing partial hosts and the `htmlPages` list in `scripts/build.mjs`
  - **Scope boundary:** non-blocking; current behaviour is not a defect and hosting configuration is intentionally maintained outside this repository
  - **Source:** `AUDIT.md` — section 7

- [ ] **O-02 — Reflect invalid form state in the accessibility tree**
  - **Value:** `aria-invalid` on the fields in `js/modules/form.js` would let screen readers announce a field as invalid on entry, rather than relying on the `aria-describedby` message alone; the attribute is currently absent from the repository
  - **Scope boundary:** non-blocking refinement to a working implementation; no change to the validation logic or the Netlify Forms contract
  - **Source:** `AUDIT.md` — section 7

- [ ] **O-03 — Promote the build's consistency checks into a standalone check command**
  - **Value:** the partial-host and single-`aria-current` assertions in `scripts/build.mjs` could run without writing any output, together with cheap additions such as local-reference resolution
  - **Scope boundary:** non-blocking; reuses logic that already exists and introduces no test framework or new dependency
  - **Source:** `AUDIT.md` — section 7
  - **Depends on:** `PH1-02`
