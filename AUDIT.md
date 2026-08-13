# EverAfter Ring — Final Technical Front-End Audit

**Audit date:** 2026-08-13
**Project type:** Static multi-page website in Polish (HTML, CSS, Vanilla JavaScript ES modules) with a Node-based production build into `dist/`; no runtime dependencies, no backend
**Audit mode:** Final repository and implementation review
**Current readiness:** Needs important fixes

## 1. Executive assessment

The repository is coherent and well-maintained. Architecture boundaries are explicit: `css/main.css` is the single stylesheet entry point, `js/app.js` is the single application entry point with a fixed module order, `partials/` holds the only copy of the shared shell, and `scripts/build.mjs` owns the production output. Every one of the 322 local asset and route references in the HTML, CSS, and partials resolves to a file that exists; no page contains duplicate IDs, broken `aria-describedby`/`aria-labelledby`/`aria-controls`/`for` targets, or an `<img>` without `alt`. Documentation is unusually accurate: `README.md` describes the delivered mechanisms rather than aspirations, and the legal pages describe the two `localStorage` entries, the Netlify Forms submission path, and the embedded Google Maps frame that the code actually implements.

The unresolved risk is concentrated in client-side interaction state rather than in structure, content, or tooling. Four implemented behaviours do not currently match their own contract: the pre-paint theme bootstrap's `prefers-color-scheme` fallback is discarded once `js/modules/theme.js` initialises; the mobile navigation panel's default state in markup and CSS is *open*, so JavaScript is required to close it rather than to open it; the project-notice dialog declares `aria-modal="true"` but has no focus containment, no `Escape` handling, and an inert backdrop that carries a close-intent attribute; and the custom `<select>` indicator is drawn with a hardcoded colour that is effectively invisible in the default light theme. None of these break the site systemically, and there are no P0 findings, but each degrades an interaction the project explicitly claims to support.

Build and deployment mechanics are sound in design, with one workflow conflict: `npm run build` runs image optimisation that rewrites tracked files under `assets/img/`, so the documented production build cannot be executed without dirtying the working tree. The project is suitable for continued development and close to presentable, but the P1 items should be resolved before it is used as a final portfolio reference.

## 2. Audit scope and verification

### Areas inspected

- All 10 top-level HTML pages: `index.html`, `oferta.html`, `uslugi.html`, `realizacje.html`, `o-nas.html`, `kontakt.html`, `dziekujemy.html`, `polityka-prywatnosci.html`, `regulamin.html`, `cookies.html`
- Shared shell: `partials/header.html`, `partials/footer.html`
- Full CSS tree: `css/main.css`, `css/tokens.css`, `css/fonts.css`, `css/base.css`, `css/layout.css`, all files under `css/components/` and `css/sections/`
- Full JavaScript tree: `js/app.js`, `js/config.js`, `js/utils.js`, `js/theme-bootstrap.js`, all modules under `js/modules/`
- Build and asset tooling: `scripts/build.mjs`, `scripts/optimize-images.mjs`, `package.json`, `package-lock.json`, `start-local-preview.bat`, `.codex/environments/environment.toml`
- Metadata and delivery contract: `robots.txt`, `sitemap.xml`, `assets/favicon/site.webmanifest`, per-page `<head>` metadata and JSON-LD, `.gitignore`
- Documentation and licensing: `README.md`, `CHANGELOG.md`, `LICENSE`
- Repository state: current Git branch, status, and diff

### Verification performed

