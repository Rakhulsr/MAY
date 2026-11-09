# MAY benchmark: session safety

Archive note: private home paths in the narrative and logs have been redacted as `<USER_HOME>`; logs are no longer byte-for-byte originals. To use commands, replace the placeholder with the appropriate Windows or Git Bash home path and adjust path separators. The baseline source patch is not redacted.

## Blind packet for the OMP Vibe test

Give this section and **only the `Baseline source patch` appendix** to the Vibe implementer until Vibe implementation and review are complete. That appendix is the same README input, not a MAY candidate result. Do not provide MAY results or other candidate appendices. Use a fresh disposable clone at commit `ebdb130c05809c6298bb5618d9124fe2395c93e1` and apply the baseline patch. Do not use the MAY candidate or its history. Follow AGENTS.md. Do not use the MAY workflow, change host models/accounts/configuration, install dependencies or skills, commit, push, create a new Git worktree, or touch other data, processes, or sessions. Use Git Bash on Windows and disposable fixtures. `TMPDIR`, `TEMP`, and `TMP` must point to an empty root owned by the run before running the session script.

### Task

When starting a new MAY session, ensure the operation creates only its own marked folder and does not automatically remove or modify other marked sessions, regardless of age. An explicitly invoked `sweep` remains a separate recovery operation with the existing age, ownership, and process guards. Preserve `start`, `stop`, `track`, exit codes, and valid Windows Git Bash paths. Update relevant regressions, documentation, and changelog.

### Acceptance

1. `start` succeeds, prints one marked path, and preserves the old session fixture and its evidence byte-for-byte, including when no PID is recorded.
2. Explicit `sweep` removes an eligible old fixture only when invoked, while preserving young sessions and live-process fixtures under the existing guards.
3. `stop` and `track` on the correct session, quoted Windows Git Bash paths, and external data boundaries remain intact.
4. A meaningful regression fails before implementation; source, tests, documentation, candidate identity, and actual output are available to an independent reviewer before final QA.

References: `skills/may/scripts/may-session.sh`, `tests/session.test.ts`, `skills/may/references/runtime.md`, and `CHANGELOG.md`. Record commands, targets, exits, output, candidate identity, roles actually started/completed/failed, review results, time, tokens, and cost when available. Run a disposable smoke test and final QA after review. Failed or unrun results are not PASS.

---

## Blind boundary: MAY results and appendices

### Environment and measurement

- One task, one MAY run; insufficient to measure statistical reliability or conclude superiority. Vibe results for this task follow the MAY appendices.
- OMP `18.18.0`, Node `v26.13.0`, Git Bash `5.2.37(1)` on Windows x64. The user stated that Vibe was inactive. Skill `may` 0.2.0 was used; default model/account remained unchanged, without bypass or auto-approval.
- Source HEAD `ebdb130c05809c6298bb5618d9124fe2395c93e1`, plus the user's README changes. README SHA-256 at the start of the run was `b94dfa65b66dd013de8c26a78013853d09b41f17a251d5411d0811ca4b33115e`; the baseline patch is in the appendix. The source repository root did not receive candidate changes.
- Implementer `MaySafetyImplementer` completed in 2m04s, independent reviewer `SafetyReviewer` in 1m02s, and QA `SafetyQA` in 6m48s. All three actually started and completed. Review was accepted with no open findings; there was no repair round. These are worker durations, not end-to-end time. Workers reported model `openai-codex/gpt-6.1-terra`; reasoning levels were not recorded. Total tokens, cost, CPU/memory, and end-to-end time were unavailable. User interventions after the run request: 0.
- Candidate HEAD remained at the baseline; the SHA-256 manifest of 48 tracked files `22e13e03d45d6033dcca629ef88046b6a7e200a65792defbe2ed6195284eacd6` was verified before and after QA with 0 mismatches. The changed README was baseline input, not an implementation delta. The reviewer reported that `sha256sum -c` produced mismatches on Windows; identity verification used independent binary SHA-256 comparisons instead.

### Results and limitations

| Criterion | Evidence | Status |
|---|---|---|
| Start preserves other sessions | Red regression exit 1 before change, focused exit 0; smoke fixture retained old evidence | PASS on disposable fixture |
| Explicit sweep and guards | Session tests 13/13 passed; smoke sweep removed eligible old fixture | PASS on disposable fixture |
| Stop/track and Windows paths | Session tests 13/13; implementer smoke tracked an owned PID then stopped the exact session | PASS in this environment |
| Review and QA | Independent review accepted; three verifier checks passed | PASS for identified candidate |
| Comprehensive host safety | Only recorded sessions/processes inspected; no global evidence | Not claimed |

The initial regression `node --test --test-name-pattern="start preserves old marked sessions" tests/session.test.ts` exited 1 because the old session disappeared. Focused `node --test --test-name-pattern="start|sweep|stop removes|stop --keep|stop rejects" tests/session.test.ts` exited 0, 7/7. The first smoke attempt failed before starting a session due to `TMPDIR: unbound variable`; the attempt after correcting the smoke command succeeded. Both logs are included; the initial failure is retained. QA capture recorded two temporary `EPERM` reads and then reported capturing all three logs; the archived logs contain the complete summaries.

### Final QA of the accepted candidate

Installed MAY 0.2.0 verifier through Git Bash, `--timeout 900 --show-output`, started `2026-11-07T19:54:49Z` and ended `2026-11-07T19:59:51Z`; exit 0. AC1 13/13, AC2 57/57, AC3 `Repository checks passed`. Independent smoke on a disposable root: `start` exit 0 and old session evidence remained; `sweep --max-age-hours 24` exit 0 removed the old fixture; `stop --keep` and `stop` both exited 0. No real browser or production service was used.

```text
MAY VERIFY
revision ebdb130c05809c6298bb5618d9124fe2395c93e1 tree 53195b9218395a9885b860ec519dee40eaf23cc3
AC1  PASS  exit=0  node --test tests/session.test.ts
AC2  PASS  exit=0  npm test
AC3  PASS  exit=0  npm run check
RESULT PASS 3/3 passed
```

#### Actual invocation

QA used executable `C:/Program Files/Git/bin/bash.exe` with `-lc`, cwd `<USER_HOME>/AppData/Local/Temp/may-bench-root-MpzFBc/may-E8IlSq/candidate`, and the following shell arguments:

```bash
root="<USER_HOME>/AppData/Local/Temp/may-bench-root-MpzFBc/may-E8IlSq/qa-root-kMAEq9"; out="$root/may-5s1zma"; export TMPDIR="$root" TEMP="$root" TMP="$root"; node "$out/fingerprint.cjs" > "$out/fingerprint-before.log" 2>&1; printf "%s\n" "$?" > "$out/fingerprint-before.exit"; node "$out/capture.cjs" "$(cygpath -w "$root")" "$(cygpath -w "$out")" > "$out/capture.log" 2>&1 & monitor=$!; date -u +%FT%TZ > "$out/verifier-start.txt"; bash "<USER_HOME>/.omp/plugins/cache/plugins/may___may___0.2.0/skills/may/scripts/may-verify.sh" --timeout 900 --check "AC1=node --test tests/session.test.ts" --check "AC2=npm test" --check "AC3=npm run check" --show-output > "$out/verifier.log" 2>&1; code=$?; date -u +%FT%TZ > "$out/verifier-end.txt"; printf "%s\n" "$code" > "$out/verifier.exit"; touch "$out/capture-stop"; wait "$monitor"; printf "%s\n" "$?" > "$out/capture.exit"; node "$out/fingerprint.cjs" > "$out/fingerprint-after.log" 2>&1; printf "%s\n" "$?" > "$out/fingerprint-after.exit"; printf "verifier_exit=%s\n" "$code"; cat "$out/fingerprint-before.log" "$out/fingerprint-after.log" "$out/capture.log" "$out/verifier.log"
```

The temporary scripts `fingerprint.cjs` and `capture.cjs` were not archived; because the session has been deleted, this complete capture invocation cannot be reproduced from the report alone. The verifier table and captured output are archived below.

QA smoke used the same executable and cwd with the shell arguments:

```bash
out="<USER_HOME>/AppData/Local/Temp/may-bench-root-MpzFBc/may-E8IlSq/qa-root-kMAEq9/may-5s1zma"; root="$(mktemp -d "$out/smoke-root-XXXXXX")"; export TMPDIR="$root" TEMP="$root" TMP="$root"; script="<USER_HOME>/AppData/Local/Temp/may-bench-root-MpzFBc/may-E8IlSq/candidate/skills/may/scripts/may-session.sh"; { printf "root=%s\n" "$root"; mkdir "$root/may-old-fixture"; printf "MAY session\n" > "$root/may-old-fixture/.may-session"; printf "evidence preserved\n" > "$root/may-old-fixture/evidence"; touch -d "48 hours ago" "$root/may-old-fixture"; printf "start command: bash %s start\n" "$script"; created="$(bash "$script" start)"; rc=$?; printf "start_exit=%s created=%s\n" "$rc" "$created"; if [ -f "$root/may-old-fixture/evidence" ]; then printf "old_evidence_survives=yes content="; cat "$root/may-old-fixture/evidence"; else printf "old_evidence_survives=no\n"; fi; printf "sweep command: bash %s sweep --max-age-hours 24\n" "$script"; bash "$script" sweep --max-age-hours 24; printf "sweep_exit=%s\n" "$?"; if [ -e "$root/may-old-fixture" ]; then printf "old_fixture_removed=no\n"; else printf "old_fixture_removed=yes\n"; fi; bash "$script" stop "$created" --keep; printf "stop_keep_exit=%s\n" "$?"; bash "$script" stop "$created"; printf "stop_exit=%s\n" "$?"; if [ -e "$created" ]; then printf "created_session_removed=no\n"; else printf "created_session_removed=yes\n"; fi; } > "$out/smoke.log" 2>&1; cat "$out/smoke.log"
```

The first implementer smoke and retry used Git Bash with `-c`, the tool's default cwd, and a 60-second timeout. Temporary paths are historical and have been deleted.

```bash
"C:/Program Files/Git/bin/bash.exe" -c 'set -u; root=/tmp/may-bench-root-MpzFBc; session="$root/may-E8IlSq"; cd "$session/candidate"; { date -u; printf "command: isolated Git Bash start; track owned sleep; stop --keep; stop\n"; mkdir "$session/smoke temp"; export TMPDIR="$session/smoke temp" TEMP="$TMPDIR" TMP="$TMPDIR"; dir=$(bash skills/may/scripts/may-session.sh start); code=$?; printf "start exit=%s path=%s\n" "$code" "$dir"; [ "$code" -eq 0 ] || exit "$code"; sleep 120 & pid=$!; printf "owned_pid=%s\n" "$pid"; bash skills/may/scripts/may-session.sh track "$dir" "$pid"; code=$?; printf "track exit=%s record=" "$code"; cat "$dir/pids"; [ "$code" -eq 0 ] || exit "$code"; bash skills/may/scripts/may-session.sh stop "$dir" --keep; code=$?; printf "stop_keep exit=%s\n" "$code"; [ "$code" -eq 0 ] || exit "$code"; wait "$pid"; printf "owned_process_wait_exit=%s\n" "$?"; bash skills/may/scripts/may-session.sh stop "$dir"; code=$?; printf "stop exit=%s\n" "$code"; [ "$code" -eq 0 ] || exit "$code"; [ ! -e "$dir" ]; printf "folder_absent_exit=%s\n" "$?"; } > "$session/smoke.log" 2>&1; code=$?; cat "$session/smoke.log"; printf "smoke_log_exit=%s\n" "$code"'
"C:/Program Files/Git/bin/bash.exe" -c 'root=/tmp/may-bench-root-MpzFBc; session="$root/may-E8IlSq"; cd "$session/candidate"; ( date -u; printf "command: isolated Git Bash start; track owned sleep; stop --keep; stop\n"; export TMPDIR="$session/smoke temp"; export TEMP="$TMPDIR" TMP="$TMPDIR"; dir=$(bash skills/may/scripts/may-session.sh start); code=$?; printf "start exit=%s path=%s\n" "$code" "$dir"; [ "$code" -eq 0 ] || exit "$code"; sleep 120 & pid=$!; printf "owned_pid=%s\n" "$pid"; bash skills/may/scripts/may-session.sh track "$dir" "$pid"; code=$?; printf "track exit=%s record=" "$code"; cat "$dir/pids"; [ "$code" -eq 0 ] || exit "$code"; bash skills/may/scripts/may-session.sh stop "$dir" --keep; code=$?; printf "stop_keep exit=%s\n" "$code"; [ "$code" -eq 0 ] || exit "$code"; wait "$pid"; printf "owned_process_wait_exit=%s\n" "$?"; bash skills/may/scripts/may-session.sh stop "$dir"; code=$?; printf "stop exit=%s\n" "$code"; [ "$code" -eq 0 ] || exit "$code"; [ ! -e "$dir" ]; printf "folder_absent_exit=%s\n" "$?"; ) > "$session/smoke-retry.log" 2>&1; code=$?; cat "$session/smoke-retry.log"; printf "smoke_exit=%s\n" "$code"'
```

The first invocation exited 127; the retry exited 0. Other inherited process environment was not recorded and has not been reconstructed.

### Artifacts and cleanup

Historical source session: `<USER_HOME>/AppData/Local/Temp/may-bench-root-MpzFBc/may-E8IlSq`. Output, patches, and fingerprints are archived below. After inspection, `may-session.sh stop` on QA session `qa-root-kMAEq9/may-5s1zma` exited 0; `stop` on parent session `may-E8IlSq` followed by `rmdir` of the run-owned root also exited 0. This does not prove cleanup of other processes or folders. The candidate was not applied to the main working tree; the candidate patch is in the appendix. This file contains local paths and source README changes; inspect before publication.

### Evidence appendices

<details>
<summary>Baseline source patch</summary>

