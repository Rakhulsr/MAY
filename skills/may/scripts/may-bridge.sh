#!/usr/bin/env bash
set -euo pipefail

usage() {
 printf 'Usage: may-bridge.sh validate <packet.json>\n       may-bridge.sh host\n       may-bridge.sh open <program> [args...]\n' >&2
 exit 2
}

hosts='herdr zellij tmux herdr-app wezterm windows-terminal vscode zed none'

# Report the host from the signals each one sets in its own panes. Multiplexers run inside
# GUI terminals and IDEs, so they are checked first: the inner host wins. MAY_HOST overrides.
detect_host() {
 if [ -n "${MAY_HOST:-}" ]; then
  case " $hosts " in *" $MAY_HOST "*) printf '%s\n' "$MAY_HOST"; return ;; esac
  printf 'MAY_HOST must be one of: %s\n' "$hosts" >&2
  exit 2
 fi
 if [ "${HERDR_ENV:-}" = 1 ]; then echo herdr
 elif [ -n "${ZELLIJ+x}" ]; then echo zellij
 elif [ -n "${TMUX:-}" ]; then echo tmux
 elif [ -n "${HC_TERMINAL_ID:-}" ]; then echo herdr-app
 elif [ -n "${WEZTERM_PANE:-}" ]; then echo wezterm
 elif [ -n "${WT_SESSION:-}" ]; then echo windows-terminal
 elif [ "${TERM_PROGRAM:-}" = vscode ]; then echo vscode
 elif [ "${ZED_TERM:-}" = true ] || [ "${TERM_PROGRAM:-}" = zed ]; then echo zed
 else echo none
 fi
}

# Herdr types the command into the new pane's shell, which may be POSIX or PowerShell.
# A bare program name followed by single-quoted arguments parses the same way in both.
herdr_line() {
 local arg line
 case $1 in *[!A-Za-z0-9_./:-]*) printf 'Herdr cannot run program name %s safely in every shell.\n' "$1" >&2; exit 2 ;; esac
 line=$1; shift
 for arg in "$@"; do
  case $arg in *"'"*|*$'\n'*|*$'\r'*) printf 'Herdr cannot pass an argument containing a single quote or line break.\n' >&2; exit 2 ;; esac
  line+=" '$arg'"
 done
 printf '%s' "$line"
}

open_herdr() {
 local out pane re='"pane"[[:space:]]*:[[:space:]]*[{][^}]*"pane_id"[[:space:]]*:[[:space:]]*"([^"]+)"'
 out=$(herdr pane split --current --direction right --cwd "$PWD" --no-focus) || return 1
 [[ $out =~ $re ]] || return 1
 pane=${BASH_REMATCH[1]}
 herdr pane run "$pane" "$2" >/dev/null || return 1
 printf '%s\n' "$pane"
}

# Open a pane or tab in the current host, never a new window. Exit 3 tells the caller to run headless.
open_pane() {
 local host cli line=
 host=$(detect_host)
 case $host in
  herdr) cli=herdr; line=$(herdr_line "$@") ;;
  zellij|tmux|wezterm) cli=$host ;;
  herdr-app) cli=hc ;;
  windows-terminal) cli=wt ;;
  *) printf 'Host %s has no pane command; run the program headless instead.\n' "$host" >&2; exit 3 ;;
 esac
 if ! command -v "$cli" >/dev/null 2>&1; then
  printf 'Host %s detected but %s is not on PATH; run the program headless instead.\n' "$host" "$cli" >&2
  exit 3
 fi
 case $host in
  herdr) open_herdr "$1" "$line" ;;
  zellij) zellij run --cwd "$PWD" -- "$@" ;;
  tmux) tmux split-window -d -P -c "$PWD" "$@" ;;
  # --no-notify: hc would otherwise type completion notes into the coordinator's own terminal.
  herdr-app) hc run --bg --json --no-notify --cwd "$PWD" -- "$@" ;;
  wezterm) wezterm cli split-pane --cwd "$PWD" -- "$@" ;;
  windows-terminal) wt -w 0 split-pane -d "$PWD" "$@" ;;
 esac || { printf 'Opening a %s pane failed; run the program headless instead.\n' "$host" >&2; exit 1; }
}

case ${1:-} in
 host) [ "$#" -eq 1 ] || usage; detect_host; exit 0 ;;
 open) shift; { [ "$#" -ge 1 ] && [ -n "$1" ]; } || usage; open_pane "$@"; exit 0 ;;
 validate) { [ "$#" -eq 2 ] && [ -n "$2" ]; } || usage ;;
 *) usage ;;
esac
if ! command -v node >/dev/null 2>&1; then
 printf 'MIP validation requires an already-installed Node.js.\n' >&2
 exit 2
fi

node - "$2" <<'NODE'
if (Number(process.versions.node.split('.')[0]) < 18) {
  console.error('MIP validation requires Node.js 18 or newer.');
  process.exit(2);
}
const fs = require('node:fs');
const limit = 256 * 1024;
const fail = () => { throw new Error('invalid'); };
const text = value => typeof value === 'string' && value.trim().length > 0;
const texts = value => Array.isArray(value) && value.every(text);
const unique = values => new Set(values).size === values.length;
const shape = (value, required, optional = []) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  return required.every(key => Object.hasOwn(value, key)) && keys.every(key => required.includes(key) || optional.includes(key));
};
const choice = (value, choices) => choices.includes(value);
function timestamp(value) {
  if (!text(value)) return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match || Number.isNaN(Date.parse(value))) return false;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1] &&
    Number(match[4]) <= 23 && Number(match[5]) <= 59 && Number(match[6]) <= 59;
}

