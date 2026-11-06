#!/usr/bin/env bash
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$here/may-session.sh"
usage() { printf 'Usage: may-e2e.sh --session <dir> --spec <path> [--start "command" --url URL --wait seconds] [--remote-ok]\n' >&2; exit 2; }
dir= spec= start= url= seconds=60 remote=0
while [ "$#" -gt 0 ]; do
 case "$1" in
  --session|--spec|--start|--url|--wait)
   [ "$#" -ge 2 ] && [ -n "$2" ] || usage
   case "$1" in --session) dir="$2";; --spec) spec="$2";; --start) start="$2";; --url) url="$2";; --wait) seconds="$2";; esac
   shift 2 ;;
  --remote-ok) remote=1; shift ;;
  *) usage ;;
 esac
done
session_path "$dir" && [ -n "$spec" ] && [[ "$seconds" =~ ^[1-9][0-9]*$ ]] || usage
dir="$validated_session"
[ -z "$start" ] || [ -n "$url" ] || usage
local_url='^https?://(localhost|127\.0\.0\.1|\[::1\])(:[0-9]+)?([/?#]|$)'
if [ -n "$url" ] && [ "$remote" -eq 0 ] && [[ ! "$url" =~ $local_url ]]; then printf 'Refusing remote URL; explicit user request and --remote-ok required\n' >&2; exit 2; fi
printf 'MAY VERIFY\n'
if ! TMPDIR="$dir" TEMP="$dir" TMP="$dir" npm_config_cache="$dir/npm-cache" npx --no-install playwright --version >"$dir/playwright-version.log" 2>&1; then
 printf 'E2E UNAVAILABLE: Playwright is not installed. Installing it requires user permission.\nRESULT UNAVAILABLE\n'
 exit 3
fi
server_pid= runner_pid=
run_dir="$(mktemp -d "$dir/e2e-run-XXXXXX")"
cleanup() {
 local failed=0
 [ ! -d "$run_dir" ] || touch "$run_dir/cancel" || failed=1
 [ -z "$runner_pid" ] || stop_recorded "$dir" "$runner_pid" || failed=1
 [ -z "$server_pid" ] || stop_recorded "$dir" "$server_pid" || failed=1
 return "$failed"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
set -m
if [ -n "$start" ]; then
 command -v curl >/dev/null 2>&1 || { printf 'E2E FAIL: curl is required for server readiness\nRESULT FAIL\n'; exit 1; }
 bash -c 'bash "$1" track "$2" "$$" || exit; [ -d "$4" ] && [ ! -e "$4/cancel" ] || exit 143; bash -c "$3"; code=$?; bash "$1" track "$2" "$$" || exit; exit "$code"' sh "$here/may-session.sh" "$dir" "$start" "$run_dir" >"$dir/server.log" 2>&1 & server_pid=$!
 ready=0; deadline=$((SECONDS+seconds))
 while [ "$SECONDS" -lt "$deadline" ]; do
  if curl --silent --fail --max-time 1 "$url" >/dev/null 2>&1; then ready=1; break; fi
  pid_alive "$server_pid" || break
  sleep 0.2
 done
 if [ "$ready" -ne 1 ]; then printf 'E2E FAIL: server did not become ready\n--- server output tail\n'; tail -n 40 "$dir/server.log"; printf 'RESULT FAIL\n'; exit 1; fi
fi
BASE_URL="$url" bash -c 'session="$1"; dir="$2"; run="$3"; bash "$session" track "$dir" "$$" || exit; [ -d "$run" ] && [ ! -e "$run/cancel" ] || exit 143; shift 3; TMPDIR="$run" TEMP="$run" TMP="$run" npm_config_cache="$run/npm-cache" npx --no-install playwright test "$@"; code=$?; bash "$session" track "$dir" "$$" || exit; exit "$code"' sh "$here/may-session.sh" "$dir" "$run_dir" "$spec" --output "$dir/e2e" --reporter=line >"$dir/playwright.log" 2>&1 & runner_pid=$!
code=0; wait "$runner_pid" 2>/dev/null || code=$?
if ! cleanup; then printf 'E2E FAIL: process cleanup failed; session retained at %s\nRESULT FAIL\n' "$dir"; exit 1; fi
server_pid= runner_pid=
if [ "$code" -eq 0 ]; then
 rm -rf "$dir/e2e"
 printf 'E2E  PASS  exit=0  playwright test %s\nRESULT PASS\n' "$spec"
else
 printf 'E2E  FAIL  exit=%s  playwright test %s\n--- E2E output tail\n' "$code" "$spec"
 tail -n 40 "$dir/playwright.log"
 printf 'Artifacts: %s/e2e\nRESULT FAIL\n' "$dir"
 exit 1
fi
