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

When the project defines `.claude/agents/may-<role>.md`, dispatch that role with that agent type so the user's chosen model applies; the [`may-config`](../../may-config/SKILL.md) skill creates these files with approval. Otherwise keep the native default. Before dispatch, read the actual `Agent` schema and follow the [canonical capability, default-preservation, recovery, and handoff rules](orchestration.md#execute-and-review). The shared contract governs unavailable or denied delegation and any owner-authorized recovery; this mapping does not grant permissions.

Resolve `MAY_SKILL_DIR` from the absolute installed `may` skill location, not the project root. Through `Bash` invoke `bash "$MAY_SKILL_DIR/scripts/may-session.sh" start`, `bash "$MAY_SKILL_DIR/scripts/may-verify.sh" --check "AC1=npm test"`, or `bash "$MAY_SKILL_DIR/scripts/may-e2e.sh" --session "$session" --spec tests/app.spec.ts`. On Windows invoke Git Bash and quote every path. Claude Code's permissions remain authoritative.
