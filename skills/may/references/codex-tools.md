# Codex actions

| Action | Native tool |
|---|---|
| Read files / find names / search | Available shell or file tools in the live list |
| Edit files | `apply_patch` when exposed, otherwise the live edit tool |
| Run checks and skill scripts | `exec_command` when exposed, otherwise the live shell tool |
| Dispatch / await tasks | `spawn_agent` / `wait_agent` or `wait` only when multi-agent configuration exposes them |
| Ask a material question | Available user-input action or chat |

Codex multi-agent availability depends on configuration. When the project defines `.codex/agents/may-<role>.toml` and the live dispatch schema can select a custom agent, dispatch that role to it so the user's chosen model applies; the [`may-config`](../../may-config/SKILL.md) skill creates these files with approval. Otherwise use the native default agent with a `may-<role>` brief. Before dispatch, read and follow the [canonical capability, default-preservation, recovery, and handoff rules](orchestration.md#execute-and-review), using the live tool schema. The shared contract governs absent delegation, blocked dispatch, and any owner-authorized recovery; do not infer capability from this mapping.

Codex 0.167.0 `spawn_agent` has no worktree or working-directory parameter, so sub-agents share one checkout: keep one writer. `codex --worktree` isolates a whole session, not a sub-agent.

Set `MAY_SKILL_DIR` to the absolute installed `may` directory supplied by skill discovery. Run `bash "$MAY_SKILL_DIR/scripts/may-session.sh" start`, `bash "$MAY_SKILL_DIR/scripts/may-verify.sh" --check "AC1=npm test"`, or `bash "$MAY_SKILL_DIR/scripts/may-e2e.sh" --session "$session" --spec tests/app.spec.ts` via the actual shell action. On Windows use Git Bash explicitly and quote paths. Respect Codex's sandbox and approvals.
