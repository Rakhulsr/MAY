# MAY: Maybe A Team You Need?

MAY is a collection of skills and small scripts that gives coding agents an engineering-team workflow: understand the goal, plan, work by role, review, repair, verify, and report in chat.

The harness controls models, accounts, sessions, tools, and permissions. MAY is model-agnostic. It uses native delegation when the harness provides subagents; otherwise, work runs sequentially and review is not presented as independent.

There is no engine, stored workflow state, or cross-session resume. Each new session starts by reading code and Git status. MAY is not a sandbox and cannot enforce model compliance with a skill.

## Install

Use your harness's plugin mechanism:

```bash
# Pi
pi install git:github.com/Rakhulsr/MAY

# Oh My Pi
omp plugin marketplace add Rakhulsr/MAY
omp plugin install may@may

# Codex
codex plugin marketplace add Rakhulsr/MAY
codex plugin add may@may
```

Inside Claude Code:

```text
/plugin marketplace add Rakhulsr/MAY
/plugin install may@may
```

The package contains `using-may` and eight roles: PM, Tech Lead, UI/UX, Frontend, Backend, QA, Security, and DevOps. Installation from GitHub has not been tested for this rebuild; local installation results appear in the support table.

## Use

Describe your goal in chat, for example:

> Use MAY to fix login validation. Preserve my changes and prove the fix with a regression test.

The agent chooses Direct for small, low-risk repairs, with self-review explicitly identified as non-independent. Complexity or risk can justify separate implementation, read-only review, and QA tasks, rather than all eight workers. One PM **or** Tech Lead coordinator applies both planning lenses inline, uses native delegation and Vibe when active, and keeps one writer. Models and accounts follow the harness configuration.

### Standalone planning and consultation

MAY can plan without an external brainstorming skill. Brainstorming explores alternatives; planning converges on the chosen direction and its deliverable. Existing brainstorming, accepted plans, previous decisions, and answers available in code are reused rather than asked for again.

For vague needs, the agent starts with an open question. It can batch simple independent questions; complex, dependent, or consequential decisions are discussed one at a time. Interactive choices are used only when a native tool is available; otherwise, choices are numbered in chat. The agent explains its recommendation, reasons, and tradeoffs, and you can answer “recommend for me.” The agent chooses reversible low-risk details and records them in the plan. Existing approval remains valid for unchanged scope; new risky actions still require permission.

A plan is ready when its goal, scope, context, justified implementation, material risks, and observable acceptance are clear. The task table includes IDs, roles, files/actions, dependencies, inputs, outputs/Definition of Done, and criteria. The acceptance matrix specifies exact commands or human actions with expected results. Planning-only work is assessed through plan review, not pretend application tests. Only complex or risky plans need a fresh read-only critic; without delegation, the agent discloses a self-check fallback.

Each role gives product-specific best-practice recommendations, not a universal checklist. Security addresses relevant identity, data, trust, and abuse concerns. DevOps addresses operational needs within approved scope without automatically adding infrastructure. UX can use text examples; browser or image tools are not prerequisites for consultation. Implemented browser functionality still requires real browser verification.

### Review before QA

Every source **and test** delta, including tests-only repairs, requires reviewer acceptance before final QA. After repair, the new delta returns to the same reviewer; Direct work uses disclosed self-review. Changes to source, tests, builds, or fixtures invalidate affected evidence: renew review first, then run the affected checks.

Verification uses the exact criterion commands and displays the `MAY VERIFY` table. Failed checks, zero-test runs, trivial checks, changes during execution, and timeouts do not count as passing. Outside Git, `PASS?` remains inconclusive with exit 1. The verifier recognizes common zero-test patterns, but assertion quality still requires review.

## Runtime scripts

Scripts are installed inside the skill, not the user's project. The agent obtains the absolute `using-may` location from the harness and invokes scripts through Bash:

```bash
bash "$MAY_SKILL_DIR/scripts/may-verify.sh" --check "AC1=npm test" --timeout 600
```

Use Git Bash on Windows and quote paths. Session and verification scripts require Bash, Git, and system utilities. For E2E without a trusted browser connection, `may-e2e.sh` requires Playwright **already installed in the project**, npx, and curl for server readiness:

```bash
(
  session="$(bash "$MAY_SKILL_DIR/scripts/may-session.sh" start)"
  trap 'bash "$MAY_SKILL_DIR/scripts/may-session.sh" stop "$session"' EXIT
  bash "$MAY_SKILL_DIR/scripts/may-e2e.sh" --session "$session" --spec tests/login.spec.ts --start "npm run dev" --url http://localhost:3000
  # Inspect failure artifacts here before the block exits and cleanup runs.
)
```

Exit 3 means Playwright is unavailable. MAY does not install it; the agent must ask permission. Non-loopback URLs require an explicit user request and `--remote-ok`, never production. Successful E2E artifacts are removed; failure artifacts remain in the session folder until inspected and cleaned.

Temporary files belong only in marked OS-temp folders. Stop the run's own session on failure or cancellation too; do not collect or delete every `may-*` folder. Cleanup claims cover only observed folders and processes. `stop --keep` stops processes but retains the folder for inspection. After an abrupt agent kill, use `stop` on the known folder. `sweep` is separate recovery for marked folders at least 24 hours old with no live recorded PID. There is no state folder in the home directory or project.

## Rebuild support: observed evidence

