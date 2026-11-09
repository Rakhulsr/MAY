---
name: may-config
description: Use when the user wants MAY roles to run on specific models, asks which model each MAY worker uses, or wants to change per-role model settings for Claude Code or Oh My Pi.
---

# MAY role model configuration

Map MAY roles to models the user chooses, through the harness's own project-level agent files. MAY never picks a model, stores credentials, calls another provider's CLI, or edits user-global configuration.

## Supported harnesses

| Harness | Native project file | Model field |
|---|---|---|
| Claude Code | `.claude/agents/may-<role>.md` | Frontmatter `model:`, a value the installed Claude Code accepts, such as an alias or `inherit` |
| Oh My Pi | `.omp/agents/may-<role>.md` | Frontmatter `model:` list of model IDs or `@role` aliases from the user's `modelRoles`; optional `thinkingLevel:` |

Observed on Claude Code's `Agent` tool and OMP 18.18.2 bundled agents. Formats change between versions: before writing, read the installed harness's current documentation or help, and an existing agent file of the same harness if one exists. If the format cannot be confirmed, stop and report it. Codex and Pi are not supported yet; say so instead of guessing.

## Steps

1. Identify the running harness and its version. Inspect existing `may-*` agent files in the project; never overwrite a file MAY did not create without explicit approval.
2. List the models the harness itself exposes: its model list, configured roles, or the live dispatch schema. Do not suggest models it does not offer.
3. Ask the user which model each relevant role should use. Offer `inherit` or no file as the default. A role left unconfigured keeps the harness default.
4. Show the complete content and path of every file to create or change, as a diff. Explain that this changes project configuration for every future session in this project.
5. Write only after explicit approval, and only those files. Report written paths, and how to undo: delete the files.
6. Do not verify a model by spawning probe workers. The next real dispatch shows whether the harness accepts it; report a rejected model rather than retrying another.

## Agent file body

Keep the body short so the agent's base context stays small:

```markdown
---
name: may-backend
description: MAY backend worker. Use only when the MAY coordinator dispatches a backend task.
model: <user-chosen value>
---

Load the MAY `may-backend` role skill (a plugin may list it with a namespace, such as `may:may-backend`) and the shared MAY role contract, then perform only the assigned task and return the contract's result shape.
```

The coordinator dispatches to `may-<role>` when such an agent exists, per the harness mapping; otherwise it uses the native default. Configured models never change the tier, review, or verification rules.