````diff
diff --git a/README.md b/README.md
index 0811aeb..e3de112 100644
--- a/README.md
+++ b/README.md
@@ -24,7 +24,11 @@ Spawning a subagent answers who can do a task. MAY adds a shared contract for wh
 | Acceptance evidence | The caller decides what results establish completion | Exact criterion commands, current-candidate evidence, explicit failures and blocked checks |
 | Temporary work | Process and artifact handling depend on the tools and caller | Marked OS-temp sessions, retained failure diagnostics, exact-session cleanup |
 
-A native workflow can implement these same patterns. MAY packages the conventions; advisory skills do not automatically enforce them. There are no published comparative token, time, or quality benchmarks here, so this table compares responsibilities, not measured superiority.
+A native workflow can implement these same patterns. MAY packages the conventions; advisory skills do not automatically enforce them.
+
+### Exploratory benchmark
+
+One local Windows case study compared OMP Vibe with MAY 0.2.0 on the same E2E-runner task. The Vibe candidate did not receive final review acceptance; the MAY candidate passed focused E2E tests and review, but its full test suite failed. The runs differed in test coverage and execution conditions, so they do not establish that either workflow is better or faster. Total token use and cost were not available.
 
 ## Install
 
@@ -69,9 +73,9 @@ pi update git:github.com/Rakhulsr/MAY
 
 Pinned Git tags or commits remain pinned. `pi update --extensions` updates all installed packages. For Claude Code, `claude plugin update may@may` updates the plugin; restart Claude Code afterwards. Update the marketplace separately when needed with `claude plugin marketplace update may`.
 
-OMP's plugin CLI exposes `omp plugin upgrade` and `--dry-run`; check `omp plugin --help` and your installed plugin identity before use. Codex's `codex plugin marketplace upgrade may` refreshes the marketplace snapshot, but does not by itself establish that an already-installed plugin has updated. The installed-plugin upgrade path for OMP and Codex has not been verified here; do not assume a marketplace refresh upgrades the installed skill. Check the harness version and plugin documentation for the applicable procedure.
+OMP's plugin CLI exposes `omp plugin upgrade` and `--dry-run`. An upgrade from MAY 0.1.0 to 0.2.0 was observed with OMP 18.18.0 in the local case study; that observation does not establish upgrade behavior for other versions. Codex's `codex plugin marketplace upgrade may` refreshes the marketplace snapshot, but does not by itself establish that an already-installed plugin has updated. Check the harness version and plugin documentation for the applicable procedure.
 
-**Breaking upgrade:** the canonical entry skill was renamed from `using-may` to `may`; there is no compatibility alias. Update prompts and references from `using-may` to `may`, and use the installed `may/SKILL.md` (its `skills/may/SKILL.md` path in this package) instead of the old installed `using-may/SKILL.md`. Remove any separately installed old skill through your harness's documented procedure to avoid stale discovery. Restart the harness or start a fresh session after updating, then verify the loaded skill and its location. Installation of this rename has not been tested. No automatic MAY update notification is promised.
+**Breaking upgrade:** the canonical entry skill was renamed from `using-may` to `may`; there is no compatibility alias. Update prompts and references from `using-may` to `may`, and use the installed `may/SKILL.md` (its `skills/may/SKILL.md` path in this package) instead of the old installed `using-may/SKILL.md`. Remove any separately installed old skill through your harness's documented procedure to avoid stale discovery. Restart the harness or start a fresh session after updating, then verify the loaded skill and its location. A fresh OMP 18.18.0 session loaded the `may` entry skill from the 0.2.0 plugin; this does not establish installation discovery for every skill or harness. No automatic MAY update notification is promised.
 
 ## Start a task
 
````
</details>

<details>
<summary>Candidate patch (includes baseline README diff)</summary>

````diff
diff --git a/CHANGELOG.md b/CHANGELOG.md
index b2f45a4..dfc5f23 100644
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -5,6 +5,7 @@
 - Rename the canonical entry skill from `using-may` to `may`; update existing prompts and installed skill references. No compatibility alias is included.
 - Refine role-specific handoffs and coordinator routing, distinguish early risk checks from final QA, and require evidence for reported test results.
 - Add opt-in bounded verifier output for successful checks and document harness update limitations.
+- Starting a session no longer removes older marked sessions; stale-session cleanup remains an explicit `sweep` operation.
 - Workflow superiority, native installation of this renamed version, and full real-model workflow support remain unverified.
 
 ## 0.1.0 (unreleased)
diff --git a/README.md b/README.md
index 0811aeb..e3de112 100644
--- a/README.md
+++ b/README.md
@@ -24,7 +24,11 @@ Spawning a subagent answers who can do a task. MAY adds a shared contract for wh
 | Acceptance evidence | The caller decides what results establish completion | Exact criterion commands, current-candidate evidence, explicit failures and blocked checks |
 | Temporary work | Process and artifact handling depend on the tools and caller | Marked OS-temp sessions, retained failure diagnostics, exact-session cleanup |
 
-A native workflow can implement these same patterns. MAY packages the conventions; advisory skills do not automatically enforce them. There are no published comparative token, time, or quality benchmarks here, so this table compares responsibilities, not measured superiority.
+A native workflow can implement these same patterns. MAY packages the conventions; advisory skills do not automatically enforce them.
+
+### Exploratory benchmark
+
+One local Windows case study compared OMP Vibe with MAY 0.2.0 on the same E2E-runner task. The Vibe candidate did not receive final review acceptance; the MAY candidate passed focused E2E tests and review, but its full test suite failed. The runs differed in test coverage and execution conditions, so they do not establish that either workflow is better or faster. Total token use and cost were not available.
 
 ## Install
 
@@ -69,9 +73,9 @@ pi update git:github.com/Rakhulsr/MAY
 
 Pinned Git tags or commits remain pinned. `pi update --extensions` updates all installed packages. For Claude Code, `claude plugin update may@may` updates the plugin; restart Claude Code afterwards. Update the marketplace separately when needed with `claude plugin marketplace update may`.
 
-OMP's plugin CLI exposes `omp plugin upgrade` and `--dry-run`; check `omp plugin --help` and your installed plugin identity before use. Codex's `codex plugin marketplace upgrade may` refreshes the marketplace snapshot, but does not by itself establish that an already-installed plugin has updated. The installed-plugin upgrade path for OMP and Codex has not been verified here; do not assume a marketplace refresh upgrades the installed skill. Check the harness version and plugin documentation for the applicable procedure.
+OMP's plugin CLI exposes `omp plugin upgrade` and `--dry-run`. An upgrade from MAY 0.1.0 to 0.2.0 was observed with OMP 18.18.0 in the local case study; that observation does not establish upgrade behavior for other versions. Codex's `codex plugin marketplace upgrade may` refreshes the marketplace snapshot, but does not by itself establish that an already-installed plugin has updated. Check the harness version and plugin documentation for the applicable procedure.
 
-**Breaking upgrade:** the canonical entry skill was renamed from `using-may` to `may`; there is no compatibility alias. Update prompts and references from `using-may` to `may`, and use the installed `may/SKILL.md` (its `skills/may/SKILL.md` path in this package) instead of the old installed `using-may/SKILL.md`. Remove any separately installed old skill through your harness's documented procedure to avoid stale discovery. Restart the harness or start a fresh session after updating, then verify the loaded skill and its location. Installation of this rename has not been tested. No automatic MAY update notification is promised.
+**Breaking upgrade:** the canonical entry skill was renamed from `using-may` to `may`; there is no compatibility alias. Update prompts and references from `using-may` to `may`, and use the installed `may/SKILL.md` (its `skills/may/SKILL.md` path in this package) instead of the old installed `using-may/SKILL.md`. Remove any separately installed old skill through your harness's documented procedure to avoid stale discovery. Restart the harness or start a fresh session after updating, then verify the loaded skill and its location. A fresh OMP 18.18.0 session loaded the `may` entry skill from the 0.2.0 plugin; this does not establish installation discovery for every skill or harness. No automatic MAY update notification is promised.
 
 ## Start a task
 
diff --git a/skills/may/references/runtime.md b/skills/may/references/runtime.md
index 429be4d..0ea3a4e 100644
--- a/skills/may/references/runtime.md
+++ b/skills/may/references/runtime.md
@@ -111,4 +111,4 @@ Create temporary work only with `may-session.sh start` and record its absolute p
 
 Attempt exact-session cleanup on failure or cancellation. An EXIT trap cannot guarantee recovery after a forced kill. A later call or fresh session can stop the recorded path without relying on lost shell variables. Resolve `MAY_SKILL_DIR` again and use the same OS-temp root if environment overrides were used to create the session. Report only observed cleanup and disclose any remaining owned path or process.
 
-`sweep` is separate stale-folder recovery for marked sessions at least 24 hours old with no live recorded process/group; `start` also runs that default sweep. It is not proof that an interrupted run cleaned up. There is no MAY workflow-state folder in the project or home directory, and a fresh session does not resume stored workflow state.
+`start` creates only its own marked folder and does not sweep existing sessions. The explicitly invoked `sweep` command is separate stale-folder recovery for marked sessions at least 24 hours old with no live recorded process/group; it retains the existing ownership and process-safety guards. It is not proof that an interrupted run cleaned up. There is no MAY workflow-state folder in the project or home directory, and a fresh session does not resume stored workflow state.
diff --git a/skills/may/scripts/may-session.sh b/skills/may/scripts/may-session.sh
index 5b60a81..03f23ad 100644
--- a/skills/may/scripts/may-session.sh
+++ b/skills/may/scripts/may-session.sh
@@ -178,7 +178,6 @@ if [ "${BASH_SOURCE[0]}" != "$0" ]; then return 0; fi
 case "${1:-}" in
  start)
   [ "$#" -eq 1 ] || { usage; exit 2; }
-  sweep >/dev/null
   dir="$(mktemp -d "$tmp_root/may-XXXXXX")" || exit 1
   printf 'MAY session\n' > "$dir/.may-session"
   printf '%s\n' "$dir" ;;
diff --git a/tests/session.test.ts b/tests/session.test.ts
index b13b10f..1f3507d 100644
--- a/tests/session.test.ts
+++ b/tests/session.test.ts
@@ -26,6 +26,17 @@ test("start creates a marked temp directory and prints only its path", (t) => {
  assert.equal(spawnSync(bash, ["-lc", 'test -e "$1"', "sh", `${dir}/.may-session`], { timeout: 5000 }).status, 0);
  assert.equal(out.stdout.trim().split(/\r?\n/).length, 1);
 });
