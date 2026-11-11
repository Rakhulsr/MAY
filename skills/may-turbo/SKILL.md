---
name: may-turbo
description: Use when the user wants MAY to coordinate workers across multiple coding harnesses, or when a tier M or L task would benefit from another harness or model.
---

# MAY Turbo

MAY with a cross-harness team. The harness still owns models, accounts, tools, and permissions. MAY never chooses a model.

## Choose the team
1. Follow the `may` skill's reference reads and plan requirements. Run `../may/scripts/may-bridge.sh harnesses --models` through Bash.
2. Show the available harnesses and models in a compact map. Long lists may be grouped by provider; offer the full list. `-` means the CLI could not list models or, for Codex, the user must name one.
3. Use the harness's native question tool to ask one question covering every planned worker's harness and model, and whether the reviewer stays native. Name the native option after the harness running you, not the model provider. Dispatch nothing until the user answers. Only list CLI-reported models; do not recommend, substitute, or infer availability.
4. Apply the user's choices to the MAY team gate and work cycle. Follow [the pane-run and snapshot/scope procedure](../may/references/ideation-bridge.md#launching-another-harness), including worker result files, `--add-dir` for Codex writers, and read-only reviewer restrictions. Read-only reviewers need no write scope.
5. Report each worker's selected harness, model, and harness-reported usage; mark usage unavailable when the harness does not report it.

The [orchestration contract](../may/references/orchestration.md) defines planning, review, and acceptance. The [ideation bridge](../may/references/ideation-bridge.md) defines cross-harness launches and evidence handling.