- `node --check` on all 14 `.js`/`.mjs` files — executed and passed
- JSON parse of `package.json`, `package-lock.json`, `assets/favicon/site.webmanifest` and all 20 JSON-LD blocks; XML parse of `sitemap.xml` — executed and passed
- Local reference resolution across all HTML, partials, and CSS (`src`, `href`, `srcset`, `url()`), resolving partial paths against the root as the runtime and build both do — executed, 322 references checked, 0 missing
- Duplicate-ID and ARIA/label reference check per page with `partials/header.html` and `partials/footer.html` injected — executed and passed; no duplicates, no dangling references
- `<img>` alternative-text presence check across all pages and partials — executed and passed
- Read-only in-memory simulation of the `build:html` stage contract (partial-host regex match, single-`aria-current` assertion, `.min` asset reference substitution) for all 10 pages — executed, all 10 would pass; no files written
- Contrast computation (WCAG 2.x relative luminance) for deterministic token pairs in both themes, including alpha compositing for the footer and callout — executed; see P1-04 for the one failing pair
- Image dimension check: all `assets/img-src/` sources and generated variants against the `width`/`height` attributes in markup — executed and passed (hero 1080×720, portfolio 1200×900)
- Generated-variant completeness: `assets/img/hero` (54 files) and `assets/img/portfolio-img` (81 files) match 6 and 9 sources × 3 widths × 3 formats — executed and passed
- Lockfile consistency against `package.json` devDependencies — executed and passed (esbuild 0.28.0, lightningcss 1.32.0, sharp 0.34.5)
- `git status`, `git diff --stat`, `git diff --ignore-cr-at-eol --stat` — executed; see P2-03
- Unreferenced-asset scan across HTML, CSS, JS, manifest, and build scripts — executed; see P2-04
- `TODO`/`FIXME`/`HACK`/`debugger`/`console.log` scan of shipped source — executed; none found outside the build scripts' intended CLI output

### Verification limitations

- No browser or assistive-technology verification was performed. Findings about rendered layout, paint order, and focus behaviour are derived from the cascade and script sequence in the source; they are labelled accordingly.
- `npm run build` and `npm run optimize:images` were not executed. Dependencies are not installed (`node_modules/` absent) and installing them was out of scope; `npm run build` additionally rewrites tracked files (see P2-05). The build was therefore verified statically and through the read-only contract simulation above, not by producing `dist/`.
- No deployment URL was supplied for this audit, so no live environment was inspected and no claim is made about whether the project is currently deployed. The origin declared in `robots.txt`, `sitemap.xml`, and the per-page canonical/`og:url` metadata is treated as configuration, not as evidence of an active deployment.
- The repository contains no automated test suite, so no test results are reported.
- Contrast was assessed only for deterministic token pairs. Surfaces composed with `color-mix()` over the modal backdrop and the hero gradient overlays were not evaluated.

## 3. Verified strengths

- Single, unambiguous source of truth per concern: `css/main.css` is the only stylesheet entry (`css/main.css:1-16`), `js/app.js` is the only application entry with an explicit module order (`js/app.js:9-16`), and `partials/` holds the only copy of the header, footer, and project notice.
- The build enforces its own contracts instead of assuming them: `scripts/build.mjs:119-133` fails the build if a partial host is missing, and `scripts/build.mjs:105-117` fails it if a primary-navigation page does not end up with exactly one `nav__link` carrying `aria-current="page"`.
- Reference integrity is complete — all 322 local references resolve, with no duplicate IDs and no dangling ARIA or label targets across all 10 pages with partials injected.
- Metadata is consistent across every page: each has its own `title`, `description`, `canonical`, full Open Graph set with image dimensions and alt text, Twitter Card, and two JSON-LD blocks, all parsing cleanly.
- Image delivery is coherent: `<picture>` with AVIF/WebP/JPG, matching `srcset`/`sizes`, explicit `width`/`height` matching the real files, `decoding="async"`, and `loading="lazy"` on below-the-fold images only.
- Defensive initialisation is the norm in the JS modules: `js/modules/nav.js:4-9`, `js/modules/form.js:22-24`, `js/modules/hero.js:1-14`, and `js/modules/header-scroll.js:7-9` all guard on missing elements and on re-initialisation before binding.
- Theme persistence degrades safely: `js/theme-bootstrap.js:10-17` and `js/modules/theme.js:10-25` both wrap storage access so the toggle keeps working for the current page when storage is unavailable.
- Colour tokens hold up under measurement: body text 14.30:1, muted body copy 4.48–5.47:1, accent 7.24:1, primary button 7.73:1, footer text 9.18:1, and the dark theme 8.90–16.24:1 across the pairs checked.
- Legal documentation matches the implementation rather than a template: `cookies.html` lists exactly the two `localStorage` keys the code writes and explicitly states that no service worker, `sessionStorage`, or Cache Storage is used, which is correct for this repository; `polityka-prywatnosci.html` describes the Netlify Forms path and the Google Maps frame that `kontakt.html` actually contains.
- Repository hygiene in shipped source is clean: no `TODO`/`FIXME`/`debugger`/`console.log` outside the build scripts' intended output, and `.gitignore` documents which generated paths are intentionally tracked.

