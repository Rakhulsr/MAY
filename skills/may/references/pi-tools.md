# Pi actions

| Action | Native tool |
|---|---|
| Read files | `read` |
| Find names / search contents | `find` / `grep` when exposed; otherwise the shell action |
| Edit / create files | `edit` / `write` |
| Run checks and skill scripts | `bash` |
| Dispatch a task | No built-in subagent tool |
| Ask a material question | Chat |

Check the actual tool list. Use an already installed subagent package only if it exposes a trusted native delegation action. With pi-subagents, a project `.pi/agents/may-<role>.md` from the [`may-config`](../../may-config/SKILL.md) skill carries the user's chosen model; dispatch that role to it when it exists. Before dispatch, read its schema and follow the [canonical capability, default-preservation, recovery, and handoff rules](orchestration.md#execute-and-review). The shared contract governs absent delegation and any owner-authorized recovery; this mapping does not authorize installing a package.

Resolve `MAY_SKILL_DIR` from the absolute installed `may` skill location. Through the shell action invoke `bash "$MAY_SKILL_DIR/scripts/may-session.sh" start`, `bash "$MAY_SKILL_DIR/scripts/may-verify.sh" --check "AC1=npm test"`, or `bash "$MAY_SKILL_DIR/scripts/may-e2e.sh" --session "$session" --spec tests/app.spec.ts`. Use Git Bash on Windows and quote all paths. Native permissions still decide what runs.
