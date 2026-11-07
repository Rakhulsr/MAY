# Codex actions

| Action | Native tool |
|---|---|
| Read files / find names / search | Available shell or file tools in the live list |
| Edit files | `apply_patch` when exposed, otherwise the live edit tool |
| Run checks and skill scripts | `exec_command` when exposed, otherwise the live shell tool |
| Dispatch / await tasks | `spawn_agent` / `wait_agent` or `wait` only when multi-agent configuration exposes them |
| Ask a material question | Available user-input action or chat |

Codex multi-agent availability depends on configuration. Before dispatch, read and follow the [canonical capability, default-preservation, recovery, and handoff rules](orchestration.md#execute-and-review), using the live tool schema. The shared contract governs absent delegation, blocked dispatch, and any owner-authorized recovery; do not infer capability from this mapping.

Set `MAY_SKILL_DIR` to the absolute installed `may` directory supplied by skill discovery. Run `bash "$MAY_SKILL_DIR/scripts/may-session.sh" start`, `bash "$MAY_SKILL_DIR/scripts/may-verify.sh" --check "AC1=npm test"`, or `bash "$MAY_SKILL_DIR/scripts/may-e2e.sh" --session "$session" --spec tests/app.spec.ts` via the actual shell action. On Windows use Git Bash explicitly and quote paths. Respect Codex's sandbox and approvals.
