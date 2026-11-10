# Orchestration

This is the coordinator's contract. Workers follow the [role contract](role-contract.md). Read [phase-reset.md](phase-reset.md) only for long or tier L work and [browser.md](browser.md) only for browser criteria.

## Discover and converge

One PM OR Tech Lead coordinator applies both planning lenses inline and follows the [role contract](role-contract.md) rules on scope, user changes, permissions, and claims. Start with relevant code, current Git status, available tools, and prior decisions.

MAY plans standalone, without an external brainstorming dependency. Brainstorming is divergent: explore plausible directions and tradeoffs when the outcome is unclear. Planning is convergent: turn the selected direction into coherent tasks and acceptance. Reuse existing brainstorming and accepted plans; inspect code for answers and ask only for missing material information. Neither stage requires a separate agent.

For vague needs, ask an open question about the user's problem or desired outcome before narrowing to implementation choices. Batch independent simple questions. Ask complex, dependent, or consequential decisions one at a time so each answer can shape the next question. Native interactive options are appropriate only if that tool is actually available; otherwise use numbered chat choices. Explain what each choice means, recommend one with context-specific reasons and tradeoffs, and allow “recommend for me.” Do not re-ask settled decisions.

When the user delegates a choice, select the recommendation and record its rationale in the plan. Decide and disclose reversible low-risk details without blocking progress. Material risk, irreversible effects, or changes to accepted scope still need the user's decision and the harness's permission. An unchanged approved plan does not need another approval just because its topic is security, data, or infrastructure. New risky actions do need explicit approval; a plan is not deployment or data-change authorization.

Relevant roles are consultative lenses before they are workers: give best-practice recommendations grounded in this product, explain alternatives, and ask useful unanswered questions. Security considers relevant identity, data, trust, and abuse boundaries; DevOps considers relevant runtime, secrets, deployment, health, observability, backup, and rollback needs. Do not add those systems merely to fill a checklist. UX can explain flows and copy in text.

## Team and tier

MAY is a team of named roles. The tier decides how many workers start; the role decides who does each part. A role that does not start as a worker still contributes as an inline lens of the coordinator or reviewer.

An area is one layer or module the change touches, such as a data store, HTTP API, client, UI, or CI. A contract change alters an interface another area consumes: an exported function, an endpoint or its response, a schema, or a command. Check the signals from L down and take the first tier that matches; count areas, not files.

| Tier | Signals | Team |
|---|---|---|
| L | Work the user asks to phase or too large for one review, auth or data risk across areas, or changes in several areas that touch the same files | One named implementer per area in sequence, named reviewers for the relevant risks, and a [phase reset](phase-reset.md) between phases |
| M | Two or more areas, any contract change, auth or data risk within one area, or other moderate risk that warrants independent review | One named implementer, the role of the area that holds the contract or most of the change, with the other areas' roles as inline lenses; and one named read-only reviewer: `may-tech-lead` by default, `may-security` for auth or sensitive data, `may-ui-ux` for user flows |
| S | Everything else: one area, no contract change, low risk | No workers. The coordinator implements inline as the relevant role, then self-reviews with the `may-tech-lead` lens and discloses that review is not independent |

Every spawned worker pays the harness's base context before doing any work; state the matching signal as the tier's reason. Do not size multi-area or contract work down to S to save tokens: only the user may override the tier. A smaller team never removes review or verification: every tier, including S, ends with the coordinator running `may-verify.sh`, except planning-only work, which ends with human plan acceptance.

Route by the decision or output needed, not technology names alone. A small backend repair is tier S with the Backend lens inline; an API consumed by UI needs Backend and Frontend contract input; auth changes need the implementation role plus Security; a new user flow needs UX and Frontend input and browser verification; CI changes need DevOps; unclear scope needs PM/Tech Lead discovery. Never start all eight roles by default.

The team header is the first line of your first plan message and of your final report, naming each role and how it takes part:

```text
Tier: S | Team: Tech Lead (coordinator) · Backend (inline) | Review: Tech Lead lens, self-review (not independent)
Tier: M | Team: Tech Lead (coordinator) · may-backend (planned) · may-tech-lead (reviewer, planned) | Review: pending
```

Update a worker's state (planned, started, done, blocked) only when it actually changes. Inline lenses are not processes; planned or failed dispatch is not completed delegation. A fallback that changes the tier or review independence must be disclosed and, when material, resolved with the user.

## Readiness and chat plan

