# Token benchmark: MAY 0.2.0 and 0.3.0 on Claude Code

Recorded 2026-11-09 with the protocol in [README.md](README.md). One run per cell: each number is one observation, not an average.

## Setup

| Item | Value |
|---|---|
| Harness | Claude Code 2.1.319, print mode (`claude -p`), resumed only if MAY asked a question; no run asked |
| Model | `claude-sonnet-5-5` for coordinator and workers, default effort |
| Plugin | Each version loaded alone with `--plugin-dir` from a `git archive` export; `--setting-sources project,local`, so no user plugins or hooks |
| MAY 0.2.0 | Commit `4d18bc3` |
| MAY 0.3.0 | Commit `27ece22` |
| Permissions | `--allowedTools Read Edit Write Glob Grep Bash Agent Skill TaskCreate TaskUpdate TaskList TaskGet ToolSearch`, inside a disposable OS-temp project |
| Order | All runs of a batch started in parallel, in separate projects |
| Counting | `count-tokens.mjs` on the coordinator log and its `subagents/` logs; tokens = input + cache read + cache write + output |

B-M-O is B-M with the first sentence replaced by: `Use MAY in Orchestrated mode for this task: dispatch native workers for implementation and independent review.` It was added after B-S and B-M both stayed Direct on both versions, so worker and coordinator behavior would be exercised at all.

## Results

| Run | Scenario | MAY | Mode | Coordinator calls | Coordinator max context | Coordinator tokens | Workers (tokens) | Run tokens | Reported cost (USD) | Oracle | Interventions |
|---|---|---|---|---:|---:|---:|---|---:|---:|---|---:|
| R1 | B-S | 0.2.0 | Direct | 5 | 27,707 | 129,524 | 0 | 129,524 | 0.079 | PASS | 0 |
| R2 | B-S | 0.3.0 | Direct | 5 | 28,621 | 131,314 | 0 | 131,314 | 0.084 | PASS | 0 |
| R3 | B-M | 0.2.0 | Direct | 4 | 31,378 | 111,279 | 0 | 111,279 | 0.114 | PASS | 0 |
| R4 | B-M | 0.3.0 | Direct | 5 | 31,127 | 137,699 | 0 | 137,699 | 0.113 | PASS | 0 |
| R5 | B-M-O | 0.2.0 | Orchestrated | 8 | 41,470 | 283,850 | 2 (99,475; 88,872) | 472,197 | 0.359 | PASS | 0 |
| R6 | B-M-O | 0.3.0 | Orchestrated | 9 | 41,323 | 319,044 | 2 (67,571; 67,147) | 453,762 | 0.286 | PASS | 0 |

Cost is the `total_cost_usd` Claude Code reported for the run.

## Observations

- Run totals for 0.3.0 were 1% higher (B-S), 24% higher (B-M) and 4% lower (B-M-O) than 0.2.0. With one run per cell, none of these differences is distinguishable from run-to-run variation.
- B-S and B-M stayed Direct on both versions. The coordinator handled the change in 4–5 calls with no workers, so 0.3.0's coordinator and worker guidance had nothing to act on. Neither Direct run on either version ran `may-verify.sh`; each disclosed that it used `npm test` and self-review.
- In B-M-O both versions dispatched one implementer and one reviewer (`general-purpose` agents) and ran `may-verify.sh` once. Only 0.3.0 passed `--log-dir` and printed a `Tier:` header. 0.3.0 workers used 28% fewer tokens (134,718 against 188,347). The 0.3.0 coordinator used 12% more tokens and one more call.
- Coordinator max context stayed between 28k and 42k tokens in every run. The 770k–930k coordinator contexts that motivated 0.3.0 came from much longer real sessions; these fixtures do not reproduce that growth, so the phase reset was never triggered.

## Limitations

- One harness, one model, one run per cell. Oh My Pi runs are blocked: OMP has no per-session plugin directory, and an isolated profile needs an interactive login that was not available.
- Print mode cannot answer permission prompts, so an explicit tool allowlist replaced interactive approval. Interactive sessions may differ.
- `~/.claude/CLAUDE.md` user instructions still loaded in every run; they were the same for both versions.
- The fixtures are small. Savings from keeping coordinator context small, if any, are expected in long multi-phase sessions, which this benchmark does not cover.
