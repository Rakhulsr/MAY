import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test, type TestContext } from "node:test";
import { git, tempDir } from "./helpers.ts";

const root = fileURLToPath(new URL("..", import.meta.url));

// WSL's bash.exe may come first on PATH on Windows, so prefer Git for Windows.
const bash = process.env.MAY_BASH ?? (["C:/Program Files/Git/bin/bash.exe"].find(existsSync) || "bash");

const run = (cwd: string, script: string, ...args: string[]) => spawnSync(bash, [join(cwd, script), ...args], { cwd, encoding: "utf8", timeout: 60000 });

/** A disposable copy of the files that would be pushed, as its own Git repo. */
function copy(t: TestContext): string {
	const dir = tempDir(t, "may-copy-");
	for (const item of ["scripts", "skills", "tests", ".claude-plugin", ".codex-plugin", ".agents", ".omp-plugin", ".version-bump.json", "package.json", "package-lock.json", "AGENTS.md", "CLAUDE.md", "GEMINI.md", "README.md", "CHANGELOG.md", "LICENSE", ".gitattributes", ".gitignore"]) {
		cpSync(join(root, item), join(dir, item), { recursive: true });
	}
	git(dir, "init", "-q", "-b", "main");
	return dir;
}

const versionOf = (dir: string, file: string) => JSON.parse(readFileSync(join(dir, file), "utf8")) as { version?: string; plugins?: { version: string }[] };

test("the version check passes on this repo", () => {
	const out = run(root, "scripts/bump-version.sh", "--check");
	assert.equal(out.status, 0, out.stdout + out.stderr);
});

test("bump-version changes every listed manifest", (t) => {
	const dir = copy(t);
	const out = run(dir, "scripts/bump-version.sh", "9.8.7");
	assert.equal(out.status, 0, out.stdout + out.stderr);
	assert.equal(versionOf(dir, "package.json").version, "9.8.7");
	assert.equal(versionOf(dir, ".claude-plugin/plugin.json").version, "9.8.7");
	assert.equal(versionOf(dir, ".claude-plugin/marketplace.json").plugins?.[0]?.version, "9.8.7");
	assert.equal(versionOf(dir, ".codex-plugin/plugin.json").version, "9.8.7");
	assert.equal(versionOf(dir, ".omp-plugin/marketplace.json").plugins?.[0]?.version, "9.8.7");
	assert.equal(run(dir, "scripts/bump-version.sh", "--check").status, 0);
});

test("bump-version refuses a malformed version and changes nothing", (t) => {
	const dir = copy(t);
	const before = readFileSync(join(dir, "package.json"), "utf8");
	assert.notEqual(run(dir, "scripts/bump-version.sh", "not-a-version").status, 0);
	assert.equal(readFileSync(join(dir, "package.json"), "utf8"), before);
});