## 4. P0 — Critical risks

None detected.

## 5. P1 — Important issues worth fixing next

### [P1-01] Theme bootstrap's `prefers-color-scheme` fallback is discarded when the runtime theme module initialises

- **Classification:** Defect
- **Affected area:** Theming, first paint, accessible state of the theme toggle
- **Evidence:** `js/theme-bootstrap.js:19-28`; `js/modules/theme.js:27`; `js/modules/theme.js:49-53`
- **Current behavior:** The synchronous bootstrap resolves the theme as stored value, then `prefers-color-scheme: dark`, then `light`, and writes the result to `<html data-theme>`. The runtime module resolves it as `getStoredTheme() || "light"` — the system-preference branch is absent — and `initTheme()` applies that result unconditionally on `DOMContentLoaded`, overwriting whatever the bootstrap set.
- **Impact:** A visitor whose system prefers dark and who has no stored choice gets a dark first paint that reverts to light once `js/app.js` runs, and the toggle then reports `aria-pressed="false"` for a page the bootstrap had resolved as dark. The system-preference fallback documented in `README.md` is not the effective behaviour of the site.
- **Recommended direction:** Resolve "no stored theme" in one place. Either share the same fallback chain between the bootstrap and `js/modules/theme.js`, or have `initTheme()` adopt the value already present on `<html data-theme>` instead of recomputing it.
- **Verification criteria:** With no `everafterring-theme` entry and a system dark preference, `<html data-theme>` remains `dark` after load and the toggle reports the dark state.

### [P1-02] Mobile navigation panel's default state is open, so JavaScript is required to close it

- **Classification:** Defect
- **Affected area:** Navigation, mobile layout, progressive enhancement
- **Evidence:** `partials/header.html:12`; `css/components/nav.css:205-231`; `js/modules/nav.js:24-37`; `js/app.js:9-16`
- **Current behavior:** The panel is authored without a `hidden` attribute. Below the 1024 px breakpoint `.nav__panel` is `position: fixed; inset: 0; height: 100vh` with an opaque `var(--color-surface)` background, and the rule `.nav__panel:not([hidden])` — higher specificity and later in the file than the base `translateX(-100%)` — resolves the transform to `translateX(0)`. The panel only becomes hidden when `initPanelState()` adds the `hidden` attribute, which happens after `DOMContentLoaded` inside the deferred module entry.
- **Impact:** In the production build the partial is inlined into the HTML, so on viewports at or below 1024 px the full-screen panel is in the open position from first paint until the module executes. If JavaScript is unavailable or `js/app.js` fails to load, it stays there and covers the page content. In source mode the same markup is open for the interval between partial injection and `initNav()`.
- **Recommended direction:** Make "closed" the default in the markup and CSS for the mobile breakpoint, so JavaScript is only needed to open the panel and to manage its ARIA state, never to hide it on load.
- **Verification criteria:** Loading a built page at 375 px width with JavaScript disabled shows the page content with no full-screen panel overlay; with JavaScript enabled there is no open-panel frame before initialisation.

### [P1-03] Project-notice dialog has no focus containment, no `Escape` handling, and an inert backdrop that implies a close action

- **Classification:** Defect
- **Affected area:** Accessibility, modal interaction
- **Evidence:** `partials/footer.html:96-99`; `js/modules/project-notice.js:22-41`; compare `js/utils.js:9-46` as used by `js/modules/nav.js:15`
- **Current behavior:** The dialog is declared `role="dialog" aria-modal="true"` and opens on every first visit, gating the page. The module binds a click handler only to `[data-project-notice-accept]`. The element carrying `data-project-notice-close` is present in the markup but is never queried in JavaScript — the attribute has no reference anywhere in the repository outside `partials/footer.html:97`. There is no `keydown`/`Escape` handler and no focus trap, although the project already implements one in `js/utils.js` and applies it to the mobile navigation.
- **Impact:** Three separate consequences of one incomplete dialog implementation: the backdrop looks and is annotated like a dismiss target but performs no action; `Escape` does not close a modal that blocks the page; and keyboard and screen-reader users can move focus out of a dialog declared `aria-modal="true"` into background content that is neither inert nor hidden, contradicting the declared modality.
- **Recommended direction:** Complete the dialog against the pattern the project already uses for navigation: route the existing `data-project-notice-close` host to a defined close path (or remove the attribute so no dismiss affordance is implied), add `Escape` handling, and reuse `trapFocus` from `js/utils.js` while the dialog is open.
- **Verification criteria:** While the notice is open, `Tab` and `Shift+Tab` cycle only within the dialog, `Escape` closes it, and the backdrop either closes it or carries no close-intent attribute.

