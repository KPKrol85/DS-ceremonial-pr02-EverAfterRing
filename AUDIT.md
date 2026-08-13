# EverAfter Ring — Final Technical Front-End Audit

**Audit date:** 2026-08-13
**Status re-verified:** 2026-08-13, against the current source and Git history
**Project type:** Static multi-page website in Polish (HTML, CSS, Vanilla JavaScript ES modules) with a Node-based production build into `dist/`; no runtime dependencies, no backend
**Audit mode:** Final repository and implementation review
**Active findings:** 1 — no P0, no open P1, one open P2 (`P2-04`)

## 1. Executive assessment

The repository is coherent and well-maintained. Architecture boundaries are explicit: `css/main.css` is the single stylesheet entry point, `js/app.js` is the single application entry point with a fixed module order, `partials/` holds the only copy of the shared shell, and `scripts/build.mjs` owns the production output. Documentation is unusually accurate: `README.md` describes the delivered mechanisms rather than aspirations, and the legal pages describe the two `localStorage` entries, the Netlify Forms submission path, and the embedded Google Maps frame that the code actually implements.

The risk this audit identified was concentrated in client-side interaction state rather than in structure, content, or tooling, alongside two build- and repository-workflow items. Those findings have since been delivered; the completed changes are recorded in `CHANGELOG.md` and their tasks in `PLAN.md`. One finding remains open here: unreferenced assets are still copied into the production output (`P2-04`).

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
- Contrast computation (WCAG 2.x relative luminance) for deterministic token pairs in both themes, including alpha compositing for the footer and callout — executed
- Image dimension check: all `assets/img-src/` sources and generated variants against the `width`/`height` attributes in markup — executed and passed (hero 1080×720, portfolio 1200×900)
- Generated-variant completeness: `assets/img/hero` (54 files) and `assets/img/portfolio-img` (81 files) match 6 and 9 sources × 3 widths × 3 formats — executed and passed
- Lockfile consistency against `package.json` devDependencies — executed and passed (esbuild 0.28.0, lightningcss 1.32.0, sharp 0.34.5)
- Unreferenced-asset scan across HTML, CSS, JS, manifest, and build scripts — executed; see P2-04
- `TODO`/`FIXME`/`HACK`/`debugger`/`console.log` scan of shipped source — executed; none found outside the build scripts' intended CLI output

### Verification limitations

- No browser or assistive-technology verification was performed. Findings about rendered layout, paint order, and focus behaviour are derived from the cascade and script sequence in the source; they are labelled accordingly.
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

None open. Resolved findings are recorded in `CHANGELOG.md`.

## 6. P2 — Minor refinements

**Open:** P2-04.

### [P2-04] Unreferenced assets are shipped into the production output

- **Classification:** Maintenance risk
- **Affected area:** Asset ownership, deployment payload
- **Evidence:** `assets/svg/sun.svg`, `assets/svg/moon.svg`, `assets/svg/facebook.svg`, `assets/svg/x.svg`, `assets/svg/linkedin.svg`, `assets/svg/github.svg`, `assets/logo/logo.png` (152 KB), `assets/placeholders/placeholder.jpg` (352 KB) — none referenced by any HTML, CSS, JS, `assets/favicon/site.webmanifest`, or build script; `scripts/build.mjs:153-166` copies the whole `assets/` tree except `img-src/` into `dist/`
- **Current behavior:** The theme and social icons exist twice — once as these standalone SVG files and once inline in `partials/header.html:41-54` and `partials/footer.html:44-78`, which is the copy the site actually renders. `logo.png` and `placeholder.jpg` are not referenced at all.
- **Impact:** Roughly half a megabyte of unused files is copied into every deployment, and the duplicated icon sources create ambiguity about which copy a maintainer should edit when changing an icon.
- **Recommended direction:** Remove the unreferenced files, or document in `README.md` why they are retained and which copy is authoritative for the icons.
- **Verification criteria:** Every file under `assets/` outside `img-src/` is either referenced from source or explicitly documented as intentionally retained.

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
- **Current evidence:** The build already asserts partial-host presence and single-`aria-current` correctness, but those assertions can only run as part of a build that produces `dist/`. The repository has no command that validates the pages without producing output.
- **Potential value:** The same guarantees plus cheap additions such as local-reference resolution could be run routinely and quickly, without writing any files — the checks this audit performed ad hoc would become repeatable.
- **Scope boundary:** Optional. This proposes reusing logic that already exists rather than introducing a test framework or new dependencies.

## 8. Current readiness conclusion

**Status:** No P0 and no open P1 findings; one P2 maintenance item remains.

No finding blocks the project from being built, served, or read: content, structure, metadata, references, and documentation are in good order. What remains is asset ownership — roughly half a megabyte of unreferenced files copied into every deployment (P2-04) — which is housekeeping and can be scheduled independently of any other work.

This status is a repository-state assessment. It is not an accessibility certification, a security assessment, a guarantee of browser or assistive-technology behaviour, or a performance measurement — none of which were performed, as recorded in the verification limitations.

## 9. Senior rating

**Rating:** 8/10 — reassessed 2026-08-13 against the current repository state (7/10 on the audit date)

**Active findings behind this rating:** P0 — 0. P1 — 0. P2 — 1 open (P2-04).

The current source supports the raise. The interaction layer that held the previous rating now establishes its own defaults instead of depending on scripting to repair them: the theme resolved before first paint survives runtime initialisation, the mobile navigation panel is closed in markup and CSS below the breakpoint, the project-notice dialog contains focus and closes on `Escape` and on the backdrop, and no raw hex literal remains anywhere under `css/` outside `css/tokens.css`. The build contract is verifiable as documented — `npm run build` writes only into the ignored `dist/` — and `.gitattributes` keeps diffs reviewable. The structural strengths recorded in section 3 are unchanged.

Three current-state factors hold it below a higher score: one finding is still open (P2-04, unreferenced files in the deployment payload); the repository has no automated test suite and no output-free check command, so the build's own contract assertions can only run as part of a build; and runtime, browser, and assistive-technology behaviour remain unverified in this document, as recorded in the verification limitations. A rating above this range needs observed behaviour and repeatable checks, not further source-level fixes.
