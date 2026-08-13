# Changelog

All significant changes to this project are documented in this file.

Development history from before the migration to this repository was kept in the previous
portfolio repository and is not reconstructed here.

## [Unreleased]

### Added

- Added the EverAfter Ring static multi-page site as an independent repository, including the HTML pages, the shared header and footer in `partials/`, the CSS and JavaScript sources, project assets, and the Node-based production build pipeline in `scripts/build.mjs` and `scripts/optimize-images.mjs`.

### Fixed

- Fixed the privacy policy, cookie policy, and terms pages to describe the functionality the site actually implements, including contact form submission through Netlify Forms, the two browser-local `localStorage` entries used for the theme choice and the project notice, and the embedded Google Maps frame on the contact page, while keeping the demonstration-project framing.
- Fixed the theme runtime so it keeps the theme resolved before the first paint. With no saved choice, a visitor whose system prefers dark now stays on the dark theme after the page loads instead of reverting to light, and the theme toggle reports the theme actually in effect.
- Fixed the mobile navigation so the panel is closed by default in the markup and the stylesheet. It no longer covers the page when JavaScript is unavailable or has not run yet, and scripting is required only to open it.
- Fixed the dropdown indicator on the contact form so it follows the active theme. The chevron on both required select fields is now clearly visible in the light theme, where it was previously almost indistinguishable from the field background.
- Fixed the project notice modal so it behaves as the modal dialog it declares itself to be: keyboard focus stays inside it while it is open, `Escape` closes it, clicking the backdrop dismisses it, and focus returns to where it was before the notice appeared.
- Fixed the technology table on the cookie policy page so it scrolls horizontally within its own region on narrow screens, with a visible keyboard focus state, instead of overflowing the page.
- Fixed the project notice so it still appears and can be dismissed in a browser that blocks site data. A failed read or write of the stored acceptance no longer surfaces as an uncaught error.
- Fixed the structured data on all ten pages so it no longer presents the demonstration site as an operating local business. The `LocalBusiness` block with real contact details was replaced by linked `WebPage` and `WebSite` data stating the project's demonstration character, matching the framing already used in the interface and the legal pages, and `README.md` describes the new contract.

### Documentation

- Added the project license as a bilingual Polish and English proprietary KP_Code license bound to this project and repository, with the Polish version stated as authoritative in case of divergence.

### Build and Tooling

- Added repository ignore rules for dependencies, the generated `dist/` output, test and coverage output, tool caches, environment files, logs, and editor or operating system artifacts, while keeping `assets/`, `package-lock.json`, and the Codex environment configuration tracked.
- Added a Codex environment configuration that installs dependencies with `npm ci` during worktree setup.
- Added a repository line-ending policy in `.gitattributes` that stores tracked text files with LF and keeps binary image and font formats out of line-ending conversion, so a one-line source edit produces a one-line diff regardless of the contributor's platform.
- Changed `npm run build` to produce the deployment output in `dist/` without generating images, so the documented build no longer rewrites version-controlled files under `assets/img/`. Image variants are now produced only by running `npm run optimize:images` explicitly, and the build documentation in `README.md` describes the new sequence.
