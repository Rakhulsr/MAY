#!/usr/bin/env bash
set -euo pipefail

usage() { printf 'Usage: may-session.sh start | stop <dir> [--keep] | sweep [--max-age-hours N] | track <dir> <pid> | snapshot <dir> | scope <dir> [path...]\n' >&2; }
tmp_root="${TMPDIR:-${TEMP:-${TMP:-/tmp}}}"
mkdir -p "$tmp_root"
tmp_root="$(cd "$tmp_root" && pwd -P)"
native_root=""
case "$(uname -s)" in MINGW*|MSYS*|CYGWIN*) native_root="$(cygpath -m "$tmp_root")" ;; esac

session_path() {
 local target="${1//\\//}" parent name
 while [[ "$target" == */ ]] && [ "$target" != / ]; do target="${target%/}"; done
 [ -n "$target" ] && [ -d "$target" ] && [ ! -L "$target" ] || return 1
 validated_session="$(cd "$target" && pwd -P)" || return 1
 parent="${validated_session%/*}"; name="${validated_session##*/}"
 # Git Bash may print the temp folder as /tmp or /c/...; compare the native form.
 if [ "$parent" != "$tmp_root" ] && [ -n "$native_root" ]; then parent="$(cygpath -m "$parent")" || return 1; [ "$parent" = "$native_root" ] || return 1
 else [ "$parent" = "$tmp_root" ] || return 1
 fi
 [[ "$name" =~ ^may-.+ ]] && [ -f "$validated_session/.may-session" ] && [ ! -L "$validated_session/.may-session" ]
}

# Print a path that native Windows tools can open too (C:/... instead of MSYS /tmp/...).
native_path() {
 case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*) cygpath -m "$1" 2>/dev/null && return 0 ;;
 esac
 printf '%s\n' "$1"
}

process_record() {
 local pid="$1" stat stamp group
 local fields=()
 if [ -r "/proc/$pid/stat" ]; then
  stat="$(cat "/proc/$pid/stat" 2>/dev/null)" || return 1
  read -r -a fields <<< "${stat##*) }"
  [ "${#fields[@]}" -ge 20 ] && [ "${fields[0]}" != Z ] || return 1
  printf '%s %s\n' "${fields[19]}" "${fields[2]}"
 else
  stamp="$(LC_ALL=C ps -o lstart= -p "$pid" 2>/dev/null)" || return 1
  [ -n "$stamp" ] || return 1
  group="$(ps -o pgid= -p "$pid" 2>/dev/null)" || return 1
  printf '%s %s\n' "${stamp//[[:space:]]/_}" "${group//[[:space:]]/}"
 fi
}

pid_alive() { kill -0 "$1" 2>/dev/null && process_record "$1" >/dev/null; }

# Group IDs remain reserved while group members exist, even after the leader exits.
group_members() {
 local group="$1" pid parent pgid winpid state rest
 case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*)
   while read -r pid parent pgid winpid rest; do
    # Cygwin/MSYS prefix stopped (S) or terminal-blocked (I, O) rows with a status letter.
    if [[ "$pid" =~ ^[A-Z]$ ]]; then read -r pid parent pgid winpid rest <<< "$parent $pgid $winpid $rest"; fi
    [[ "$pid" =~ ^[1-9][0-9]*$ ]] && [ "$pgid" = "$group" ] && pid_alive "$pid" && printf '%s\n' "$pid"
   done < <(ps -l) ;;
  *)
   while read -r pid pgid state; do
    if [ "$pgid" = "$group" ] && [[ "$state" != Z* ]]; then printf '%s\n' "$pid"; fi
   done < <(ps -axo pid=,pgid=,stat=) ;;
 esac
 return 0
}

