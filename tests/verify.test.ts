import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test, type TestContext } from "node:test";
import { bash, git, gitRepo, tempDir } from "./helpers.ts";

const script = fileURLToPath(new URL("../skills/may/scripts/may-verify.sh", import.meta.url)).replaceAll("\\", "/");

function repo(t: TestContext) {
	const dir = gitRepo(t);
	writeFileSync(join(dir, "bug.cjs"), "if (1 + 1 !== 3) process.exit(1); console.log('# tests 1');\n");
	git(dir, "add", ".");
	git(dir, "commit", "-qm", "fixture");
	return dir;
}

function run(cwd: string, checks: string[], extra: string[] = []) {
	const before = git(cwd, "status", "--porcelain=v1", "-uall");
	const out = spawnSync(bash, [script, ...checks.flatMap(check => ["--check", check]), ...extra], {
		cwd, encoding: "utf8", timeout: 120000,
	});
	// A killed verifier has status null; report the harness timeout instead of a misleading status mismatch.
	if (out.error) throw out.error;
	assert.equal(git(cwd, "status", "--porcelain=v1", "-uall"), before, "script must not write to repo");
	return out;
}

test("a genuine failing regression becomes PASS only after repairing the fixture", (t) => {
	const dir = repo(t);
	let out = run(dir, ["AC1=node bug.cjs"]);
	assert.equal(out.status, 1);
	assert.match(out.stdout, /AC1\s+FAIL\s+exit=1/);
	writeFileSync(join(dir, "bug.cjs"), "if (1 + 1 !== 2) process.exit(1); console.log('# tests 1');\n");
	out = run(dir, ["AC1=node bug.cjs"]);
	assert.equal(out.status, 0, out.stdout + out.stderr);
	assert.match(out.stdout, /AC1\s+PASS\s+exit=0/);
});

test("successful check output is available only when explicitly requested", (t) => {
	const dir = repo(t);
	writeFileSync(join(dir, "evidence.cjs"), "console.log('target: disposable mysql'); console.log('# tests 1');\n");
	const normal = run(dir, ["AC=node evidence.cjs"]);
	assert.equal(normal.status, 0, normal.stdout + normal.stderr);
	assert.doesNotMatch(normal.stdout, /target: disposable mysql/);
	const shown = run(dir, ["AC=node evidence.cjs"], ["--show-output"]);
	assert.equal(shown.status, 0, shown.stdout + shown.stderr);
	assert.match(shown.stdout, /target: disposable mysql/);
	writeFileSync(join(dir, "evidence.cjs"), "for (let i = 1; i <= 41; i++) console.log(`line-${i}`);\n");
	const bounded = run(dir, ["AC=node evidence.cjs"], ["--show-output"]);
	assert.equal(bounded.status, 0, bounded.stdout + bounded.stderr);
	assert.doesNotMatch(bounded.stdout, /line-1\n/);
	assert.match(bounded.stdout, /line-41/);
	writeFileSync(join(dir, "evidence.cjs"), "console.log('no tests ran');\n");
	const empty = run(dir, ["AC=node evidence.cjs"]);
	assert.equal(empty.status, 1);
	assert.match(empty.stdout, /no tests ran/);
});

test("--log-dir keeps full check output without changing the result table", (t) => {
	const dir = repo(t);
	const logs = tempDir(t, "may-logs-");
	writeFileSync(join(dir, "long.cjs"), "for (let i = 1; i <= 60; i++) console.log('line ' + i); console.log('# tests 1');\n");
	const checks = ["AC1=node long.cjs", "AC2=node bug.cjs", "AC3=node long.cjs"];
	const plain = run(dir, checks);
	const logged = run(dir, checks, ["--log-dir", logs]);
	assert.equal(logged.status, plain.status);
	assert.equal(logged.stdout.replace(/^LOG .*\n/gm, ""), plain.stdout);
	const ac1 = `${logs}/AC1.log`;
	assert.ok(logged.stdout.includes(`LOG AC1 ${ac1}\n`), logged.stdout);
	assert.match(logged.stdout, /^LOG AC3 .*AC1\.log$/m, "shared command points at the owner log");
	assert.match(readFileSync(join(logs, "AC1.log"), "utf8"), /^line 1\n[\s\S]*line 60\n/);
	assert.ok(existsSync(join(logs, "AC2.log")));
	assert.equal(existsSync(join(logs, "AC3.log")), false);
	assert.equal(run(dir, checks, ["--log-dir", join(logs, "missing")]).status, 2);
	assert.equal(run(dir, ["ac1=node long.cjs", "AC1=node bug.cjs"], ["--log-dir", logs]).status, 2, "IDs differing only by case would share a log file");
	assert.equal(run(dir, ["ac1=node long.cjs", "AC1=node long.cjs"]).status, 0, "case-distinct IDs stay valid without --log-dir");
	assert.match(run(dir, ["AC1=node long.cjs"], ["--log-dir", `${logs}/`]).stdout, new RegExp(`^LOG AC1 ${logs.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&")}/AC1\\.log$`, "m"));
	assert.equal(run(dir, checks, ["--log-dir"]).status, 2);
});

