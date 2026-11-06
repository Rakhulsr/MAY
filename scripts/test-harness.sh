#!/usr/bin/env bash
# Use a published-file copy and temporary home, isolated from local files and user config.
# Installation proof does not establish workflow support.
set -euo pipefail

usage() {
	echo "usage: test-harness.sh <pi|omp|codex|claude>" >&2
	exit 2
}

[ $# -eq 1 ] || usage
harness="$1"
case "$harness" in
	pi | omp | codex | claude) ;;
	*) usage ;;
esac

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
private_protocols="$(git -C "$root" ls-files --cached -- AGENTS.local.md CLAUDE.local.md GEMINI.local.md)"
if [ -n "$private_protocols" ]; then
	echo "FAIL: private protocols are staged or tracked: $private_protocols" >&2
	exit 1
fi

if ! command -v "$harness" >/dev/null 2>&1; then
	echo "SKIP $harness: not installed"
	exit 3
fi

work="$(mktemp -d)"
cleanup() {
	rm -rf "$work" 2>/dev/null || true
}
trap cleanup EXIT

native() {
	if command -v cygpath >/dev/null 2>&1; then cygpath -w "$1"; else printf '%s' "$1"; fi
}

package="$work/package/may"
mkdir -p "$package"
(cd "$root" && git ls-files --cached --others --exclude-standard -z -- . ':(top,literal,exclude)AGENTS.local.md' ':(top,literal,exclude)CLAUDE.local.md' ':(top,literal,exclude)GEMINI.local.md') | while IFS= read -r -d '' file; do
	[ -f "$root/$file" ] || continue
	mkdir -p "$package/$(dirname "$file")"
	cp "$root/$file" "$package/$file"
done
git_quiet=(-C "$package" -c core.autocrlf=false -c core.safecrlf=false -c user.name=may -c user.email=may@example.invalid)
git "${git_quiet[@]}" init -q -b main
git "${git_quiet[@]}" add -A
git "${git_quiet[@]}" commit -qm "published file set"
source_path="$(native "$package")"
home="$work/home"
mkdir -p "$home"

expected_skills="$(find "$package/skills" -mindepth 2 -maxdepth 2 -name SKILL.md | wc -l | tr -d ' ')"
version="$("$harness" --version 2>&1 | head -1)"

# Distinct MAY skill names, because a harness can keep a marketplace copy beside the installed one.
count_skills() {
	find "$1" -type f -name SKILL.md 2>/dev/null | while IFS= read -r file; do
		basename "$(dirname "$file")"
	done | grep -E '^(may-[a-z-]+|using-may)$' | sort -u | wc -l | tr -d ' '
}

# The harness itself must list the plugin as installed, since files alone prove little.
require_listed() {
	if ! printf '%s' "$1" | grep -qE "$2"; then
		echo "FAIL $harness ($version): the harness does not list the plugin as installed"
		printf '%s\n' "$1" | head -8
		exit 1
	fi
}

report() {
	local found="$1"
	if [ "$found" -ne "$expected_skills" ]; then
		echo "FAIL $harness ($version): found $found of $expected_skills skills"
		exit 1
	fi
	local runtime
	if [ "$harness" = pi ]; then
		runtime="$package/skills/using-may/scripts"
	else
		runtime="$(find "$home" -type d -path '*/using-may/scripts' -print -quit)"
	fi
	[ -n "$runtime" ] || { echo "FAIL $harness: installed runtime directory missing"; exit 1; }
	for name in may-session.sh may-verify.sh may-e2e.sh; do
		[ -f "$runtime/$name" ] && bash -n "$runtime/$name" || { echo "FAIL $harness: $name missing or invalid"; exit 1; }
	done
	local session code
	export TMPDIR="$work/runtime tmp"
	mkdir -p "$TMPDIR"
	session="$(bash "$runtime/may-session.sh" start)"
	[ -f "$session/.may-session" ] || { echo "FAIL $harness: installed session script did not run"; exit 1; }
	bash "$runtime/may-session.sh" stop "$session"
	code=0; bash "$runtime/may-verify.sh" >/dev/null 2>&1 || code=$?
	[ "$code" -eq 2 ] || { echo "FAIL $harness: installed verifier did not run"; exit 1; }
	code=0; bash "$runtime/may-e2e.sh" >/dev/null 2>&1 || code=$?
	[ "$code" -eq 2 ] || { echo "FAIL $harness: installed E2E script did not run"; exit 1; }
	echo "OK $harness: 3 of 3 runtime scripts present and runnable."
	echo "OK $harness ($version): $found of $expected_skills skills installed. Level: installable."
}

case "$harness" in
	pi)
		export PI_CODING_AGENT_DIR
		PI_CODING_AGENT_DIR="$(native "$home")"
		pi install "$source_path" >/dev/null
		# Ask real Pi what it loaded, with no model call and only the package installed.
		reply="$(printf '%s\n' '{"id":"c","type":"get_commands"}' | timeout 60 pi --mode rpc --offline --no-context-files --session-dir "$(native "$work/sessions")" 2>/dev/null || true)"
		found="$(printf '%s' "$reply" | node --input-type=module -e '
			let raw = "";
			for await (const chunk of process.stdin) raw += chunk;
			const line = raw.split("\n").find((l) => l.includes("\"get_commands\""));
			const names = JSON.parse(line).data.commands.map((c) => c.name);
			console.log(names.filter((n) => /^skill:(may-[a-z-]+|using-may)$/.test(n)).length);
		')"
		report "$found"
		;;
	omp)
		export HOME USERPROFILE
		HOME="$(native "$home")"
		USERPROFILE="$HOME"
		omp plugin marketplace add "$source_path" >/dev/null
		omp plugin install may@may >/dev/null
		require_listed "$(omp plugin list 2>&1)" "may@may"
		report "$(count_skills "$home")"
		;;
	codex)
		export CODEX_HOME
		CODEX_HOME="$(native "$home")"
		codex plugin marketplace add "$source_path" >/dev/null 2>&1
		codex plugin add may@may >/dev/null 2>&1
		require_listed "$(codex plugin list 2>/dev/null)" "may@may +installed"
		report "$(count_skills "$home")"
		;;
	claude)
		export CLAUDE_CONFIG_DIR
		CLAUDE_CONFIG_DIR="$(native "$home")"
		claude plugin validate "$source_path" >/dev/null
		claude plugin marketplace add "$source_path" >/dev/null
		claude plugin install may@may >/dev/null
		require_listed "$(claude plugin list 2>&1)" "may@may"
		report "$(count_skills "$home")"
		;;
esac