stop_pid() {
 local pid="$1" expected="$2" group="$3" records="${4:-}" actual winpid child parent record tries members proof member identity member_group extra
 actual="$(process_record "$pid" 2>/dev/null || true)"
 if [ -n "$actual" ] && [ "${actual%% *}" != "$expected" ]; then
  printf 'PID %s identity changed; refusing termination and retaining session\n' "$pid" >&2; return 1
 fi
 if [ "$group" = "$pid" ]; then
  members="$(group_members "$group")"
  [ -n "$members" ] || return 0
  if [ -z "$actual" ]; then
   proof=0
   if [ -f "$records" ]; then
    while read -r member identity member_group extra; do
     [ "$member_group" = "$group" ] && [ -z "$extra" ] || continue
     record="$(process_record "$member" 2>/dev/null || true)"
     if [ "$record" = "$identity $group" ]; then proof=1; break; fi
    done < "$records"
   fi
   [ "$proof" -eq 1 ] || { printf 'Group %s ownership unverifiable; retaining session\n' "$group" >&2; return 1; }
  fi
  if [ -n "$actual" ] && [ -n "$records" ]; then
   while read -r member; do
    record="$(process_record "$member" 2>/dev/null || true)"
    [ "${record#* }" = "$group" ] || continue
    if ! grep -Fxq "$member $record" "$records"; then printf '%s %s\n' "$member" "$record" >> "$records"; fi
   done <<< "$members"
  fi
  case "$(uname -s)" in
   MINGW*|MSYS*|CYGWIN*)
    while read -r child; do
     record="$(process_record "$child" 2>/dev/null || true)"
     [ "${record#* }" = "$group" ] || continue
     [ -r "/proc/$child/winpid" ] || continue
     winpid="$(cat "/proc/$child/winpid")"
     if ! taskkill //PID "$winpid" //T //F >/dev/null 2>&1 && pid_alive "$child"; then
      printf 'Cannot terminate PID %s; retaining session\n' "$child" >&2; return 1
     fi
    done <<< "$members" ;;
   *) kill -TERM -- "-$group" 2>/dev/null || { [ -z "$(group_members "$group")" ] || return 1; } ;;
  esac
  for ((tries=0; tries<30; tries++)); do
   [ -n "$(group_members "$group")" ] || return 0
   sleep 0.1
  done
  case "$(uname -s)" in MINGW*|MSYS*|CYGWIN*) ;; *) kill -KILL -- "-$group" 2>/dev/null || true ;; esac
  for ((tries=0; tries<30; tries++)); do
   [ -n "$(group_members "$group")" ] || return 0
   sleep 0.1
  done
 else
  [ -n "$actual" ] || return 0
  if [ -r "/proc/$pid/winpid" ]; then
   winpid="$(cat "/proc/$pid/winpid")"
   if ! taskkill //PID "$winpid" //T //F >/dev/null 2>&1 && pid_alive "$pid"; then
    printf 'Cannot terminate PID %s; retaining session\n' "$pid" >&2; return 1
   fi
  else
   while read -r child parent; do
    if [ "$parent" = "$pid" ]; then
     record="$(process_record "$child" 2>/dev/null || true)"
     [ -z "$record" ] || stop_pid "$child" "${record%% *}" "${record#* }" || return 1
    fi
   done < <(ps -axo pid=,ppid=)
   kill -TERM "$pid" 2>/dev/null || { pid_alive "$pid" && return 1; }
  fi
  for ((tries=0; tries<30; tries++)); do
   pid_alive "$pid" || return 0
   sleep 0.1
  done
  if [ ! -r "/proc/$pid/winpid" ] && [ "$(process_record "$pid" 2>/dev/null || true)" = "$actual" ]; then kill -KILL "$pid" 2>/dev/null || true; fi
  pid_alive "$pid" || return 0
 fi
 printf 'PID/group %s remains alive; retaining session\n' "$pid" >&2
 return 1
}

