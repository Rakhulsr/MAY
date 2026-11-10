# Phase reset

Every coordinator turn rereads its whole context, so long work costs far more in the coordinator than in its workers. A phase reset lets that work continue in a fresh or compacted session.

**When:** for tier L, after the plan is accepted and after each phase's review acceptance; for any tier, when the coordinator context has grown large between phases.

**How:** write `handoff.md` into the current `may-session.sh` folder, print its absolute path, and suggest the user continue in a fresh session or compact the current one. A fresh session reads the handoff only from a path the user gives, then rechecks it against code and Git. It is a starting brief, not resumed workflow state. At a phase reset, do not stop that session: report its path as a remaining temporary path. The fresh session stops that exact path when its work ends. Continue within 24 hours: any later `may-session.sh start`, including each verifier run, sweeps marked folders untouched for 24 hours without live processes, so an older handoff can disappear.

Keep `handoff.md` to about 60 lines, without transcripts, file contents, or secrets:

```text
Objective; tier and team header
Accepted decisions, one line each
Tasks: ID | role | files | status
Criteria: ID | exact check command
Candidate: HEAD and dirty paths
Evidence: verify table and log paths, status
Open: findings, blockers, next action
```

When a handoff's `Candidate` differs from current Git status, report the difference and trust the code.

**Persistent handoff (opt-in):** when work must outlive the 24-hour sweep, and only when the user asks for it, write the same `handoff.md` to `may-artifacts/handoff.md` in the project instead. Before writing, confirm with `git check-ignore -q may-artifacts/handoff.md` that Git ignores it; if not, ask the user to approve adding `may-artifacts/` to `.git/info/exclude` or `.gitignore`. Never stage or commit it. The same rules apply: a fresh session reads it only from a path the user gives and rechecks it against Git. Stop the session normally, since the handoff no longer lives in it. Overwrite the file at each phase reset and delete it when the work ends or the user abandons it.