+test("start preserves old marked sessions and their evidence without recorded processes", (t) => {
+ const tmp = tempDir(t, "may tmp "); const old = session(tmp, "may-old");
+ const evidence = join(old, "evidence"); mkdirSync(evidence);
+ const contents = Buffer.from([0, 1, 127, 128, 255]); writeFileSync(join(evidence, "capture"), contents);
+ const marker = readFileSync(join(old, ".may-session")); const age = new Date(Date.now() - 25 * 3600000); utimesSync(old, age, age);
+ const out = run(tmp, "start"); assert.equal(out.status, 0, out.stderr);
+ assert.equal(out.stdout.trim().split(/\r?\n/).length, 1);
+ assert.equal(existsSync(old), true);
+ assert.deepEqual(readFileSync(join(old, ".may-session")), marker);
+ assert.deepEqual(readFileSync(join(evidence, "capture")), contents);
+});
 test("stop removes a validated session folder", (t) => { const tmp = tempDir(t, "may tmp "); const dir = session(tmp); const out = run(tmp, "stop", dir); assert.equal(out.status, 0, out.stderr); assert.equal(existsSync(dir), false); });
 test("stop --keep leaves the folder and prints its path", (t) => { const tmp = tempDir(t, "may tmp "); const dir = session(tmp); const out = run(tmp, "stop", dir, "--keep"); assert.equal(out.status, 0, out.stderr); assert.equal(existsSync(dir), true); assert.equal(out.stdout.trim(), dir); });
 test("stop rejects unsafe or unmarked targets without deleting them", (t) => {
````
</details>

<details>
<summary>Tracked-file SHA-256 manifest</summary>

````text
7c77b82cca90bea594d405d2f06cc01b08286e580e406d8486e7878b04ab9591 *.agents/plugins/marketplace.json
a9bdb0a13b70ddb9aec6ea52f8810d91b631a1a3d29c8e657d376f116aecde24 *.claude-plugin/marketplace.json
e2b5aad15cf9ed0a4356840cef9356610171b6c2f6695fd8d6e4d5005bdeda31 *.claude-plugin/plugin.json
e45e48828d9fc708c5198ed8723136b7bba0d4b7004c3c3ac0b6fd30a2c74abd *.codex-plugin/plugin.json
0a38370224c134075aa5a1850ef9af90d4f090e2917661983e5f42d1deb12639 *.gitattributes
ecc99e14c9cee6bb218ff91dbcfbe5a31a4de6d0357c9eee76404ae1f08b5a88 *.gitignore
a9bdb0a13b70ddb9aec6ea52f8810d91b631a1a3d29c8e657d376f116aecde24 *.omp-plugin/marketplace.json
0ab06dd721e28d4a82a2ddae5a78a49009d5ed27629522d6f9638541a5b1805e *.version-bump.json
35ad95bd8b4efd7cb9a2fc6cfa0f7507bbf22339e334786077dac00e61922db5 *AGENTS.md
a0a465bdfe476e28920876486d4ec9091180ed101a94a8406a60334531b3deda *assets/diagrams/runtime-boundary.svg
d45df4dc84d6751993c286b1544b78828d686ab19ff9404c4242ddff0096fe8e *assets/diagrams/workflow.svg
7f984675997805a2584dde36104d52f6a3450c808b5b566d76273c511515270a *assets/logo/Pixel MAY.png
5e2cfdcdff0ed37d0e51d80a74b6b23bddcebaa4b7640cd6748c1aa38f85cf48 *CHANGELOG.md
f6390dfd0976eaeb2c936a80a39ddc92e74d261f1619805277cd822f928080b0 *CLAUDE.md
4752ccf4034081d147e5a33cf7f8b3740965b5ebfe584b2bc7dfacdb6ba941f3 *CONTRIBUTING.md
6cc1b73b1ea34a7c08e0e5d8391d618d9880ba6a7e0acb713567f7ea0ba68d9d *GEMINI.md
71d6be4dcfb8e15b37bd18ead78757e75b0101e96d84cf03980fc7314dc1693b *LICENSE
2ad5493badf193359d98d7f6eac52c0b08f82e677f8bdfc29dfaf85a4c35f78b *package.json
29e6bd805e79924bf56cb50df52666c81309e526cc1950baa7bebd39f49f7699 *package-lock.json
b94dfa65b66dd013de8c26a78013853d09b41f17a251d5411d0811ca4b33115e *README.md
e872e254533971e531826019178a147e33819352438317a3189a6d9f1130bc65 *scripts/bump-version.sh
faa56515b35bdaae97e3f749abfc001be6a34a62ad6a1b63fc6945f6d803769a *scripts/check-repo.sh
4dbf31bc38f90eb5943001306f158d36a7b4a938644c8a2e696da202f106ca5b *scripts/test-harness.sh
cf9d3308d17c817e7160a7de8a78cf788702bc9a766bb1395068b30fbb335d00 *SECURITY.md
2c0eed682557ca42642829f3a7b114c6d5d1ae96fd7ed4181e782e6aa478230f *skills/may/references/claude-code-tools.md
9e4c71e4d385841bb5874f55524a5497e673e651567838b361122bd90d62df63 *skills/may/references/codex-tools.md
0b205ebe9e557690d9a5a28a7e2d4f83ddc60ea84f13ca6d69f7b3dffc430936 *skills/may/references/examples.md
5d0c371f7eb06b8501f476ea9010b92ce2b6b90489ec6ed084f125097b450b33 *skills/may/references/oh-my-pi-tools.md
581c548bd3af3c1f3f5835a508277387015e8a155de0d2f7249a55bea94cd3ed *skills/may/references/orchestration.md
bfbe021cddc34361f9a60cbbc04053dd0a915da071280fdadba301bb3a0a572a *skills/may/references/pi-tools.md
eb82b5439009356f49478e2b56cd08053030bddfa8b174b4b6e3d48f7baec073 *skills/may/references/runtime.md
61b33153606678f683db6cc1b8ba22a00324eec0cef1d8d645fd9193192b827f *skills/may/scripts/may-e2e.sh
8ad4f9036cb0a192765c7284fc49b8b0af1b93a39131e07173cc4e5edbf1721e *skills/may/scripts/may-session.sh
2bc2df862fbbd11c437524940d73b97ad4073526be6a41838290917faa6f86a9 *skills/may/scripts/may-verify.sh
0acab9029d8422e0a314fdc1e13c266b398a1bdeab17281a046e87036dca80ad *skills/may/SKILL.md
c816f5e1174698703692a3104976035cee8ba58ffe957c0093268e33745cf7a9 *skills/may-backend/SKILL.md
13ed0f18a4fa49111d118986fd9b804e80e86b1489d8f307eb1e1f429f3f530b *skills/may-devops/SKILL.md
1989b8714b59d17134bf9ec84cc0ea6a48381c776958a8f7e7bc4412e3a059bd *skills/may-frontend/SKILL.md
e01e1da4db9f4e3eb09604f0906818a228dec44c51c08c0f8be6c3936a87ce05 *skills/may-pm/SKILL.md
af0f2bf3439278a3b75c06b036fcdb26ad902ade89da969d2ccfebd7abf036df *skills/may-qa/SKILL.md
c49096b2829ec1f787e42c1ae33c2559fe123c1b9886d6d6c14983389d8224d8 *skills/may-security/SKILL.md
2a0c116416168bc390984c316734b1d530e1445a9d68dc734145ff6970a07f42 *skills/may-tech-lead/SKILL.md
71a3610dead7db0c613769b203d3f800cb181f59c503f5647fde6ec105a0eb29 *skills/may-ui-ux/SKILL.md
341af283e51bbbd6ca145fd37c17f4eb26c05eb04f5117b1c8901bb8d521c421 *tests/e2e.test.ts
15dc06846780b8a09c7f556db35db708622062a35a379f6804b6eeb32d4c3c33 *tests/helpers.ts
8de45006b84fc49e0197a9a7ea501ba35e76d1d926f642c338e890044a712c8c *tests/scripts.test.ts
933ccc12249dc73d1558a74d9fa0f21306ead3cb7d08ae99465f7aa675045272 *tests/session.test.ts
37edf75cca09cfddeac9e80dcd610d20c7ba7bc3f1fcdb15622f2d6c7f146707 *tests/verify.test.ts
````
</details>

<details>
<summary>Regression red</summary>

````text
Sat, Nov  7, 2026  7:50:38 PM
command: node --test --test-name-pattern="start preserves old marked sessions" tests/session.test.ts
✖ start preserves old marked sessions and their evidence without recorded processes (560.1092ms)
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 823.8035

✖ failing tests:

test at tests\session.test.ts:29:1
✖ start preserves old marked sessions and their evidence without recorded processes (560.1092ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  
  false !== true
  
      at TestContext.<anonymous> (file:///<USER_HOME>/AppData/Local/Temp/may-bench-root-MpzFBc/may-E8IlSq/candidate/tests/session.test.ts:36:9)
      at Test.runInAsyncScope (node:async_hooks:226:14)
      at Test.run (node:internal/test_runner/test:1402:25)
      at Test.start (node:internal/test_runner/test:1262:17)
      at startSubtestAfterBootstrap (node:internal/test_runner/harness:387:17) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: false,
    expected: true,
    operator: 'strictEqual',
    diff: 'simple'
  }
exit=1
````
</details>

<details>
<summary>Focused verification</summary>

````text
Sat, Nov  7, 2026  7:51:01 PM
command: node --test --test-name-pattern="start|sweep|stop removes|stop --keep|stop rejects" tests/session.test.ts
✔ start creates a marked temp directory and prints only its path (1405.7582ms)
✔ start preserves old marked sessions and their evidence without recorded processes (176.7713ms)
✔ stop removes a validated session folder (377.2447ms)
✔ stop --keep leaves the folder and prints its path (308.1363ms)
✔ stop rejects unsafe or unmarked targets without deleting them (1196.6728ms)
✔ sweep removes only old marked sessions and preserves young sessions (607.0926ms)
✔ sweep leaves a marked session while a tracked process is alive (2285.6603ms)
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6508.3386
exit=0
````
</details>

<details>
<summary>Smoke first attempt</summary>

````text
Sat, Nov  7, 2026  7:51:20 PM
command: isolated Git Bash start; track owned sleep; stop --keep; stop
/usr/bin/bash: line 1: TMPDIR: unbound variable
````
</details>

<details>
<summary>Smoke corrected command</summary>

````text
Sat, Nov  7, 2026  7:51:34 PM
command: isolated Git Bash start; track owned sleep; stop --keep; stop
start exit=0 path=/tmp/may-bench-root-MpzFBc/may-E8IlSq/smoke temp/may-OAkTND
owned_pid=1784
track exit=0 record=1784 278801388 1777
/tmp/may-bench-root-MpzFBc/may-E8IlSq/smoke temp/may-OAkTND
stop_keep exit=0
owned_process_wait_exit=0
stop exit=0
folder_absent_exit=0
````
</details>

<details>
<summary>QA smoke</summary>

````text
root=<USER_HOME>/AppData/Local/Temp/may-bench-root-MpzFBc/may-E8IlSq/qa-root-kMAEq9/may-5s1zma/smoke-root-LS8GPO
start command: bash <USER_HOME>/AppData/Local/Temp/may-bench-root-MpzFBc/may-E8IlSq/candidate/skills/may/scripts/may-session.sh start
start_exit=0 created=<USER_HOME>/AppData/Local/Temp/may-bench-root-MpzFBc/may-E8IlSq/qa-root-kMAEq9/may-5s1zma/smoke-root-LS8GPO/may-NRu5Vu
old_evidence_survives=yes content=evidence preserved
sweep command: bash <USER_HOME>/AppData/Local/Temp/may-bench-root-MpzFBc/may-E8IlSq/candidate/skills/may/scripts/may-session.sh sweep --max-age-hours 24
<USER_HOME>/AppData/Local/Temp/may-bench-root-MpzFBc/may-E8IlSq/qa-root-kMAEq9/may-5s1zma/smoke-root-LS8GPO/may-old-fixture
sweep_exit=0
old_fixture_removed=yes
<USER_HOME>/AppData/Local/Temp/may-bench-root-MpzFBc/may-E8IlSq/qa-root-kMAEq9/may-5s1zma/smoke-root-LS8GPO/may-NRu5Vu
stop_keep_exit=0
stop_exit=0
created_session_removed=yes
````
</details>

<details>
<summary>AC1 full output</summary>

````text
✔ start creates a marked temp directory and prints only its path (731.4694ms)
✔ start preserves old marked sessions and their evidence without recorded processes (182.1617ms)
✔ stop removes a validated session folder (398.3291ms)
✔ stop --keep leaves the folder and prints its path (268.4648ms)
✔ stop rejects unsafe or unmarked targets without deleting them (1706.9916ms)
✔ sweep removes only old marked sessions and preserves young sessions (756.5701ms)
✔ sweep leaves a marked session while a tracked process is alive (3100.7654ms)
✔ stop terminates a tracked process and its descendant before deleting recovery data (3488.7135ms)
✔ failed process termination retains the session and recorded PID (3002.6132ms)
✔ ordinary and trailing-slash symlink aliases cannot escape the temp root (413.6966ms)
✔ a recorded process identity mismatch never kills the current PID owner (2480.7009ms)
✔ owned group cleanup includes TERM-ignoring child with live leader (6162.0467ms)
✔ owned group cleanup includes TERM-ignoring child with exited leader (6939.6966ms)
ℹ tests 13
ℹ suites 0
ℹ pass 13
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 29934.5693
````
</details>

<details>
<summary>AC2 full output</summary>

````text
npm notice run may@0.2.0 test
npm notice run node --test "tests/*.test.ts"
✔ unavailable Playwright returns 3 and never attempts installation (817.06ms)
✔ invalid session and remote URLs are rejected (1033.091ms)
✔ server stops and artifacts removed on PASS (12935.7992ms)
✔ server stops and artifacts retained on FAIL (11776.35ms)
✔ server cleanup after TERM (18889.9136ms)
✔ server cleanup after KILL (13570.5655ms)
✔ TERM during registration cannot launch the command after cleanup (6533.8861ms)
✔ the version check passes on this repo (469.964ms)
✔ bump-version changes every listed manifest (894.0567ms)
✔ bump-version refuses a malformed version and changes nothing (677.0045ms)
✔ the version check names a manifest that drifted (994.1771ms)
✔ check-repo passes on a clean copy (8365.8734ms)
✔ check-repo fails when a skill name does not match its folder (9290.4233ms)
✔ check-repo fails when a skill has no description (9801.9524ms)
✔ check-repo fails when docs would be published (10672.0504ms)
✔ check-repo rejects a public README.md dependency on local specifications (7279.1498ms)
✔ check-repo rejects a public AGENTS.md dependency on local specifications (7160.7149ms)
✔ check-repo fails on a manifest that is not valid JSON (7551.8894ms)
✔ test-harness rejects an unknown harness without installing anything (61.1141ms)
✔ the entry skill and every tool mapping ship with the plugin (1.458ms)
✔ the scripts keep LF endings, so Git Bash can run them after a Windows checkout (1.3641ms)
✔ check-repo rejects missing runtime scripts referenced by a skill reference (6632.5622ms)
✔ check-repo rejects resurrected engine directories (20538.5406ms)
✔ check-repo rejects obsolete storage references in publishable content (6720.6421ms)
✔ npm package selection includes public runtime and developer files but excludes personal data (4007.4235ms)
✔ start creates a marked temp directory and prints only its path (1257.2524ms)
✔ start preserves old marked sessions and their evidence without recorded processes (213.6436ms)
✔ stop removes a validated session folder (720.4714ms)
✔ stop --keep leaves the folder and prints its path (743.604ms)
✔ stop rejects unsafe or unmarked targets without deleting them (1799.9834ms)
✔ sweep removes only old marked sessions and preserves young sessions (865.4092ms)
✔ sweep leaves a marked session while a tracked process is alive (3962.6707ms)
✔ stop terminates a tracked process and its descendant before deleting recovery data (4955.4464ms)
✔ failed process termination retains the session and recorded PID (4731.9015ms)
✔ ordinary and trailing-slash symlink aliases cannot escape the temp root (337.9589ms)
✔ a recorded process identity mismatch never kills the current PID owner (4101.4921ms)
✔ owned group cleanup includes TERM-ignoring child with live leader (10066.8538ms)
✔ owned group cleanup includes TERM-ignoring child with exited leader (10156.0174ms)
✔ a genuine failing regression becomes PASS only after repairing the fixture (17856.7192ms)
✔ successful check output is available only when explicitly requested (37167.1077ms)
✔ all zero-test output forms are NO_TESTS (70366.6088ms)
✔ Go package summaries with and without tests pass in the same command (5854.692ms)
✔ cached Go coverage summaries count before packages without selected tests (4823.495ms)
✔ Go packages all lack test files remain NO_TESTS (6995.1278ms)
✔ Go package has no selected tests remain NO_TESTS (8513.4821ms)
✔ cached Go coverage package has no selected tests remain NO_TESTS (7126.2433ms)
✔ success-like log lines accompany empty Go packages remain NO_TESTS (6754.4179ms)
✔ a non-Go empty suite follows a successful Go package remain NO_TESTS (5783.2227ms)
✔ successful Go checks cannot supply tests for a different empty check (9553.8031ms)
✔ trivial checks never execute shell side effects (20502.1654ms)
✔ source edits during verification are CHANGED, including same status untracked content (6731.3762ms)
✔ timeout terminates check descendants and reports TIMEOUT (7675.1339ms)
✔ one identical command runs once and covers both IDs (5718.6581ms)
✔ outside git uses PASS? and never success exit (4955.3375ms)
✔ nested invocation detects changed untracked sibling content across the whole repository (6829.7067ms)
✔ failed timeout termination still returns TIMEOUT and retains process recovery (8534.1629ms)
✔ a parent deadline stays bounded when auxiliary registration runs past the timeout (8323.9077ms)
ℹ tests 57
ℹ suites 0
ℹ pass 57
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 250406.9385
````
</details>

<details>
<summary>AC3 full output</summary>

````text
npm notice run may@0.2.0 check
npm notice run bash scripts/check-repo.sh
Repository checks passed
````
</details>

<details>
<summary>MAY verifier output</summary>

````text
warning: in the working copy of 'README.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'README.md', LF will be replaced by CRLF the next time Git touches it
MAY VERIFY
revision ebdb130c05809c6298bb5618d9124fe2395c93e1 tree 53195b9218395a9885b860ec519dee40eaf23cc3
AC1  PASS  exit=0  node --test tests/session.test.ts
--- AC1 output tail
✔ start creates a marked temp directory and prints only its path (731.4694ms)
✔ start preserves old marked sessions and their evidence without recorded processes (182.1617ms)
✔ stop removes a validated session folder (398.3291ms)
✔ stop --keep leaves the folder and prints its path (268.4648ms)
✔ stop rejects unsafe or unmarked targets without deleting them (1706.9916ms)
✔ sweep removes only old marked sessions and preserves young sessions (756.5701ms)
✔ sweep leaves a marked session while a tracked process is alive (3100.7654ms)
✔ stop terminates a tracked process and its descendant before deleting recovery data (3488.7135ms)
✔ failed process termination retains the session and recorded PID (3002.6132ms)
✔ ordinary and trailing-slash symlink aliases cannot escape the temp root (413.6966ms)
✔ a recorded process identity mismatch never kills the current PID owner (2480.7009ms)
✔ owned group cleanup includes TERM-ignoring child with live leader (6162.0467ms)
✔ owned group cleanup includes TERM-ignoring child with exited leader (6939.6966ms)
ℹ tests 13
ℹ suites 0
ℹ pass 13
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 29934.5693
AC2  PASS  exit=0  npm test
--- AC2 output tail
✔ start creates a marked temp directory and prints only its path (1257.2524ms)
✔ start preserves old marked sessions and their evidence without recorded processes (213.6436ms)
✔ stop removes a validated session folder (720.4714ms)
✔ stop --keep leaves the folder and prints its path (743.604ms)
✔ stop rejects unsafe or unmarked targets without deleting them (1799.9834ms)
✔ sweep removes only old marked sessions and preserves young sessions (865.4092ms)
✔ sweep leaves a marked session while a tracked process is alive (3962.6707ms)
✔ stop terminates a tracked process and its descendant before deleting recovery data (4955.4464ms)
✔ failed process termination retains the session and recorded PID (4731.9015ms)
✔ ordinary and trailing-slash symlink aliases cannot escape the temp root (337.9589ms)
✔ a recorded process identity mismatch never kills the current PID owner (4101.4921ms)
✔ owned group cleanup includes TERM-ignoring child with live leader (10066.8538ms)
✔ owned group cleanup includes TERM-ignoring child with exited leader (10156.0174ms)
✔ a genuine failing regression becomes PASS only after repairing the fixture (17856.7192ms)
✔ successful check output is available only when explicitly requested (37167.1077ms)
✔ all zero-test output forms are NO_TESTS (70366.6088ms)
✔ Go package summaries with and without tests pass in the same command (5854.692ms)
✔ cached Go coverage summaries count before packages without selected tests (4823.495ms)
✔ Go packages all lack test files remain NO_TESTS (6995.1278ms)
✔ Go package has no selected tests remain NO_TESTS (8513.4821ms)
✔ cached Go coverage package has no selected tests remain NO_TESTS (7126.2433ms)
✔ success-like log lines accompany empty Go packages remain NO_TESTS (6754.4179ms)
✔ a non-Go empty suite follows a successful Go package remain NO_TESTS (5783.2227ms)
✔ successful Go checks cannot supply tests for a different empty check (9553.8031ms)
✔ trivial checks never execute shell side effects (20502.1654ms)
✔ source edits during verification are CHANGED, including same status untracked content (6731.3762ms)
✔ timeout terminates check descendants and reports TIMEOUT (7675.1339ms)
✔ one identical command runs once and covers both IDs (5718.6581ms)
✔ outside git uses PASS? and never success exit (4955.3375ms)
✔ nested invocation detects changed untracked sibling content across the whole repository (6829.7067ms)
✔ failed timeout termination still returns TIMEOUT and retains process recovery (8534.1629ms)
✔ a parent deadline stays bounded when auxiliary registration runs past the timeout (8323.9077ms)
ℹ tests 57
ℹ suites 0
ℹ pass 57
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 250406.9385
AC3  PASS  exit=0  npm run check
--- AC3 output tail
npm notice run may@0.2.0 check
npm notice run bash scripts/check-repo.sh
Repository checks passed
RESULT PASS 3/3 passed
````
</details>

<details>
<summary>Capture diagnostics</summary>

````text
Error: EPERM: operation not permitted, open '<USER_HOME>\AppData\Local\Temp\may-bench-root-MpzFBc\may-E8IlSq\qa-root-kMAEq9\may-RoGPuZ\0.log'
    at Object.openSync (node:fs:782:18)
    at Object.readFileSync (node:fs:628:35)
    at capture (<USER_HOME>\AppData\Local\Temp\may-bench-root-MpzFBc\may-E8IlSq\qa-root-kMAEq9\may-5s1zma\capture.cjs:3:220)
    at Timeout._onTimeout (<USER_HOME>\AppData\Local\Temp\may-bench-root-MpzFBc\may-E8IlSq\qa-root-kMAEq9\may-5s1zma\capture.cjs:4:28)
    at listOnTimeout (node:internal/timers:685:17)
    at process.processTimers (node:internal/timers:618:7) {
  errno: -4048,
  code: 'EPERM',
  syscall: 'open',
  path: '<USER_HOME>\\AppData\\Local\\Temp\\may-bench-root-MpzFBc\\may-E8IlSq\\qa-root-kMAEq9\\may-RoGPuZ\\0.log'
}
Error: EPERM: operation not permitted, open '<USER_HOME>\AppData\Local\Temp\may-bench-root-MpzFBc\may-E8IlSq\qa-root-kMAEq9\may-nb6yBx\2.log'
    at Object.openSync (node:fs:782:18)
    at Object.readFileSync (node:fs:628:35)
    at capture (<USER_HOME>\AppData\Local\Temp\may-bench-root-MpzFBc\may-E8IlSq\qa-root-kMAEq9\may-5s1zma\capture.cjs:3:220)
    at Timeout._onTimeout (<USER_HOME>\AppData\Local\Temp\may-bench-root-MpzFBc\may-E8IlSq\qa-root-kMAEq9\may-5s1zma\capture.cjs:4:28)
    at listOnTimeout (node:internal/timers:685:17)
    at process.processTimers (node:internal/timers:618:7) {
  errno: -4048,
  code: 'EPERM',
  syscall: 'open',
  path: '<USER_HOME>\\AppData\\Local\\Temp\\may-bench-root-MpzFBc\\may-E8IlSq\\qa-root-kMAEq9\\may-nb6yBx\\2.log'
}
captured=1,2,3
````
</details>

<details>
<summary>Fingerprint before QA</summary>

````text
manifest_sha256=22e13e03d45d6033dcca629ef88046b6a7e200a65792defbe2ed6195284eacd6 tracked=48 mismatches=0
HEAD=ebdb130c05809c6298bb5618d9124fe2395c93e1
STATUS_BEGIN
 M CHANGELOG.md
 M README.md
 M skills/may/references/runtime.md
 M skills/may/scripts/may-session.sh
 M tests/session.test.ts
STATUS_END
````
</details>

<details>
<summary>Fingerprint after QA</summary>

````text
manifest_sha256=22e13e03d45d6033dcca629ef88046b6a7e200a65792defbe2ed6195284eacd6 tracked=48 mismatches=0
HEAD=ebdb130c05809c6298bb5618d9124fe2395c93e1
STATUS_BEGIN
 M CHANGELOG.md
 M README.md
 M skills/may/references/runtime.md
 M skills/may/scripts/may-session.sh
 M tests/session.test.ts
STATUS_END
````
</details>

---

## Vibe results without the MAY workflow: session-safety task

The run used disposable candidate `<USER_HOME>/AppData/Local/Temp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/candidate`, HEAD `ebdb130c05809c6298bb5618d9124fe2395c93e1`. Baseline patch SHA-256 `f5768d126b76af519412c5e295305388c5e6ec3d328f895a328985edd2c4703f`, README SHA-256 `b94dfa65b66dd013de8c26a78013853d09b41f17a251d5411d0811ca4b33115e`. The `git diff --binary` SHA-256 was the same before and after QA: `7394ffa519136ae1b153ede06e63f814b7535fdce7720812a2ba06748c99759f`. This identifies the recorded diff, not comprehensive host safety. `task.patch` excludes the baseline README; `all-changes.patch` includes the README and task deltas.

The Vibe xhigh implementer finished in 4m38s; a fresh Vibe xhigh reviewer, independent of the implementer, finished in 1m15s and accepted the static review without findings. Vibe medium QA finished in 5m27s. There was no candidate repair round. The reported base model for both paths was `openai-codex/gpt-6.1-terra`; the implementer's provenance says the serving model could not be independently observed. The exact MAY reasoning level was not recorded. There were no user interventions after the Vibe request.

QA used Git Bash 5.2.37, Node v26.13.0 and npm 12.2.1 with isolated TMPDIR/TEMP/TMP. After review, `node --test tests/session.test.ts` exited 0, 13/13 (23.94s); `npm test` exited 0, 57/57 (204.68s); `npm run check` exited 0, `Repository checks passed`. Commands, targets, start and end times, output, and fingerprints are in `run-retry.log` below. QA smoke recorded identical fixture marker and payload hashes before and after `start` exit 0; `sweep --max-age-hours 24` exit 0 removed the eligible fixture, and `stop` exit 0 removed the created session. Tests cover young-session/live-process guards, stop/track and paths. The regression before the fix exited 1; implementer red and smoke logs are included. PASS applies to this candidate and these test conditions, not statistical superiority.

### Comparison for the current task

| Measure | MAY | Vibe without MAY workflow |
|---|---|---|
| Implementer, reviewer, QA (worker duration) | 2m04s, 1m02s, 6m48s | 4m38s xhigh, 1m15s xhigh, 5m27s medium |
| Review | Independent, accepted with no open findings | Fresh independent reviewer session, static review accepted without findings |
| Candidate repair after review | None | None |
| Candidate QA | 13/13, 57/57, check exit 0; MAY verifier | 13/13, 57/57, check exit 0; direct runner without MAY verifier |
| QA measurement | Verifier 302s by timestamps | Runner 238.51s per QA; different from worker duration |
| User interventions after request | 0 | 0 |
| Tokens, cost, end-to-end time | Unavailable | Unavailable |

The 302s and 238.51s figures do not support a speed claim: the MAY verifier adds overhead, while Vibe used neither the verifier nor the MAY workflow, so measurement conditions are not equivalent. Worker durations are not end-to-end. There was only one task and one pair of runs; order, cache, time, user and coordinator may contaminate the comparison. Reasoning levels differed or were unknown. There is no basis to conclude that either path is superior.

### Deviations and evidence limits

- The initial shell probe used `date /T` in Git Bash and failed; provenance records it without a state change. Initial setup produced `error: corrupt patch at line 29`; the `tee` pipeline hid the failure exit. The saved baseline patch was corrected with the missing final context line and applied; the checkout README was normalized from CRLF to LF to match the hash. `setup.log`, `baseline.log`, fingerprints and provenance are retained.
- One grep inadvertently displayed one line of `skills/may/SKILL.md`; the full skill file and MAY workflow were not loaded. QA did not use the MAY verifier. This is a blind deviation, not a claim of perfect isolation.
- Initial QA runner `run.log` exited 1 due to unbound `TMPDIR` before any test ran. After the runner was fixed, each final check ran once; this was not a rerun of a failed test. The archived script is the corrected runner; the initial log retains the error.
- Static review does not establish runtime behavior; QA results apply to the observed environment and fixtures. No claim is made for testing the entire host or all platforms. Unrecorded model, token, cost and end-to-end evidence was not reconstructed.
- Workers did not change the original project working tree; this report change is outside the candidate. QA used Git Bash with `TMPDIR`, `TEMP`, and `TMP` set to `<USER_HOME>/AppData/Local/Temp/vibe-session-benchmark-tCbHNiG4`, then ran `bash "$root/may-p0NEbO/candidate/skills/may/scripts/may-session.sh" stop "$root/may-p0NEbO"` and `rmdir "$root"`. Output: `stop_exit=0`, `rmdir_exit=0`, `session=absent`, `root=absent`; no sweep or fallback. Appendix paths are historical; this does not prove cleanup of unrecorded processes. The report contains local paths, output and patches; inspect before publication.
- Independent report review found F1: the final space-only context line was missing from the baseline appendix. The line was repaired; the extracted SHA-256 matched the original baseline `f5768d126b76af519412c5e295305388c5e6ec3d328f895a328985edd2c4703f`, and the reviewer accepted it on re-review.

### Vibe evidence appendices

The following is the available artifact text with home paths redacted as described above, not complete byte-for-byte copies. `baseline.patch` is not duplicated because it already appears in the MAY appendix; `all-changes.patch` is included as the full candidate diff and itself contains the baseline README delta. Reviewer and QA summaries come from worker results; provenance was written before review and QA, so its statements that these had not run reflect that historical point.

<details>
<summary>setup.log</summary>

`````text
2026-11-07T20:10:12Z
git clone --no-hardlinks --no-checkout SOURCE candidate
Cloning into '<USER_HOME>/AppData/Local/Temp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/candidate'...
done.
HEAD is now at ebdb130 Prepare MAY 0.2.0 orchestration update
error: corrupt patch at line 29
`````
</details>

<details>
<summary>baseline.log</summary>

`````text
2026-11-07T20:10:31Z
git -C candidate apply baseline.patch
3c745c2f1b8ac200f1d7aa9108050bd4adff769e6af45ab978254e09c46a6be2 */tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/candidate/README.md
f5768d126b76af519412c5e295305388c5e6ec3d328f895a328985edd2c4703f */tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/baseline.patch
## HEAD (no branch)
 M README.md
2026-11-07T20:10:31Z
`````
</details>

<details>
<summary>fingerprint-baseline.log</summary>

`````text
2026-11-07T20:11:06Z
b94dfa65b66dd013de8c26a78013853d09b41f17a251d5411d0811ca4b33115e */tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/candidate/README.md
f5768d126b76af519412c5e295305388c5e6ec3d328f895a328985edd2c4703f */tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/baseline.patch
2026-11-07T20:11:06Z
`````
</details>

<details>
<summary>provenance.txt</summary>

`````text
Run: OMP Vibe implementation; reviewer/QA not run by this worker.
Start observed UTC: 2026-11-07T20:09:37Z. Candidate evidence completed UTC: 2026-11-07T20:13:10Z.
Model: workstation context reports openai-codex/gpt-6.1-terra; actual serving model not independently observable. Tokens/cost: unavailable.
Workers: this implementation worker only; no worker dispatched here. Other coordinator workers' status is not observed and is not asserted.
Source checkout status: ## main; M README.md; ?? BENCHMARK-MAY.md. No source checkout edits made.
Owned root: <USER_HOME>/AppData/Local/Temp/vibe-session-benchmark-tCbHNiG4
Owned marked session: <USER_HOME>/AppData/Local/Temp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO
Candidate: marked session/candidate, detached ebdb130c05809c6298bb5618d9124fe2395c93e1. test temp: marked session/test-tmp. Smoke temp: marked session/smoke root. Candidate and evidence intentionally retained for coordinator cleanup.
Root creation and marked session command, explicit Git Bash:
"C:/Program Files/Git/bin/bash.exe" -lc 'set -e; date -u +%FT%TZ; root=$(mktemp -d "${TMPDIR:-${TEMP:-${TMP:-/tmp}}}/vibe-session-benchmark-XXXXXXXX"); export TMPDIR="$root" TEMP="$root" TMP="$root"; printf "ROOT=%s\n" "$root"; printf "SESSION="; bash skills/may/scripts/may-session.sh start'
Output: ROOT=/tmp/vibe-session-benchmark-tCbHNiG4; SESSION=/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO; exit 0.
Setup command: explicit Git Bash, with all three temp variables set to owned root; git clone --no-hardlinks --no-checkout "$(pwd)" "$s/candidate"; git -C "$s/candidate" checkout --detach ebdb130c05809c6298bb5618d9124fe2395c93e1; git -C "$s/candidate" apply "$s/baseline.patch". Full output in setup.log. First patch application failed (corrupt patch at line 29: missing context line; setup pipeline did not propagate exit due to tee); fixed only missing final context line in saved patch and reapplied successfully, output in baseline.log. Clone checkout had CRLF README; normalized README to LF by whole-file replacement, fingerprint in fingerprint-baseline.log. Baseline README SHA-256 b94dfa65b66dd013de8c26a78013853d09b41f17a251d5411d0811ca4b33115e.
Red command in candidate, explicit Git Bash, TMPDIR=TEMP=TMP=Windows path to owned test-tmp: node --test --test-name-pattern="start preserves old marked sessions" tests/session.test.ts. Exit 1, 2026-11-07T20:11:44Z to 20:11:45Z; old marked session missing. Full output red.log.
Initial check command in candidate, explicit Git Bash, TMPDIR=TEMP=TMP=Windows path to owned test-tmp: node --test tests/session.test.ts. Exit 0, 13/13, 2026-11-07T20:12:02Z to 20:12:28Z; output initial-session-tests.log. This is not final QA.
Disposable smoke command explicit Git Bash: bash "$s/smoke.sh". Full traced commands/paths/output in smoke.sh and smoke.log. Exit 0, 2026-11-07T20:12:57Z to 20:13:00Z. Smoke-owned sleep MSYS PID 1768 was tracked, stopped and waited; smoke-created session paths appear in smoke.log and were removed by explicit stop/sweep. Test suite also spawned its own fixture processes and reported successful cleanup, but did not log their PIDs; exact fixture process identities unavailable.
Artifacts: baseline.patch; task.patch excludes README baseline; all-changes.patch includes baseline and task. candidate-fingerprints.log contains SHA-256s, status, commit and Git warning about future README CRLF conversion. Git Bash logged node v26.13.0, git v2.50.0.windows.1. An initial shell probe used Windows date /T under Git Bash and failed as unsupported; no state change.
Not run: independent review, final QA, full test suite, npm run check, installation or host configuration changes. No commit, push or worktree. Candidate must be reviewed before final QA.
`````
</details>

<details>
<summary>candidate-fingerprints.log</summary>

`````text
START 2026-11-07T20:13:10Z
git diff --binary HEAD and task-only diff; sha256sum candidate files
warning: in the working copy of 'README.md', LF will be replaced by CRLF the next time Git touches it
## HEAD (no branch)
 M CHANGELOG.md
 M README.md
 M skills/may/references/runtime.md
 M skills/may/scripts/may-session.sh
 M tests/session.test.ts
ebdb130c05809c6298bb5618d9124fe2395c93e1
b94dfa65b66dd013de8c26a78013853d09b41f17a251d5411d0811ca4b33115e */tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/candidate/README.md
a1ed5ce637fdfbffd567872d5573726222fac45e535563d0ecfd5a81fc85446b */tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/candidate/CHANGELOG.md
8ad4f9036cb0a192765c7284fc49b8b0af1b93a39131e07173cc4e5edbf1721e */tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/candidate/skills/may/scripts/may-session.sh
d955293a0d2b1d0dac6121829aa0cb86fcb6e8b1a4c3065719d39a9feecabe6e */tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/candidate/skills/may/references/runtime.md
1f869451749f142969d74cb04ea64078475e121f903eb787705a38a21b224445 */tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/candidate/tests/session.test.ts
f5768d126b76af519412c5e295305388c5e6ec3d328f895a328985edd2c4703f */tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/baseline.patch
1c75b55ca00ea78ff3538b71cb1f1b7a1eb33da92f0d7b462fe9246686233a1c */tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/task.patch
7394ffa519136ae1b153ede06e63f814b7535fdce7720812a2ba06748c99759f */tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/all-changes.patch
bf37d90033c1dc44c8f04734a8ce631a57e1adf7f2d27ce3595752439c457f4d */tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/red.log
ba2326a2ca031b2bbb15103edf8d603be89126fa8b277149e7e9ce88315f1e99 */tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/initial-session-tests.log
ba633323cf8df65e0649dd672a2c0108d060c4b44dfd61939bb78f0867525ffd */tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke.log
EXIT=0
FINISH 2026-11-07T20:13:10Z
`````
</details>

<details>
<summary>red.log</summary>

`````text
START 2026-11-07T20:11:44Z
TARGET=candidate; TMPDIR=TEMP=TMP=session/test-tmp; node --test --test-name-pattern="start preserves old marked sessions" tests/session.test.ts
✖ start preserves old marked sessions and their evidence without recorded PIDs (552.5556ms)
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 836.8348

✖ failing tests:

test at tests\session.test.ts:29:1
✖ start preserves old marked sessions and their evidence without recorded PIDs (552.5556ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
  + actual - expected
  
    [
      'may-gHCCak',
  -   'may-old'
    ]
  
      at TestContext.<anonymous> (file:///<USER_HOME>/AppData/Local/Temp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/candidate/tests/session.test.ts:38:9)
      at Test.runInAsyncScope (node:async_hooks:226:14)
      at Test.run (node:internal/test_runner/test:1402:25)
      at Test.start (node:internal/test_runner/test:1262:17)
      at startSubtestAfterBootstrap (node:internal/test_runner/harness:387:17) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: [ 'may-gHCCak' ],
    expected: [ 'may-gHCCak', 'may-old' ],
    operator: 'deepStrictEqual',
    diff: 'simple'
  }
EXIT=1
FINISH 2026-11-07T20:11:45Z
`````
</details>

<details>
<summary>initial-session-tests.log</summary>

`````text
START 2026-11-07T20:12:02Z
TARGET=candidate; TMPDIR=TEMP=TMP=session/test-tmp; node --test tests/session.test.ts
✔ start creates a marked temp directory and prints only its path (673.329ms)
✔ start preserves old marked sessions and their evidence without recorded PIDs (149.0046ms)
✔ stop removes a validated session folder (316.5701ms)
✔ stop --keep leaves the folder and prints its path (180.195ms)
✔ stop rejects unsafe or unmarked targets without deleting them (1069.143ms)
✔ sweep removes only old marked sessions and preserves young sessions (590.3533ms)
✔ sweep leaves a marked session while a tracked process is alive (2864.874ms)
✔ stop terminates a tracked process and its descendant before deleting recovery data (3094.7803ms)
✔ failed process termination retains the session and recorded PID (2425.6122ms)
✔ ordinary and trailing-slash symlink aliases cannot escape the temp root (306.5894ms)
✔ a recorded process identity mismatch never kills the current PID owner (2850.7459ms)
✔ owned group cleanup includes TERM-ignoring child with live leader (5433.3663ms)
✔ owned group cleanup includes TERM-ignoring child with exited leader (5544.7096ms)
ℹ tests 13
ℹ suites 0
ℹ pass 13
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 25642.684
EXIT=0
FINISH 2026-11-07T20:12:28Z
`````
</details>

<details>
<summary>smoke.sh</summary>

`````text
#!/usr/bin/env bash
set -euo pipefail
set -x
s=/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO
script="$s/candidate/skills/may/scripts/may-session.sh"
root="$s/smoke root"
mkdir -p "$root"
export TMPDIR="$root" TEMP="$root" TMP="$root"
old="$root/may-old"
mkdir "$old"
printf 'MAY session\n' > "$old/.may-session"
printf '\000\377evidence\n' > "$old/evidence"
touch -d '2 days ago' "$old"
sha256sum "$old/.may-session" "$old/evidence"
dir="$(bash "$script" start)"
printf 'START_PATH=%s\n' "$dir"
test -f "$dir/.may-session"
test -f "$old/evidence"
test ! -e "$old/pids"
sha256sum "$old/.may-session" "$old/evidence"
young="$(bash "$script" start)"
printf 'YOUNG_PATH=%s\n' "$young"
bash "$script" sweep
[ ! -e "$old" ]
[ -f "$young/.may-session" ]
sleep 60 &
pid=$!
printf 'OWNED_PID=%s\n' "$pid"
winpath="$(cygpath -w "$dir")"
printf 'WINDOWS_PATH=%s\n' "$winpath"
bash "$script" track "$winpath" "$pid"
bash "$script" stop "$winpath"
wait "$pid" || :
test ! -e "$dir"
test -f "$young/.may-session"
bash "$script" stop "$(cygpath -w "$young")"
test ! -e "$young"
printf 'SMOKE_OK\n'
`````
</details>

<details>
<summary>smoke.log</summary>

`````text
START 2026-11-07T20:12:57Z
COMMAND: bash session/smoke.sh
+ s=/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO
+ script=/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/candidate/skills/may/scripts/may-session.sh
+ root='/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root'
+ mkdir -p '/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root'
+ export 'TMPDIR=/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root' 'TEMP=/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root' 'TMP=/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root'
+ TMPDIR='/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root'
+ TEMP='/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root'
+ TMP='/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root'
+ old='/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root/may-old'
+ mkdir '/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root/may-old'
+ printf 'MAY session\n'
+ printf '\000\377evidence\n'
+ touch -d '2 days ago' '/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root/may-old'
+ sha256sum '/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root/may-old/.may-session' '/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root/may-old/evidence'
a4d27ada9310d8325b97406a3839fdf39a4f8e842d4e20ad26714274d5e40736 */tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root/may-old/.may-session
16bdec42383987388eb2ee7c3443c41cc5cdf5e063c11bd55a9110374284b09f */tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root/may-old/evidence
++ bash /tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/candidate/skills/may/scripts/may-session.sh start
+ dir='/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root/may-qQxdr9'
+ printf 'START_PATH=%s\n' '/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root/may-qQxdr9'
START_PATH=/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root/may-qQxdr9
+ test -f '/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root/may-qQxdr9/.may-session'
+ test -f '/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root/may-old/evidence'
+ test '!' -e '/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root/may-old/pids'
+ sha256sum '/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root/may-old/.may-session' '/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root/may-old/evidence'
a4d27ada9310d8325b97406a3839fdf39a4f8e842d4e20ad26714274d5e40736 */tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root/may-old/.may-session
16bdec42383987388eb2ee7c3443c41cc5cdf5e063c11bd55a9110374284b09f */tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root/may-old/evidence
++ bash /tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/candidate/skills/may/scripts/may-session.sh start
+ young='/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root/may-pAnfb5'
+ printf 'YOUNG_PATH=%s\n' '/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root/may-pAnfb5'
YOUNG_PATH=/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root/may-pAnfb5
+ bash /tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/candidate/skills/may/scripts/may-session.sh sweep
/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root/may-old
+ '[' '!' -e '/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root/may-old' ']'
+ '[' -f '/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root/may-pAnfb5/.may-session' ']'
+ pid=1768
+ sleep 60
+ printf 'OWNED_PID=%s\n' 1768
OWNED_PID=1768
++ cygpath -w '/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root/may-qQxdr9'
+ winpath='<USER_HOME>\AppData\Local\Temp\vibe-session-benchmark-tCbHNiG4\may-p0NEbO\smoke root\may-qQxdr9'
+ printf 'WINDOWS_PATH=%s\n' '<USER_HOME>\AppData\Local\Temp\vibe-session-benchmark-tCbHNiG4\may-p0NEbO\smoke root\may-qQxdr9'
WINDOWS_PATH=<USER_HOME>\AppData\Local\Temp\vibe-session-benchmark-tCbHNiG4\may-p0NEbO\smoke root\may-qQxdr9
+ bash /tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/candidate/skills/may/scripts/may-session.sh track '<USER_HOME>\AppData\Local\Temp\vibe-session-benchmark-tCbHNiG4\may-p0NEbO\smoke root\may-qQxdr9' 1768
+ bash /tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/candidate/skills/may/scripts/may-session.sh stop '<USER_HOME>\AppData\Local\Temp\vibe-session-benchmark-tCbHNiG4\may-p0NEbO\smoke root\may-qQxdr9'
+ wait 1768
+ test '!' -e '/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root/may-qQxdr9'
+ test -f '/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root/may-pAnfb5/.may-session'
++ cygpath -w '/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root/may-pAnfb5'
+ bash /tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/candidate/skills/may/scripts/may-session.sh stop '<USER_HOME>\AppData\Local\Temp\vibe-session-benchmark-tCbHNiG4\may-p0NEbO\smoke root\may-pAnfb5'
+ test '!' -e '/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/smoke root/may-pAnfb5'
+ printf 'SMOKE_OK\n'
SMOKE_OK
EXIT=0
FINISH 2026-11-07T20:13:00Z
`````
</details>

<details>
<summary>task.patch</summary>

`````text
diff --git a/CHANGELOG.md b/CHANGELOG.md
index b2f45a4..13236ad 100644
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -5,6 +5,7 @@
 - Rename the canonical entry skill from `using-may` to `may`; update existing prompts and installed skill references. No compatibility alias is included.
 - Refine role-specific handoffs and coordinator routing, distinguish early risk checks from final QA, and require evidence for reported test results.
 - Add opt-in bounded verifier output for successful checks and document harness update limitations.
+- Starting a session no longer sweeps older sessions; stale-session recovery remains an explicit guarded operation.
 - Workflow superiority, native installation of this renamed version, and full real-model workflow support remain unverified.
 
 ## 0.1.0 (unreleased)
diff --git a/skills/may/references/runtime.md b/skills/may/references/runtime.md
index 429be4d..5832657 100644
--- a/skills/may/references/runtime.md
+++ b/skills/may/references/runtime.md
@@ -111,4 +111,4 @@ Create temporary work only with `may-session.sh start` and record its absolute p
 
 Attempt exact-session cleanup on failure or cancellation. An EXIT trap cannot guarantee recovery after a forced kill. A later call or fresh session can stop the recorded path without relying on lost shell variables. Resolve `MAY_SKILL_DIR` again and use the same OS-temp root if environment overrides were used to create the session. Report only observed cleanup and disclose any remaining owned path or process.
 
-`sweep` is separate stale-folder recovery for marked sessions at least 24 hours old with no live recorded process/group; `start` also runs that default sweep. It is not proof that an interrupted run cleaned up. There is no MAY workflow-state folder in the project or home directory, and a fresh session does not resume stored workflow state.
+`start` creates a new marked session without sweeping or changing existing sessions. An explicit `sweep` is separate stale-folder recovery for marked sessions at least 24 hours old with no live recorded process/group. It is not proof that an interrupted run cleaned up. There is no MAY workflow-state folder in the project or home directory, and a fresh session does not resume stored workflow state.
diff --git a/skills/may/scripts/may-session.sh b/skills/may/scripts/may-session.sh
index 5b60a81..03f23ad 100644
--- a/skills/may/scripts/may-session.sh
+++ b/skills/may/scripts/may-session.sh
@@ -178,7 +178,6 @@ if [ "${BASH_SOURCE[0]}" != "$0" ]; then return 0; fi
 case "${1:-}" in
  start)
   [ "$#" -eq 1 ] || { usage; exit 2; }
-  sweep >/dev/null
   dir="$(mktemp -d "$tmp_root/may-XXXXXX")" || exit 1
   printf 'MAY session\n' > "$dir/.may-session"
   printf '%s\n' "$dir" ;;
diff --git a/tests/session.test.ts b/tests/session.test.ts
index b13b10f..eb2cc3f 100644
--- a/tests/session.test.ts
+++ b/tests/session.test.ts
@@ -1,6 +1,6 @@
 import assert from "node:assert/strict";
 import { spawnSync } from "node:child_process";
-import { existsSync, mkdirSync, readFileSync, symlinkSync, utimesSync, writeFileSync, chmodSync } from "node:fs";
+import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, symlinkSync, utimesSync, writeFileSync, chmodSync } from "node:fs";
 import { join } from "node:path";
 import { fileURLToPath } from "node:url";
 import { test } from "node:test";
@@ -26,6 +26,21 @@ test("start creates a marked temp directory and prints only its path", (t) => {
  assert.equal(spawnSync(bash, ["-lc", 'test -e "$1"', "sh", `${dir}/.may-session`], { timeout: 5000 }).status, 0);
  assert.equal(out.stdout.trim().split(/\r?\n/).length, 1);
 });
+test("start preserves old marked sessions and their evidence without recorded PIDs", (t) => {
+ const tmp = tempDir(t, "may tmp "); const old = session(tmp, "may-old");
+ const evidence = join(old, "evidence"); mkdirSync(evidence);
+ const bytes = Buffer.from([0, 255, 13, 10, 42]); writeFileSync(join(evidence, "capture.bin"), bytes);
+ const age = new Date(Date.now() - 48 * 3600000); utimesSync(old, age, age);
+ const before = statSync(old).mtimeMs; const marker = readFileSync(join(old, ".may-session"));
+ const out = run(tmp, "start"); assert.equal(out.status, 0, out.stderr);
+ assert.equal(out.stdout.trim().split(/\r?\n/).length, 1);
+ assert.match(out.stdout.trim(), /may-[^/\\]+$/);
+ assert.deepEqual(readdirSync(tmp).sort(), ["may-old", out.stdout.trim().split(/[/\\]/).pop()].sort());
+ assert.deepEqual(readFileSync(join(old, ".may-session")), marker);
+ assert.deepEqual(readFileSync(join(evidence, "capture.bin")), bytes);
+ assert.equal(existsSync(join(old, "pids")), false);
+ assert.equal(statSync(old).mtimeMs, before);
+});
 test("stop removes a validated session folder", (t) => { const tmp = tempDir(t, "may tmp "); const dir = session(tmp); const out = run(tmp, "stop", dir); assert.equal(out.status, 0, out.stderr); assert.equal(existsSync(dir), false); });
 test("stop --keep leaves the folder and prints its path", (t) => { const tmp = tempDir(t, "may tmp "); const dir = session(tmp); const out = run(tmp, "stop", dir, "--keep"); assert.equal(out.status, 0, out.stderr); assert.equal(existsSync(dir), true); assert.equal(out.stdout.trim(), dir); });
 test("stop rejects unsafe or unmarked targets without deleting them", (t) => {
`````
</details>

<details>
<summary>all-changes.patch</summary>

`````text
diff --git a/CHANGELOG.md b/CHANGELOG.md
index b2f45a4..13236ad 100644
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -5,6 +5,7 @@
 - Rename the canonical entry skill from `using-may` to `may`; update existing prompts and installed skill references. No compatibility alias is included.
 - Refine role-specific handoffs and coordinator routing, distinguish early risk checks from final QA, and require evidence for reported test results.
 - Add opt-in bounded verifier output for successful checks and document harness update limitations.
+- Starting a session no longer sweeps older sessions; stale-session recovery remains an explicit guarded operation.
 - Workflow superiority, native installation of this renamed version, and full real-model workflow support remain unverified.
 
 ## 0.1.0 (unreleased)
diff --git a/README.md b/README.md
index 0811aeb..e3de112 100644
--- a/README.md
+++ b/README.md
@@ -24,7 +24,11 @@ Spawning a subagent answers who can do a task. MAY adds a shared contract for wh
 | Acceptance evidence | The caller decides what results establish completion | Exact criterion commands, current-candidate evidence, explicit failures and blocked checks |
 | Temporary work | Process and artifact handling depend on the tools and caller | Marked OS-temp sessions, retained failure diagnostics, exact-session cleanup |
 
-A native workflow can implement these same patterns. MAY packages the conventions; advisory skills do not automatically enforce them. There are no published comparative token, time, or quality benchmarks here, so this table compares responsibilities, not measured superiority.
+A native workflow can implement these same patterns. MAY packages the conventions; advisory skills do not automatically enforce them.
+
+### Exploratory benchmark
+
+One local Windows case study compared OMP Vibe with MAY 0.2.0 on the same E2E-runner task. The Vibe candidate did not receive final review acceptance; the MAY candidate passed focused E2E tests and review, but its full test suite failed. The runs differed in test coverage and execution conditions, so they do not establish that either workflow is better or faster. Total token use and cost were not available.
 
 ## Install
 
@@ -69,9 +73,9 @@ pi update git:github.com/Rakhulsr/MAY
 
 Pinned Git tags or commits remain pinned. `pi update --extensions` updates all installed packages. For Claude Code, `claude plugin update may@may` updates the plugin; restart Claude Code afterwards. Update the marketplace separately when needed with `claude plugin marketplace update may`.
 
-OMP's plugin CLI exposes `omp plugin upgrade` and `--dry-run`; check `omp plugin --help` and your installed plugin identity before use. Codex's `codex plugin marketplace upgrade may` refreshes the marketplace snapshot, but does not by itself establish that an already-installed plugin has updated. The installed-plugin upgrade path for OMP and Codex has not been verified here; do not assume a marketplace refresh upgrades the installed skill. Check the harness version and plugin documentation for the applicable procedure.
+OMP's plugin CLI exposes `omp plugin upgrade` and `--dry-run`. An upgrade from MAY 0.1.0 to 0.2.0 was observed with OMP 18.18.0 in the local case study; that observation does not establish upgrade behavior for other versions. Codex's `codex plugin marketplace upgrade may` refreshes the marketplace snapshot, but does not by itself establish that an already-installed plugin has updated. Check the harness version and plugin documentation for the applicable procedure.
 
-**Breaking upgrade:** the canonical entry skill was renamed from `using-may` to `may`; there is no compatibility alias. Update prompts and references from `using-may` to `may`, and use the installed `may/SKILL.md` (its `skills/may/SKILL.md` path in this package) instead of the old installed `using-may/SKILL.md`. Remove any separately installed old skill through your harness's documented procedure to avoid stale discovery. Restart the harness or start a fresh session after updating, then verify the loaded skill and its location. Installation of this rename has not been tested. No automatic MAY update notification is promised.
+**Breaking upgrade:** the canonical entry skill was renamed from `using-may` to `may`; there is no compatibility alias. Update prompts and references from `using-may` to `may`, and use the installed `may/SKILL.md` (its `skills/may/SKILL.md` path in this package) instead of the old installed `using-may/SKILL.md`. Remove any separately installed old skill through your harness's documented procedure to avoid stale discovery. Restart the harness or start a fresh session after updating, then verify the loaded skill and its location. A fresh OMP 18.18.0 session loaded the `may` entry skill from the 0.2.0 plugin; this does not establish installation discovery for every skill or harness. No automatic MAY update notification is promised.
 
 ## Start a task
 
diff --git a/skills/may/references/runtime.md b/skills/may/references/runtime.md
index 429be4d..5832657 100644
--- a/skills/may/references/runtime.md
+++ b/skills/may/references/runtime.md
@@ -111,4 +111,4 @@ Create temporary work only with `may-session.sh start` and record its absolute p
 
 Attempt exact-session cleanup on failure or cancellation. An EXIT trap cannot guarantee recovery after a forced kill. A later call or fresh session can stop the recorded path without relying on lost shell variables. Resolve `MAY_SKILL_DIR` again and use the same OS-temp root if environment overrides were used to create the session. Report only observed cleanup and disclose any remaining owned path or process.
 
-`sweep` is separate stale-folder recovery for marked sessions at least 24 hours old with no live recorded process/group; `start` also runs that default sweep. It is not proof that an interrupted run cleaned up. There is no MAY workflow-state folder in the project or home directory, and a fresh session does not resume stored workflow state.
+`start` creates a new marked session without sweeping or changing existing sessions. An explicit `sweep` is separate stale-folder recovery for marked sessions at least 24 hours old with no live recorded process/group. It is not proof that an interrupted run cleaned up. There is no MAY workflow-state folder in the project or home directory, and a fresh session does not resume stored workflow state.
diff --git a/skills/may/scripts/may-session.sh b/skills/may/scripts/may-session.sh
index 5b60a81..03f23ad 100644
--- a/skills/may/scripts/may-session.sh
+++ b/skills/may/scripts/may-session.sh
@@ -178,7 +178,6 @@ if [ "${BASH_SOURCE[0]}" != "$0" ]; then return 0; fi
 case "${1:-}" in
  start)
   [ "$#" -eq 1 ] || { usage; exit 2; }
-  sweep >/dev/null
   dir="$(mktemp -d "$tmp_root/may-XXXXXX")" || exit 1
   printf 'MAY session\n' > "$dir/.may-session"
   printf '%s\n' "$dir" ;;
diff --git a/tests/session.test.ts b/tests/session.test.ts
index b13b10f..eb2cc3f 100644
--- a/tests/session.test.ts
+++ b/tests/session.test.ts
@@ -1,6 +1,6 @@
 import assert from "node:assert/strict";
 import { spawnSync } from "node:child_process";
-import { existsSync, mkdirSync, readFileSync, symlinkSync, utimesSync, writeFileSync, chmodSync } from "node:fs";
+import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, symlinkSync, utimesSync, writeFileSync, chmodSync } from "node:fs";
 import { join } from "node:path";
 import { fileURLToPath } from "node:url";
 import { test } from "node:test";
@@ -26,6 +26,21 @@ test("start creates a marked temp directory and prints only its path", (t) => {
  assert.equal(spawnSync(bash, ["-lc", 'test -e "$1"', "sh", `${dir}/.may-session`], { timeout: 5000 }).status, 0);
  assert.equal(out.stdout.trim().split(/\r?\n/).length, 1);
 });
+test("start preserves old marked sessions and their evidence without recorded PIDs", (t) => {
+ const tmp = tempDir(t, "may tmp "); const old = session(tmp, "may-old");
+ const evidence = join(old, "evidence"); mkdirSync(evidence);
+ const bytes = Buffer.from([0, 255, 13, 10, 42]); writeFileSync(join(evidence, "capture.bin"), bytes);
+ const age = new Date(Date.now() - 48 * 3600000); utimesSync(old, age, age);
+ const before = statSync(old).mtimeMs; const marker = readFileSync(join(old, ".may-session"));
+ const out = run(tmp, "start"); assert.equal(out.status, 0, out.stderr);
+ assert.equal(out.stdout.trim().split(/\r?\n/).length, 1);
+ assert.match(out.stdout.trim(), /may-[^/\\]+$/);
+ assert.deepEqual(readdirSync(tmp).sort(), ["may-old", out.stdout.trim().split(/[/\\]/).pop()].sort());
+ assert.deepEqual(readFileSync(join(old, ".may-session")), marker);
+ assert.deepEqual(readFileSync(join(evidence, "capture.bin")), bytes);
+ assert.equal(existsSync(join(old, "pids")), false);
+ assert.equal(statSync(old).mtimeMs, before);
+});
 test("stop removes a validated session folder", (t) => { const tmp = tempDir(t, "may tmp "); const dir = session(tmp); const out = run(tmp, "stop", dir); assert.equal(out.status, 0, out.stderr); assert.equal(existsSync(dir), false); });
 test("stop --keep leaves the folder and prints its path", (t) => { const tmp = tempDir(t, "may tmp "); const dir = session(tmp); const out = run(tmp, "stop", dir, "--keep"); assert.equal(out.status, 0, out.stderr); assert.equal(existsSync(dir), true); assert.equal(out.stdout.trim(), dir); });
 test("stop rejects unsafe or unmarked targets without deleting them", (t) => {
`````
</details>

<details>
<summary>qa-d8PNXntT/run.sh</summary>

`````text
#!/usr/bin/env bash
set -u
qa=<USER_HOME>/AppData/Local/Temp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/qa-d8PNXntT
candidate=<USER_HOME>/AppData/Local/Temp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/candidate
cd "$candidate" || exit 1
exec > >(tee "$qa/run-retry.log") 2>&1
fingerprint() {
 echo "=== fingerprint $1 $(date -u +%FT%TZ) ==="
 git rev-parse HEAD; git status --short; git diff --binary | sha256sum; sha256sum README.md
}
run_test() {
 local name="$1"; shift
 mkdir -p "$qa/tmp-$name"
 TMPDIR="$(cygpath -w "$qa/tmp-$name")"; export TMPDIR TEMP="$TMPDIR" TMP="$TMPDIR"
 echo "=== $name start $(date -u +%FT%TZ) target=$candidate TMP=$TMPDIR command=$* ==="
 "$@" > "$qa/$name.log" 2>&1
 local rc=$?
 cat "$qa/$name.log"
 echo "=== $name exit=$rc end $(date -u +%FT%TZ) ==="
}
echo "node=$(node --version) npm=$(npm --version) bash=$BASH_VERSION"
fingerprint before
run_test session node --test tests/session.test.ts
run_test npm-test npm test
run_test check npm run check
mkdir -p "$qa/smoke-root/may-old"
TMPDIR="$(cygpath -w "$qa/smoke-root")"; export TMPDIR TEMP="$TMPDIR" TMP="$TMPDIR"
fixture="$qa/smoke-root/may-old"
printf 'MAY session\n' > "$fixture/.may-session"
printf 'owned fixture bytes\n' > "$fixture/payload"
touch -d '3 days ago' "$fixture"
echo "=== smoke start $(date -u +%FT%TZ) fixture=$fixture ==="
sha256sum "$fixture/.may-session" "$fixture/payload"
script="$candidate/skills/may/scripts/may-session.sh"
session="$(bash "$script" start)"; rc=$?; printf 'start exit=%s created=%s\n' "$rc" "$session"
sha256sum "$fixture/.may-session" "$fixture/payload"; echo "fixture_after_start_exit=$?"
bash "$script" sweep --max-age-hours 24; rc=$?; echo "sweep_exit=$rc"; if [ -e "$fixture" ]; then echo fixture_after_sweep=present; else echo fixture_after_sweep=absent; fi
if [ "$rc" -eq 0 ] && [ -n "$session" ]; then bash "$script" stop "$session"; rc=$?; echo "stop_exit=$rc session=$session"; if [ -e "$session" ]; then echo session_after_stop=present; else echo session_after_stop=absent; fi; else echo 'stop=not_run'; fi
echo "=== smoke end $(date -u +%FT%TZ) ==="
fingerprint after
`````
</details>

<details>
<summary>qa-d8PNXntT/run.log</summary>

`````text
node=v26.13.0 npm=12.2.1 bash=5.2.37(1)-release
=== fingerprint before 2026-11-07T20:16:35Z ===
ebdb130c05809c6298bb5618d9124fe2395c93e1
 M CHANGELOG.md
 M README.md
 M skills/may/references/runtime.md
 M skills/may/scripts/may-session.sh
 M tests/session.test.ts
warning: in the working copy of 'README.md', LF will be replaced by CRLF the next time Git touches it
7394ffa519136ae1b153ede06e63f814b7535fdce7720812a2ba06748c99759f *-
b94dfa65b66dd013de8c26a78013853d09b41f17a251d5411d0811ca4b33115e *README.md
<USER_HOME>/AppData/Local/Temp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/qa-d8PNXntT/run.sh: line 14: TMPDIR: unbound variable
`````
</details>

<details>
<summary>qa-d8PNXntT/run-retry.log</summary>

`````text
node=v26.13.0 npm=12.2.1 bash=5.2.37(1)-release
=== fingerprint before 2026-11-07T20:16:56Z ===
ebdb130c05809c6298bb5618d9124fe2395c93e1
 M CHANGELOG.md
 M README.md
 M skills/may/references/runtime.md
 M skills/may/scripts/may-session.sh
 M tests/session.test.ts
warning: in the working copy of 'README.md', LF will be replaced by CRLF the next time Git touches it
7394ffa519136ae1b153ede06e63f814b7535fdce7720812a2ba06748c99759f *-
b94dfa65b66dd013de8c26a78013853d09b41f17a251d5411d0811ca4b33115e *README.md
=== session start 2026-11-07T20:16:56Z target=<USER_HOME>/AppData/Local/Temp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/candidate TMP=<USER_HOME>\AppData\Local\Temp\vibe-session-benchmark-tCbHNiG4\may-p0NEbO\qa-d8PNXntT\tmp-session command=node --test tests/session.test.ts ===
✔ start creates a marked temp directory and prints only its path (808.8967ms)
✔ start preserves old marked sessions and their evidence without recorded PIDs (139.9111ms)
✔ stop removes a validated session folder (381.9235ms)
✔ stop --keep leaves the folder and prints its path (194.436ms)
✔ stop rejects unsafe or unmarked targets without deleting them (1097.7643ms)
✔ sweep removes only old marked sessions and preserves young sessions (581.1012ms)
✔ sweep leaves a marked session while a tracked process is alive (2609.2844ms)
✔ stop terminates a tracked process and its descendant before deleting recovery data (2984.2386ms)
✔ failed process termination retains the session and recorded PID (2257.5188ms)
✔ ordinary and trailing-slash symlink aliases cannot escape the temp root (230.8662ms)
✔ a recorded process identity mismatch never kills the current PID owner (2582.732ms)
✔ owned group cleanup includes TERM-ignoring child with live leader (5051.8728ms)
✔ owned group cleanup includes TERM-ignoring child with exited leader (4857.2333ms)
ℹ tests 13
ℹ suites 0
ℹ pass 13
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 23937.7721
=== session exit=0 end 2026-11-07T20:17:20Z ===
=== npm-test start 2026-11-07T20:17:21Z target=<USER_HOME>/AppData/Local/Temp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/candidate TMP=<USER_HOME>\AppData\Local\Temp\vibe-session-benchmark-tCbHNiG4\may-p0NEbO\qa-d8PNXntT\tmp-npm-test command=npm test ===
npm notice run may@0.2.0 test
npm notice run node --test "tests/*.test.ts"
✔ unavailable Playwright returns 3 and never attempts installation (443.6669ms)
✔ invalid session and remote URLs are rejected (741.499ms)
✔ server stops and artifacts removed on PASS (9897.1119ms)
✔ server stops and artifacts retained on FAIL (10636.9292ms)
✔ server cleanup after TERM (15313.3838ms)
✔ server cleanup after KILL (11849.2942ms)
✔ TERM during registration cannot launch the command after cleanup (6776.55ms)
✔ the version check passes on this repo (262.1059ms)
✔ bump-version changes every listed manifest (773.4162ms)
✔ bump-version refuses a malformed version and changes nothing (442.8331ms)
✔ the version check names a manifest that drifted (714.7471ms)
✔ check-repo passes on a clean copy (7412.0207ms)
✔ check-repo fails when a skill name does not match its folder (6744.6593ms)
✔ check-repo fails when a skill has no description (7596.4272ms)
✔ check-repo fails when docs would be published (8102.4399ms)
✔ check-repo rejects a public README.md dependency on local specifications (6091.9807ms)
✔ check-repo rejects a public AGENTS.md dependency on local specifications (6342.9001ms)
✔ check-repo fails on a manifest that is not valid JSON (6724.74ms)
✔ test-harness rejects an unknown harness without installing anything (86.4769ms)
✔ the entry skill and every tool mapping ship with the plugin (1.1398ms)
✔ the scripts keep LF endings, so Git Bash can run them after a Windows checkout (0.7826ms)
✔ check-repo rejects missing runtime scripts referenced by a skill reference (6520.987ms)
✔ check-repo rejects resurrected engine directories (17050.6856ms)
✔ check-repo rejects obsolete storage references in publishable content (6091.105ms)
✔ npm package selection includes public runtime and developer files but excludes personal data (4208.7651ms)
✔ start creates a marked temp directory and prints only its path (842.7ms)
✔ start preserves old marked sessions and their evidence without recorded PIDs (187.765ms)
✔ stop removes a validated session folder (472.716ms)
✔ stop --keep leaves the folder and prints its path (276.8034ms)
✔ stop rejects unsafe or unmarked targets without deleting them (2280.9484ms)
✔ sweep removes only old marked sessions and preserves young sessions (1009.2651ms)
✔ sweep leaves a marked session while a tracked process is alive (3328.7523ms)
✔ stop terminates a tracked process and its descendant before deleting recovery data (3225.7562ms)
✔ failed process termination retains the session and recorded PID (4090.1505ms)
✔ ordinary and trailing-slash symlink aliases cannot escape the temp root (365.7466ms)
✔ a recorded process identity mismatch never kills the current PID owner (3711.3719ms)
✔ owned group cleanup includes TERM-ignoring child with live leader (8054.1632ms)
✔ owned group cleanup includes TERM-ignoring child with exited leader (8166.1282ms)
✔ a genuine failing regression becomes PASS only after repairing the fixture (13968.2581ms)
✔ successful check output is available only when explicitly requested (30482.2206ms)
✔ all zero-test output forms are NO_TESTS (57587.5104ms)
✔ Go package summaries with and without tests pass in the same command (4218.9478ms)
✔ cached Go coverage summaries count before packages without selected tests (4904.9118ms)
✔ Go packages all lack test files remain NO_TESTS (4990.9987ms)
✔ Go package has no selected tests remain NO_TESTS (5022.3741ms)
✔ cached Go coverage package has no selected tests remain NO_TESTS (5560.1062ms)
✔ success-like log lines accompany empty Go packages remain NO_TESTS (5150.2946ms)
✔ a non-Go empty suite follows a successful Go package remain NO_TESTS (5683.1834ms)
✔ successful Go checks cannot supply tests for a different empty check (8491.5406ms)
✔ trivial checks never execute shell side effects (15898.7637ms)
✔ source edits during verification are CHANGED, including same status untracked content (4975.6578ms)
✔ timeout terminates check descendants and reports TIMEOUT (7019.9043ms)
✔ one identical command runs once and covers both IDs (5037.7959ms)
✔ outside git uses PASS? and never success exit (4883.9619ms)
✔ nested invocation detects changed untracked sibling content across the whole repository (5847.8279ms)
✔ failed timeout termination still returns TIMEOUT and retains process recovery (7185.87ms)
✔ a parent deadline stays bounded when auxiliary registration runs past the timeout (7545.1594ms)
ℹ tests 57
ℹ suites 0
ℹ pass 57
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 204683.4674
=== npm-test exit=0 end 2026-11-07T20:20:47Z ===
=== check start 2026-11-07T20:20:47Z target=<USER_HOME>/AppData/Local/Temp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/candidate TMP=<USER_HOME>\AppData\Local\Temp\vibe-session-benchmark-tCbHNiG4\may-p0NEbO\qa-d8PNXntT\tmp-check command=npm run check ===
npm notice run may@0.2.0 check
npm notice run bash scripts/check-repo.sh
Repository checks passed
=== check exit=0 end 2026-11-07T20:20:52Z ===
=== smoke start 2026-11-07T20:20:52Z fixture=<USER_HOME>/AppData/Local/Temp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/qa-d8PNXntT/smoke-root/may-old ===
a4d27ada9310d8325b97406a3839fdf39a4f8e842d4e20ad26714274d5e40736 *<USER_HOME>/AppData/Local/Temp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/qa-d8PNXntT/smoke-root/may-old/.may-session
13cd40c4ecedc5c5ee01db0e9aed00c0186a93ccf9a4d859a085b2acb6d8dbef *<USER_HOME>/AppData/Local/Temp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/qa-d8PNXntT/smoke-root/may-old/payload
start exit=0 created=/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/qa-d8PNXntT/smoke-root/may-7uipOf
a4d27ada9310d8325b97406a3839fdf39a4f8e842d4e20ad26714274d5e40736 *<USER_HOME>/AppData/Local/Temp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/qa-d8PNXntT/smoke-root/may-old/.may-session
13cd40c4ecedc5c5ee01db0e9aed00c0186a93ccf9a4d859a085b2acb6d8dbef *<USER_HOME>/AppData/Local/Temp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/qa-d8PNXntT/smoke-root/may-old/payload
fixture_after_start_exit=0
/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/qa-d8PNXntT/smoke-root/may-old
sweep_exit=0
fixture_after_sweep=absent
stop_exit=0 session=/tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/qa-d8PNXntT/smoke-root/may-7uipOf
session_after_stop=absent
=== smoke end 2026-11-07T20:20:53Z ===
=== fingerprint after 2026-11-07T20:20:53Z ===
ebdb130c05809c6298bb5618d9124fe2395c93e1
 M CHANGELOG.md
 M README.md
 M skills/may/references/runtime.md
 M skills/may/scripts/may-session.sh
 M tests/session.test.ts
warning: in the working copy of 'README.md', LF will be replaced by CRLF the next time Git touches it
7394ffa519136ae1b153ede06e63f814b7535fdce7720812a2ba06748c99759f *-
b94dfa65b66dd013de8c26a78013853d09b41f17a251d5411d0811ca4b33115e *README.md
`````
</details>

<details>
<summary>qa-d8PNXntT/session.log</summary>

`````text
✔ start creates a marked temp directory and prints only its path (808.8967ms)
✔ start preserves old marked sessions and their evidence without recorded PIDs (139.9111ms)
✔ stop removes a validated session folder (381.9235ms)
✔ stop --keep leaves the folder and prints its path (194.436ms)
✔ stop rejects unsafe or unmarked targets without deleting them (1097.7643ms)
✔ sweep removes only old marked sessions and preserves young sessions (581.1012ms)
✔ sweep leaves a marked session while a tracked process is alive (2609.2844ms)
✔ stop terminates a tracked process and its descendant before deleting recovery data (2984.2386ms)
✔ failed process termination retains the session and recorded PID (2257.5188ms)
✔ ordinary and trailing-slash symlink aliases cannot escape the temp root (230.8662ms)
✔ a recorded process identity mismatch never kills the current PID owner (2582.732ms)
✔ owned group cleanup includes TERM-ignoring child with live leader (5051.8728ms)
✔ owned group cleanup includes TERM-ignoring child with exited leader (4857.2333ms)
ℹ tests 13
ℹ suites 0
ℹ pass 13
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 23937.7721
`````
</details>

<details>
<summary>qa-d8PNXntT/npm-test.log</summary>

`````text
npm notice run may@0.2.0 test
npm notice run node --test "tests/*.test.ts"
✔ unavailable Playwright returns 3 and never attempts installation (443.6669ms)
✔ invalid session and remote URLs are rejected (741.499ms)
✔ server stops and artifacts removed on PASS (9897.1119ms)
✔ server stops and artifacts retained on FAIL (10636.9292ms)
✔ server cleanup after TERM (15313.3838ms)
✔ server cleanup after KILL (11849.2942ms)
✔ TERM during registration cannot launch the command after cleanup (6776.55ms)
✔ the version check passes on this repo (262.1059ms)
✔ bump-version changes every listed manifest (773.4162ms)
✔ bump-version refuses a malformed version and changes nothing (442.8331ms)
✔ the version check names a manifest that drifted (714.7471ms)
✔ check-repo passes on a clean copy (7412.0207ms)
✔ check-repo fails when a skill name does not match its folder (6744.6593ms)
✔ check-repo fails when a skill has no description (7596.4272ms)
✔ check-repo fails when docs would be published (8102.4399ms)
✔ check-repo rejects a public README.md dependency on local specifications (6091.9807ms)
✔ check-repo rejects a public AGENTS.md dependency on local specifications (6342.9001ms)
✔ check-repo fails on a manifest that is not valid JSON (6724.74ms)
✔ test-harness rejects an unknown harness without installing anything (86.4769ms)
✔ the entry skill and every tool mapping ship with the plugin (1.1398ms)
✔ the scripts keep LF endings, so Git Bash can run them after a Windows checkout (0.7826ms)
✔ check-repo rejects missing runtime scripts referenced by a skill reference (6520.987ms)
✔ check-repo rejects resurrected engine directories (17050.6856ms)
✔ check-repo rejects obsolete storage references in publishable content (6091.105ms)
✔ npm package selection includes public runtime and developer files but excludes personal data (4208.7651ms)
✔ start creates a marked temp directory and prints only its path (842.7ms)
✔ start preserves old marked sessions and their evidence without recorded PIDs (187.765ms)
✔ stop removes a validated session folder (472.716ms)
✔ stop --keep leaves the folder and prints its path (276.8034ms)
✔ stop rejects unsafe or unmarked targets without deleting them (2280.9484ms)
✔ sweep removes only old marked sessions and preserves young sessions (1009.2651ms)
✔ sweep leaves a marked session while a tracked process is alive (3328.7523ms)
✔ stop terminates a tracked process and its descendant before deleting recovery data (3225.7562ms)
✔ failed process termination retains the session and recorded PID (4090.1505ms)
✔ ordinary and trailing-slash symlink aliases cannot escape the temp root (365.7466ms)
✔ a recorded process identity mismatch never kills the current PID owner (3711.3719ms)
✔ owned group cleanup includes TERM-ignoring child with live leader (8054.1632ms)
✔ owned group cleanup includes TERM-ignoring child with exited leader (8166.1282ms)
✔ a genuine failing regression becomes PASS only after repairing the fixture (13968.2581ms)
✔ successful check output is available only when explicitly requested (30482.2206ms)
✔ all zero-test output forms are NO_TESTS (57587.5104ms)
✔ Go package summaries with and without tests pass in the same command (4218.9478ms)
✔ cached Go coverage summaries count before packages without selected tests (4904.9118ms)
✔ Go packages all lack test files remain NO_TESTS (4990.9987ms)
✔ Go package has no selected tests remain NO_TESTS (5022.3741ms)
✔ cached Go coverage package has no selected tests remain NO_TESTS (5560.1062ms)
✔ success-like log lines accompany empty Go packages remain NO_TESTS (5150.2946ms)
✔ a non-Go empty suite follows a successful Go package remain NO_TESTS (5683.1834ms)
✔ successful Go checks cannot supply tests for a different empty check (8491.5406ms)
✔ trivial checks never execute shell side effects (15898.7637ms)
✔ source edits during verification are CHANGED, including same status untracked content (4975.6578ms)
✔ timeout terminates check descendants and reports TIMEOUT (7019.9043ms)
✔ one identical command runs once and covers both IDs (5037.7959ms)
✔ outside git uses PASS? and never success exit (4883.9619ms)
✔ nested invocation detects changed untracked sibling content across the whole repository (5847.8279ms)
✔ failed timeout termination still returns TIMEOUT and retains process recovery (7185.87ms)
✔ a parent deadline stays bounded when auxiliary registration runs past the timeout (7545.1594ms)
ℹ tests 57
ℹ suites 0
ℹ pass 57
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 204683.4674
`````
</details>

<details>
<summary>qa-d8PNXntT/check.log</summary>

`````text
npm notice run may@0.2.0 check
npm notice run bash scripts/check-repo.sh
Repository checks passed
`````
</details>

<details>
<summary>English translation of reviewer handoff; narrative not verbatim</summary>

`````text
{
  "verdict": "ACCEPT — independent static review; no blocking findings in the reviewed delta. This is not QA or a claim that tests passed.",
  "acceptance": [
    {
      "criterion": "Start only creates its own marked session and does not sweep or modify other sessions",
      "evidence": "skills/may/scripts/may-session.sh:179-183 removes the sweep invocation and only creates a unique directory and marker; tests/session.test.ts:29-42 tests a 48-hour session without a PID, binary contents, marker, and mtime."
    },
    {
      "criterion": "Explicit sweep retains its guards; stop, track, exit codes and Git Bash paths are preserved",
      "evidence": "The script diff only removes one sweep invocation; sweep, stop and track implementations are unchanged. Existing tests cover old/young sessions, live processes, unsafe paths and process identity. This is a static assessment, not execution."
    },
    {
      "criterion": "Real regression and documentation",
      "evidence": "The regression runs the real script and checks the filesystem; runtime.md:114 and CHANGELOG.md:8 explain the change. Provenance reports red exit 1 and the initial suite 13/13 exit 0, but the reviewer did not run or reverify tests."
    },
    {
      "criterion": "Inherited README and scope",
      "evidence": "The README delta matches baseline.patch, separate from task.patch; study and installation claims in README cannot be independently confirmed from the permitted artifacts. No out-of-scope task changes were found."
    }
  ],
  "fingerprint": {
    "head_and_baseline": "ebdb130c05809c6298bb5618d9124fe2395c93e1",
    "full_binary_diff_sha256": "7394ffa519136ae1b153ede06e63f814b7535fdce7720812a2ba06748c99759f",
    "baseline_patch_sha256": "f5768d126b76af519412c5e295305388c5e6ec3d328f895a328985edd2c4703f",
    "task_patch_sha256": "1c75b55ca00ea78ff3538b71cb1f1b7a1eb33da92f0d7b462fe9246686233a1c",
    "files_sha256": {
      "README.md": "b94dfa65b66dd013de8c26a78013853d09b41f17a251d5411d0811ca4b33115e",
      "CHANGELOG.md": "a1ed5ce637fdfbffd567872d5573726222fac45e535563d0ecfd5a81fc85446b",
      "skills/may/scripts/may-session.sh": "8ad4f9036cb0a192765c7284fc49b8b0af1b93a39131e07173cc4e5edbf1721e",
      "skills/may/references/runtime.md": "d955293a0d2b1d0dac6121829aa0cb86fcb6e8b1a4c3065719d39a9feecabe6e",
      "tests/session.test.ts": "1f869451749f142969d74cb04ea64078475e121f903eb787705a38a21b224445"
    },
    "status": "The five files above are modified; no untracked files were reported by git status --porcelain=v1 --untracked-files=all. Fingerprints match candidate-fingerprints.log."
  },
  "commands": [
    {
      "command": "git rev-parse HEAD",
      "exit": 0
    },
    {
      "command": "git status --porcelain=v1 --untracked-files=all",
      "exit": 0
    },
    {
      "command": "git diff --no-ext-diff ebdb130c05809c6298bb5618d9124fe2395c93e1 -- CHANGELOG.md README.md skills/may/references/runtime.md skills/may/scripts/may-session.sh tests/session.test.ts",
      "exit": 0
    },
    {
      "command": "git diff --no-ext-diff --binary ebdb130c05809c6298bb5618d9124fe2395c93e1 | sha256sum",
      "exit": 0,
      "note": "The printed pipeline status is the status of sha256sum; the hash matches the recorded all-changes.patch."
    },
    {
      "command": "sha256sum README.md CHANGELOG.md skills/may/scripts/may-session.sh skills/may/references/runtime.md tests/session.test.ts ../baseline.patch ../task.patch",
      "exit": 0
    }
  ],
  "limitations": "No tests, smoke, installation, configuration, or file changes were performed. Static inspection does not prove runtime behavior or platform support."
}
`````
</details>

<details>
<summary>Vibe QA result</summary>

`````text
{
  "result": "QA passed on candidate; no candidate changes made.",
  "checks": "Git Bash 5.2.37, Node v26.13.0, npm 12.2.1: node --test tests/session.test.ts exit 0 (13/13, 23.94s); npm test exit 0 (57/57, 204.68s); npm run check exit 0 (Repository checks passed, 5s). Sequential; isolated TMPDIR/TEMP/TMP; total runner 238.51s.",
  "fingerprint": "Before and after HEAD ebdb130c05809c6298bb5618d9124fe2395c93e1; git diff --binary SHA256 7394ffa519136ae1b153ede06e63f814b7535fdce7720812a2ba06748c99759f; README SHA256 b94dfa65b66dd013de8c26a78013853d09b41f17a251d5411d0811ca4b33115e. Status unchanged: CHANGELOG.md, README.md, skills/may/references/runtime.md, skills/may/scripts/may-session.sh, tests/session.test.ts modified.",
  "smoke": "Owned smoke-root/may-old marker and payload SHA256 unchanged after start; sweep --max-age-hours 24 exit 0 removed only fixture; stop exit 0 removed exact created session /tmp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/qa-d8PNXntT/smoke-root/may-7uipOf. No processes were tracked in smoke.",
  "artifacts": "<USER_HOME>/AppData/Local/Temp/vibe-session-benchmark-tCbHNiG4/may-p0NEbO/qa-d8PNXntT contains run.log, run-retry.log, session.log, npm-test.log, check.log, run.sh and isolated temp roots; retained for inspection. Candidate remains in existing parent.",
  "caveats": "Initial runner exited 1 before any test due to unbound TMPDIR; raw run.log retained; corrected runner then executed tests once each. QA harness is omp worker, model openai-codex/gpt-6.1-terra; cost unavailable. No MAY verifier or workflow invoked; verifier behavior and real-model workflow behavior were not independently tested."
}
`````
</details>
