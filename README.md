<p align="center">
  <img src="assets/logo/Pixel%20MAY.png" alt="MAY logo" width="720" height="240">
</p>

# MAY

Workflow skills for coding agents.

MAY helps an agent turn a coding goal into a scoped plan, implementation, review, and acceptance evidence. It ships ten skills and four Bash scripts for use with Pi, Oh My Pi, Codex, and Claude Code. A small repair can stay with one agent; complex work can use a coordinator and relevant workers.

Your harness still controls models, accounts, tools, permissions, and delegation. MAY supplies written guidance and deterministic scripts, not a workflow engine or sandbox.

[Why MAY](#why-may) · [Install](#install) · [Start a task](#start-a-task) · [Workflow](#workflow) · [Skills](#skills) · [Runtime guide](skills/may/references/runtime.md) · [Contributing](CONTRIBUTING.md)

## Why MAY

Spawning a subagent answers who can do a task. MAY adds a shared contract for what to hand off, when a candidate is ready for review, and which evidence supports acceptance. This is useful when you want those responsibilities stated consistently instead of reconstructing them for each task.

| Responsibility | Native delegation by itself | MAY's documented convention |
|---|---|---|
| Plan and handoff | The harness provides task dispatch; the caller supplies the brief | Goal, scope, dependencies, inputs, outputs, and observable criteria |
| Team selection | Available workers and modes depend on the harness | A team of named roles (`may-backend`, `may-tech-lead`, …) sized by S, M, or L tier; tier S works inline, only justified roles start as workers; coordinator-only dispatch |
| Review | Separation and review policy depend on the caller | Read-only review before final QA, repairs back to the same reviewer; disclosed Tech Lead self-review for tier S |
| Acceptance evidence | The caller decides what results establish completion | Exact criterion commands, current-candidate evidence, explicit failures and blocked checks |
| Temporary work | Process and artifact handling depend on the tools and caller | Marked OS-temp sessions, retained failure diagnostics, exact-session cleanup |

A native workflow can implement these same patterns. MAY packages the conventions; advisory skills do not automatically enforce them.

### Exploratory benchmark

One local Windows session-safety task compared MAY 0.2.0 with OMP Vibe without the MAY workflow. Both candidates passed independent review and final QA. The numbers below are individual worker durations, not end-to-end times.

| Measure | MAY | Vibe |
|---|---:|---:|
| Implementer worker (seconds) | 124 | 278 |
| Reviewer worker (seconds) | 62 | 75 |
| QA worker (seconds) | 408 | 327 |
| Session tests passed / total | 13 / 13 | 13 / 13 |
| Full suite passed / total | 57 / 57 | 57 / 57 |

Both repository checks exited 0. MAY used its verifier; Vibe ran checks directly, so their QA timings are not equivalent speed measurements. The base model reported for both paths was `openai-codex/gpt-6.1-terra`; Vibe used xhigh for implementation and review and medium for QA, while MAY reasoning levels were not recorded. Cache, run order and coordinator context can affect results. One task and one run per path do not establish superiority. Total tokens, cost and end-to-end time were unavailable.

See the [detailed report](tests/benchmark/benchmark-0.2.0.md).

A second, token-focused comparison of MAY 0.2.0 and 0.3.0 on Claude Code found no measurable difference: in six single runs, all passing their oracles, 0.3.0 run totals ranged from 4% lower to 24% higher. See the [0.3.0 token report](tests/benchmark/benchmark-0.3.0.md).

## Install

Install MAY separately in each harness you use, then start a fresh session. These are integration targets, not a guarantee that every model, version, or workflow has been tested. See [requirements and limits](#requirements-and-limits).

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

## Update

Pi's `pi update` updates Pi itself, not installed packages. Update MAY with:

```bash
pi update git:github.com/Rakhulsr/MAY
```

Pinned Git tags or commits remain pinned. `pi update --extensions` updates all installed packages. For Claude Code, `claude plugin update may@may` updates the plugin; restart Claude Code afterwards. Update the marketplace separately when needed with `claude plugin marketplace update may`.

OMP's plugin CLI exposes `omp plugin upgrade` and `--dry-run`. An upgrade from MAY 0.1.0 to 0.2.0 was observed with OMP 18.18.0 in the local case study; that observation does not establish upgrade behavior for other versions. Codex's `codex plugin marketplace upgrade may` refreshes the marketplace snapshot, but does not by itself establish that an already-installed plugin has updated. Check the harness version and plugin documentation for the applicable procedure.

**Breaking upgrade:** the canonical entry skill was renamed from `using-may` to `may`; there is no compatibility alias. Update prompts and references from `using-may` to `may`, and use the installed `may/SKILL.md` (its `skills/may/SKILL.md` path in this package) instead of the old installed `using-may/SKILL.md`. Remove any separately installed old skill through your harness's documented procedure to avoid stale discovery. Restart the harness or start a fresh session after updating, then verify the loaded skill and its location. A fresh OMP 18.18.0 session loaded the `may` entry skill from the 0.2.0 plugin; this does not establish installation discovery for every skill or harness. No automatic MAY update notification is promised.

## Start a task

Open your project in a fresh harness session and name MAY explicitly:

```text
Use MAY to fix login validation. Preserve my changes and prove the fix
with a regression test. First read the installed may skill and
its orchestration contract, then state the scope and acceptance checks.
```

Confirm the agent actually reads the installed `may/SKILL.md` and its referenced orchestration and harness mapping before work starts. Use the harness's visible file/tool activity where available; a reply saying “MAY is active” alone is not evidence. If the skill cannot be found, resolve installation/discovery before continuing.

For planning only:

```text
Use MAY to plan password reset for this app. Inspect the existing auth
and email code, recommend an approach, and define acceptance checks.
Keep the plan in chat; do not change files yet.
```

The agent should inspect code and Git status, reuse settled decisions, and ask only material unanswered questions. You can answer “recommend for me” to delegate a choice with its rationale and tradeoffs. Planning does not require an external brainstorming skill; planning-only work ends with human plan review, not application tests presented as proof of prose.

For a user-directed ideation handoff or independent critique, ask MAY to use the [manual ideation bridge](skills/may/references/ideation-bridge.md). Packets are transferred by the user; the optional structural validator needs Bash and an already-installed Node.js 18 or newer. Neither packet validation nor skill guidance enforces permissions or proves claims.

When you ask for it, MAY can also hand work to another harness:

- **Cross-harness review:** the coordinator sends the criteria and diff to Codex, Claude Code, Pi, or Oh My Pi running headless and read-only, and records its findings as an independent review after checking them against the code. Name the harness; the diff goes to that harness's provider. See [cross-harness review](skills/may/references/ideation-bridge.md#cross-harness-review).
- **Visible panes:** `may-bridge.sh host` detects the terminal host (Herdr, herdr-app, zellij, tmux, WezTerm, Windows Terminal, VS Code, Zed, or none), and `may-bridge.sh open <program> [args...]` opens the other harness in a pane of that host instead of a new window. Where a host has no pane command, the coordinator runs the harness headless. See [launching another harness](skills/may/references/ideation-bridge.md#launching-another-harness).

See a [real verification-step example](skills/may/references/examples.md), with its exact observed output and limits.

## Workflow

![MAY workflow: a coordinator picks tier S, implementing inline with Tech Lead self-review, or tier M/L, dispatching named role workers with a read-only review and repair loop. Both routes lead to acceptance checks, evidence, and cleanup.](assets/diagrams/workflow.svg)

[Editable diagram source](assets/diagrams/workflow.svg)

The coordinator picks a tier from the areas the change touches (a data store, API, client, UI, or CI), checking L first:

| Tier | When | Team |
|---|---|---|
| S | One area, no contract change, low risk | No workers; the coordinator implements inline and self-reviews with the Tech Lead lens, disclosed as not independent |
| M | Two or more areas, a contract change, or auth or data risk in one area | One named implementer and one read-only reviewer chosen by risk (`may-tech-lead`, `may-security`, or `may-ui-ux`) |
| L | Phased or very large work, risk across areas, or areas touching the same files | One implementer per area, named reviewers per risk, and a [phase reset](skills/may/references/phase-reset.md) between phases |

Only you can move work to a smaller tier. Long work can end a phase with a `handoff.md` in the session folder, which a fresh session reads only from a path you give it and rechecks against Git.

Arrows show the work sequence, not permission to spawn workers: only the coordinator dispatches. One PM or Tech Lead coordinator applies both planning perspectives; roles are not a requirement to start every agent. Tier M and L dispatch named role workers, such as `may-backend` and `may-tech-lead`, keep one writer per checkout, and use a separate reviewer when delegation is available. Tier L areas that change separate files can run as [parallel writers](skills/may/references/orchestration.md#parallel-writers) when the harness gives each worker its own checkout and the working tree is clean; the coordinator checks each checkout's base, applies one patch at a time, and reviews and verifies the combined result. Tier S implements inline under the relevant role lens and uses a disclosed, non-independent Tech Lead self-review. In every tier the coordinator runs final verification itself; a QA worker is started only to design missing tests or drive browser checks. Without delegation, tasks run sequentially with the same disclosure.

Every source and test repair returns to review before final QA. After two unsuccessful repair rounds, the agent asks you how to proceed. Changes to source, tests, builds, or fixtures invalidate affected evidence. The [orchestration contract](skills/may/references/orchestration.md) defines the full planning and acceptance rules; the [runtime guide](skills/may/references/runtime.md#what-runs-where) shows the execution boundary.

## Skills

Roles are responsibility profiles, not mandatory processes. They give advice grounded in the project and approved scope; Security and DevOps do not automatically add controls or infrastructure. UX consultation can use text.

| Skill | Use it for |
|---|---|
| [may](skills/may/SKILL.md) | Workflow selection and harness-specific tool mappings |
| [may-pm](skills/may-pm/SKILL.md) | Requirements, scope, priorities, and acceptance criteria |
| [may-tech-lead](skills/may-tech-lead/SKILL.md) | Architecture, tradeoffs, task boundaries, and dependencies |
| [may-ui-ux](skills/may-ui-ux/SKILL.md) | User flows, interaction design, accessibility, and visual review |
| [may-frontend](skills/may-frontend/SKILL.md) | Components, client behavior, API integration, and browser regressions |
| [may-backend](skills/may-backend/SKILL.md) | APIs, domain logic, data integrity, integrations, and tests |
| [may-qa](skills/may-qa/SKILL.md) | Acceptance checks, regression coverage, and current-artifact evidence |
| [may-security](skills/may-security/SKILL.md) | Threat modeling, auth, secrets, trust boundaries, and review |
| [may-devops](skills/may-devops/SKILL.md) | Development environments, builds, CI, and deployment risk |
| [may-config](skills/may-config/SKILL.md) | Per-role model choices in Claude Code, Oh My Pi, Codex, or Pi (pi-subagents) project agent files, written only after approval |

Each role except `may-config` also ships as a worker agent in [`agents/`](agents/), named after the role and preloading its skill, so a dispatched worker appears as `may-backend` rather than a generic agent. Claude Code lists them as `may:may-<role>`. The package also declares them for Pi with pi-subagents, untested there so far. Oh My Pi and Codex plugins do not ship agents, so there the coordinator uses `may-config` project agents or the native default with a role brief.

## Requirements and limits

- Pi, Oh My Pi, Codex, and Claude Code have native integration metadata and tool mappings. Available tools, permissions, and model behavior depend on your harness and configuration.
- Runtime scripts require Bash, Git, and core/system utilities. Use Git Bash on Windows. Node is needed for MAY's repository tests, not workflow state.
- Browser verification needs a trusted browser connection or the project's already-installed Playwright. MAY does not install browser tooling automatically. Missing capability is blocked, not a pass.
- MAY has no database, background service, persistent workflow state, or cross-session resume. Plans and reports stay in chat or a temporary session folder, never in your project unless you request files. New sessions start from code and Git status.
- Parallel writers need native per-worker isolation: Claude Code `isolation: "worktree"`, pi-subagents `worktree: true`, or Oh My Pi `isolated: true` after you enable `task.isolation.enabled`. Codex sub-agents share one checkout, so Codex stays with one writer. One Claude Code run is tested; Pi and Oh My Pi parallel writers are untested.
- Workflow-tested on Claude Code 2.1.322 with `claude-opus-5-5` on Windows: one headless run each of a small repair, a feature with independent review and QA, a fail-fix-pass repair, and a forced interruption continued in a fresh session, all passing their oracles, under the user's `auto` permission mode. Other harnesses, models, and platforms are not workflow-tested.
- Skills cannot enforce model compliance or provide isolation. See the [trust and security policy](SECURITY.md) before authorizing commands or handling sensitive data.

For agent-managed and manual checks, exit codes, failure-artifact inspection, and interrupted-session cleanup, read the [runtime guide](skills/may/references/runtime.md). For repository setup, checks, and local plugin development, read [CONTRIBUTING.md](CONTRIBUTING.md). Changes are recorded in [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE)