### [P1-04] Custom `<select>` indicator is drawn with a hardcoded colour that is invisible in the default light theme

- **Classification:** Defect
- **Affected area:** Contact form, theming, non-text contrast
- **Evidence:** `css/components/forms.css:71-77`; `css/components/forms.css:28-37`; `css/tokens.css:11`, `css/tokens.css:20`
- **Current behavior:** `.form select` sets `appearance: none`, removing the native dropdown indicator, and replaces it with an inline SVG chevron whose stroke is the hardcoded literal `#f4e7d2`. The control's background comes from `var(--color-surface)`, which is `#ffffff` in the light theme and `#241d1a` in the dark theme. Computed contrast for the chevron against its own background is 1.22:1 in light and 13.60:1 in dark.
- **Impact:** In the default theme the two required `<select>` fields on the contact page (`kontakt.html:159-165`, `kontakt.html:172-177`) lose their only visual indication that they are dropdowns and read as plain text inputs. This is the one place in the stylesheet where a raw colour value escapes the token system, and it is the one measured contrast failure.
- **Recommended direction:** Derive the chevron colour from an existing theme token so it inverts with the theme, in line with how the rest of the component layer consumes `css/tokens.css`.
- **Verification criteria:** The dropdown indicator is clearly distinguishable against the field background in both `data-theme="light"` and `data-theme="dark"`.

## 6. P2 — Minor refinements

### [P2-01] `initProjectNotice` accesses `localStorage` without the guard used everywhere else in the project

- **Classification:** Source-visible risk
- **Affected area:** Project notice, runtime resilience
- **Evidence:** `js/modules/project-notice.js:18`; `js/modules/project-notice.js:30`; compare `js/modules/theme.js:10-25` and `js/theme-bootstrap.js:10-17`
- **Current behavior:** Both the read and the write of `everafterringProjectNoticeAccepted` are unguarded, while the two theme entry points wrap equivalent access in `try`/`catch` with an explicit comment about storage being unavailable.
- **Impact:** In a browser configured to block site data, storage access throws. The read at line 18 runs before the notice is shown, so the notice would not appear and the rejection would propagate out of the `onReady` callback in `js/app.js:9-16` as an unhandled error. Because this module is invoked last, the other modules are unaffected — the impact is a silently missing disclosure and a console error, not a broken page.
- **Recommended direction:** Apply the same defensive storage-access pattern already established in the theme modules.
- **Verification criteria:** With site data blocked, the notice still renders, dismissal still works for the current page, and no uncaught error is logged.

### [P2-02] Cookies table is wrapped in a scroll region that no CSS makes scrollable

- **Classification:** Source-visible risk
- **Affected area:** Legal page layout, keyboard navigation, responsive behaviour
- **Evidence:** `cookies.html:129`; no `table` or `overflow` declaration exists anywhere under `css/` for this pattern (`css/components/`, `css/sections/`, `css/base.css`, `css/layout.css` all checked)
- **Current behavior:** The five-column technology table is wrapped in `<div role="region" aria-label="…" tabindex="0">`, the standard markup for a keyboard-scrollable table container. The stylesheet contains no rule for `table`, `th`, `td`, or for this wrapper, so it has no `overflow` behaviour and the table has no width containment.
- **Impact:** The wrapper adds a keyboard focus stop that cannot scroll anything, and on narrow viewports the table has no defined behaviour when its content exceeds the container width. This is the only table in the project, so the gap is contained to one page.
- **Recommended direction:** Either give the region the overflow behaviour its semantics promise, together with minimal table styling consistent with the component layer, or drop the region and `tabindex` so no scroll affordance is announced.
- **Verification criteria:** At 360 px width the table content is reachable within its own region without horizontal page overflow, and the focus stop performs an actual scroll.

