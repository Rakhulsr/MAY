# Browser verification

Read this only when a criterion covers implemented browser functionality. UX planning or text examples alone do not require browser or image tools.

Implemented browser functionality requires real browser verification, not screenshots alone. For native browser and Playwright alike, identify the approved target and candidate/build exercised, actions and observed results; missing identity or observation is not proof of the implemented candidate. Use an available trusted native browser connection; otherwise write or select the appropriate regression and use the optional E2E runner only with the project's already-installed Playwright. If neither route is available, report the browser criterion as blocked and ask permission before installing anything. The runner executes tests rather than creating them; it additionally needs npx and curl for server readiness.

For the runner, keep evidence available across tool calls:

1. Create a marked session with `bash "$MAY_SKILL_DIR/scripts/may-session.sh" start` and record its printed absolute path in task/chat context before running E2E. Run from the target project; use its real spec, start command, and approved URL.
2. Capture the runner exit even in shells using `set -e`:

```bash
if bash "$MAY_SKILL_DIR/scripts/may-e2e.sh" --session "$session" --spec tests/login.spec.ts --start "npm run dev" --url http://localhost:3000; then
  code=0
else
  code=$?
fi
```

3. Exit `0` is pass: stop the exact session and check cleanup succeeded. Exit `1` is test/readiness/process-cleanup failure; exit `2` is invalid usage or a rejected target. For either, stop with `--keep`, inspect the retained logs/artifacts in the next tool call if necessary, then stop without `--keep` to delete the session. Exit `3` is Playwright unavailable, not a failed regression: clean the session, report blocked, and ask installation permission. Preserve the original result in the report; cleanup failure is an additional failure with the remaining path disclosed.

Resolve the installed skill path and substitute the recorded absolute session path again in subsequent tool calls; do not assume `$session` or `$MAY_SKILL_DIR` survives. Never attach an unconditional deleting EXIT trap before evidence that must be inspected in another call. Use remote URLs only when explicitly requested, with `--remote-ok`, never production.
