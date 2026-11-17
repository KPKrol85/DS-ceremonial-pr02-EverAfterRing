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

- **Affected workflow:** Verification workflow.
- **Evidence:** `AGENTS.md:26-34`; `package.json:25-31`; `playwright.config.js:24-30`; `README.md:166-176`, `README.md:222-247`, `README.md:493-502`, `README.md:549-574`; verification fields in `docs/archive/improvements/IMPROVEMENTS-QUALITY-2026-11-14.md`, `IMPROVEMENTS-UX-2026-11-15.md`, and `IMPROVEMENTS-UI-2026-11-17.md`.
- **Current workflow:** `AGENTS.md` requires focused checks for focused changes but names no project commands. README documents each script individually and the full `npm run test:smoke` run only. Archived records show focused runs performed in several different ways — `npm run test:smoke -- tests/<spec>.spec.js`, a separate `npm run build` followed by a spec run, and unspecified "focused Playwright tests". Because `webServer` serves whatever `dist/` exists, a spec run without a preceding build tests stale or missing output; only the `test:smoke` passthrough guarantees a fresh build.
- **Proposed improvement:** Add a short verification guide to the README testing section that maps common change types (content/markup, CSS, JavaScript module, partial or shell contract, build configuration, documentation only) to the appropriate existing commands, and documents `npm run test:smoke -- <spec>` as the supported focused browser check.
- **Expected practical value:** Consistent, reproducible verification across agent and manual tasks; removes the stale-`dist/` risk of running Playwright directly; makes the `AGENTS.md` focused-check rule actionable.
- **Implementation scope:** README testing section in both language sections, optionally one pointer line in `AGENTS.md` Verification. No script, configuration, or test changes; no new commands.
- **Acceptance criteria:** The PL and EN testing sections each contain the same change-type-to-command mapping using only existing commands; the guide states that focused browser runs use `npm run test:smoke -- <spec>` and why a direct `playwright test` may test stale output; documentation-only changes are identified as needing no browser run; `package.json` and `playwright.config.js` are unchanged.
- **Impact:** High
- **Effort:** Small

### IMP-WORKFLOW-02 — Stop duplicating volatile counts and file inventories in the bilingual README

- **Affected workflow:** Project documentation maintenance.
- **Evidence:** `README.md:95`, `README.md:101-105`, `README.md:228`, `README.md:230-239` (PL); `README.md:422`, `README.md:429-433`, `README.md:555`, `README.md:557-568` (EN); `tests/*.spec.js`; `css/components/`; `docs/archive/improvements/`; commit `27f9050` ("Update README test coverage documentation").
- **Current workflow:** README mirrors every section in Polish and English and hand-maintains exact facts owned by other files: the Playwright test count, a per-scenario test inventory, and per-file lists in the structure trees. Each improvement cycle that adds tests or files requires two manual README edits. The duplicates have drifted: README states twenty-four tests, while the current specs define 47 (counted statically, including parameterized cases); the test inventory omits the package-preselection, legal-page notice, and error-token cases added in the UX and UI cycles; the `css/components/` comment omits `author-note`, `legal`, and `table`; the `docs/archive/` tree omits `improvements/`.
- **Proposed improvement:** Replace volatile counts and exhaustive per-file or per-scenario enumerations with stable descriptions of ownership and scope that point to the canonical location (`tests/`, `css/main.css`, `docs/archive/`), and resynchronize both language sections in the same change.
- **Expected practical value:** Fewer README edits per improvement cycle, no recurring PL/EN drift on facts that change with each task, and a README that stays accurate between cycles.
- **Implementation scope:** `README.md` only — the structure trees, the testing section, and any other numeric statements that duplicate executable sources. Stable contracts (page count tied to `htmlPages`, commands, deployment notes, accessibility mechanisms) stay documented. No source, test, or configuration changes.
- **Acceptance criteria:** README contains no hard-coded total test count; the structure trees list directories with their role rather than file inventories that require per-file updates; `docs/archive/improvements/` is listed; every remaining statement in the testing and structure sections matches the current repository; PL and EN sections state the same facts.
- **Impact:** Medium
- **Effort:** Small

