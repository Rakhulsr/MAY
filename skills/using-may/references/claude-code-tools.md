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

Read the actual `Agent` schema. Dispatch one task with a fresh complete brief, required role skill, assigned files, criteria, decisions, and prior results. Keep one writer. Reviewers are read-only; wait for task results and inspect evidence before proceeding. Retain native configured model/account defaults, without a model override. If `Agent` is unavailable or denied, report the limitation, perform only allowed sequential work, and disclose that review is not separate.

Resolve `MAY_SKILL_DIR` from the absolute installed `using-may` skill location, not the project root. Through `Bash` invoke `bash "$MAY_SKILL_DIR/scripts/may-session.sh" start`, `bash "$MAY_SKILL_DIR/scripts/may-verify.sh" --check "AC1=npm test"`, or `bash "$MAY_SKILL_DIR/scripts/may-e2e.sh" --session "$session" --spec tests/app.spec.ts`. On Windows invoke Git Bash and quote every path. Claude Code's permissions remain authoritative.
