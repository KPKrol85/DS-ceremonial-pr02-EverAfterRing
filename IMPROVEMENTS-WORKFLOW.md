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

- **Affected workflow:** Generated asset management.
- **Evidence:** `scripts/optimize-images.mjs:71-113`; `vite.config.js:55-78`; `README.md:643`; `.gitignore` (tracked `assets/`); `docs/archive/plans/PLAN-2026-08-15.md` (PH3-03).
- **Current workflow:** `npm run optimize:images` writes variants for every source in `assets/img-src/` into the tracked `assets/img/` directory but never inspects existing output. A renamed or removed source therefore leaves its old variants tracked, and the build copies everything under `assets/` (except `img-src/`) into `dist/`. `npm run check` verifies that references resolve, not that generated files still have a source. Unreferenced assets were previously found only by a manual audit (PH3-03 removed eight). The current tree has 15 sources and 135 matching variants, with no stale files observed.
- **Proposed improvement:** Have the image script list variants in `assets/img/` that no longer correspond to a current source, in report-only form, after regeneration.
- **Expected practical value:** Stale generated binaries are detected at the moment they are created rather than by a later audit, keeping the tracked asset set and deployment payload aligned with `assets/img-src/`.
- **Implementation scope:** `scripts/optimize-images.mjs` only. Report without deleting; leave output formats, widths, quality settings, and the source/generated ownership contract unchanged.
- **Acceptance criteria:** A run with the current sources reports no stale variants and produces the same output set as before; a run after removing or renaming a source lists that source's previous variants by path; the script deletes no files; `npm run build` remains independent of image generation.
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
