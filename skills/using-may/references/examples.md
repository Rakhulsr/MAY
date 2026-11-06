# Examples

## A task prompt

This is an illustrative request, not a transcript or a claim of completed work:

```text
Use MAY to fix login validation. Inspect the existing auth code and my
working-tree changes first. Keep the scope to the validation bug and a
regression test. State the acceptance checks, use Direct work if the
risk is small, and disclose whether review is independent. Keep the
plan and evidence report in chat.
```

The agent should turn the request into a scoped plan using the [orchestration contract](orchestration.md), not copy a fixed team roster. The exact files, repair, and checks depend on the inspected project. For installed scripts, resolve the harness-provided skill directory as explained in the [runtime guide](runtime.md).

## Observed verification step

The following command was actually run from a MAY source checkout against the existing session-script tests:

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