A plan is ready when the goal, scope/non-goals, existing context, justified implementation approach, material risks, and observable acceptance are known. Record accepted decisions and agent-selected reversible details. Resolve consequential unknowns before execution; do not invent paths or exact commands when inspection is still needed. At the readiness boundary, give one short line naming the accepted scope, task/criterion coverage, and any remaining blocker; do not repeat unchanged approvals.

Present the team header, an objective and a coherent deliverable, then these linked tables. Keep them short for tier S.

| Task ID | Role | Files / allowed actions | Depends on | Inputs | Output / Definition of Done | Criteria |
|---|---|---|---|---|---|---|
| T1 | may-backend | Inspected exact paths and authorized actions | None or task IDs | Accepted behavior and existing contract | Complete user-visible slice and regression coverage | AC1 |
| T2 | may-tech-lead (review) | Every T1 source/test delta, read-only | T1 | Candidate changes and criteria | Explicit acceptance or scoped findings | AC1 |
| T3 | Coordinator with QA lens | Exact checks and authorized environment | Current T2 acceptance | Accepted source/tests and fixtures | Criterion evidence, including failures and gaps | AC1 |

| Criterion ID | Observable outcome | Exact check command or human action | Scope / evidence required |
|---|---|---|---|
| AC1 | Concrete behavior a check can disprove | Repository regression command, or `human`: explicit action and expected result | Named scenario, target, and failure signal |

The deliverables must compose into the stated outcome. Allowed actions describe agreed scope; this advisory plan does not enforce permissions. Reject “works” and always-successful checks. Say when one command covers multiple criteria. Planning-only deliverables use explicit human review actions and checkable plan criteria; do not run application tests or invent a MAY VERIFY command to verify prose. Label checks for proposed future work as planned, not executed evidence.

Only a **complex or risky plan** needs a fresh read-only plan critic, normally `may-pm` or `may-tech-lead`. Brief it on accepted decisions, scope, task dependencies, risks, and criteria; ask for material gaps, contradictions, and disproving checks, not another design. Resolve findings before execution. Without native delegation, perform and disclose a non-independent self-check. Simple plans get an inline self-check. Plan critique does not replace implementation review.

## Keep coordinator context small

- Keep the coordinator's context to decisions, plans, and short results. Do not read large files, full logs, or whole diffs; inspect changes with `git diff --stat` and read only the needed ranges, or delegate exploration to a read-only worker that returns findings and paths.
- Write check output into the session folder with `may-verify.sh --log-dir`; read the `MAY VERIFY` table and only the relevant parts of failing logs.
- For long or tier L work, use a [phase reset](phase-reset.md).

## Execute and review

Before dispatch, inspect the current harness mapping and live tool schema, observable native defaults, and permissions. Report unavailable or unknown capabilities honestly: an exposed tool or configured default does not prove provider authentication will succeed. Do not spawn probe workers, change configuration, select another model, or automatically retry to establish readiness.

Only the coordinator dispatches role workers. Dispatch each worker by its role name, using the first of these the live dispatch schema offers:

1. The project agent `may-<role>`, which carries the user's chosen model from `may-config`.
2. The agent MAY ships for that role, as named in the harness mapping.
3. The native default worker, with a brief that starts `You are may-<role>` and tells it to load the `may-<role>` skill. Disclose this fallback in the team header.

Dispatch into a fresh context and keep one writer at a time. Include the objective, assigned task, criteria, exact files, decisions, prior results, and required invocation inputs in the brief. Never forward the coordinator's chat history or paste file contents the worker can read itself; give paths and the relevant decisions instead. Reuse an active native execution/team mode such as Vibe; do not add a second agent manager, delegation package, or role-starting runner.

If dispatch fails or is denied, show the blocked action and actual worker outcome. Keep configured defaults and permissions intact; ask for the needed owner decision rather than silently switching tier or model or repeating a denied action. An explicitly approved recovery is limited to its authorized scope and must use a route the harness actually permits. If delegation is absent, disclose sequential execution and non-independent review before proceeding with that limitation.

Read returned results and inspect evidence before accepting a handoff. A worker's reported pass without inspectable command, target, exit, output and candidate identity is unverified, not PASS or an inferred failure; request the missing evidence or rerun when permitted. Record candidate identity using the relevant source/test/build/fixture snapshot, including uncommitted changes; HEAD alone is insufficient. A reviewer must have relevant task expertise; a fresh context or role label alone does not establish it, and limitations must be disclosed. Preserve finding IDs, affected criteria, and review disposition.