test("all zero-test output forms are NO_TESTS", (t) => {
	const dir = repo(t);
	const patterns = ["ℹ tests 0", "# tests 0", "ℹ pass 0", "# pass 0", "No Tests Found", "no tests ran", "no test files", "0 passing", "ran 0 tests", "tests: 0 total"];
	for (const pattern of patterns) {
		writeFileSync(join(dir, "zero.cjs"), `console.log(${JSON.stringify(pattern)});`);
		const out = run(dir, ["AC=node zero.cjs"]);
		assert.equal(out.status, 1, out.stderr);
		assert.match(out.stdout, /AC\s+NO_TESTS/);
	}
});

test("Go package summaries with and without tests pass in the same command", (t) => {
	const dir = repo(t);
	writeFileSync(join(dir, "go-output.cjs"), `process.stdout.write(${JSON.stringify("?   \texample.test/project/cmd\t[no test files]\nok  \texample.test/project/service\t0.123s\n")});`);
	const out = run(dir, ["AC=node go-output.cjs"]);
	assert.equal(out.status, 0, out.stdout + out.stderr);
	assert.match(out.stdout, /AC\s+PASS\s+exit=0/);
	assert.match(out.stdout, /RESULT PASS 1\/1 passed/);
});

test("cached Go coverage summaries count before packages without selected tests", (t) => {
	const dir = repo(t);
	const report = "ok  \texample.test/project/service\t(cached)\tcoverage: 85.7% of statements\n?   \texample.test/project/cmd\t[no test files]\nok  \texample.test/project/other\t0.001s [no tests to run]\n";
	writeFileSync(join(dir, "go-output.cjs"), `process.stdout.write(${JSON.stringify(report)});`);
	const out = run(dir, ["AC=node go-output.cjs"]);
	assert.equal(out.status, 0, out.stdout + out.stderr);
	assert.match(out.stdout, /AC\s+PASS\s+exit=0/);
});

for (const { name, report } of [
	{
		name: "Go packages all lack test files",
		report: "?   \texample.test/project/cmd\t[no test files]\n?   \texample.test/project/model\t[no test files]\n",
	},
	{
		name: "Go package has no selected tests",
		report: "ok  \texample.test/project/service\t0.001s [no tests to run]\n",
	},
	{
		name: "cached Go coverage package has no selected tests",
		report: "ok  \texample.test/project/service\t(cached)\tcoverage: 0.0% of statements [no tests to run]\n",
	},
	{
		name: "success-like log lines accompany empty Go packages",
		report: "?   \texample.test/project/cmd\t[no test files]\nlog: ok example.test/project/service 0.123s\nok example.test/project/service complete\n",
	},
	{
		name: "a non-Go empty suite follows a successful Go package",
		report: "ok  \texample.test/project/service\t0.123s\n# tests 0\n",
	},
]) {
	test(`${name} remain NO_TESTS`, (t) => {
		const dir = repo(t);
		writeFileSync(join(dir, "go-output.cjs"), `process.stdout.write(${JSON.stringify(report)});`);
		const out = run(dir, ["AC=node go-output.cjs"]);
		assert.equal(out.status, 1, out.stdout + out.stderr);
		assert.match(out.stdout, /AC\s+NO_TESTS\s+exit=0/);
		assert.match(out.stdout, /RESULT FAIL 0\/1 passed/);
	});
}

test("successful Go checks cannot supply tests for a different empty check", (t) => {
	const dir = repo(t);
	writeFileSync(join(dir, "go-tests.cjs"), `process.stdout.write(${JSON.stringify("ok  \texample.test/project/service\t0.123s\n")});`);
	writeFileSync(join(dir, "go-empty.cjs"), `process.stdout.write(${JSON.stringify("?   \texample.test/project/cmd\t[no test files]\n")});`);
	const out = run(dir, ["TESTED=node go-tests.cjs", "EMPTY=node go-empty.cjs"]);
	assert.equal(out.status, 1, out.stdout + out.stderr);
	assert.match(out.stdout, /TESTED\s+PASS\s+exit=0/);
	assert.match(out.stdout, /EMPTY\s+NO_TESTS\s+exit=0/);
	assert.match(out.stdout, /RESULT FAIL 1\/2 passed/);
});

