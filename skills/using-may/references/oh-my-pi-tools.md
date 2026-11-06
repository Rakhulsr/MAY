# Oh My Pi actions

Validated against the installed OMP 18.16.0 help and this session's actual tool list. Recheck the live list on other versions; Pi assumptions do not apply.

| Action | Native tool |
|---|---|
| Read files, inspect directories | `read` |
| Find names / search contents | `glob` / `grep` |
| Edit / create a file | `edit` / `write` |
| Run checks and skill scripts | `bash` |
| Dispatch a task | `task` |
| Wait for dispatched work | `wait` when exposed; otherwise follow the task result delivery contract |
| Ask a material question | `ask` when interactive, otherwise chat |
| Browser evidence | Available trusted browser tool in the live list |

The PM or Tech Lead coordinator uses OMP's native delegation and reuses Vibe when that mode is active and available; do not implement another agent manager or invent Vibe commands. Dispatch only justified task-relevant workers through the actual tool schema, not the whole role roster. Workers return results without dispatching another team. Give complete briefs and relevant role skills; reviewers are read-only. Keep one writer, await results, and inspect evidence before the next task. Keep native model/account defaults without overrides. If delegation is absent, execute sequentially and disclose non-separate review.

Use the absolute installed `using-may` location supplied by skill loading as `MAY_SKILL_DIR`, then invoke through the native shell action: `bash "$MAY_SKILL_DIR/scripts/may-session.sh" start`, `bash "$MAY_SKILL_DIR/scripts/may-verify.sh" --check "AC1=npm test"`, or `bash "$MAY_SKILL_DIR/scripts/may-e2e.sh" --session "$session" --spec tests/app.spec.ts`. On Windows invoke Git Bash explicitly; quote every path. OMP's current permission policy remains in force.
