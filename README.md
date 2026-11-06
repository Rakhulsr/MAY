# MAY: Maybe A Team You Need?

MAY gives coding agents a workflow for planning, implementation, review, and acceptance checks. It contains nine skills and three Bash scripts for Pi, Oh My Pi, Codex, and Claude Code. Small repairs stay with one agent; more complex work can use a coordinator and task-specific workers.

MAY uses your harness's configured models, accounts, tools, and permissions. It has no engine, database, persistent workflow state, or cross-session resume. Plans and reports stay in chat unless you ask for files.

[Install](#install) · [Start a task](#start-a-task) · [How it works](#how-it-works) · [Skills](#skills) · [Runtime scripts](#runtime-scripts) · [Support and limitations](#support-and-limitations) · [Development](#development)

## Install

Install MAY separately in each harness you use, then start a fresh session. These are the GitHub installation commands; the current rebuild has local installation proof, but installation from GitHub has not yet been tested. See [support and limitations](#support-and-limitations) for the observed results.

### Pi

```bash
pi install git:github.com/Rakhulsr/MAY
```

### Oh My Pi

```bash
omp plugin marketplace add Rakhulsr/MAY
omp plugin install may@may
```

### Codex

```bash
codex plugin marketplace add Rakhulsr/MAY
codex plugin add may@may
```

### Claude Code

Run inside Claude Code:

```text
/plugin marketplace add Rakhulsr/MAY
/plugin install may@may
```

## Start a task

Open the project in your harness and describe the outcome you want. Name MAY explicitly:

```text
Use MAY to fix login validation. Preserve my changes and prove the fix
with a regression test.
```

For planning without implementation:

```text
Use MAY to plan password reset for this app. Inspect the existing auth
and email code, recommend an approach, and define acceptance checks.
Keep the plan in chat; do not change files yet.
```

The agent should inspect the code and Git status, reuse prior decisions, and ask only material unanswered questions. For a vague goal, it starts with an open question. It can batch simple independent choices; consequential or dependent decisions are discussed one at a time. You can answer “recommend for me” to delegate a choice and receive the rationale and tradeoffs.

Planning works without an external brainstorming skill. An accepted plan identifies the goal, scope, tasks, dependencies, inputs, outputs, risks, and observable acceptance checks. Planning-only work ends with plan review, not application tests presented as proof of the plan.

## How it works

MAY uses the smallest team justified by the task:

- Direct work suits a small, low-risk repair. One agent implements, self-reviews, and checks the change, disclosing that review is not independent.
- Orchestrated work uses separate implementation, read-only review, and QA tasks when complexity or risk warrants them. One PM or Tech Lead coordinator applies both planning perspectives and keeps one writer at a time. It selects relevant roles rather than starting all eight.

The workflow is:

1. Inspect the project and agree on the outcome and acceptance checks. Reuse existing brainstorming, plans, and approvals for unchanged scope. Complex or risky plans get a fresh read-only critic when native delegation is available.
2. Implement the scoped change using the relevant role guidance and existing project conventions.
3. Review every source and test change before final QA. Repairs, including tests-only repairs, return to the same reviewer for renewed acceptance. After two unsuccessful repair rounds, the agent asks you how to proceed.
4. Run the agreed checks against the reviewed candidate. Source, test, build, or fixture changes invalidate affected evidence and require renewed review before those checks run again.
5. Report criterion-level evidence, review disposition, failures, untested work, and cleanup in chat.

Native delegation and active native modes such as Vibe remain under the harness's control. Without delegation, MAY uses sequential work and discloses non-independent review. Only the coordinator dispatches workers; workers do not spawn another team. Lightweight role helpers, including their cost, depth, and permission design, remain unresolved rather than an available feature.

For the full planning, review, and reporting contract, read [orchestration](skills/using-may/references/orchestration.md). A new session starts from the code and Git status, not restored MAY workflow state.

## Skills

Roles are responsibility profiles, not mandatory agent processes. Each provides recommendations grounded in the project and approved scope. UX consultation can use text; Security and DevOps advice does not automatically add controls or infrastructure.

| Skill | Use it for |
|---|---|
| [using-may](skills/using-may/SKILL.md) | Entry point, workflow selection, and harness-specific tool mappings |
| [may-pm](skills/may-pm/SKILL.md) | Requirements, scope, priorities, and acceptance criteria |
| [may-tech-lead](skills/may-tech-lead/SKILL.md) | Architecture, technical tradeoffs, task boundaries, and dependencies |
| [may-ui-ux](skills/may-ui-ux/SKILL.md) | User flows, interaction design, accessibility, and visual review |
| [may-frontend](skills/may-frontend/SKILL.md) | Components, client-side behavior, API integration, and browser regressions |
| [may-backend](skills/may-backend/SKILL.md) | APIs, domain logic, data integrity, integrations, and backend tests |
| [may-qa](skills/may-qa/SKILL.md) | Acceptance checks, regression coverage, and current-artifact evidence |
| [may-security](skills/may-security/SKILL.md) | Threat modeling, auth, secrets, trust boundaries, and security review |
| [may-devops](skills/may-devops/SKILL.md) | Development environments, builds, CI, and deployment risk |

## Runtime scripts

Scripts ship inside the installed `using-may` skill, not the project being worked on. Obtain that skill's absolute location from the harness and set `MAY_SKILL_DIR` to it. Run commands from the target project's directory, through Bash. On Windows, use Git Bash and quote paths with spaces.

Session and verification scripts require Bash, Git, and core/system utilities. Node is required for MAY's repository tests, not for workflow state.

| Script | Purpose |
|---|---|
| [may-session.sh](skills/using-may/scripts/may-session.sh) | Create marked OS-temp folders, track processes, and stop or recover a session |
| [may-verify.sh](skills/using-may/scripts/may-verify.sh) | Run criterion commands and print a revision-aware `MAY VERIFY` table |
| [may-e2e.sh](skills/using-may/scripts/may-e2e.sh) | Run the project's already-installed Playwright tests, optionally starting a local server |

### Acceptance checks

Replace `AC1` and the command with the plan's actual criterion and check:

```bash
bash "$MAY_SKILL_DIR/scripts/may-verify.sh" --check "AC1=npm test" --timeout 600
```

Repeat `--check "ID=command"` for additional criteria. The agent displays the complete `MAY VERIFY` table. Failed checks, common zero-test output, trivial commands, changes during execution, and timeouts do not count as passing. Outside Git, `PASS?` is inconclusive and the script exits 1. The verifier cannot assess assertion quality or establish browser build identity; review and appropriate browser evidence are still required.

### Browser checks

Implemented browser functionality needs real browser verification through a trusted connection or the optional E2E runner. The runner requires Playwright already installed in the target project, npx, and curl when waiting for a server. It does not install dependencies.

Replace the spec, start command, and URL with the project's values:

```bash
(
  session="$(bash "$MAY_SKILL_DIR/scripts/may-session.sh" start)"
  trap 'bash "$MAY_SKILL_DIR/scripts/may-session.sh" stop "$session"' EXIT
  bash "$MAY_SKILL_DIR/scripts/may-e2e.sh" --session "$session" --spec tests/login.spec.ts --start "npm run dev" --url http://localhost:3000
  # Inspect failure artifacts here before the block exits and cleanup runs.
)
```

Exit 3 means Playwright is unavailable; installing it requires your permission. Non-loopback URLs require an explicit user request and `--remote-ok`; production is not an allowed target. Successful E2E artifacts are removed. Failure artifacts remain in the session folder until inspection and cleanup.

### Cleanup and interruption

Stop the exact session created for the task, including after failure or cancellation. Do not collect or delete unrelated `may-*` folders. Cleanup reports cover only observed folders and processes.

`may-session.sh stop <dir> --keep` stops recorded processes but retains the folder for inspection. After an abrupt agent kill, use `stop <dir>` on the known folder. `sweep` recovers marked folders at least 24 hours old with no live recorded PID; `start` also runs this default stale-folder sweep. There is no MAY state folder in the project or home directory.

## Support and limitations

The current rebuild is `installable` on the versions below. Local installation tests in temporary homes discovered all nine skills and three runnable scripts without updating the user's global plugin cache. This does not establish GitHub installation or complete workflow support.

| Harness | Tested version | Real-model workflow evidence |
|---|---|---|
| Pi | 1.4.0 | Blocked by an expired configured-model token; one attempt, no account or model change |
| Oh My Pi | 18.16.0 | Manual workflow and native planning evidence; not all four final workflow scenarios |
| Codex | 0.163.0 | Blocked by the configured read-only sandbox; one attempt, no permission change |
| Claude Code | 2.1.318 | Historical small-repair, fail-fix-pass, and interruption scenarios passed; feature/review scenario timed out during review after 420 seconds, with no retry started before the manual pause |

`workflow-tested` requires four real-model scenarios on the named harness version: a small repair, a feature with review before QA, fail-fix-pass, and interruption followed by a fresh session. Unit tests and fake models do not satisfy that requirement. Historical runs do not establish that status for later guidance changes.

MAY's skills are advisory. They cannot enforce model compliance, provide a sandbox, or grant permissions. Real Playwright execution, Linux/macOS execution, native interactive questions, and end-to-end coverage of every role remain untested.

<details>
<summary>Validation evidence and known test limitations (2026-11-06)</summary>

- Independent review accepted the runtime timeout-race repair. At that checkpoint, `npm test` passed 45/45 with no skips and `npm run check` passed. Subsequent local reinstallation succeeded on Pi, OMP, Codex, and Claude Code in temporary homes.
- Guidance validation retained five pre-edit controls that failed the intended behavior and ten post-edit passing responses covering planning, accepted-plan reuse, Direct work, complex risk, tests-only repair, question batching, and Security/DevOps/UX advice. Those response tests supplied guidance with tools disabled; they do not prove native tool invocation.
- An OMP plan-only smoke read installed skills and ran one native read-only critic. The agent incorporated its findings into the roadmap; no second acceptance was claimed. The two temporary fixture files stayed unchanged. The parent model was `openai-codex/gpt-6.1-sol`; the critic used the native default `openai-codex/gpt-6.1-sol:high`, without account or model overrides. An unavailable `mxterm` MCP connection warning remained in the evidence. Independent review accepted the guidance and evidence, but the smoke proves prompted behavior, not reliable autonomous critic selection.
- After guidance acceptance, `npm test` passed 45/45 with no skips and `npm run check` passed through Windows Git Bash. The later pre-commit run passed 43/45: the fail-fix-pass fixture case and zero-test-output case returned null subprocess statuses under the helper's 15-second deadline. An unchanged full suite then passed 45/45 with temporary diagnostic telemetry; no null statuses, errors, or signals were recorded, and the longest synchronous child call took 8.55 seconds. A separate instrumented verifier probe produced the expected failure and cleaned its session. The original intermittent failure remains unexplained. A host deadline is suspected, but `ETIMEDOUT` was not observed; no timeout or assertion was changed to obtain a pass. The later pass does not erase the failures.
- Interruption testing stopped an agent during a real check, stopped the recorded check process with identity guards, and observed the EXIT trap remove the original folder. The next session started fresh; its first follow-up was inconclusive because PID-file evidence was already gone. A separate marked, PID-free fixture aged 25 hours tested stale-folder sweep. That fixture was not residue from the interrupted run.
- The latest recorded repository check and exact-session start/stop smoke passed. Runtime and test logic were unchanged for the guidance and comment cleanup. The planning-only smoke did not exercise browser workflows. Earlier manual OMP testing exercised Chromium registration, login, and logout; that does not establish real Playwright fallback coverage or the other untested scenarios listed above.

</details>

## Development

The root [AGENTS.md](AGENTS.md), [CLAUDE.md](CLAUDE.md), and [GEMINI.md](GEMINI.md) are runtime bootstraps that route to the canonical `using-may` skill. Their discovery depends on the harness and installation route; plugin installation does not guarantee they are loaded. Canonical skills live in `skills/`; root `scripts/` contains developer tools, not the runtime workflow. [CHANGELOG.md](CHANGELOG.md) records the rebuild's changes and validation limits.

For development of MAY itself, explicitly ask the agent to read your local `AGENTS.local.md`, with `CLAUDE.local.md` or `GEMINI.local.md` when relevant. These optional private contributor notes are not required to use MAY and are not distributed. Keep the three files untracked and not ignored; do not assume native discovery of any local filename. A checkout without them uses the public skills and your current development instructions.

Stage and commit only explicit reviewed public paths. `npm run check` and the harness-copy script reject the three root personal protocol names if staged or tracked; the harness copy excludes their untracked copies, and npm packaging uses an explicit public-file allowlist. These guards do not prevent publication through Git if checks are bypassed. Other untracked files remain subject to the normal repository checks.

For local OMP development, replace the placeholder with the absolute checkout path:

```bash
omp plugin link "/absolute/path/to/may"
```

Start a fresh OMP session after linking. To load the checkout for one session instead, use `omp --plugin-dir "/absolute/path/to/may"`.

Repository tests require Node 26+. On Windows, run these commands from Git Bash, not WSL Bash:

```bash
npm test
npm run check
```

`npm run test:harness` runs local installation checks for Pi, OMP, Codex, and Claude Code in temporary homes. It requires those harnesses to be installed and does not prove real-model workflow behavior. `bash scripts/bump-version.sh <version>` updates the package and plugin manifest versions together.

## License

[MIT](LICENSE)