test("trivial checks never execute shell side effects", (t) => {
	const dir = repo(t);
	const patterns = ["exit", "exit 0", "true", ":", "rem hi", "echo hi", "cmd /c exit 0", "node -e 0", 'node -e "process.exit(0)"', "node --version", "node -v", "npm --version"];
	for (const command of patterns) {
		const out = run(dir, [`AC=${command}; touch side-effect`]);
		assert.equal(out.status, 1, out.stderr);
		assert.match(out.stdout, /AC\s+TRIVIAL/);
		assert.equal(existsSync(join(dir, "side-effect")), false);
	}
});

test("source edits during verification are CHANGED, including same status untracked content", (t) => {
	const dir = repo(t);
	writeFileSync(join(dir, "change.cjs"), "require('fs').writeFileSync('untracked','after');console.log('# tests 1');");
	writeFileSync(join(dir, "untracked"), "before");
	const before = git(dir, "status", "--porcelain=v1", "-uall");
	const out = spawnSync(bash, [script, "--check", "AC=node change.cjs"], { cwd: dir, encoding: "utf8", timeout: 15000 });
	assert.equal(out.status, 1, out.stderr);
	assert.match(out.stdout, /AC\s+CHANGED/);
	assert.equal(git(dir, "status", "--porcelain=v1", "-uall"), before);
	assert.equal(readFileSync(join(dir, "untracked"), "utf8"), "after");
});

// A real child process must be observed after OS-level timeout; fake parent timers cannot prove termination.
test("timeout terminates check descendants and reports TIMEOUT", (t) => {
	const dir = repo(t);
	const ticks = join(tempDir(t), "ticks").replaceAll("\\", "/");
	writeFileSync(join(dir, "slow.cjs"), `setInterval(()=>require('fs').appendFileSync(${JSON.stringify(ticks)},'x'),50);`);
	const out = run(dir, ["AC=node slow.cjs"], ["--timeout", "1"]);
	assert.equal(out.status, 1, out.stderr);
	assert.match(out.stdout, /AC\s+TIMEOUT/);
	const before = readFileSync(ticks, "utf8");
	Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 300);
	assert.equal(readFileSync(ticks, "utf8"), before);
});

test("one identical command runs once and covers both IDs", (t) => {
	const dir = repo(t);
	const count = join(tempDir(t), "count").replaceAll("\\", "/");
	writeFileSync(join(dir, "count.cjs"), `require('fs').appendFileSync(${JSON.stringify(count)},'x'); console.log('# tests 1');`);
	const out = run(dir, ["AC1=node count.cjs", "AC2=node count.cjs"]);
	assert.equal(out.status, 0, out.stderr);
	assert.equal(readFileSync(count, "utf8"), "x");
	assert.match(out.stdout, /NOTE one command covers AC1, AC2/);
});

test("outside git uses PASS? and never success exit", (t) => {
	const dir = tempDir(t);
	writeFileSync(join(dir, "ok.cjs"), "console.log('# tests 1');");
	const out = spawnSync(bash, [script, "--check", "AC=node ok.cjs"], { cwd: dir, encoding: "utf8", timeout: 15000 });
	assert.equal(out.status, 1, out.stderr);
	assert.match(out.stdout, /revision none/);
	assert.match(out.stdout, /AC\s+PASS\?/);
});

test("nested invocation detects changed untracked sibling content across the whole repository", (t) => {
	const dir = repo(t);
	const nested = join(dir, "nested");
	mkdirSync(nested);
	writeFileSync(join(dir, "sibling"), "before");
	writeFileSync(join(nested, "change.cjs"), "require('fs').writeFileSync('../sibling','after');console.log('# tests 1');");
	const before = git(dir, "status", "--porcelain=v1", "-uall");
	const out = spawnSync(bash, [script, "--check", "AC=node change.cjs"], { cwd: nested, encoding: "utf8", timeout: 15000 });
	assert.equal(out.status, 1, out.stdout + out.stderr);
	assert.match(out.stdout, /AC\s+CHANGED/);
	assert.equal(git(dir, "status", "--porcelain=v1", "-uall"), before);
});

test("a different bash earlier on PATH does not replace the running interpreter", (t) => {
	const dir = repo(t);
	writeFileSync(join(dir, "ok.cjs"), "console.log('# tests 1');\n");
	const bin = tempDir(t, "may wrong bash ");
	writeFileSync(join(bin, "bash"), "#!/bin/sh\necho 'wrong bash on PATH' >&2\nexit 97\n");
	chmodSync(join(bin, "bash"), 0o755);
	const quote = (s: string) => `'${s.replaceAll("'", "'\\''")}'`;
	const before = git(dir, "status", "--porcelain=v1", "-uall");
	const out = spawnSync(bash, ["-c", `export PATH=${quote(bin)}:$PATH; exec "$BASH" ${quote(script)} --check 'AC=node ok.cjs'`], {
		cwd: dir, encoding: "utf8", timeout: 15000,
	});
	assert.equal(out.status, 0, out.stdout + out.stderr);
	assert.match(out.stdout, /AC\s+PASS\s+exit=0/);
	assert.doesNotMatch(out.stdout + out.stderr, /wrong bash on PATH/);
	assert.equal(git(dir, "status", "--porcelain=v1", "-uall"), before);
});

