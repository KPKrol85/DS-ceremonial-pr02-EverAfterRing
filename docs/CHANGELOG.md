# Changelog

All significant changes to EverAfterRing Hotels & Travel are documented in this file.

## Entry policy

A change is significant when a future maintainer or the project owner would reasonably need to know that one of the following changed:

- user-visible behavior, including meaningful UI, UX, or public content changes;
- accessibility behavior or accessibility contracts;
- build behavior, build guards, or npm scripts;
- test infrastructure or verification tooling;
- the dependency set;
- deployment or hosting workflow;
- PWA, service-worker, cache, or offline behavior;
- architecture, sources of truth, or important project maintenance contracts.

Judge by impact, not by file count. A small visual change is recorded when it affects behavior, accessibility, or a shared component contract. Editing a file alone does not justify an entry.

Not recorded: improvement-report status updates and archiving, commit-only or tracking-document changes, temporary verification probes, minor internal documentation corrections, and isolated cosmetic adjustments without broader impact.

For each implementation task, determine `Changelog: yes` or `Changelog: no`. Add entries only when authorized within the approved task scope.

## [Unreleased]

### Added

* Added the EverAfter Ring static multi-page site as an independent repository with shared partials, project assets, JavaScript and CSS sources, and a Node-based production workflow.
* Added a custom `404.html` page with the shared shell, root-relative recovery navigation, `noindex, follow`, and production-build integration.
* Added an accessible portfolio lightbox for all nine images on `realizacje.html`, with mouse, touch, keyboard, focus-return, responsive-image, dark-theme, and reduced-motion support.
* Added `aria-invalid` state handling to validated contact-form fields, synchronized with the existing validation messages and recovery behavior.
* Added a contact-form note identifying KP_Code Digital Studio as the inquiry recipient and the presented services and packages as demonstrational.
* Added a portfolio hint on `realizacje.html` that names the lightbox opening gesture for the primary input, a mouse double-click or a single tap, and appears only once the lightbox has initialized.

### Removed

* Removed eight unused icon, logo, and placeholder assets, reducing the deployment payload without affecting rendered content.
* Removed the single-consumer `js/config.js` selector registry, so every JavaScript module now owns its DOM selectors.

### Fixed

* Aligned the privacy policy, cookies policy, and terms with the implemented Netlify Forms flow, browser storage, embedded map, and demonstrational project scope.
* Preserved the resolved system theme before first paint and aligned the theme toggle with the active theme.
* Kept the mobile navigation closed by default until JavaScript explicitly opens it.
* Made contact-form select indicators readable in both light and dark themes.
* Added focus containment, `Escape` dismissal, backdrop dismissal, and focus restoration to the project notice modal.
* Contained the cookie-policy technology table within a horizontally scrollable, keyboard-focusable region on narrow screens.
* Made the project notice resilient to unavailable browser storage.
* Replaced `LocalBusiness` structured data with linked `WebPage` and `WebSite` data that reflects the project's demonstrational character.
* Aligned the navigation script's mobile mode with the CSS desktop breakpoint, removing mobile-only panel state and focus handling from the desktop navigation at 1024 px.
* Stopped the hero image parallax from scheduling animation frames while idle and gave its transform a single owner per motion preference.
* Moved the remaining component color and shadow literals into design tokens, making `css/tokens.css` the single owner of component color values.

### Documentation

* Added the project-specific bilingual Polish and English proprietary KP_Code license.

### Build and Tooling

* Added repository ignore rules for dependencies, generated output, reports, caches, environment files, logs, and editor or operating-system artifacts.
* Added worktree environment configuration using `npm ci`.
* Added a repository-wide LF line-ending policy while excluding binary assets from text conversion.
* Separated image generation from the production build so `npm run build` no longer rewrites version-controlled image assets.
* Migrated the production build from the custom Node pipeline to Vite while preserving the static HTML, CSS, and Vanilla JavaScript multi-page architecture.
* Kept the synchronous theme bootstrap outside the main JavaScript bundle and inline it during production builds before first paint.
* Preserved authored asset paths, excluded image sources from `dist/`, and emitted bundled CSS and JavaScript with content hashes.
* Standardized local development and production preview through Vite on ports 8181 and 8182.
* Removed direct `esbuild` and `lightningcss` dependencies after moving bundling and minification to Vite.
* Added `npm run check` for dependency-free source consistency, shared-shell contracts, and local-reference validation.
* Added a Chromium smoke-test baseline covering representative pages, navigation, theme behavior, mobile navigation, and the project notice.
* Extended theme regression tests to cover the system-dark fallback, `theme-color` metadata synchronization, and cross-tab theme synchronization.
* Extended contact-form regression tests to cover per-field validation messages, prevented invalid submission, and the Netlify Forms POST payload.
* Extended project-notice regression tests to cover keyboard focus containment, backdrop dismissal, and acceptance persisted across a reload.
* Added a regression test verifying that theme switching, project-notice dismissal, and mobile navigation remain operable without uncaught errors when browser storage is unavailable.
* Extended `npm run check` to validate per-page ID uniqueness and same-document ARIA, `label[for]`, and fragment-link targets with the shared shell resolved.
* Unified development and production shared-shell resolution in Vite and removed runtime partial loading.
