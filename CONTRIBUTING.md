# Contributing to MAY

Contributions are welcome in:

- Canonical workflow skills in `skills/may/` and scoped role guidance in `skills/may-*/`.
- Fixes to the small, deterministic Bash scripts, with behavioral regression tests.
- Documentation, repository checks, and distribution metadata.
- Integration mappings that connect the canonical skills to native facilities without duplicating the workflow.

## Choose your tools

You can contribute manually with any editor, or use any development tools, including optional AI assistance. No particular harness, provider, model, or account is required. [AGENTS.md](AGENTS.md) provides guidance for coding agents working on MAY; using an agent is not a prerequisite for contributing.

## Design boundaries

MAY remains a collection of skills and small scripts:

- Keep one canonical copy of each skill. Put installed workflow behavior in the skills, not root contributor instructions or integration-specific copies.
- Do not add an execution engine, database, event journal, persistent workflow state, background service, cross-session resume, or project-context store or injector.
- Leave permissions, tools, sessions, configured models/accounts, and delegation defaults under the native harness's control. Do not add automatic configuration changes, model/account selection, a separate delegation manager, or dependency installation.
- Reuse existing conventions and standard tools rather than adding dependencies or speculative infrastructure.
- Preserve portability: quoted Windows Git Bash paths, LF shell scripts, Unix process-group handling, and Windows process-tree shutdown with process-identity guards.
- Keep temporary work in marked OS-temp sessions. Stop only owned processes and use guarded cleanup; never collect or delete unrelated temporary folders or processes.

Preserve unrelated contributor changes. Keep private specifications and personal data out of public files and artifacts; public guidance must work without local-only files. Report security issues through [SECURITY.md](SECURITY.md).

## Checks

The repository checks require Node 26+, Bash, Git, and core/system utilities. These are test prerequisites, not requirements for choosing an editor or coding tool. On Windows, `npm test`, `npm run check`, and `npm run test:harness` run Git Bash, located from `git --exec-path`, rather than a bare `bash` that may be WSL Bash; if that Git Bash is not found they fail with an error instead of falling back to `bash`. Set `MAY_BASH` to the Bash executable to override that choice.

```bash
npm test
npm run check
```

`npm test` exercises real Bash scripts through Node's test runner. `npm run check` checks manifest consistency, skill references, public-file boundaries, and shell syntax.

For behavior changes, first add a meaningful failing regression that asserts observable results against disposable fixtures. For installation or integration changes, use the existing targeted installation tests with already-installed tools and isolated temporary homes. Do not install tools or change user configuration just to obtain a passing result.

A passing repository check or installation-discovery test does not establish real-model workflow support, browser behavior, or assertion quality. Report skipped, blocked, failed, and unrun checks as such.

## Pull requests

Keep each change focused. Explain:

- The problem, scope, and user-visible behavior before and after the change.
- The regression coverage and exact checks run, with their outcomes.
- Any limitations, untested platforms or integrations, and remaining owned temporary resources.

Update affected documentation and record user-facing changes in [CHANGELOG.md](CHANGELOG.md). Keep support claims aligned with actual evidence, including failures and permission or credential blockers. Do not describe an unrun check as passing.

### Protected branches and security review

Changes to `main`, `release`, and `release/*` go through pull requests. CI runs repository checks, script tests, an npm advisory audit, and a static audit of GitHub Actions workflows. The workflow uses read-only repository access and does not give pull requests secrets. Dependabot proposes updates to GitHub Actions; review the action source and pinned commit before merging.

Review changes to skills, agent instructions, documentation, scripts, and workflows for prompt injection: identify untrusted content, instructions that claim authority or request secrets, permission escalation, external communication, and destructive commands. Check that tool permissions and human approval remain with the harness and user. An automated workflow scan detects some unsafe Actions patterns, not prompt injection in arbitrary content; passing CI is not proof that a change is safe.

Repository administrators must configure branch rulesets separately; committing a workflow does not protect a branch. In GitHub Settings → Rules → Rulesets, target `main`, `release`, `release/*`, and `release/**/*` (add patterns for deeper release branches as needed). Require pull requests, at least one approval, dismissal of stale approvals, resolution of review conversations, and the `Repository checks` and `Workflow security` status checks from GitHub Actions. Block force pushes and deletion, and limit bypass privileges. Enable the merge queue only if desired; CI supports its `merge_group` event. Apply protection after the workflow has run and the checks are selectable. Review changes to `.github/` and security-sensitive instructions especially carefully; if code-owner review is required, configure actual maintainers as code owners first.

Use short-lived branches from `main`; stabilize releases on `release` or `release/<version>` and merge release fixes back to `main` through a reviewed pull request. Enable GitHub secret scanning, push protection, Dependabot alerts, and Actions code scanning where available. These are repository settings and are not enabled by this workflow.

## Distribution consistency

Keep package and integration manifest versions consistent. Change versions only as part of an intended version update, using the existing version-maintenance script.

Preserve the explicit `package.json` public-file allowlist and inspect the actual package inventory when distribution paths change. Ensure public documentation links and the README logo are included, and private material is excluded. Installation fixtures use tracked and nonignored working-copy candidates, a different boundary from the package allowlist. Review the explicit file list before staging or publishing; neither boundary prevents accidental publication by itself.
