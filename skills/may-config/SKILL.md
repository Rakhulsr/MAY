---
name: may-config
description: Use when the user wants MAY roles to run on specific models, asks which model each MAY worker uses, or wants to change per-role model settings for Claude Code, Oh My Pi, Codex, or Pi with the pi-subagents extension.
---

# MAY role model configuration

Map MAY roles to models the user chooses, through the harness's own project-level agent files. MAY never picks a model, stores credentials, calls another provider's CLI, or edits user-global configuration.

## Supported harnesses

| Harness | Native project file | Model field |
|---|---|---|
| Claude Code | `.claude/agents/may-<role>.md` | Frontmatter `model:`, a value the installed Claude Code accepts, such as an alias or `inherit` |
| Oh My Pi | `.omp/agents/may-<role>.md` | Frontmatter `model:` list of model IDs or `@role` aliases from the user's `modelRoles`; optional `thinkingLevel:` |
| Codex | `.codex/agents/may-<role>.toml` | TOML `model`, optional `model_reasoning_effort`; required `name`, `description`, `developer_instructions` |
| Pi with pi-subagents | `.pi/agents/may-<role>.md` | Frontmatter `model:` (optional `:level` suffix) and optional `thinking:` |

Observed dispatch to a project `may-<role>` agent with its configured model on Claude Code 2.1.319, OMP 18.18.3, and Pi 1.5.0 with pi-subagents 0.87.0. The Codex 0.163.0 format comes from its documentation; in a `codex exec` run the spawn tool offered no custom-agent selector, so the model was not applied. Codex loads project `.codex/` layers only for a trusted project. Pi core has no subagent tool: without an installed subagent extension that reads project agent files, Pi is not supported, and MAY does not install one. Formats change between versions: before writing, read the installed harness's current documentation or help, and an existing agent file of the same harness if one exists. If the format cannot be confirmed, stop and report it instead of guessing.

## Steps

1. Identify the running harness and its version. Inspect existing `may-*` agent files in the project; never overwrite a file MAY did not create without explicit approval.
2. List the models the harness itself exposes: its model list, configured roles, or the live dispatch schema. Do not suggest models it does not offer.
3. Ask the user which model each relevant role should use. Offer `inherit` or no file as the default. A role left unconfigured keeps the harness default.
4. Show the complete content and path of every file to create or change, as a diff. Explain that this changes project configuration for every future session in this project.
5. Write only after explicit approval, and only those files. Report written paths, and how to undo: delete the files.
6. Do not verify a model by spawning probe workers. The next real dispatch shows whether the harness accepts it; report a rejected model rather than retrying another.

## Agent file body

Start from MAY's own agent for that role in the installed package's `agents/may-<role>.md`, and add only the model fields, so the project agent keeps the role name, skill preload, and short body:

```markdown
---
name: may-backend
description: MAY Backend Engineer for backend or server-side work. Use only when the MAY coordinator dispatches a task to this role.
model: <user-chosen value>
skills:
  - may-backend
disallowedTools: Agent
---

You are may-backend, the Backend Engineer on a MAY engineering team. The may-backend skill is preloaded; if it is not in your context, load it. Follow the MAY role contract it links, do only the task the coordinator assigns, never dispatch other agents, and start your result with `ROLE: may-backend`.
```

`skills` and `disallowedTools` are Claude Code fields; pi-subagents reads `skills` too. For Oh My Pi, keep only the fields its documentation lists.

For Codex, put the same instruction in `developer_instructions` and keep the TOML keys the documentation lists.

The coordinator dispatches to the project `may-<role>` when it exists, then to MAY's packaged role agent, then to the native default, per the harness mapping. Configured models never change the tier, review, or verification rules.
