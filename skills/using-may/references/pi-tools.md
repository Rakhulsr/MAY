# Pi actions

| Action | Native tool |
|---|---|
| Read files | `read` |
| Find names / search contents | `find` / `grep` when exposed; otherwise the shell action |
| Edit / create files | `edit` / `write` |
| Run checks and skill scripts | `bash` |
| Dispatch a task | No built-in subagent tool |
| Ask a material question | Chat |

Check the actual tool list. Use an already installed subagent package only if it exposes a trusted native delegation action; read its schema and send a complete brief with the required role skill. Do not install a package. Without it, execute sequentially and disclose that review is not separate. Keep the user's native configured model/account.

Resolve `MAY_SKILL_DIR` from the absolute installed `using-may` skill location. Through the shell action invoke `bash "$MAY_SKILL_DIR/scripts/may-session.sh" start`, `bash "$MAY_SKILL_DIR/scripts/may-verify.sh" --check "AC1=npm test"`, or `bash "$MAY_SKILL_DIR/scripts/may-e2e.sh" --session "$session" --spec tests/app.spec.ts`. Use Git Bash on Windows and quote all paths. Native permissions still decide what runs.