stop_recorded() {
 local dir="$1" selected="${2:-}" pid identity group extra found=0
 if [ -f "$dir/pids" ]; then
  while read -r pid identity group extra; do
   [ -n "$pid" ] || continue
   [ -z "$selected" ] || [ "$selected" = "$pid" ] || continue
   found=1
   if [[ ! "$pid" =~ ^[1-9][0-9]*$ ]] || [ -z "$identity" ] || [[ ! "$group" =~ ^[1-9][0-9]*$ ]] || [ -n "$extra" ]; then
    printf 'Unverifiable process record; retaining %s\n' "$dir" >&2; return 1
   fi
   stop_pid "$pid" "$identity" "$group" "$dir/pids" || return 1
  done < "$dir/pids"
 fi
 if [ -n "$selected" ] && [ "$found" -eq 0 ] && { pid_alive "$selected" || [ -n "$(group_members "$selected")" ]; }; then
  printf 'PID %s still registering; retaining %s\n' "$selected" "$dir" >&2; return 1
 fi
 return 0
}

remove_session() {
 session_path "$1" || return 2
 rm -rf "$validated_session"
}

sweep() {
 local hours=24 dir now modified pid identity group extra alive
 if [ "$#" -gt 0 ]; then
  [ "$#" -eq 2 ] && [ "$1" = --max-age-hours ] && [[ "$2" =~ ^[1-9][0-9]*$ ]] || { usage; return 2; }
  hours="$2"
 fi
 now="$(date +%s)"
 for dir in "$tmp_root"/may-*; do
  session_path "$dir" || continue
  modified="$(date -r "$dir" +%s 2>/dev/null || stat -c %Y "$dir" 2>/dev/null || stat -f %m "$dir" 2>/dev/null || echo "$now")"
  [ "$((now-modified))" -ge "$((hours*3600))" ] || continue
  alive=0
  if [ -f "$dir/pids" ]; then
   while read -r pid identity group extra; do
    [ -n "$pid" ] || continue
    if [ -z "$identity" ] || [[ ! "$group" =~ ^[1-9][0-9]*$ ]] || [ -n "$extra" ]; then alive=1; continue; fi
    if pid_alive "$pid" || { [ "$group" = "$pid" ] && [ -n "$(group_members "$group")" ]; }; then alive=1; fi
   done < "$dir/pids"
  fi
  [ "$alive" -eq 0 ] || continue
  remove_session "$dir"
  native_path "$dir"
 done
}

scope_flush() {
 local path hash
 [ "${#files[@]}" -gt 0 ] || return 0
 git hash-object -- "${files[@]}" > "$dir/.scope-hashes" || return 1
 exec 3< "$dir/.scope-hashes"
 for path in "${files[@]}"; do
  IFS= read -r hash <&3 || return 1
  printf '%s\t%s\0' "$path" "$hash" >> "$dir/.scope-current"
 done
 exec 3<&-
 files=()
}