### [P2-03] Working tree carries line-ending-only changes and the repository has no normalisation policy

- **Classification:** Maintenance risk
- **Affected area:** Repository hygiene, reviewability
- **Evidence:** `git diff --stat` reports 1628 insertions and 1628 deletions across 8 files while `git diff --ignore-cr-at-eol --stat` is empty; `js/modules/hero.js` currently contains exactly one CRLF line among LF lines; no `.gitattributes` exists in the repository
- **Current behavior:** Eight tracked files — `.gitignore`, `LICENSE`, `cookies.html`, `css/components/project-notice.css`, `js/modules/hero.js`, `js/modules/project-notice.js`, `polityka-prywatnosci.html`, `regulamin.html` — differ from `HEAD` only by carriage returns. One file has been partially converted, leaving mixed line endings inside a single source file.
- **Impact:** Whole-file diffs conceal real changes during review, and a commit made from this state would record 1628 changed lines that carry no content. Without a normalisation policy this will recur on every checkout and edit cycle on Windows.
- **Recommended direction:** Add a line-ending normalisation policy to the repository so the index stores one consistent form, then re-check the working tree.
- **Verification criteria:** On a fresh checkout `git status` is clean, and editing one line in a source file produces a one-line diff.

### [P2-04] Unreferenced assets are shipped into the production output

- **Classification:** Maintenance risk
- **Affected area:** Asset ownership, deployment payload
- **Evidence:** `assets/svg/sun.svg`, `assets/svg/moon.svg`, `assets/svg/facebook.svg`, `assets/svg/x.svg`, `assets/svg/linkedin.svg`, `assets/svg/github.svg`, `assets/logo/logo.png` (152 KB), `assets/placeholders/placeholder.jpg` (352 KB) — none referenced by any HTML, CSS, JS, `assets/favicon/site.webmanifest`, or build script; `scripts/build.mjs:153-166` copies the whole `assets/` tree except `img-src/` into `dist/`
- **Current behavior:** The theme and social icons exist twice — once as these standalone SVG files and once inline in `partials/header.html:41-54` and `partials/footer.html:44-78`, which is the copy the site actually renders. `logo.png` and `placeholder.jpg` are not referenced at all.
- **Impact:** Roughly half a megabyte of unused files is copied into every deployment, and the duplicated icon sources create ambiguity about which copy a maintainer should edit when changing an icon.
- **Recommended direction:** Remove the unreferenced files, or document in `README.md` why they are retained and which copy is authoritative for the icons.
- **Verification criteria:** Every file under `assets/` outside `img-src/` is either referenced from source or explicitly documented as intentionally retained.

### [P2-05] The documented production build rewrites tracked files as a side effect

- **Classification:** Contract mismatch
- **Affected area:** Build workflow, verifiability
- **Evidence:** `package.json` — `scripts.build` (`npm run optimize:images && node scripts/build.mjs build`); `scripts/optimize-images.mjs:10` and `scripts/optimize-images.mjs:86-97`; `.gitignore` ignores `/dist/` only and lists `assets/` as intentionally tracked; `README.md` — "Build produkcyjny" section
- **Current behavior:** `npm run build` regenerates every variant under the tracked `assets/img/` directory before producing `dist/`. `README.md` already records that the build was not run while the document was prepared, for exactly this reason.
- **Impact:** The single documented command for producing the deployment artifact cannot be run without dirtying the working tree, which is why the build's real output could not be verified in this audit either. Over time this discourages running the build and increases the chance that `dist/` diverges from source in ways nobody observes.
- **Recommended direction:** Separate asset generation from the deployment build so that `npm run build` writes only to the ignored `dist/` directory, and keep `optimize:images` as the explicit step run when source images change.
- **Verification criteria:** `npm run build` completes and `git status` remains clean afterwards.

### [P2-06] Structured data presents the demonstration site as an operating local business

