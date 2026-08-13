# Changelog

All significant changes to this project are documented in this file.

Development history from before the migration to this repository was kept in the previous
portfolio repository and is not reconstructed here.

## [Unreleased]

### Added

- Added the EverAfter Ring static multi-page site as an independent repository, including the HTML pages, the shared header and footer in `partials/`, the CSS and JavaScript sources, project assets, and the Node-based production build pipeline in `scripts/build.mjs` and `scripts/optimize-images.mjs`.

### Fixed

- Fixed the privacy policy, cookie policy, and terms pages to describe the functionality the site actually implements, including contact form submission through Netlify Forms, the two browser-local `localStorage` entries used for the theme choice and the project notice, and the embedded Google Maps frame on the contact page, while keeping the demonstration-project framing.

### Documentation

- Added the project license as a bilingual Polish and English proprietary KP_Code license bound to this project and repository, with the Polish version stated as authoritative in case of divergence.

### Build and Tooling

- Added repository ignore rules for dependencies, the generated `dist/` output, test and coverage output, tool caches, environment files, logs, and editor or operating system artifacts, while keeping `assets/`, `package-lock.json`, and the Codex environment configuration tracked.
- Added a Codex environment configuration that installs dependencies with `npm ci` during worktree setup.