Record each check's exact command, exit and observed output, plus the minimal required nonsecret inputs with their values or resolvable references. Secrets are names/references only, never values; do not dump the environment. Before work that may outlive a worker, keep needed raw output in the owned session until inspection. If interrupted, inspect known retained artifacts and report worker outcome separately from check outcome, for example `WORKER_FAILED | CHECK_PASSED exit=0`, `CHECK_FAILED`, or `CHECK_NOT_RUN` only when supported. These are chat descriptions, not verifier statuses; missing or unbound evidence stays unknown. Do not infer check failure solely from worker failure, or completion solely from a log's existence.

When a material integration risk has a ready candidate and relevant regression, run an early diagnostic before review when possible. Identify the candidate, actual target and side effects; require an authorized command and disposable or explicitly approved data and integrations. Localhost alone is not proof of safety. If identity, scope or approval is unknown, report blocked. Record command, target reference, exit and observed output. Early results are preliminary and cannot substitute for review or final QA.

A reviewer is read-only and assesses **every changed source and test delta** against the plan. Findings include ID, severity, affected criterion, evidence, and required repair. At the review boundary, state the candidate identity, reviewer, and explicit acceptance or open findings in one short line. After any repair, including a tests-only repair, return the new delta to the same reviewer and obtain renewed acceptance before final QA. Prior acceptance covers only the reviewed candidate; plan acceptance is not implementation acceptance. Tier S follows the same sequence with the disclosed `may-tech-lead` self-review. After two unsuccessful repair rounds, ask the user; resubmitting unchanged work is not repair.

## Verify exact criteria

Resolve the installed `may` directory from the harness-provided skill location; do not assume it is in the project. Inspect which executable the shell action actually invokes. On Windows select the installed Git Bash executable explicitly, not an unqualified `bash` that may resolve to WSL; quote paths. The [examples](examples.md#windows-shell-selection) show invocation syntax. `MAY_SKILL_DIR` is a per-shell convenience for the absolute skill directory; resolve it again in later calls if shell variables are not preserved.

```bash
bash "$MAY_SKILL_DIR/scripts/may-verify.sh" --check "AC1=node --test tests/login.test.js" --check "AC2=npm test" --log-dir "$session"
```

The coordinator runs final verification itself in every tier; spawn `may-qa` only to design missing tests or acceptance, or to drive browser verification. `--log-dir` takes an existing directory, normally the current session folder, never the project tree; each check's full output lands in `<ID>.log` and the table gains `LOG` lines. Use the plan's exact checks and required invocation inputs, and **display the complete MAY VERIFY output table**. At the QA boundary, give one short line identifying the accepted candidate actually checked and any failed, missing, or stale evidence. Any source, test, build, or fixture change invalidates affected evidence: renew review acceptance of the changed delta, then rerun affected checks; old PASS results are historical. Failed criteria return to repair and review. Ask about human criteria at the end. Only the user may remove criteria; report them as deferred, not passed.

The verifier reports PASS, FAIL, NO_TESTS, TRIVIAL, CHANGED, or TIMEOUT. Outside Git, PASS? is inconclusive and exits 1. An unborn Git repository is labeled unborn. Zero-test output and trivial commands are not evidence. Shared commands execute once and identify every covered criterion. The script cannot judge weak assertions; reviewer acceptance remains necessary. For implemented browser functionality, follow [browser.md](browser.md).

## Clean and report

Temporary work and evidence belong only in a folder created by `scripts/may-session.sh start`. It holds logs, artifacts, process identities, and an optional phase-reset `handoff.md`, not durable workflow state. Track background process IDs with that script. Stop **the exact session you created**, including failure or cancellation; use `--keep` only while diagnostics need inspection, then remove that known session. Never wildcard all `may-*` folders to capture or clean evidence. If cleanup fails, report the marked path for recovery. Attempt cleanup on cancellation, but do not promise traps survive a forced kill. Stale-folder sweep requires the age and process/group guards; it is separate recovery, not proof that this run cleaned its own session.

Report in chat, in the user's language: the team header with final worker states; work performed; criterion/evidence table and actual verifier output; review findings/disposition; failed, stale, untested, blocked, or deferred work; human decisions; exact remaining temporary paths. Cleanup claims name only observed processes/folders. Start the next session from code and Git status, not restored MAY workflow state; a handoff path the user provides is a brief to recheck, not state to trust.