| Harness | Tested version | Level | Workflow evidence |
|---|---|---|---|
| Pi | 1.4.0 | `installable` | S1–S4 BLOCKED: configured model token expired; 1 attempt, no account/model change |
| Oh My Pi | 18.16.0 | `installable` | Runtime checkpoint 45/45; pre-commit 43/45, then unchanged suite with diagnostic telemetry 45/45; repository check PASS; 10 pressure responses + 1 native planning smoke, not four final workflow scenarios |
| Codex | 0.163.0 | `installable` | S1–S4 BLOCKED: configured sandbox read-only; 1 attempt, no permission change |
| Claude Code | 2.1.318 | `installable` | Historical S1/S3/S4 PASS; S2 timed out after 420 seconds during review; retry had not started before the manual pause |

`installable` means only that a real installation discovered nine skills and three runnable scripts. `workflow-tested` requires four real-model scenarios on the named version: a small repair, a feature with review before QA, fail-fix-pass, and interruption followed by a fresh session. Unit tests and fake models are not workflow evidence. This table follows actual attempts, not assumed compatibility.

The R7 timeout-race repair received **independent reviewer acceptance**. At that checkpoint, runtime code passed `npm test`: **45/45**, with no skips; `npm run check` also passed. Reinstallation in temporary homes, sequentially Pi, OMP, Codex, then Claude, discovered **9/9 skills and 3/3 scripts** on all four harnesses. These runs did not install or update the user's global plugin cache.

In the latest S4 run, the agent was stopped during a real check, then the recorded check process was stopped with identity guards. The EXIT trap cleaned the original folder; the next session started fresh without resume. The first follow-up accurately reported that PID-file evidence was no longer available, not that it had found a live process. A later sweep-age test used a **separate stale fixture**: a marked folder created through the script, with no PID, was aged 25 hours; default sweep in a fresh session printed the deleted path. That fixture was not residue from the original interrupted run. Interruption/cleanup evidence and age-policy evidence are distinct. All attempts, including the inconclusive follow-up and Claude timeout, were retained in the test record.

Planning and consultation guidance has been updated; historical results above do not establish `workflow-tested` status for the updated guidance. Manual testing found a missing plan acceptance matrix and QA before review of a tests-only repair; the guidance now states both gates explicitly. New evidence reflects actual runs, including failures, rather than conclusions inferred from wording. Lightweight role helpers, including cost, depth, and permissions, are **unresolved and outside this change**. The existing coordinator-only dispatch convention remains pending that decision. Real Playwright and Linux/macOS execution remain NOT_RUN.

### Guidance validation (2026-11-06)

- Independent review accepted the guidance changes with no findings. Five pre-edit auth controls batched material/dependent questions; five post-edit responses started with access policy. Ten GREEN responses covered auth, accepted-plan reuse, Direct work, complex risk/tests-only repair, independent question batching, and Security/DevOps/UX recommendations. These runs supplied guidance text with tools disabled; they do not prove native tool invocation.
- An OMP plan-only smoke read the installed entry skill, orchestration reference, OMP mapping, PM/Tech Lead, and relevant roles. One native read-only critic actually ran. Its findings were incorporated into a discovery-gated roadmap, with no second acceptance claimed. The two temporary fixture files stayed unchanged. This proves the prompted workflow, not autonomous critic-selection reliability.
- The observed parent model was `openai-codex/gpt-6.1-sol`; the critic used the native default `openai-codex/gpt-6.1-sol:high`, without account/model overrides. Independent review accepted response and smoke evidence with no findings. The unavailable MCP `mxterm` connection warning was retained in the evidence.
- After guidance acceptance, `npm test` passed **45/45**, with no skips, and `npm run check` passed through Windows Git Bash. Runtime, test source, and configuration were unchanged for that guidance adjustment.
- Native interactive ask and browser execution remain NOT_RUN. All eight role texts were updated, but direct consultation scenarios sampled only Security/DevOps/UX; no end-to-end test of every role is claimed. Support remains `installable`, not `workflow-tested`.

### Latest pre-commit verification

The first pre-commit `npm test` run passed **43/45**, with **2 failures** and no skips. The failing cases were “a genuine failing regression becomes PASS only after repairing the fixture” and “all zero-test output forms are NO_TESTS.” Both returned a null subprocess status from the helper with a 15-second deadline; those failure records do not establish the child error code.

A subsequent diagnostic run of the unchanged full suite passed **45/45**, with no skips. Temporary subprocess telemetry recorded no null statuses, errors, or signals; its longest observed synchronous child call took 8.55 seconds. A separate instrumented verifier probe returned the expected failing-check result and cleaned its session. The original intermittent failure remains unexplained: a host deadline is suspected, but `ETIMEDOUT` was not observed, and no timeout or assertion was changed to obtain a pass.

`npm run check` passed, and a real session start/stop smoke removed its exact temporary folder. Comment cleanup changed no executable script bytes; runtime and test logic were unchanged. The passing diagnostic run does not erase the earlier failures.

## Development

Node 26+ is required for repository tests. The runtime package does not require a Node engine.

```bash
npm test
npm run check
npm run test:harness
bash scripts/bump-version.sh 0.2.0
```

On Windows, run from Git Bash, not WSL Bash. `scripts/` contains developer tools only; runtime scripts live in `skills/using-may/scripts/`. Installation tests use temporary homes, not your global configuration.

Contributors follow [AGENTS.md](AGENTS.md). License: [MIT](LICENSE).
