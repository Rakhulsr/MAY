# Pi actions

| Action | Native tool |
|---|---|
| Read files | `read` |
| Find names / search contents | `find` / `grep` when exposed; otherwise the shell action |
| Edit / create files | `edit` / `write` |
| Run checks and skill scripts | `bash` |
| Dispatch a task | No built-in subagent tool |
| Ask a material question | Chat |

Check the actual tool list. Use an already installed subagent package only if it exposes a trusted native delegation action. With pi-subagents, MAY's package declares agents named `may-<role>` that preload the role skill (package discovery not yet observed), and a project `.pi/agents/may-<role>.md` from the [`may-config`](../../may-config/SKILL.md) skill carries the user's chosen model; pi-subagents documents that project agents win a name collision. Dispatch each role to `may-<role>` when the live agent list shows it; otherwise use the native default with a `may-<role>` brief. Before dispatch, read its schema and follow the [canonical capability, default-preservation, recovery, and handoff rules](orchestration.md#execute-and-review). The shared contract governs absent delegation and any owner-authorized recovery; this mapping does not authorize installing a package.

For [parallel writers](orchestration.md#parallel-writers), use the shared-checkout form or pi-subagents 0.87.0 `worktree: true` per child: it needs a clean source checkout, branches from `HEAD` (or a named `baseRef`), saves a patch and handoff manifest in the child's `artifactPaths`, and removes cleanly captured worktrees. Apply those patches as the integration step. Check the live tool list for native continuation and a per-dispatch model field; if continuation is unavailable, dispatch fresh as the contract describes.

Resolve `MAY_SKILL_DIR` from the absolute installed `may` skill location. Through the shell action invoke `bash "$MAY_SKILL_DIR/scripts/may-session.sh" start`, `bash "$MAY_SKILL_DIR/scripts/may-verify.sh" --check "AC1=npm test"`, or `bash "$MAY_SKILL_DIR/scripts/may-e2e.sh" --session "$session" --spec tests/app.spec.ts`. Use Git Bash on Windows and quote all paths. Native permissions still decide what runs.