test("the version check names a manifest that drifted", (t) => {
	const dir = copy(t);
	const file = join(dir, ".codex-plugin/plugin.json");
	writeFileSync(file, readFileSync(file, "utf8").replace(/"version": "[^"]+"/, '"version": "0.0.1"'));
	const out = run(dir, "scripts/bump-version.sh", "--check");
	assert.notEqual(out.status, 0);
	assert.match(out.stdout + out.stderr, /\.codex-plugin\/plugin\.json/);
});

test("check-repo passes on a clean copy", (t) => {
	const out = run(copy(t), "scripts/check-repo.sh");
	assert.equal(out.status, 0, out.stdout + out.stderr);
});

test("check-repo fails when a skill name does not match its folder", (t) => {
	const dir = copy(t);
	const file = join(dir, "skills/may-qa/SKILL.md");
	writeFileSync(file, readFileSync(file, "utf8").replace("name: may-qa", "name: wrong"));
	const out = run(dir, "scripts/check-repo.sh");
	assert.notEqual(out.status, 0);
	assert.match(out.stdout + out.stderr, /may-qa/);
});

test("check-repo fails when a skill has no description", (t) => {
	const dir = copy(t);
	const file = join(dir, "skills/may-qa/SKILL.md");
	writeFileSync(file, readFileSync(file, "utf8").replace(/description: .*/, ""));
	assert.notEqual(run(dir, "scripts/check-repo.sh").status, 0);
});

test("check-repo fails when docs would be published", (t) => {
	const dir = copy(t);
	writeFileSync(join(dir, ".gitignore"), "node_modules/\n");
	const { mkdirSync } = process.getBuiltinModule("node:fs");
	mkdirSync(join(dir, "docs"));
	writeFileSync(join(dir, "docs", "PRD.md"), "private");
	const out = run(dir, "scripts/check-repo.sh");
	assert.notEqual(out.status, 0);
	assert.match(out.stdout + out.stderr, /local specifications/);
});

for (const file of ["README.md", "AGENTS.md"]) {
	test(`check-repo rejects a public ${file} dependency on local specifications`, (t) => {
		const dir = copy(t);
		writeFileSync(join(dir, file), "See do" + "cs/PRD.md for details.\n");
		const out = run(dir, "scripts/check-repo.sh");
		assert.notEqual(out.status, 0);
		assert.ok((out.stdout + out.stderr).includes(file));
	});
}

test("check-repo fails on a manifest that is not valid JSON", (t) => {
	const dir = copy(t);
	writeFileSync(join(dir, ".omp-plugin/marketplace.json"), "{ nope");
	assert.notEqual(run(dir, "scripts/check-repo.sh").status, 0);
});

test("test-harness rejects an unknown harness without installing anything", () => {
	const out = run(root, "scripts/test-harness.sh", "nope");
	assert.equal(out.status, 2);
	assert.match(out.stdout + out.stderr, /usage/i);
});


test("the entry skill and every tool mapping ship with the plugin", () => {
	const skill = readFileSync(join(root, "skills/using-may/SKILL.md"), "utf8");
	assert.match(skill, /^name: using-may$/m);
	for (const harness of ["pi", "oh-my-pi", "codex", "claude-code"]) {
		assert.ok(existsSync(join(root, `skills/using-may/references/${harness}-tools.md`)), harness);
		assert.match(skill, new RegExp(`references/${harness}-tools\\.md`));
	}
});

test("the scripts keep LF endings, so Git Bash can run them after a Windows checkout", () => {
	const attributes = readFileSync(join(root, ".gitattributes"), "utf8");
	assert.match(attributes, /\*\.sh text eol=lf/);
	for (const script of ["bump-version.sh", "check-repo.sh", "test-harness.sh"]) {
		assert.ok(!readFileSync(join(root, "scripts", script), "utf8").includes("\r"), script);
	}
});

test("check-repo rejects missing runtime scripts referenced by a skill reference", (t) => {
	const dir = copy(t);
	const file = join(dir, "skills/using-may/references/pi-tools.md");
	writeFileSync(file, readFileSync(file, "utf8") + "\nRun `scripts/missing-runtime.sh`.\n");
	const out = run(dir, "scripts/check-repo.sh");
	assert.notEqual(out.status, 0);
	assert.match(out.stdout + out.stderr, /missing-runtime/);
});

test("check-repo rejects resurrected engine directories", (t) => {
	for (const name of ["src", ".pi", "hooks"]) {
		const dir = copy(t);
		const { mkdirSync } = process.getBuiltinModule("node:fs");
		mkdirSync(join(dir, name));
		const out = run(dir, "scripts/check-repo.sh");
		assert.notEqual(out.status, 0, name);
		assert.match(out.stdout + out.stderr, /removed engine/);
	}
});

test("check-repo rejects obsolete storage references in publishable content", (t) => {
	const dir = copy(t);
	writeFileSync(join(dir, "README.md"), "SQL" + "ite\n");
	const out = run(dir, "scripts/check-repo.sh");
	assert.notEqual(out.status, 0);
	assert.match(out.stdout + out.stderr, /README/);
});

const localProtocols = ["AGENTS.local.md", "CLAUDE.local.md", "GEMINI.local.md"];

function personalProtocols(dir: string) {
	for (const file of localProtocols) writeFileSync(join(dir, file), "Private: do" + "cs/plan/private.md\n");
}

function harnessCopy(dir: string, t: TestContext) {
	const capture = tempDir(t, "may-published-");
	const bin = join(dir, "bin");
	mkdirSync(bin);
	writeFileSync(join(bin, "pi"), '#!/usr/bin/env bash\nif [ "$1" = --version ]; then echo test-boundary; exit 0; fi\n[ "$1" = install ] || exit 2\ncp -R "$2/." "$MAY_CAPTURE/"\nexit 42\n', { mode: 0o755 });
	writeFileSync(join(dir, "copy-probe.sh"), '#!/usr/bin/env bash\nexport PATH="$(dirname "$0")/bin:$PATH"\nbash "$(dirname "$0")/scripts/test-harness.sh" pi\n');
	const out = spawnSync(bash, [join(dir, "copy-probe.sh")], {
		cwd: dir, encoding: "utf8", timeout: 60000,
		env: { ...process.env, MAY_CAPTURE: capture },
	});
	return { out, capture };
}

test("untracked personal protocols stay local without hiding other notes from checks", (t) => {
	const dir = copy(t);
	personalProtocols(dir);
	const out = run(dir, "scripts/check-repo.sh");
	assert.equal(out.status, 0, out.stdout + out.stderr);
	for (const file of localProtocols) assert.match(git(dir, "ls-files", "--others", "--exclude-standard", "--", file), new RegExp(file));
	mkdirSync(join(dir, "nested"));
	for (const file of ["other.local.md", "nested/AGENTS.local.md"]) {
		writeFileSync(join(dir, file), "do" + "cs/private.md\n");
		const unsafe = run(dir, "scripts/check-repo.sh");
		assert.notEqual(unsafe.status, 0);
		assert.ok((unsafe.stdout + unsafe.stderr).includes(file));
	}
});

for (const file of localProtocols) {
	test(`staged ${file} blocks repository checks and harness publication`, (t) => {
		const dir = copy(t);
		writeFileSync(join(dir, file), "Private developer instructions\n");
		git(dir, "add", "--", file);
		const out = run(dir, "scripts/check-repo.sh");
		assert.notEqual(out.status, 0, out.stdout + out.stderr);
		assert.ok((out.stdout + out.stderr).includes(file));
		const { out: harness, capture } = harnessCopy(dir, t);
		assert.equal(harness.status, 1, harness.stdout + harness.stderr);
		assert.ok((harness.stdout + harness.stderr).includes(file));
		assert.ok(!existsSync(join(capture, "package.json")));
	});
}

test("harness publication copies public protocols and skills without personal protocols", (t) => {
	const dir = copy(t);
	personalProtocols(dir);
	const { out, capture } = harnessCopy(dir, t);
	assert.equal(out.status, 42, out.stdout + out.stderr);
	for (const file of localProtocols) assert.ok(!existsSync(join(capture, file)), file);
	for (const file of ["AGENTS.md", "CLAUDE.md", "GEMINI.md", "skills/using-may/SKILL.md", "skills/using-may/references/orchestration.md"]) {
		assert.ok(readFileSync(join(capture, file), "utf8").length > 0, file);
	}
});

test("npm package selection includes runtime and developer tools but excludes personal protocols", (t) => {
	const dir = copy(t);
	personalProtocols(dir);
	const out = spawnSync(bash, ["-lc", "npm pack --dry-run --json --ignore-scripts --offline"], { cwd: dir, encoding: "utf8", timeout: 60000 });
	assert.equal(out.status, 0, out.stdout + out.stderr);
	const inventory = JSON.parse(out.stdout);
	const packed = Array.isArray(inventory) ? inventory[0] : inventory.may;
	const files = packed.files.map((file: { path: string }) => file.path) as string[];
	for (const file of localProtocols) assert.ok(!files.includes(file), file);
	for (const file of ["AGENTS.md", "CLAUDE.md", "GEMINI.md", "README.md", "LICENSE", "CHANGELOG.md", ".claude-plugin/plugin.json", ".codex-plugin/plugin.json", ".omp-plugin/marketplace.json", ".agents/plugins/marketplace.json", "scripts/check-repo.sh", "tests/scripts.test.ts", ".version-bump.json", "skills/using-may/scripts/may-session.sh"]) {
		assert.ok(files.includes(file), file);
	}
});
