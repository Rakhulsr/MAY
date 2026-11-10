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

Project agent files were observed on OMP 18.18.2. OMP plugins do not ship agents. When the project defines `.omp/agents/may-<role>.md`, dispatch that role to that agent so the user's chosen model applies; the [`may-config`](../../may-config/SKILL.md) skill creates these files with approval. Otherwise use the native default task agent with a `may-<role>` brief. Before dispatch, read and follow the [canonical capability, default-preservation, recovery, and handoff rules](orchestration.md#execute-and-review). Use OMP's actual `task` schema and native delegation; reuse Vibe only when active and available, without inventing commands. Exposed tools do not establish provider authentication. The shared contract governs blocked dispatch and any owner-authorized recovery.

For [parallel writers](orchestration.md#parallel-writers), use the shared-checkout form or, when the user has enabled `task.isolation.enabled`, OMP's per-task `isolated: true` for isolated checkouts. The `task.isolation.apply` setting decides whether successful isolated changes are applied to the parent checkout automatically or kept as patch or branch artifacts. Read the live schema; MAY does not change these settings.

Continue an idle subagent by writing to `agent://<id>`, or use `vibe_send` in Vibe mode, when available; follow the [continuation rule](orchestration.md#execute-and-review).

Use the absolute installed `may` location supplied by skill loading as `MAY_SKILL_DIR`, then invoke through the native shell action: `bash "$MAY_SKILL_DIR/scripts/may-session.sh" start`, `bash "$MAY_SKILL_DIR/scripts/may-verify.sh" --check "AC1=npm test"`, or `bash "$MAY_SKILL_DIR/scripts/may-e2e.sh" --session "$session" --spec tests/app.spec.ts`. On Windows invoke Git Bash explicitly; quote every path. OMP's current permission policy remains in force.