test("failed timeout termination still returns TIMEOUT and retains process recovery", { skip: process.platform !== "win32" }, (t) => {
	const dir = repo(t);
	const tmp = tempDir(t, "may timeout ");
	const bin = join(tmp, "bin");
	mkdirSync(bin);
	const started = join(tmp, "started");
	const attempted = join(tmp, "taskkill-attempted");
	const quote = (s: string) => `'${s.replaceAll("'", "'\\''")}'`;
	writeFileSync(join(bin, "taskkill"), `#!/usr/bin/env bash\ntouch ${quote(attempted.replaceAll("\\", "/"))}\nexit 1\n`);
	chmodSync(join(bin, "taskkill"), 0o755);
	writeFileSync(join(dir, "slow.cjs"), `require('fs').writeFileSync(${JSON.stringify(started)}, 'started'); setInterval(()=>{},50);`);
	const out = spawnSync(bash, ["-c", `export PATH=${quote(bin)}:$PATH; exec "$BASH" ${quote(script)} --check 'AC=node slow.cjs' --timeout 5`], {
		cwd: dir, env: { ...process.env, TMPDIR: tmp }, encoding: "utf8", timeout: 30000,
	});
	try {
		assert.equal(out.status, 1, out.stdout + out.stderr);
		assert.equal(existsSync(started), true, "the check must start before its timeout");
		assert.equal(existsSync(attempted), true, "cleanup must attempt the failing taskkill");
		assert.match(out.stdout, /AC\s+TIMEOUT/);
		const retained = out.stdout.match(/^Retained session: (.+)$/m)?.[1];
		assert.ok(retained, out.stdout);
		assert.equal(existsSync(join(retained, ".may-session")), true, `${retained} is not a native path`);
	} finally {
		const cleanup = spawnSync(bash, ["-c", `for dir in ${quote(tmp.replaceAll("\\", "/"))}/may-*; do [ ! -d "$dir" ] || bash ${quote(script.replace("may-verify.sh", "may-session.sh"))} stop "$dir"; done`], {
			cwd: dir, env: { ...process.env, TMPDIR: tmp }, encoding: "utf8", timeout: 15000,
		});
		assert.equal(cleanup.status, 0, cleanup.stdout + cleanup.stderr);
	}
});

test("a parent deadline stays bounded when auxiliary registration runs past the timeout", (t) => {
	const dir = repo(t);
	const tmp = tempDir(t, "may delayed registration ");
	const started = join(tmp, "check-started");
	const delayed = join(tmp, "registration-delayed");
	const timing = join(tmp, "timing.sh");
	const quote = (s: string) => `'${s.replaceAll("'", "'\\''")}'`;
	// Delay only the post-command registration: the check has already run (`started` exists) and the launcher re-enters `track`.
	writeFileSync(timing, `if [[ "$0" == *may-session.sh ]] && [ "\${1:-}" = track ] && [ -e ${quote(started.replaceAll("\\", "/"))} ]; then touch ${quote(delayed.replaceAll("\\", "/"))}; sleep 6; fi\n`);
	writeFileSync(join(dir, "slow.cjs"), `require('fs').writeFileSync(${JSON.stringify(started)},'started');console.log('# tests 1');`);
	const before = git(dir, "status", "--porcelain=v1", "-uall");
	const out = spawnSync(bash, [script, "--check", "AC=node slow.cjs", "--timeout", "1"], {
		cwd: dir, env: { ...process.env, TMPDIR: tmp, BASH_ENV: timing }, encoding: "utf8", timeout: 15000,
	});
	try {
		assert.equal(out.status, 1, `delayed=${existsSync(delayed)} started=${existsSync(started)}\n${out.stdout}${out.stderr}`);
		assert.equal(existsSync(started), true, "the real check must run, not just its launcher");
		assert.equal(existsSync(delayed), true, "the post-command registration delay must run");
		assert.match(out.stdout, /AC\s+TIMEOUT/, out.stdout + out.stderr);
		assert.equal(git(dir, "status", "--porcelain=v1", "-uall"), before);
	} finally {
		const cleanup = spawnSync(bash, ["-c", `for dir in ${quote(tmp.replaceAll("\\", "/"))}/may-*; do [ ! -d "$dir" ] || bash ${quote(script.replace("may-verify.sh", "may-session.sh"))} stop "$dir"; done`], {
			cwd: dir, env: { ...process.env, TMPDIR: tmp }, encoding: "utf8", timeout: 15000,
		});
		assert.equal(cleanup.status, 0, cleanup.stdout + cleanup.stderr);
	}
});