scope_record() {
 local path=$1
 case "$path" in *$'\t'*|*$'\n'*) printf 'Scope cannot represent a path containing a tab or newline\n' >&2; return 2 ;; esac
 if [ -e "$path" ] || [ -L "$path" ]; then
  files[${#files[@]}]=$path
  if [ "${#files[@]}" -ge 80 ]; then scope_flush || return 1; fi
 else
  printf '%s\tdeleted\0' "$path" >> "$dir/.scope-current"
 fi
}

scope_state() {
 local entry path
 local -a files=()
 git status --porcelain=v1 -z --untracked-files=all > "$dir/.scope-status" || return 1
 : > "$dir/.scope-current"
 while IFS= read -r -d '' entry; do
  path=${entry:3}
  scope_record "$path" || return $?
  if [[ ${entry:0:2} == *R* || ${entry:0:2} == *C* ]]; then
   IFS= read -r -d '' path || return 1
   scope_record "$path" || return $?
  fi
 done < "$dir/.scope-status"
 scope_flush || return 1
}

scope_emit() {
 local arg
 [ -n "$path" ] && [ "$old" != "$new" ] || return 0
 for arg in "$@"; do [ "$path" != "$arg" ] || return 0; done
 printf '%s\n' "$path"
 result=1
}

scope_command() {
 local action=$1 head root record path previous old new tag value result=0
 shift
 [ "$#" -ge 1 ] && [ -n "$1" ] || { usage; return 2; }
 [ "$action" != snapshot ] || [ "$#" -eq 1 ] || { usage; return 2; }
 session_path "$1" || { usage; return 2; }
 dir=$validated_session; shift
 root=$(git rev-parse --show-toplevel) || return 1
 cd "$root"
 head=$(git rev-parse HEAD) || return 1
 if [ "$action" = scope ] && [ ! -f "$dir/scope-snapshot" ]; then
  printf 'Missing scope snapshot\n' >&2; return 2
 fi
 scope_state || return $?
 if [ "$action" = snapshot ]; then
  { printf '%s\0' "$head"; cat "$dir/.scope-current"; } > "$dir/scope-snapshot"
  return 0
 fi
 {
  IFS= read -r -d '' old || return 2
  cat > "$dir/.scope-baseline"
 } < "$dir/scope-snapshot"
 if [ "$old" != "$head" ]; then printf 'HEAD: %s -> %s\n' "$old" "$head"; result=1; fi
 {
  while IFS= read -r -d '' record; do printf '%s\tB\0' "$record"; done < "$dir/.scope-baseline"
  while IFS= read -r -d '' record; do printf '%s\tC\0' "$record"; done < "$dir/.scope-current"
 } | LC_ALL=C sort -z > "$dir/.scope-sorted"
 previous=; old=; new=
 while IFS= read -r -d '' record; do
  path=${record%%$'\t'*}; value=${record#*$'\t'}; tag=${value##*$'\t'}; value=${value%$'\t'*}
  if [ "$path" != "$previous" ]; then
   path=$previous; scope_emit "$@"
   path=${record%%$'\t'*}; previous=$path; old=; new=
  fi
  if [ "$tag" = B ]; then old=$value; else new=$value; fi
 done < "$dir/.scope-sorted"
 path=$previous; scope_emit "$@"
 return "$result"
}

if [ "${BASH_SOURCE[0]}" != "$0" ]; then return 0; fi
case "${1:-}" in
 snapshot|scope) action=$1; shift; scope_command "$action" "$@" ;;
 start)
  [ "$#" -eq 1 ] || { usage; exit 2; }
  sweep >/dev/null
  dir="$(mktemp -d "$tmp_root/may-XXXXXX")" || exit 1
  printf 'MAY session\n' > "$dir/.may-session"
  native_path "$dir" ;;
 stop)
  [ "$#" -ge 2 ] && [ "$#" -le 3 ] || { usage; exit 2; }
  keep=0
  if [ "$#" -eq 3 ]; then [ "$3" = --keep ] || { usage; exit 2; }; keep=1; fi
  session_path "$2" || { printf 'Refusing unsafe or unmarked session path: %s\n' "$2" >&2; exit 2; }
  dir="$validated_session"
  stop_recorded "$dir"
  if [ "$keep" -eq 1 ]; then native_path "$dir"; else shown="$(native_path "$dir")"; remove_session "$dir" && printf 'Removed %s\n' "$shown"; fi ;;
 sweep) shift; sweep "$@" ;;
 track)
  [ "$#" -eq 3 ] && [[ "$3" =~ ^[1-9][0-9]*$ ]] && [ "$3" -gt 1 ] || { usage; exit 2; }
  session_path "$2" || { usage; exit 2; }
  dir="$validated_session"; pid="$3"
  record="$(process_record "$pid")" || { printf 'Cannot identify live PID %s\n' "$pid" >&2; exit 1; }
  if ! grep -Fxq "$pid $record" "$dir/pids" 2>/dev/null; then printf '%s %s\n' "$pid" "$record" >> "$dir/pids"; fi
  if [ "${record#* }" = "$pid" ]; then
   while read -r member; do
    member_record="$(process_record "$member" 2>/dev/null || true)"
    [ -n "$member_record" ] || continue
    if ! grep -Fxq "$member $member_record" "$dir/pids"; then printf '%s %s\n' "$member" "$member_record" >> "$dir/pids"; fi
   done < <(group_members "$pid")
  fi ;;
 *) usage; exit 2 ;;
esac
