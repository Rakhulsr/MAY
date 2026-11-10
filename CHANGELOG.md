# Changelog

## 0.3.0 (unreleased)

- Keep coordinator context small: the coordinator delegates large reads, keeps check output in the session folder, and can write a phase-reset `handoff.md` there so long work continues in a fresh or compacted session. A fresh session reads it only from a path the user gives and rechecks it against Git.
- One tiered mode replaces Direct and Orchestrated. Tier S has no workers: the coordinator implements inline under the relevant role lens and self-reviews with the Tech Lead lens, disclosed as not independent. Tier M (two or more areas, any contract change, or auth or data risk in one area) adds one named implementer and one named reviewer chosen by risk; tier L (phased work or risk across areas) adds one implementer per area in sequence with phase resets. The coordinator checks signals from L down and may not size multi-area or contract work down to S. Every tier ends with `may-verify.sh`, except planning-only work. A team header opens the plan and the final report and names each role as coordinator, inline lens, worker, or reviewer. Roles that are not spawned still act as inline lenses.
- Each role ships as a plugin worker agent in `agents/may-<role>.md` that preloads its skill, so Claude Code dispatches `may:may-<role>` instead of a generic worker; on Claude Code a project `may-<role>` agent from `may-config` is listed beside it and preferred. The package also declares the agents for pi-subagents (`pi.subagents.agents`); package discovery there is untested. Oh My Pi and Codex fall back to the native default with a role brief. `npm run check` requires an agent for every role skill.
- Split the guidance so each reader loads less: workers read the short `role-contract.md` instead of the whole orchestration contract, and the coordinator reads `phase-reset.md` and `browser.md` only when needed.
- When the user asks, the phase-reset handoff can live in a Git-ignored project `may-artifacts/handoff.md` to survive the 24-hour temp sweep; it is never committed and is deleted when the work ends.
- Workers return a fixed short result shape (`ROLE`, `STATUS`, `CHANGED`, `EVIDENCE`, `FINDINGS`, `OPEN`) and never receive the coordinator's chat history.
- Preserve exact user contract details in implementer and reviewer briefs, and map each criterion to a check that exercises it instead of treating a passing test command as complete coverage.
- Add a user-directed manual ideation bridge with MIP/1 packets, independent proposals, bounded critique, and optional local structural validation; cross-harness model behavior remains unverified.
- `may-bridge.sh host` reports the terminal host MAY runs in (Herdr, herdr-app, zellij, tmux, WezTerm, Windows Terminal, VS Code, Zed, or none) from the variables each host sets, inner multiplexer first; `MAY_HOST` overrides. `may-bridge.sh open <program> [args...]` opens a pane or tab in that host instead of a new window, and exits 3 where no pane command exists (VS Code, Zed, unknown hosts, or a missing host CLI) so the coordinator runs the other harness headless. Every host path is tested with stub host CLIs. On herdr-app (herdr-core `hc`), `open` started real panes for OMP 18.18.6, Claude Code 2.1.322, Pi 1.5.0, and Codex 0.167.0 in the current directory, each ending with the coordinator's terminal. Real pane creation in Herdr TUI, zellij, tmux, WezTerm, and Windows Terminal is unverified.
- Workflow-tested on Claude Code 2.1.322 (`claude-opus-5-5`, Windows; the installed 0.3.0 plugin for the fail-fix-pass and interruption runs, the repository plugin directory for the others): a small repair, a feature with an independent reviewer and one repair round, a fail-fix-pass repair that reproduced the failing test first, and a run force-stopped mid-implementation then finished in a fresh session without `--resume`. One headless run each; all passed their oracles. These runs inherited the user's configured `auto` permission mode, and their `--allowedTools` argument was split incorrectly by the runner, so they do not show behavior under a strict allowlist. Workers wrote scratch copies to `mktemp` directories outside the session folder; briefs now pass the session folder and workers keep scratch work inside it.
- Parallel writers for tier L: areas with disjoint files may run at the same time when the harness gives each worker its own checkout (Claude Code `isolation: "worktree"`, pi-subagents `worktree: true`, or Oh My Pi `isolated: true` once the user enables it) and the working tree is clean. The coordinator checks each checkout started from the recorded base, applies one patch at a time, reviews the combined delta, verifies in the main checkout, and removes the worktrees it was given. Codex sub-agents share one checkout and stay sequential. On Claude Code 2.1.322 a probe of two isolated workers produced two worktrees on the current `HEAD` whose patches applied and cleaned up as documented; one MAY tier L run (`claude-opus-5-5`, `default` permission mode with a tool allowlist, repository plugin directory) dispatched backend and frontend writers in parallel worktrees, checked their base, reviewed the combined delta, verified 5/5, removed both worktrees and branches, and passed an independent oracle. In that run the patch command needed approval because it wrote a patch file, so the coordinator copied the workers' files instead; the guidance now pipes the diff straight into `git apply`. Pi and Oh My Pi parallel writers are untested.
- Cross-harness review: when the user asks, the coordinator sends the criteria and diff to another harness running headless and read-only (Codex, Claude Code, Pi, or Oh My Pi) and records its findings as an independent review. On one seeded two-bug diff, Codex 0.167.0 (`gpt-6.1-sol`), Claude Code 2.1.322, Pi 1.5.0, and Oh My Pi 18.18.6 each reported both bugs and left the working tree unchanged. Pi and Oh My Pi wait for stdin unless it is closed.
- The coordinator runs final verification itself; a QA worker is started only to design missing tests or drive browser checks.
- `may-verify.sh --timeout` and `may-e2e.sh --wait` now start when the user's command starts. MAY's own process registration gets a separate allowance of up to 30 seconds, so a loaded host no longer reports a fast check as `TIMEOUT` or a ready server as not ready.
- `may-verify.sh --log-dir <dir>` writes each check's complete output to `<ID>.log` and adds `LOG` lines to the table. Output without the option is unchanged.
- New `may-config` skill writes user-chosen per-role models into Claude Code, Oh My Pi, Codex, or Pi (pi-subagents extension) project agent files after the user approves the exact diff. MAY still never selects models. Dispatch to a project `may-<role>` agent used its configured model on Claude Code 2.1.319, OMP 18.18.3, and Pi 1.5.0 with pi-subagents 0.87.0 (one probe each; the OMP and Pi probe models were rejected by their providers for credentials, after model resolution). On Codex 0.163.0 `exec`, the spawn tool offered no custom-agent selector; model application there is unverified.
- Add an independent token benchmark: two Node standard-library fixtures, oracles, a run-preparation script and a session-log token counter. Six single Claude Code runs comparing 0.2.0 and 0.3.0 found no measurable token difference; see `tests/benchmark/benchmark-0.3.0.md`.

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
