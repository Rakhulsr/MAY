# Claude Code actions

| Action | Native tool |
|---|---|
| Read files | `Read` |
| Find names / search contents | `Glob` / `Grep` |
| Edit / create a file | `Edit` / `Write` |
| Run checks and skill scripts | `Bash` |
| Dispatch a task | `Agent` |
| Ask a material question | `AskUserQuestion` or chat |
| Browser evidence | Available trusted browser tool in the live list |

Dispatch a role worker with `subagent_type` set to the project agent `may-<role>` when the live list shows it (created by [`may-config`](../../may-config/SKILL.md), it carries the user's chosen model), otherwise the plugin agent `may:may-<role>`, which preloads the role skill. Use `general-purpose` with a role brief only when neither is listed. Before dispatch, read the actual `Agent` schema and follow the [canonical capability, default-preservation, recovery, and handoff rules](orchestration.md#execute-and-review). The shared contract governs unavailable or denied delegation and any owner-authorized recovery; this mapping does not grant permissions.

Continue a worker with `SendMessage` to its agent id when available; follow the [continuation rule](orchestration.md#execute-and-review). In Claude Code 2.1.322 the `SendMessage` schema says a message to a completed agent resumes it from its transcript, so a finished reviewer stays reusable. A `/compact` summary can drop agent names and ids, so record each worker's name or id in the status board and write [`handoff.md`](phase-reset.md) before compacting.

`TaskStop` stops a running background task. After reading a worker's final result, stop a worker that is still running or resending its report only when it will not be continued; the schema does not say whether a stopped agent can be resumed.

For [parallel writers](orchestration.md#parallel-writers), use the shared-checkout form or set `isolation: "worktree"` on each `Agent` call for isolated checkouts; the result names `worktreePath` and `worktreeBranch`. Claude Code 2.1.322 put these under `.claude/worktrees/` in the project, so `.claude/` shows as untracked until they are removed, and kept a worktree that had changes. Its documentation says a worktree branches from the remote default branch unless the `worktree.baseRef` setting is `"head"` (it uses local `HEAD` when no remote default is cached), so the base check matters on feature branches. Ask the user before changing that setting.

Resolve `MAY_SKILL_DIR` from the absolute installed `may` skill location, not the project root. Through `Bash` invoke `bash "$MAY_SKILL_DIR/scripts/may-session.sh" start`, `bash "$MAY_SKILL_DIR/scripts/may-verify.sh" --check "AC1=npm test"`, or `bash "$MAY_SKILL_DIR/scripts/may-e2e.sh" --session "$session" --spec tests/app.spec.ts`. On Windows invoke Git Bash and quote every path. Claude Code's permissions remain authoritative.
