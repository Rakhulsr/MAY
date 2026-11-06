#!/usr/bin/env bash
# Keeps the version identical in every manifest listed in .version-bump.json.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

if [ $# -ne 1 ]; then
	echo "usage: bump-version.sh <x.y.z> | --check" >&2
	exit 2
fi

MAY_BUMP_ARG="$1" node --input-type=module - <<'NODE'
import { readFileSync, writeFileSync } from "node:fs";

const arg = process.env.MAY_BUMP_ARG;
const { files } = JSON.parse(readFileSync(".version-bump.json", "utf8"));
const read = (path) => JSON.parse(readFileSync(path, "utf8"));
const keys = (field) => field.split(".");
const get = (json, field) => keys(field).reduce((value, key) => value?.[key], json);

if (arg === "--check") {
	const expected = read("package.json").version;
	const drifted = files.filter((f) => get(read(f.path), f.field) !== expected);
	for (const f of drifted) console.error(`${f.path} (${f.field}) is ${get(read(f.path), f.field)}, expected ${expected}`);
	if (drifted.length) process.exit(1);
	console.log(`All manifests are at ${expected}`);
	process.exit(0);
}

if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(arg)) {
	console.error(`Not a version: ${arg}`);
	process.exit(2);
}

for (const f of files) {
	const json = read(f.path);
	const path = keys(f.field);
	const last = path.pop();
	const parent = path.reduce((value, key) => value[key], json);
	parent[last] = arg;
	writeFileSync(f.path, `${JSON.stringify(json, null, 2)}\n`);
}
console.log(`Set version ${arg}`);
NODE
