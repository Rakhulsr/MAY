# Changelog

## 0.3.0 (unreleased)

- Keep coordinator context small: the coordinator delegates large reads, keeps check output in the session folder, and can write a phase-reset `handoff.md` there so long work continues in a fresh or compacted session. A fresh session reads it only from a path the user gives and rechecks it against Git.
- Size teams by S, M, or L tier shown in the mode header. Roles that are not spawned still act as inline lenses.
- Workers return a fixed short result shape (`STATUS`, `CHANGED`, `EVIDENCE`, `FINDINGS`, `OPEN`) and never receive the coordinator's chat history.
- The coordinator runs final verification itself; a QA worker is started only to design missing tests or drive browser checks.
- `may-verify.sh --log-dir <dir>` writes each check's complete output to `<ID>.log` and adds `LOG` lines to the table. Output without the option is unchanged.
- New `may-config` skill writes user-chosen per-role models into Claude Code or Oh My Pi project agent files after the user approves the exact diff. MAY still never selects models. Codex and Pi are not supported.
- Add an independent token benchmark with two Node standard-library fixtures, oracles, a run-preparation script, and a session-log token counter.
- Token savings are not yet measured; see the benchmark report once runs are recorded.

## 0.2.0 (unreleased)

- Rename the canonical entry skill from `using-may` to `may`; update existing prompts and installed skill references. No compatibility alias is included.
- Refine role-specific handoffs and coordinator routing, distinguish early risk checks from final QA, and require evidence for reported test results.
- Add opt-in bounded verifier output for successful checks and document harness update limitations.
- Run the verifier's and E2E runner's helper processes and check commands with the same Bash that launched the script, instead of the first `bash` on `PATH`. On Windows, launching through Git's `usr/bin/bash.exe` no longer falls through to the WSL launcher.
- On Windows Git Bash, session cleanup now finds stopped or terminal-blocked members of a recorded process group. `ps -l` prefixes those rows with a status letter, so `stop` previously skipped them, reported success, and deleted the session while they kept running. `track` and `sweep` use the same listing, so refreshed tracking records such members and an aged session is preserved while only a stopped member of an exited leader's group remains.
- On Windows Git Bash, session, sweep, `stop --keep`, retained-session, and E2E artifact paths are printed in `C:/…` form instead of MSYS `/tmp/…`, so native harness file tools can open retained diagnostics.
- `npm run check` and `npm run test:harness` run their Bash scripts through `scripts/bash.ts`, which on Windows locates Git Bash from `git --exec-path` instead of a bare `bash` that may launch WSL, and fails with an error rather than falling back to `bash` when it is not found. Tests share the same lookup instead of a hardcoded default install path; `MAY_BASH` still overrides. If Bash is killed by a signal, the launcher terminates itself with that signal instead of exiting 1.
- Workflow superiority, native installation of this renamed version, and full real-model workflow support remain unverified.

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
- Mode headers distinguish inline roles from planned, started, completed, or blocked workers; risk-based mode choices and short readiness/review/QA boundaries identify the current candidate and evidence gaps.
- Role profiles share one required operating/handoff contract. Dispatch preflight preserves native defaults and permissions; interrupted-worker evidence retains exact commands, required nonsecret inputs, and inspectable temporary artifacts without persistent workflow state.

### Fixed

- Every changed source and test delta, including tests-only repairs, requires renewed review acceptance before final QA; affected evidence becomes stale after source/test/build/fixture changes.
- Temporary capture and cleanup target the run's exact session, with claims limited to observed scope rather than unrelated `may-*` folders.
- Browser-check guidance separates agent-managed use from optional shell commands, reports unavailable tooling as blocked, and preserves failed-run diagnostics across tool calls until inspection and exact-session cleanup.
- Mixed Go test output no longer counts a package's `[no test files]` line as proof that the entire command ran no tests when other packages provide test results.
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
