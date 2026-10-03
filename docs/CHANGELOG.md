# Changelog

All significant changes to this project are documented in this file.

Development history from before the migration to this repository was kept in the previous portfolio repository and is not reconstructed here.

## [Unreleased]

### Added

* Added the EverAfter Ring static multi-page site as an independent repository with shared partials, project assets, JavaScript and CSS sources, and a Node-based production workflow.
* Added a custom `404.html` page with the shared shell, root-relative recovery navigation, `noindex, follow`, and production-build integration.
* Added an accessible portfolio lightbox for all nine images on `realizacje.html`, with mouse, touch, keyboard, focus-return, responsive-image, dark-theme, and reduced-motion support.
* Added `aria-invalid` state handling to validated contact-form fields, synchronized with the existing validation messages and recovery behavior.

### Removed

* Removed eight unused icon, logo, and placeholder assets, reducing the deployment payload without affecting rendered content.

### Fixed

* Aligned the privacy policy, cookies policy, and terms with the implemented Netlify Forms flow, browser storage, embedded map, and demonstrational project scope.
* Preserved the resolved system theme before first paint and aligned the theme toggle with the active theme.
* Kept the mobile navigation closed by default until JavaScript explicitly opens it.
* Made contact-form select indicators readable in both light and dark themes.
* Added focus containment, `Escape` dismissal, backdrop dismissal, and focus restoration to the project notice modal.
* Contained the cookie-policy technology table within a horizontally scrollable, keyboard-focusable region on narrow screens.
* Made the project notice resilient to unavailable browser storage.
* Replaced `LocalBusiness` structured data with linked `WebPage` and `WebSite` data that reflects the project's demonstrational character.

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
