# EverAfterRing — Workflow Improvements

**Analysis date:** 2026-11-17
**Project type:** Static multi-page website in Polish (HTML, CSS, Vanilla JavaScript ES modules) with a Vite development, build, and preview toolchain; Node-based source check, image-generation script, and Chromium Playwright smoke suite; no CI configuration in the repository
**Analysis mode:** Evidence-based workflow improvement review
**Focus:** Project-wide workflow

## Improvement overview

The project has a compact, well-separated toolchain: `npm run check` validates source contracts without writing files, `npm run build` produces the ignored `dist/` directory, `npm run test:smoke` rebuilds before running Playwright against the production preview, and `npm run optimize:images` is an explicit, separate asset step. Git history shows a repeated maintenance cycle — document an improvement report, implement five items, condense completion records, archive under `docs/archive/improvements/` — run four times between 2026-11-14 and 2026-11-17.

The main opportunities lie in the processes around this toolchain rather than in the toolchain itself: focused verification is practised but not documented, the bilingual README duplicates volatile facts that have already drifted from the source, the improvement-cycle lifecycle is followed by convention only, and two documented manual maintenance procedures (page registration and image regeneration) have no automated feedback.

## Proposed improvements

### IMP-WORKFLOW-01 — Document the focused verification commands per change type

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added equivalent Polish and English README guides mapping six change types to existing verification commands and additional risk-based checks. Documented focused `test:smoke` runs, the stale-`dist/` risk of direct Playwright execution, and documentation-only verification; linked the guide from `AGENTS.md`.
- **Verification:** Compared the guides against `package.json`, `playwright.config.js`, and archived focused-run evidence; checked PL/EN command parity, Markdown structure, links, and the diff, with `git diff --check` passing. Confirmed unchanged surrounding README content, scripts, and configuration; no build or browser tests were run for this documentation-only change.
- **Impact:** High
- **Effort:** Small

### IMP-WORKFLOW-02 — Stop duplicating volatile counts and file inventories in the bilingual README

- **Status:** COMPLETED — implemented and verified.
- **Result:** Removed the fixed Playwright test total and replaced bilingual README file and scenario inventories with responsibility and coverage summaries linked to canonical sources. Included the improvement archive and preserved the existing verification guidance and testing limitations.
- **Verification:** Compared PL/EN content with current directories, CSS imports, test specifications, and Playwright configuration; checked Markdown structure, local links, and unchanged surrounding README content and IMP-WORKFLOW-01 guides. `git diff --check` passed; no build or browser tests were run for this documentation-only change.
- **Impact:** Medium
- **Effort:** Small

### IMP-WORKFLOW-03 — Codify the improvement-cycle lifecycle in AGENTS.md

- **Status:** REJECTED — not implemented.
- **Decision:** Retain the existing KP_Code documentation workflow, project instructions, and archive structure without modification.
- **Reason:** The proposed project-specific lifecycle rules would duplicate established KP_Code conventions and could introduce inconsistencies between repositories. The existing `docs/archive/` structure already separates audits, improvements, and plans. Differences in historical report headings do not justify introducing additional local requirements.
- **Verification:** Reviewed the current `AGENTS.md`, improvement records, and four archived improvement reports. Confirmed the existing archive organization and completion-record conventions. No implementation changes were made.
- **Impact:** Medium
- **Effort:** Small

### IMP-WORKFLOW-04 — Make the page-registration and origin procedures verifiable through `npm run check`

- **Status:** COMPLETED — implemented and verified.
- **Result:** Extended `npm run check` to verify sitemap registration against `htmlPages`, canonical URLs, and the production origin from `homepage`. Documented the checks in both README languages.
- **Verification:** `npm run check` passed on the maintained sources. All 18 isolated cases returned the expected exit codes and diagnostics, including indexing exceptions, external URLs, and invalid sitemap, canonical, and origin values. File snapshots confirmed read-only operation and `dist/` remained absent.
- **Impact:** Medium
- **Effort:** Medium

### IMP-WORKFLOW-05 — Report stale generated image variants during image regeneration

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added reporting of stale generated image variants after optimization and when the source directory is empty or missing. Reported files remain untouched.
- **Verification:** `node --check scripts/optimize-images.mjs` and `npm run check` passed. Isolated runs reproduced all 135 tracked output paths, generated byte-identical JPG, WebP, and AVIF fixture outputs against the previous version, and verified reporting after source removal, renaming, and width changes, including empty and missing sources. File hashes and timestamps confirmed that reported files were untouched, and an isolated production build passed with the optimizer absent.
- **Impact:** Low
- **Effort:** Small

## Selection summary

The proposals target the processes repeated most often in this repository: verifying a change (01), keeping the README synchronized after each cycle (02), and closing improvement cycles (03). Two further proposals add automated feedback to manual maintenance procedures that README already documents but nothing currently checks: page registration and origin changes (04), and image regeneration (05).

01, 02, and 03 are documentation-only and independent, although 01 and 02 both edit the README testing section and are best applied in one sequence. 04 and 05 are independent of each other and of the documentation items; 04 should update the README check-scope text after 02 if both are approved. All five preserve the existing Vite toolchain, command set, generated-file ownership, and manual deployment model. Four are Small and one is Medium, which fits a focused development session.

Not selected: CI or deployment automation (deployment settings are intentionally kept outside the repository and no evidence shows a need), Node-version pinning beyond the existing `engines` field (no observed mismatch), and local branch or worktree cleanup (local state, not a repository contract).

## Analysis limitations

- The analysis was static. No project command was run; `node_modules/` is absent in this worktree. The 47-test figure is a static count of `test()` calls, including loop-generated cases, not a Playwright `--list` result.
- Netlify build and publish settings are not tracked in the repository and were not inspected.
- Two documentation defects observed outside this report's scope: `docs/CHANGELOG.md:3` names the project "EverAfterRing Hotels & Travel", and `docs/CHANGELOG.md:74` records a worktree environment configuration that commit `18fa4b0` later removed.
