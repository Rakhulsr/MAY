# Examples

## A task prompt

This is an illustrative request, not a transcript or a claim of completed work:

```text
Use MAY to fix login validation. Inspect the existing auth code and my
working-tree changes first. Keep the scope to the validation bug and a
regression test. State the acceptance checks, keep the team small if
the risk is small, and disclose whether review is independent. Keep the
plan and evidence report in chat.
```

The agent should turn the request into a scoped plan using the [orchestration contract](orchestration.md), not copy a fixed team roster. The exact files, repair, and checks depend on the inspected project. For installed scripts, resolve the harness-provided skill directory as explained in the [runtime guide](runtime.md).

## Team header and boundary examples

These are illustrative chat lines, not observed worker runs or acceptance evidence:

```text
Tier: S | Team: Tech Lead (coordinator) · Backend (inline) | Review: Tech Lead lens, self-review (not independent)
Reason: one local helper repair, unchanged interface, focused regression.
Ready: accepted repair scope; T1-T3 cover AC1; no material blocker.
Review: candidate C1 (current source/test snapshot, including uncommitted files);
self-review accepted; no open findings.
QA: checked accepted C1 with the planned command and required inputs;
report actual output and missing evidence, not an assumed PASS.
```

A response-contract change consumed by multiple UI surfaces needs a different assessment: explain the contract/regression risk, serialize shared-file writers, and justify independent review. Reading Backend, Frontend, PM, or Tech Lead profiles inline does not start those workers.

```text
Tier: L | Team: Tech Lead (coordinator) · may-backend (planned) · may-frontend (planned) ·
may-tech-lead (reviewer, planned) · Security (inline lens) | Review: pending
```

Update worker states with actual dispatch results, for example `may-backend (done)`. Each worker's result starts with `ROLE: may-<role>`. If native dispatch fails authentication or an override is denied, report the blocked worker and needed owner decision; do not silently change tier, model, account, or configuration. A permitted owner-approved recovery is a new authorized action, not an automatic retry.

For an interrupted QA worker, a brief handoff might identify task/criteria, the reviewed candidate snapshot, reviewer acceptance, and `WORKER_FAILED | CHECK_PASSED exit=0` only after inspecting the known raw output and confirming its candidate binding. Include the exact check command, required nonsecret input such as `FIXTURE_MODULE=<resolved existing module path>`, and the recorded owned session/artifact paths. A missing input or inaccessible log leaves a gap; it does not authorize installing a dependency or inventing a result. Retain needed raw artifacts until inspection, then clean the exact session. This is same-session recovery context, not stored cross-session workflow state.

## Windows shell selection

Inspect the actual shell action and installed executables first. An unqualified `bash` may resolve to WSL rather than Git Bash. The following templates assume the paths have already been resolved from that inspection; they are not claims about a user's installation or required global configuration.

If the shell action is PowerShell, `$gitBash` is the inspected Git Bash executable and `$maySkillDir` is the discovered installed skill directory:

```powershell
& $gitBash "$maySkillDir/scripts/may-session.sh" start
```

If the action accepts Bash-compatible executable invocation, use its inspected executable path explicitly (`GIT_BASH` here is a local convenience):

```bash
"$GIT_BASH" "$MAY_SKILL_DIR/scripts/may-session.sh" start
```

Record the printed absolute session path before the next call. Use the actual shell's invocation syntax and resolved paths again for verification or cleanup; do not assume shell variables survive tool calls.

## Observed verification step

The following command was actually run from a MAY source checkout against the existing session-script tests, before the entry skill was renamed from `using-may` to `may`:

```bash
bash skills/using-may/scripts/may-verify.sh --check "AC1=node --test tests/session.test.ts"
```

Complete standard output from that run:

```text
MAY VERIFY
revision 6f71a52a0921c58cb841b98d4f5ba868761efc7d tree 1f895a11d7e2fda5b2c42cfb218da3cb41883613
AC1  PASS  exit=0  node --test tests/session.test.ts
RESULT PASS 1/1 passed
```

The verifier exited 0 under Windows Git Bash with Node 26. The revision and tree identifiers describe that historical candidate, not the latest checkout or your project.

This demonstrates one real verification step and the table format. It is not a real-model planning/implementation/review transcript, browser test, proof that all requirements are covered, or a token/time/quality benchmark. It also does not verify later documentation edits. The command uses a source-checkout path because the test belongs to MAY itself; a normal target project uses the installed skill path and its own criterion commands.

`PASS` means the command succeeded without the verifier detecting the failure conditions described in the [runtime guide](runtime.md#acceptance-checks). The reviewer still has to assess whether the assertions establish the agreed behavior.
