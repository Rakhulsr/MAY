import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
// @ts-ignore: plain ESM benchmark helper
import { countRun } from "./benchmark/count-tokens.mjs";
import { bash, tempDir } from "./helpers.ts";

const bench = join(import.meta.dirname, "benchmark");
const oracle = (name: string, dir: string) =>
	spawnSync(process.execPath, [join(bench, "oracles", `${name}.mjs`), dir], { encoding: "utf8", timeout: 30000 });

for (const name of ["orders", "notes"]) {
	test(`${name} oracle fails on the fixture and passes on the reference`, (t) => {
		const dir = join(tempDir(t), name);
		cpSync(join(bench, "fixtures", name), dir, { recursive: true });
		const fixtureTests = spawnSync(process.execPath, ["--test"], { cwd: dir, encoding: "utf8", timeout: 30000 });
		assert.equal(fixtureTests.status, 0, fixtureTests.stdout);
		const red = oracle(name, dir);
		assert.notEqual(red.status, 0);
		assert.match(red.stderr, /AssertionError/);
		cpSync(join(bench, "reference", name), dir, { recursive: true });
		const green = oracle(name, dir);
		assert.equal(green.status, 0, green.stderr);
		assert.match(green.stdout, /PASS/);
	});
}

test("prepare-run creates a committed project inside a marked session", (t) => {
	const root = tempDir(t);
	const env = { ...process.env, TMPDIR: root, TEMP: root, TMP: root };
	const out = execFileSync(process.execPath, [join(bench, "prepare-run.mjs"), "orders"], { encoding: "utf8", env });
	const session = /^session (.+)$/m.exec(out)?.[1] ?? "";
	const project = /^project (.+)$/m.exec(out)?.[1] ?? "";
	assert.ok(existsSync(join(project, "orders.js")));
	assert.equal(execFileSync("git", ["status", "--porcelain"], { cwd: project, encoding: "utf8" }), "");
	const stop = spawnSync(bash, [join(import.meta.dirname, "../skills/may/scripts/may-session.sh"), "stop", session], {
		encoding: "utf8",
		env,
	});
	assert.equal(stop.status, 0, stop.stderr);
	assert.equal(existsSync(session), false);
	assert.notEqual(spawnSync(process.execPath, [join(bench, "prepare-run.mjs"), "../x"], { env }).status, 0);
});

test("count-tokens dedupes Claude blocks and adds OMP workers", (t) => {
	const dir = tempDir(t);
	const claude = join(dir, "claude.jsonl");
	const block = (id: string, usage: object) => JSON.stringify({ type: "assistant", message: { id, usage } });
	const claudeUsage = { input_tokens: 1, cache_read_input_tokens: 100, cache_creation_input_tokens: 10, output_tokens: 5 };
	writeFileSync(claude, [block("m1", claudeUsage), block("m1", claudeUsage), "not json", block("m2", { ...claudeUsage, cache_read_input_tokens: 300 })].join("\n"));
	mkdirSync(join(dir, "claude", "subagents"), { recursive: true });
	writeFileSync(join(dir, "claude", "subagents", "agent-a.jsonl"), block("w1", claudeUsage));
	const run = countRun(claude);
	assert.equal(run.coordinator.calls, 2);
	assert.equal(run.coordinator.maxContext, 311);
	assert.equal(run.coordinator.total, 116 + 316);
	assert.equal(run.workers.length, 1);
	assert.equal(run.total, 116 + 316 + 116);

	const omp = join(dir, "omp.jsonl");
	const ompLine = (usage: object) => JSON.stringify({ type: "message", message: { role: "assistant", usage } });
	writeFileSync(omp, [ompLine({ input: 2, cacheRead: 50, cacheWrite: 0, output: 3 }), ompLine({ input: 0, cacheRead: 0, cacheWrite: 0, output: 0 })].join("\n"));
	mkdirSync(join(dir, "omp"));
	writeFileSync(join(dir, "omp", "Worker.jsonl"), ompLine({ input: 1, cacheRead: 9, cacheWrite: 0, output: 1 }));
	const ompRun = countRun(omp);
	assert.equal(ompRun.coordinator.calls, 1);
	assert.equal(ompRun.total, 55 + 11);
});