### IMP-WORKFLOW-03 — Codify the improvement-cycle lifecycle in AGENTS.md

- **Affected workflow:** Improvement-report tracking and archiving.
- **Evidence:** `AGENTS.md:52-69`, `AGENTS.md:71-95`, `AGENTS.md:145-158`; `docs/archive/improvements/` (four reports); commits `f5c2867`, `76be3bb`, `e9b43ca`, `59fb9b9`; no root `PLAN.md`.
- **Current workflow:** `AGENTS.md` defines the per-improvement completion record and names `docs/archive/plans/` for plans, but does not define where improvement reports are archived, how archived files are named, what wrapper structure an archived report uses, or whether approved improvements must be entered in `PLAN.md`. In practice, four cycles ran without a root `PLAN.md`, archived to `docs/archive/improvements/IMPROVEMENTS-<CATEGORY>-<archive date>.md`, with differing wrappers: titles ("Completion Record" vs. "Improvements"), opening sections ("Scope" vs. "Improvement overview"), and closing sections ("Completion" vs. "Completion summary"; "Limitations and outstanding observations" vs. "Verification limitations").
- **Proposed improvement:** Add a short lifecycle subsection to the existing "Completed improvement records" section stating the tracking document for an active cycle (the active `IMPROVEMENTS-*.md` report unless a `PLAN.md` is explicitly opened), the archive directory, the filename pattern, and the archived report structure already used in practice.
- **Expected practical value:** Each cycle closure follows one defined procedure instead of being re-derived; archived reports become uniform and comparable; removes the recurring ambiguity between `PLAN.md` and improvement reports.
- **Implementation scope:** `AGENTS.md` only, a few lines within the existing section. Existing archived reports are not rewritten; the global KP_Code standards are not changed.
- **Acceptance criteria:** `AGENTS.md` names `docs/archive/improvements/` and the `IMPROVEMENTS-<CATEGORY>-YYYY-MM-DD.md` pattern; it lists the archived report sections in order; it states when `PLAN.md` is and is not required for improvement work; the four existing archive filenames conform to the documented pattern; no archived report is modified.
- **Impact:** Medium
- **Effort:** Small

### IMP-WORKFLOW-04 — Make the page-registration and origin procedures verifiable through `npm run check`

- **Affected workflow:** Page addition and site-origin maintenance.
- **Evidence:** `README.md:313` (PL), `README.md:640` (EN); `scripts/html-shell.mjs:11-33`; `scripts/check.mjs:20-22`, `scripts/check.mjs:367-419`; `sitemap.xml`; `robots.txt`; `package.json` (`homepage`); commit `44cb9cd`.
- **Current workflow:** README documents adding a page as a manual update across `htmlPages`, `primaryNavPages`, `partials/header.html`, and `sitemap.xml`. `npm run check` validates `htmlPages`, the navigation state, and local references, but does not read `sitemap.xml`, canonical URLs, or absolute self-URLs. The production origin occurs 101 times across the pages, `robots.txt`, and `sitemap.xml`; the last origin change (`44cb9cd`) was a manual 14-file edit. All of these are currently consistent (sitemap lists the nine indexable pages; every canonical matches its file), so this is a process gap, not a defect.
- **Proposed improvement:** Extend the existing source check so that the sitemap entries match the indexable subset of `htmlPages`, each page's canonical URL matches its own filename, and absolute self-URLs in pages, `robots.txt`, and `sitemap.xml` use the origin declared in `package.json` `homepage`.
- **Expected practical value:** The documented add-a-page procedure and any future origin change receive immediate, file-specific feedback instead of relying on manual review across many files.
- **Implementation scope:** `scripts/check.mjs` and the README check-scope description. Reuse `htmlPages`; keep the explicit indexable-page exceptions (`dziekujemy.html`, `404.html`) visible in one place. No build, page, or metadata changes; no new dependency; the command still writes nothing.
- **Acceptance criteria:** `npm run check` passes on the current repository; it fails with a named file and reason when a sitemap entry is missing or extra, when a canonical URL does not match its page, or when an absolute self-URL uses a different origin; `dist/` and tracked files remain unchanged after the run; README describes the added scope in both languages.
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
