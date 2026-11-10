import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { delimiter, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test, type TestContext } from "node:test";
import { resolveBash } from "../scripts/bash.ts";
import { bash, git, tempDir } from "./helpers.ts";

const root = fileURLToPath(new URL("..", import.meta.url));

const run = (cwd: string, script: string, ...args: string[]) => spawnSync(bash, [join(cwd, script), ...args], { cwd, encoding: "utf8", timeout: 60000 });

/** MAY_BASH unset and a `bash` that exits 97 first on PATH, as WSL's launcher would shadow Git Bash for cmd.exe. */
function poisonedEnv(t: TestContext) {
	const fake = tempDir(t, "may-wrong-bash-");
	writeFileSync(join(fake, "bash.cmd"), "@echo wrong bash on PATH 1>&2\r\n@exit /b 97\r\n");
	writeFileSync(join(fake, "bash"), "#!/bin/sh\necho wrong bash on PATH >&2\nexit 97\n", { mode: 0o755 });
	const env = { ...process.env };
	delete env.MAY_BASH;
	const key = Object.keys(env).find((name) => name.toLowerCase() === "path") ?? "PATH";
	env[key] = `${fake}${delimiter}${env[key] ?? ""}`;
	return env;
}

test("the npm script launcher runs Git Bash rather than WSL and keeps the exit code", (t) => {
	const env = { ...process.env };
	delete env.MAY_BASH;
	const out = spawnSync(process.execPath, ["scripts/bash.ts", "-c", "uname -s; exit 7"], { cwd: root, env: process.platform === "win32" ? poisonedEnv(t) : env, encoding: "utf8", timeout: 30000 });
	assert.equal(out.status, 7, out.stdout + out.stderr);
	assert.doesNotMatch(out.stderr, /wrong bash on PATH/);
	if (process.platform === "win32") assert.match(out.stdout, /^(MINGW|MSYS|CYGWIN)/, out.stdout + out.stderr);
});

test("npm run check runs Git Bash even when another bash comes first on PATH", { skip: process.platform !== "win32" }, (t) => {
	const out = spawnSync("npm run check", { cwd: copy(t), env: poisonedEnv(t), shell: true, encoding: "utf8", timeout: 120000 });
	assert.equal(out.status, 0, out.stdout + out.stderr);
	assert.match(out.stdout, /Repository checks passed/);
	assert.doesNotMatch(out.stdout + out.stderr, /wrong bash on PATH/);
});

test("resolveBash honors MAY_BASH and fails closed instead of falling back to a bare bash on Windows", (t) => {
	assert.equal(resolveBash({ MAY_BASH: "C:/custom/bash.exe" }), "C:/custom/bash.exe");
	if (process.platform === "win32") assert.throws(() => resolveBash({ PATH: tempDir(t, "may-empty-path-") }), /Git for Windows bin\/bash\.exe not found/);
});

/** A disposable copy of the files that would be pushed, as its own Git repo. */
function copy(t: TestContext): string {
	const dir = tempDir(t, "may-copy-");
	for (const item of ["scripts", "skills", "agents", "tests", ".claude-plugin", ".codex-plugin", ".agents", ".omp-plugin", ".version-bump.json", "package.json", "package-lock.json", "AGENTS.md", "CLAUDE.md", "GEMINI.md", "README.md", "CHANGELOG.md", "LICENSE", ".gitattributes", ".gitignore"]) {
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

test("every role skill has a plugin agent that preloads it", (t) => {
	const dir = copy(t);
	rmSync(join(dir, "agents/may-qa.md"));
	const out = run(dir, "scripts/check-repo.sh");
	assert.notEqual(out.status, 0);
	assert.match(out.stdout + out.stderr, /may-qa/);
});

test("check-repo fails when an agent preloads another role's skill", (t) => {
	const dir = copy(t);
	const file = join(dir, "agents/may-qa.md");
	writeFileSync(file, readFileSync(file, "utf8").replace("  - may-qa", "  - may-backend"));
	const out = run(dir, "scripts/check-repo.sh");
	assert.notEqual(out.status, 0);
	assert.match(out.stdout + out.stderr, /agents\/may-qa\.md/);
});

for (const [label, change] of [
	["names another role", (text: string) => text.replace("name: may-qa", "name: may-backend")],
	["may dispatch other agents", (text: string) => text.replace(/^disallowedTools: Agent\r?\n/m, "")],
] as const) {
	test(`check-repo fails when an agent ${label}`, (t) => {
		const dir = copy(t);
		const file = join(dir, "agents/may-qa.md");
		writeFileSync(file, change(readFileSync(file, "utf8")));
		const out = run(dir, "scripts/check-repo.sh");
		assert.notEqual(out.status, 0);
		assert.match(out.stdout + out.stderr, /agents\/may-qa\.md/);
	});
}

test("check-repo fails on an agent without a role skill", (t) => {
	const dir = copy(t);
	cpSync(join(dir, "agents/may-qa.md"), join(dir, "agents/may-ghost.md"));
	const out = run(dir, "scripts/check-repo.sh");
	assert.notEqual(out.status, 0);
	assert.match(out.stdout + out.stderr, /may-ghost/);
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
	const skill = readFileSync(join(root, "skills/may/SKILL.md"), "utf8");
	assert.match(skill, /^name: may$/m);
	assert.ok(!existsSync(join(root, "skills/using-may")), "obsolete entry skill must not be installed as an alias");
	for (const harness of ["pi", "oh-my-pi", "codex", "claude-code"]) {
		assert.ok(existsSync(join(root, `skills/may/references/${harness}-tools.md`)), harness);
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
	const file = join(dir, "skills/may/references/pi-tools.md");
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

test("npm package selection includes public runtime and developer files but excludes personal data", (t) => {
	const dir = copy(t);
	const personalFiles = ["personal-notes.md", ".env", ".env.local"];
	for (const file of personalFiles) writeFileSync(join(dir, file), "Private fixture content\n");
	const out = spawnSync(bash, ["-lc", "npm pack --dry-run --json --ignore-scripts --offline"], { cwd: dir, encoding: "utf8", timeout: 60000 });
	assert.equal(out.status, 0, out.stdout + out.stderr);
	const inventory = JSON.parse(out.stdout);
	const packed = Array.isArray(inventory) ? inventory[0] : inventory.may;
	const files = packed.files.map((file: { path: string }) => file.path) as string[];
	for (const file of personalFiles) assert.ok(!files.includes(file), file);
	for (const file of ["AGENTS.md", "CLAUDE.md", "GEMINI.md", "README.md", "LICENSE", "CHANGELOG.md", ".claude-plugin/plugin.json", ".codex-plugin/plugin.json", ".omp-plugin/marketplace.json", ".agents/plugins/marketplace.json", "scripts/check-repo.sh", "tests/scripts.test.ts", ".version-bump.json", "skills/may/scripts/may-session.sh"]) {
		assert.ok(files.includes(file), file);
	}
});
