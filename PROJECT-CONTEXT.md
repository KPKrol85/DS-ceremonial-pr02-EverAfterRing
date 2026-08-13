# EverAfter Ring — Project Context

## Purpose

This file defines the stable working context for the EverAfter Ring project.

Use it together with the current repository state and the dedicated project documents. Do not replace current repository evidence with assumptions, old conversation context, or historical task descriptions.

## Project

- Name: EverAfter Ring
- Repository: `KPKrol85/DS-ceremonial-pr02-EverAfterRing`
- Type: static multi-page website
- Runtime: HTML, CSS, Vanilla JavaScript ES modules
- Build tooling: Node.js / npm
- Production output: `dist/`
- No runtime framework
- No backend
- `dist/` is generated output and must never be edited directly

The current implementation and repository contents are authoritative for technical behavior.

## Sources of Truth

Use the following documents according to their specific responsibility:

### `README.md`

Describes the current project architecture, features, development workflow, build contract, deployment model, accessibility mechanisms, SEO, assets, and maintenance rules.

### `AUDIT.md`

Contains only currently open audit findings and the current overall audit assessment/rating.

When a finding is fixed and verified, remove it from the active findings.

Do not keep `Resolved` findings or historical resolution records in `AUDIT.md`.

### `PLAN.md`

Tracks implementation work.

- completed tasks use `[x]`
- unfinished tasks remain unchecked
- completed tasks may retain their original audit provenance
- optional future improvements remain clearly separate from required work

### `CHANGELOG.md`

Contains the historical record of completed significant changes.

Resolved audit findings belong here rather than in `AUDIT.md`.

### `PROMPT - AGENT.md`

Canonical KP_Code standard for every `PROMPT - AGENT` request.

Follow it exactly when generating coding-agent tasks.

Every agent task must be standalone and must rely only on:

- the task prompt
- files available in the project
- evidence the agent can inspect itself

Never assume the coding agent can see previous ChatGPT conversations, reviews, reports, or earlier task context.

### `COMMIT - STANDARD.md`

Canonical KP_Code standard for every `COMMIT - STANDARD` request.

Follow it exactly.

## Documentation Lifecycle

The documentation model is:

`AUDIT.md` → current problems
`PLAN.md` → implementation tracker
`CHANGELOG.md` → completed history
`README.md` → current project documentation

Do not mix these responsibilities.

After a verified fix:

1. remove the resolved finding from active `AUDIT.md`
2. update audit counts
3. reassess the existing audit rating when appropriate
4. mark the relevant `PLAN.md` task complete
5. record significant completed work in `CHANGELOG.md`
6. update `README.md` only when the delivered implementation changes something it documents

Never remove the audit rating section merely because active findings reach zero.

## Development Workflow

Coding-agent implementation work is performed in a separate branch/worktree.

The coding agent must:

- inspect before editing
- make the smallest safe change
- preserve existing architecture
- leave implementation changes unstaged
- never stage files unless explicitly requested
- never create commits unless explicitly requested
- never push
- never cherry-pick
- never reset or clean user work
- never edit `dist/` directly

The normal Git flow is controlled by the user:

1. coding agent finishes with unstaged changes
2. user reviews `git status`
3. user stages the approved files
4. user requests `COMMIT - STANDARD`
5. commit is created in the coding-agent worktree
6. commit SHA is obtained with `git log -1 --oneline`
7. user cherry-picks the SHA onto `main`
8. user pushes `main`

Do not replace this workflow with an alternative unless explicitly requested.

## Scope Rules

Prefer one focused task at a time.

For each task:

- inspect the current implementation first
- identify the canonical source
- use evidence from the current project
- keep the diff minimal
- preserve unrelated behavior
- avoid speculative refactoring
- avoid unrelated cleanup
- avoid dependency additions unless required
- do not redesign working architecture by preference
- do not invent files, paths, components, behavior, tests, or configuration

If an unrelated issue is discovered, leave it unchanged unless it blocks the requested task.

## Generated and Local Tooling

- `dist/` is generated and ignored
- `.claude/` is local agent/worktree tooling and is not part of the project source
- `.codex/environments/environment.toml` is intentionally tracked project configuration
- local agent worktrees must never be copied into the portfolio project

## Portfolio Copy

The project may also be synchronized into `kp-code-portfolio`.

The standalone EverAfter Ring repository remains the development source.

Do not treat the portfolio copy as the canonical development repository.

## Migration Decisions

Do not migrate the project to Vite, TypeScript, another framework, or another build architecture unless the user explicitly approves that migration.

A request to analyse a possible migration is analysis only until implementation is explicitly approved.

Preserve the current architecture until that decision is made.

## Collaboration Rule

When project state is uncertain, verify the current repository or the relevant project document before answering.

Prefer current evidence over remembered conversation context.

Do not reconstruct project state from old chats when current project files can answer the question.

Keep technical guidance concise, sequential, and internally consistent.
