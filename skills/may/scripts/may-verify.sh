#!/usr/bin/env bash
set -euo pipefail
usage() { printf 'Usage: may-verify.sh --check "ID=command" [--check "ID=command"] [--timeout seconds] [--show-output]\n' >&2; exit 2; }
ids=() commands=() owners=() statuses=() codes=()
seconds=600
show_output=0
while [ "$#" -gt 0 ]; do
 case "$1" in
  --check)
   [ "$#" -ge 2 ] && [[ "$2" == *=* ]] || usage
   id="${2%%=*}"; cmd="${2#*=}"
   [[ "$id" =~ ^[A-Za-z0-9_.-]+$ ]] && [[ "$cmd" =~ [^[:space:]] ]] || usage
   for existing in "${ids[@]}"; do [ "$id" != "$existing" ] || usage; done
   ids+=("$id"); commands+=("$cmd"); shift 2 ;;
  --timeout) [ "$#" -ge 2 ] && [[ "$2" =~ ^[1-9][0-9]*$ ]] || usage; seconds="$2"; shift 2 ;;
  --show-output) show_output=1; shift ;;
  *) usage ;;
 esac
done
[ "${#ids[@]}" -gt 0 ] || usage
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
session="$here/may-session.sh"
work="$("$BASH" "$session" start)"
retain=0
cleanup() {
 [ -n "$work" ] || return 0
 [ ! -d "$work" ] || touch "$work/cancel"
 if [ "$retain" -eq 1 ]; then printf 'Retained session: %s\n' "$work"; return 0; fi
 if ! "$BASH" "$session" stop "$work" >/dev/null; then printf 'Retained session: %s\n' "$work"; exit 1; fi
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
in_git=0
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then in_git=1; fi
revision=none
if [ "$in_git" -eq 1 ]; then revision="$(git rev-parse --verify HEAD 2>/dev/null || printf unborn)"; fi
repo_root=
[ "$in_git" -eq 0 ] || repo_root="$(git rev-parse --show-toplevel)"
fingerprint() {
 [ "$in_git" -eq 1 ] || { printf none; return; }
 (
  cd "$repo_root"
  git rev-parse --verify HEAD 2>/dev/null || printf unborn
  git status --porcelain=v1 -uall -z
  if [ "$revision" = unborn ]; then git diff --binary; git diff --cached --binary; else git diff HEAD --binary; fi
  while IFS= read -r -d '' file; do
   printf '%s\0' "$file"
   git hash-object -- "$file"
  done < <(git ls-files --others --exclude-standard -z)
 ) | git hash-object --stdin
}
initial="$(fingerprint)"
trivial() {
 local plain first
 plain="${1//\"/}"; plain="${plain//\'/}"
 first="${plain%%;*}"; first="${first%%&&*}"; first="${first%%||*}"
 shopt -s nocasematch
 local pattern='^[[:space:]]*(exit([[:space:]]+0)?|true|:|rem([[:space:]].*)?|echo([[:space:]].*)?|cmd[[:space:]]+/c[[:space:]]+exit[[:space:]]+0|node[[:space:]]+(-e[[:space:]]+(0|process\.exit\(0\))|--version|-v)|npm[[:space:]]+--version)[[:space:]]*$'
 [[ "$first" =~ $pattern ]]
}
no_tests() {
 local line go_empty=0 go_passed=0
 local go_package='^[[:space:]]*ok[[:space:]]+[^[:space:]]+[[:space:]]+([0-9]+(\.[0-9]+)?s|\(cached\))([[:space:]]+coverage:[[:space:]]+.*)?'
 local go_no_files='^[[:space:]]*\?[[:space:]]+[^[:space:]]+[[:space:]]+\[no test files\][[:space:]]*$'
 local go_no_run="${go_package}"'[[:space:]]+\[no tests to run\][[:space:]]*$'
 local go_success="${go_package}"'[[:space:]]*$'
 shopt -s nocasematch
 while IFS= read -r line || [ -n "$line" ]; do
  if [[ "$line" =~ $go_no_files ]] || [[ "$line" =~ $go_no_run ]]; then go_empty=1; continue; fi
  [[ "$line" =~ ^[[:space:]]*(ℹ|\#)[[:space:]]+(tests|pass)[[:space:]]+0([[:space:]]|$) ]] && return 0
  [[ "$line" =~ no[[:space:]]+tests[[:space:]]+(found|ran)|no[[:space:]]+test[[:space:]]+files|(^|[^0-9])0[[:space:]]+passing|ran[[:space:]]+0[[:space:]]+tests|tests:[[:space:]]+0[[:space:]]+total ]] && return 0
  [[ "$line" =~ $go_success ]] && go_passed=1
 done < "$1"
 [ "$go_empty" -eq 1 ] && [ "$go_passed" -eq 0 ]
}
set -m
for ((i=0; i<${#ids[@]}; i++)); do
 owner="$i"
 for ((j=0; j<i; j++)); do
  if [ "${commands[$i]}" = "${commands[$j]}" ]; then owner="${owners[$j]}"; break; fi
 done
 owners+=("$owner")
 [ "$owner" -eq "$i" ] || continue
 statuses[$i]=TRIVIAL; codes[$i]='-'
 trivial "${commands[$i]}" && continue
 rm -f "$work/timedout" "$work/cancel"
 "$BASH" -c '"$BASH" "$1" track "$2" "$$" || exit; [ -d "$2" ] && [ ! -e "$2/cancel" ] || exit 143; "$BASH" -c "$3"; code=$?; "$BASH" "$1" track "$2" "$$" || exit; exit "$code"' sh "$session" "$work" "${commands[$i]}" >"$work/$i.log" 2>&1 & pid=$!
 # SECONDS is integer-valued; rounding up prevents terminating a check early.
 deadline=$((SECONDS+seconds+1))
 while kill -0 "$pid" 2>/dev/null; do
  if [ "$SECONDS" -ge "$deadline" ]; then touch "$work/timedout"; break; fi
  sleep 0.05
 done
 code=124
 if [ ! -e "$work/timedout" ]; then code=0; wait "$pid" 2>/dev/null || code=$?; fi
 touch "$work/cancel"
 if ! "$BASH" -c 'source "$1"; stop_recorded "$2" "$3"' sh "$session" "$work" "$pid" >"$work/cleanup.log" 2>&1 || ! "$BASH" "$session" stop "$work" --keep >>"$work/cleanup.log" 2>&1; then
  retain=1
  status=FAIL; [ ! -e "$work/timedout" ] || status=TIMEOUT
  printf 'MAY VERIFY\nrevision %s tree %s\n%s  %s  exit=%s  %s\n' "$revision" "$initial" "${ids[$i]}" "$status" "$code" "${commands[$i]}"
  printf '%s\n' 'CLEANUP FAIL; process recovery data retained'
  tail -n 40 "$work/cleanup.log"
  printf 'NOTE remaining checks not run after cleanup failure\nRESULT FAIL 0/%s passed\n' "${#ids[@]}"
  exit 1
 fi
 : > "$work/pids"
 codes[$i]="$code"
 if [ -e "$work/timedout" ]; then statuses[$i]=TIMEOUT
 elif [ "$code" -ne 0 ]; then statuses[$i]=FAIL
 elif no_tests "$work/$i.log"; then statuses[$i]=NO_TESTS
 elif [ "$in_git" -eq 0 ]; then statuses[$i]='PASS?'
 else statuses[$i]=PASS
 fi
done
final="$(fingerprint)"
printf 'MAY VERIFY\nrevision %s tree %s\n' "$revision" "$initial"
passed=0
for ((i=0; i<${#ids[@]}; i++)); do
 owner="${owners[$i]}"; status="${statuses[$owner]}"
 if [ "$initial" != "$final" ] && [ "$status" != TRIVIAL ] && [ "$status" != TIMEOUT ]; then status=CHANGED; fi
 printf '%s  %s  exit=%s  %s\n' "${ids[$i]}" "$status" "${codes[$owner]}" "${commands[$i]}"
 if [ "$status" = PASS ]; then passed=$((passed+1)); fi
 if [ -f "$work/$owner.log" ] && { [ "$status" != PASS ] || [ "$show_output" -eq 1 ]; }; then
  printf '%s\n' "--- ${ids[$i]} output tail"; tail -n 40 "$work/$owner.log"
 fi
 if [ "$owner" -eq "$i" ]; then
  names="${ids[$i]}"; count=1
  for ((j=i+1; j<${#ids[@]}; j++)); do if [ "${owners[$j]}" -eq "$i" ]; then names="$names, ${ids[$j]}"; count=$((count+1)); fi; done
  [ "$count" -eq 1 ] || printf 'NOTE one command covers %s\n' "$names"
 fi
done
if ! "$BASH" "$session" stop "$work" >/dev/null; then
 retain=1; printf 'RESULT FAIL cleanup incomplete\n'; exit 1
fi
work=
result=FAIL; [ "$passed" -ne "${#ids[@]}" ] || result=PASS
printf 'RESULT %s %s/%s passed\n' "$result" "$passed" "${#ids[@]}"
[ "$result" = PASS ]
