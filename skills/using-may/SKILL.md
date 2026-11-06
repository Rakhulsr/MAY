---
name: using-may
description: Use when the user mentions MAY, requests an engineering team workflow, or asks for coordinated planning, implementation, review, and acceptance checks.
---

# Using MAY

MAY is engineering workflow guidance plus small scripts. The harness owns permissions, models, accounts, sessions, and tools. MAY is model-agnostic: keep the user's configured model and account, including native delegation defaults.

Use MAY for coding goals that need an explicit outcome and evidence, including standalone planning. It needs no external brainstorming skill. Skip it for casual questions, non-coding requests, or a different workflow the user explicitly chose.

## Start fresh

Every session starts fresh: read relevant code and current Git status. Existing files are the starting point, not something to claim ownership of. Ask before overwriting the user's uncommitted changes. Do not write plans, state, notes, or reports into the repository unless the user requests those files.

Before acting, read `references/orchestration.md` and the mapping for the current harness:

| Harness | Mapping |
|---|---|
| Pi | `references/pi-tools.md` |
| Oh My Pi | `references/oh-my-pi-tools.md` |
| Codex | `references/codex-tools.md` |
| Claude Code | `references/claude-code-tools.md` |

## Consult before planning

Reuse prior brainstorming, accepted plans, decisions, and inspected code; fill only missing material details. Brainstorming explores alternatives; planning converges on a justified deliverable. These are stages, not mandatory separate agents or repeated approval rituals.

For vague needs, start with an open question. Batch independent simple questions; ask complex, dependent, or consequential decisions one at a time. Use native interactive options only when the actual tool is available, otherwise numbered chat choices. Explain options, your recommendation, reasons, and tradeoffs; offer “recommend for me.” Decide and disclose reversible low-risk details yourself. A delegated choice belongs in the plan; it does not authorize risky actions.

Read the planning/readiness contract in `references/orchestration.md` before presenting a plan. Each relevant role contributes context-specific best-practice advice and questions, not a universal checklist or a mandatory worker.

## Minimum relevant team

One PM or Tech Lead coordinator applies both planning lenses in its current context; those profiles do not require two agent processes. Select workers only for task-relevant expertise, never all eight roles by default. Backend-only work does not need Frontend or UI/UX workers.

Only the coordinator dispatches role workers. Workers return their assigned result without spawning another team. Reuse the harness's native execution mode, including Vibe when active, rather than creating a second agent manager.

## Work cycle

1. **Understand:** inspect the relevant code, constraints, and available actions; distinguish facts, assumptions, and material questions.
2. **Plan:** apply `may-pm` and `may-tech-lead` inline; choose Direct with no unnecessary workers for a small low-risk fix, otherwise plan only justified implementation, review, and QA roles; present observable criteria in chat.
3. **Establish readiness:** resolve goal, scope, context, justified implementation, material risks, and checkable acceptance. Reuse unchanged approvals; obtain approval for new or changed risky actions and material decisions. A complex or risky plan gets a fresh read-only native critic; disclose a self-check fallback when delegation is unavailable.
4. **Implement by role:** load only relevant role skills; the coordinator dispatches fresh native workers for Orchestrated tasks, one writer at a time; otherwise work sequentially and disclose that review is not separate.
5. **Review:** obtain acceptance of every changed source and test delta before final QA, including repairs and tests-only changes; findings have IDs, severity, and affected criteria. Direct work uses disclosed self-review.
6. **Repair:** send findings back for scoped fixes and re-review by the same reviewer; after two repair rounds ask the user.
7. **Verify:** after current review acceptance, run `scripts/may-verify.sh` with the exact plan checks; show its output table. Planning-only work uses explicit human plan acceptance, not pretend executable checks. Browser functionality needs real browser evidence through a trusted connection or `scripts/may-e2e.sh`; UX advice alone does not require a browser or image.
8. **Report in chat:** map each criterion to observed evidence and disclose failures, stale results, untested or deferred work; ask about human criteria.
9. **Clean:** keep temporary work only in a folder from `scripts/may-session.sh start`; always stop your exact session at the end, including failure or cancellation. Report only observed cleanup scope, never sweep unrelated `may-*` captures. A new session never resumes MAY workflow state.
