# Token benchmark: MAY 0.2.0 and 0.3.0

The first section records Claude Code runs from 2026-11-09. The later sections cover additional Claude Code and Oh My Pi runs. Each result states its run count and limits; none proves that one MAY version is universally more efficient.

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

- These six runs cover one harness and one model, with one run per cell. OMP was blocked during this batch; later OMP observations appear below.
- Print mode cannot answer permission prompts, so an explicit tool allowlist replaced interactive approval. Interactive sessions may differ.
- `~/.claude/CLAUDE.md` user instructions still loaded in every run; they were the same for both versions.
- The fixtures are small. Savings from keeping coordinator context small, if any, are expected in long multi-phase sessions, which this benchmark does not cover.

## Tiered team with named role agents (2026-11-10)

Second round, Claude Code 2.1.322, model `claude-sonnet-5-5`, `--plugin-dir` export, `--setting-sources project,local`, explicit `--allowedTools` in disposable projects. Three runs per cell, all in one turn, all oracles PASS. `weighted` counts input-equivalent tokens (cache read 0.1, cache write 1.25, output 5). Baseline is 0.3.0 at `f7329e4`; candidate is the uncommitted tiered-team change (single S/M/L mode, `agents/may-<role>.md`, split guidance).

| Scenario | Version | Run totals | Median total | Median weighted | Median cost | Workers |
|---|---|---|---:|---:|---:|---|
| B-S | 0.3.0 | 131,316 / 198,812 / 199,238 | 198,812 | 62,629 | $0.145 | none |
| B-S | candidate | 177,271 / 183,907 / 185,158 | 183,907 | 52,218 | $0.118 | none |
| B-M | 0.3.0 | 138,209 / 138,750 / 153,993 | 138,750 | 50,852 | $0.115 | none |
| B-M | candidate | 110,320 / 149,004 / 229,601 | 149,004 | 58,998 | $0.139 | none |
| B-L | 0.3.0 | 495,473 / 846,885 / 1,461,468 | 846,885 | 210,619 | $0.406 | 4 `Explore` in one run |
| B-L | candidate | 873,594 / 1,073,041 / 1,216,373 | 1,073,041 | 324,866 | $0.618 | 4 `may:may-tech-lead` reviews in two runs |

Observations:

- B-S cost fell about 19% at the median, and the three runs were closer together. The candidate's coordinator reads less guidance per call.
- In B-L the coordinator dispatched the named reviewer `may:may-tech-lead` once per phase in two of three runs, and each result started `ROLE: may-tech-lead`. This is the first observed named role worker; the baseline only used generic `Explore`. Those independent reviews account for most of the B-L cost increase (worker tokens 166k and 260k).
- No run dispatched a named implementer. B-M (four areas, one contract) and B-L stayed inline, so tier selection still under-sizes multi-area work.
- The team header appeared in the coordinator's text in only two of nine candidate runs, both B-S.
- With three runs per cell and wide spread, these are directional observations, not significant differences.

## Oh My Pi: B-M on GPT-6.1 Terra (2026-11-10)

These are individual observations, not averages. Both coordinators used OMP 18.18.6, `openai-codex/gpt-6.1-terra`, and medium reasoning in separate disposable projects. The two initial runs overlapped. Tokens include input, cache reads, cache writes, and output, including worker sessions. The OMP-reported costs below are estimates, not verified billing amounts.

| Run | MAY source | Result | Coordinator tokens | Worker tokens | Total tokens | Time | Reported cost |
|---|---|---|---:|---:|---:|---:|---:|
| O1 | Installed 0.2.0 | Oracle PASS; self-review | 458,792 | 0 | 458,792 | 97 s | $0.0691 |
| O2 | Working-tree 0.3.0 at `3acbdef` | Oracle FAIL; independent review | 544,351 | 192,644 | 736,995 | 176 s | $0.1654 |
| O3 | Same 0.3.0 plus uncommitted handoff guidance | Oracle PASS; self-review | 259,550 | 0 | 259,550 | 136 s | $0.0582 |

O2's tests passed, but the independent oracle found that its rendered tag items omitted the required `class="tag"`. The implementer brief omitted that exact requirement. The later guidance asks coordinators to preserve literal contract details in implementer and reviewer briefs and to map criteria to checks.

O3 did not dispatch workers: the coordinator reported that the harness's delegation gate conflicted with MAY's tier-M instruction. Its pass therefore does not test the changed handoff guidance. O2's two workers used high reasoning while its coordinator and the other runs used medium; this is not a controlled reasoning-level comparison. Each cell has one observation, O3 ran separately, and these small tasks cannot establish token savings. No Luna results are included.

The OMP runs used `--plugin-dir`, `--profile may-benchmark`, print mode, `--no-prewalk`, `--max-time 15m`, and `--max-cost 2`. Actual tool permissions remained under the harness. The benchmark runner inspected the oracle failure and then removed its owned temporary sessions, including raw logs; the OMP figures above cannot be independently recounted from retained logs. One malformed-prompt attempt was cancelled and is excluded from these rows and costs.

### OMP long scenario

The B-L prompt runs four phases on the notes fixture. These two runs used the same OMP version, Terra model, coordinator reasoning, prompt, and isolated profile as the B-M runs. They ran at the same time, with a 15-minute and $2 limit per run. The 0.3.0 candidate included the uncommitted handoff guidance.

| MAY | Independent oracle | Coordinator tokens | Worker tokens | Total tokens | Coordinator peak context | Time | Reported cost |
|---|---|---:|---:|---:|---:|---:|---:|
| 0.2.0 | PASS | 1,013,975 | 0 | 1,013,975 | 43,015 | 191 s | $0.1182 |
| 0.3.0 candidate | PASS | 2,481,749 | 1,213,947 | 3,695,696 | 47,681 | 686 s | $0.4116 |

The baseline used self-review. The candidate used workers and reported review and repair across phases; its worker logs included high reasoning while the coordinator used medium. These runs did different amounts of review and are single observations, so the token, time, and reported-cost differences cannot be attributed solely to MAY version. Neither peak context approached the 770k–930k motivating sessions, so this result does not establish the effect of a phase reset on those sessions. Reported cost is the sum of usage estimates in the OMP logs, not a verified bill.