// JSON.parse keeps the last duplicate key. Reject duplicates to avoid different consumers seeing different packets.
function uniqueKeys(input) {
  let i = 0;
  const ws = () => { while (/\s/.test(input[i] ?? '') && i < input.length) i++; };
  function string() {
    const start = i++;
    while (i < input.length) {
      const ch = input[i++];
      if (ch === '\\') i++;
      else if (ch === '"') return JSON.parse(input.slice(start, i));
    }
    fail();
  }
  function value() {
    ws();
    if (input[i] === '{') {
      i++; ws(); const keys = new Set();
      if (input[i] === '}') { i++; return; }
      for (;;) {
        ws(); const key = string();
        if (keys.has(key)) fail();
        keys.add(key); ws(); i++; value(); ws();
        if (input[i++] === '}') return;
      }
    }
    if (input[i] === '[') {
      i++; ws();
      if (input[i] === ']') { i++; return; }
      for (;;) { value(); ws(); if (input[i++] === ']') return; }
    }
    if (input[i] === '"') { string(); return; }
    while (i < input.length && !/[\s,\]}]/.test(input[i])) i++;
  }
  value();
}

async function main() {
 try {
  const before = fs.lstatSync(process.argv[2]);
  if (!before.isFile()) fail();
  const flags = fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0) | (fs.constants.O_NONBLOCK ?? 0);
  const timer = setTimeout(() => {
    console.error('Invalid or unreadable MIP/1 packet.');
    process.exit(1);
  }, 3000);
  let handle;
  try { handle = await fs.promises.open(process.argv[2], flags); }
  finally { clearTimeout(timer); }
  let length = 0;
  const buffer = Buffer.alloc(limit + 1);
  try {
    const opened = await handle.stat();
    const after = fs.lstatSync(process.argv[2]);
    if (!opened.isFile() || !after.isFile() || before.dev !== opened.dev || before.ino !== opened.ino ||
        after.dev !== opened.dev || after.ino !== opened.ino) fail();
    const fd = handle.fd;
    while (length < buffer.length) {
      const n = fs.readSync(fd, buffer, length, buffer.length - length, null);
      if (!n) break;
      length += n;
    }
  } finally { await handle.close(); }
  if (length > limit) fail();
  const input = new TextDecoder('utf-8', { fatal: true }).decode(buffer.subarray(0, length));
  const p = JSON.parse(input);
  uniqueKeys(input);
  if (!shape(p, ['schema_version', 'id', 'kind', 'created_at', 'parents', 'source', 'context', 'task', 'claims', 'evidence', 'open_questions', 'payload']) ||
      p.schema_version !== 'mip/1' || !text(p.id) || !choice(p.kind, ['brief', 'proposal', 'review', 'resolution']) ||
      !timestamp(p.created_at) ||
      !texts(p.parents) || !shape(p.source, ['harness'], ['model']) || !text(p.source.harness) ||
      (Object.hasOwn(p.source, 'model') && !text(p.source.model)) ||
      !shape(p.context, ['revision', 'fingerprint', 'scope']) ||
      !(p.context.revision === null || text(p.context.revision)) || !(p.context.fingerprint === null || text(p.context.fingerprint)) || !texts(p.context.scope) ||
      !shape(p.task, ['goal', 'constraints']) || !text(p.task.goal) || !texts(p.task.constraints) ||
      !Array.isArray(p.claims) || !Array.isArray(p.evidence) || !texts(p.open_questions)) fail();
  if (!p.evidence.every(e => shape(e, ['id', 'type', 'locator', 'verification']) && text(e.id) && text(e.type) && text(e.locator) && choice(e.verification, ['unverified', 'verified', 'stale', 'unavailable'])) ||
      !unique(p.evidence.map(e => e.id))) fail();
  const evidence = new Set(p.evidence.map(e => e.id));
  if (!p.claims.every(c => shape(c, ['id', 'statement', 'status', 'evidence_ids']) && text(c.id) && text(c.statement) && choice(c.status, ['hypothesis', 'supported', 'contradicted', 'unknown']) && texts(c.evidence_ids) && c.evidence_ids.every(id => evidence.has(id))) ||
      !unique(p.claims.map(c => c.id))) fail();
  const d = p.payload;
  if (p.kind === 'brief') {
    if (!shape(d, ['questions']) || !texts(d.questions)) fail();
  } else if (p.kind === 'proposal') {
    if (!shape(d, ['options', 'recommendation']) || !Array.isArray(d.options) || !d.options.length ||
        !d.options.every(o => shape(o, ['id', 'description', 'advantages', 'risks']) && text(o.id) && text(o.description) && texts(o.advantages) && texts(o.risks)) ||
        !unique(d.options.map(o => o.id)) || !text(d.recommendation) || !d.options.some(o => o.id === d.recommendation)) fail();
  } else if (p.kind === 'review') {
    if (!shape(d, ['target_id', 'findings']) || !text(d.target_id) || !Array.isArray(d.findings) ||
        !d.findings.every(f => shape(f, ['statement', 'assessment', 'reason']) && text(f.statement) && choice(f.assessment, ['confirmed', 'unsupported', 'alternative', 'disagreement']) && text(f.reason))) fail();
  } else {
    if (!shape(d, ['decisions', 'disagreements']) || !Array.isArray(d.decisions) || !texts(d.disagreements) ||
        !d.decisions.every(x => shape(x, ['statement', 'status', 'reason']) && text(x.statement) && choice(x.status, ['proposed', 'accepted', 'rejected', 'deferred']) && text(x.reason))) fail();
  }
  console.log('MIP/1 packet is structurally valid.');
 } catch {
  console.error('Invalid or unreadable MIP/1 packet.');
  process.exitCode = 1;
 }
}
main();
NODE
