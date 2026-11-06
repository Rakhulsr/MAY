#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

failed=0
fail() {
	echo "FAIL: $*" >&2
	failed=1
}

for removed in src .pi hooks; do
	[ ! -e "$removed" ] || fail "removed engine directory exists: $removed"
done

"$root/scripts/bump-version.sh" --check >/dev/null || fail "manifest versions differ"

node --input-type=module - <<'NODE' || failed=1
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

let bad = false;
const fail = (message) => {
	console.error(`FAIL: ${message}`);
	bad = true;
};

for (const file of ["package.json", ".claude-plugin/plugin.json", ".claude-plugin/marketplace.json", ".codex-plugin/plugin.json", ".agents/plugins/marketplace.json", ".omp-plugin/marketplace.json", ".version-bump.json"]) {
	try {
		JSON.parse(readFileSync(file, "utf8"));
	} catch (e) {
		fail(`${file} is not valid JSON: ${e.message}`);
	}
}

for (const entry of readdirSync("skills", { withFileTypes: true })) {
	if (!entry.isDirectory()) continue;
	const file = `skills/${entry.name}/SKILL.md`;
	if (!existsSync(file)) {
		fail(`${entry.name} has no SKILL.md`);
		continue;
	}
	const text = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
	const front = /^---\n([\s\S]*?)\n---\n/.exec(text)?.[1] ?? "";
	const name = /^name: (.+)$/m.exec(front)?.[1]?.trim();
	const description = /^description: (.+)$/m.exec(front)?.[1]?.trim();
	if (name !== entry.name) fail(`${entry.name}: frontmatter name is "${name}"`);
	if (!description) fail(`${entry.name}: frontmatter has no description`);
	const inspect = (dir) => {
		for (const child of readdirSync(dir, { withFileTypes: true })) {
			const path = `${dir}/${child.name}`;
			if (child.isDirectory()) { inspect(path); continue; }
			if (!child.name.endsWith(".md")) continue;
			const content = readFileSync(path, "utf8");
			const links = /(?:\.\.\/[\w.-]+\/)?(?:references|scripts)\/[\w./-]+\.(?:md|sh)/g;
			for (const match of content.matchAll(links)) {
				if (!existsSync(resolve("skills", entry.name, match[0]))) fail(`${path}: ${match[0]} does not exist`);
			}
		}
	};
	inspect(`skills/${entry.name}`);
}
process.exit(bad ? 1 : 0);
NODE

# What a commit would publish: tracked files plus anything not ignored.
publishable="$(git ls-files --cached --others --exclude-standard)"

local_specs='do''cs/'
if printf '%s\n' "$publishable" | grep -qE "^$local_specs"; then
	fail "local specifications would be published"
fi
if printf '%s\n' "$publishable" | grep -qE '(^|/)node_modules/'; then
	fail "node_modules would be published"
fi

# Only the contributor protocol and ignore rules may name local specifications.
while IFS= read -r file; do
	[ -f "$file" ] || continue
	if [ "$file" != AGENTS.md ] && grep -Iiq 'sql''ite' "$file"; then
		fail "$file mentions removed storage technology"
	fi
	case "$file" in
		AGENTS.md | .gitignore) continue ;;
	esac
	if grep -Iq "$local_specs" "$file"; then
		fail "$file depends on local specifications"
	fi
done <<<"$publishable"

for script in "$root"/scripts/*.sh "$root"/skills/*/scripts/*.sh; do
	[ -f "$script" ] || continue
	bash -n "$script" || fail "$script has a syntax error"
done

if [ "$failed" -ne 0 ]; then
	exit 1
fi
echo "Repository checks passed"