- **Classification:** Content integrity risk
- **Affected area:** SEO metadata, public disclosure consistency
- **Evidence:** `index.html:45-63` and the identical `LocalBusiness` block on all 10 pages; `robots.txt`; the demonstration framing appears only in `partials/footer.html:96-104` and in the legal pages (for example `cookies.html`, section 1)
- **Current behavior:** Every page publishes a `LocalBusiness` entity with `name`, `telephone`, `email`, and a full `PostalAddress`, carrying the studio's real contact details. `robots.txt` allows the whole site to be indexed. The statement that this is a portfolio project with a fictional offer exists in the interface and in the legal documents, but not in the structured data.
- **Impact:** The machine-readable claim is consumed independently of the interface, so the one channel that search engines and aggregators read directly is also the one channel that carries no qualification — while the surrounding pages state that the business does not operate. Enquiries generated from it would reach real contact details for a service that the project itself declares fictional.
- **Recommended direction:** Bring the structured data into line with the project's stated character — for example by relying on the `WebSite` block that every page already carries, or by qualifying the business entity — so that the disclosure is consistent across interface, legal pages, and metadata.
- **Verification criteria:** No page publishes structured data asserting an operating business that the project's own documents state does not exist.

## 7. Extra quality improvements

### Add a custom 404 page

- **Relevant area:** Routing and shared shell.
- **Current evidence:** The repository contains ten pages and no `404.html`; `scripts/build.mjs:12-23` lists every page explicitly, and the shared shell is already available to any new page through the partial hosts.
- **Potential value:** An unknown path would land on a page consistent with the site's own design and navigation instead of the hosting platform's default, using infrastructure that already exists.
- **Scope boundary:** Optional. The current behaviour is not a defect, and hosting configuration is intentionally maintained outside this repository.

### Reflect invalid form state in the accessibility tree

- **Relevant area:** Contact form validation (`js/modules/form.js:30-45`, `kontakt.html:127-190`).
- **Current evidence:** Validation is already well built — `novalidate` applied from script, per-field messages written into `aria-describedby` targets, focus moved to the first invalid field, and an `aria-live="polite"` status region. The one signal not exposed is `aria-invalid` on the fields themselves.
- **Potential value:** Screen readers would announce a field as invalid on entry rather than relying on the description text alone, and the state would be available for styling without an additional class.
- **Scope boundary:** Optional refinement to a working implementation; no change to the validation logic or the Netlify Forms contract is implied.

### Promote the build's existing consistency checks into a standalone check command

- **Relevant area:** Verification tooling (`scripts/build.mjs:105-117`, `scripts/build.mjs:119-133`, `package.json` scripts).
- **Current evidence:** The build already asserts partial-host presence and single-`aria-current` correctness, but those assertions can only run as part of a build that also rewrites tracked image assets (P2-05). The repository has no command that validates the pages without producing output.
- **Potential value:** The same guarantees plus cheap additions such as local-reference resolution could be run routinely and quickly, without writing any files — the checks this audit performed ad hoc would become repeatable.
- **Scope boundary:** Optional. This proposes reusing logic that already exists rather than introducing a test framework or new dependencies.

## 8. Current readiness conclusion

**Status:** Needs important fixes

No finding blocks the project from being built, served, or read: content, structure, metadata, references, and documentation are in good order, and there are no P0 risks. Four P1 findings should be resolved first, because each one concerns a behaviour the project explicitly documents as working — the system-preference theme fallback, the mobile navigation's closed default state, the modal dialog's declared modality, and the visibility of a form control's indicator in the default theme. All four are contained fixes within the existing architecture; none requires restructuring, new dependencies, or a redesign. Once they are addressed, the remaining P2 items are housekeeping that can be scheduled independently.

This status is a repository-state assessment. It is not an accessibility certification, a security assessment, a guarantee of browser or assistive-technology behaviour, or a performance measurement — none of which were performed, as recorded in the verification limitations.

## 9. Senior rating

**Rating:** 7/10

The fundamentals are strong for a static multi-page site in this scope: clean source-of-truth boundaries, a build that validates its own contracts rather than trusting them, complete and correct reference integrity across ten pages, disciplined image and font delivery, colour tokens that hold up under measurement, and documentation and legal pages that describe the implementation accurately instead of over-claiming — an area where comparable projects usually lose points. The rating is held at 7 by four P1 defects that all sit in the same layer: interaction state that depends on JavaScript to correct a default rather than establishing the correct default up front, and one hardcoded value that escapes an otherwise consistent token system. The verification limitations also matter — the production build and all runtime behaviour were assessed statically, so the assessment cannot yet be raised on the strength of observed behaviour.
