# Changelog

## 0.1.0 (unreleased)

### Added

- A skill-first engineering cycle: chat plan, scoped role work, read-only review, repairs, criterion-based checks, chat report, and cleanup.
- One entry skill and eight responsibility profiles, distributed through native Pi, Oh My Pi, Codex, and Claude Code plugin mechanisms.
- Bundled Bash scripts for guarded OS-temp sessions and process-tree cleanup, revision-aware verification, and optional no-install Playwright E2E.
- Real Git Bash integration tests for denial, zero-test output, trivial commands, source drift, timeouts, shared checks, and interrupted server cleanup.

### Changed

- Workflows start fresh each session. Plans and reports remain in chat unless the user requests files.
- Native harness permissions and configured models/accounts remain authoritative; MAY is model-agnostic, with native delegation or sequential fallback.
- One PM or Tech Lead coordinator applies planning lenses inline and delegates only justified task-relevant roles, not the full roster; leaf workers do not spawn teams. Active native Vibe is reused without a second agent manager; review and QA remain required.
- Support levels distinguish installation proof from four real-model workflow scenarios.
- Standalone planning reuses existing brainstorming and accepted plans without an external skill dependency. Adaptive questions distinguish independent simple choices from consequential decisions and offer explained recommendations with text fallback.
- Chat plans include task inputs, outputs, dependencies, scoped actions, Definition of Done, and checkable acceptance. Only complex or risky plans need a fresh read-only critic; unavailable delegation is disclosed as self-check.
- All eight roles give scope-specific recommendations; UX advice can use text, and operational/security concerns apply only where relevant. Existing helper dispatch remains pending a separate decision.
- Root agent files share a MAY contributor development guide; installed workflow guidance remains in the canonical skills. npm packaging selects explicit public files, and repository checks reject public dependencies on private specifications.
- Public documentation now starts with MAY's delegation responsibilities and onboarding, with workflow diagrams, a scoped verification example, and separate runtime, contributor, and security guides.

### Fixed

- Every changed source and test delta, including tests-only repairs, requires renewed review acceptance before final QA; affected evidence becomes stale after source/test/build/fixture changes.
- Temporary capture and cleanup target the run's exact session, with claims limited to observed scope rather than unrelated `may-*` folders.
- Browser-check guidance separates agent-managed use from optional shell commands, reports unavailable tooling as blocked, and preserves failed-run diagnostics across tool calls until inspection and exact-session cleanup.
- Workflow and runtime diagrams use packaged, editable SVG images instead of requiring Mermaid rendering in Markdown previews.

### Validation (2026-11-06)

- Independent review accepted the guidance, ten real-model response scenarios, and one installed-skill native plan-only smoke. Five pre-edit auth controls exposed dependent-question batching; all controls and limitations were retained.
- OMP 18.16.0 used the configured model/account defaults; actual installed-skill reads and one read-only native critic were observed. The temporary fixture stayed unchanged. This is prompted planning evidence, not full workflow or autonomous routing proof.
- `npm test` passed 45/45 with no skips; `npm run check` passed through Windows Git Bash after guidance acceptance. Native interactive questions and real browser testing remain untested; support stays `installable`.

### Removed

- The old engine, workflow database, event history, persistent recovery, host adapters, command interface, and plugin interception behavior.

### Limitations

- Skills cannot enforce model compliance or provide a sandbox.
- The verifier detects common empty-test/trivial-command patterns, not weak assertions or browser build identity.
- Real browser and real-model support claims require observed runs; unavailable credentials or permissions are reported rather than bypassed.
