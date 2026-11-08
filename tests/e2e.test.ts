import assert from "node:assert/strict";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { chmodSync, existsSync, mkdirSync, readFileSync, watch, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test, type TestContext } from "node:test";
import { bash, tempDir } from "./helpers.ts";

const scripts = fileURLToPath(new URL("../skills/may/scripts/", import.meta.url)).replaceAll("\\", "/");
const quote = (s: string) => `'${s.replaceAll("'", "'\\''")}'`;

interface Fixture {
	cwd: string;
	dir: string;
	log: string;
	command: string;
	env: NodeJS.ProcessEnv & { FAKE_STARTED: string; FAKE_EXIT: string; FAKE_UNAVAILABLE: string };
}

function setup(t: TestContext): Fixture {
	const cwd = tempDir(t, "may e2e ");
	const dir = join(cwd, "may-session");
	mkdirSync(dir);
	writeFileSync(join(dir, ".may-session"), "MAY\n");
	const bin = join(cwd, "bin");
	mkdirSync(bin);
	const log = join(cwd, "npx-calls");
	const fake = join(bin, "npx");
	writeFileSync(fake, `#!/usr/bin/env bash
printf '%s\\n' "$*" >> "$FAKE_CALLS"
if [ "$3" = --version ]; then [ "$FAKE_UNAVAILABLE" != 1 ]; exit $?; fi
while [ "$#" -gt 0 ]; do
 if [ "$1" = --output ]; then shift; mkdir -p "$1"; echo trace > "$1/trace.txt"; fi
 shift
done
printf '# tests 1\\n'
if [ "$FAKE_HOLD" = 1 ]; then touch "$FAKE_STARTED"; while :; do sleep 1; done; fi
exit "$FAKE_EXIT"
`);
	chmodSync(fake, 0o755);
	const env = {
		...process.env, TMPDIR: cwd, FAKE_CALLS: log, FAKE_EXIT: "0", FAKE_UNAVAILABLE: "0",
		FAKE_HOLD: "0", FAKE_STARTED: join(cwd, "playwright-started"),
	};
	const command = `export PATH=${quote(bin)}:$PATH; exec bash ${quote(scripts + "may-e2e.sh")}`;
	return { cwd, dir, log, env, command };
}

function run(f: Fixture, args: string[] = []) {
	return spawnSync(bash, ["-c", `${f.command} "$@"`, "sh", "--session", f.dir, "--spec", "test.spec.js", ...args], {
		cwd: f.cwd, env: f.env, encoding: "utf8", timeout: 15000,
	});
}

async function freePort() {
	const server = createServer();
	const listening = once(server, "listening");
	server.listen(0, "127.0.0.1");
	await listening;
	const address = server.address();
	assert.ok(address && typeof address !== "string");
	const closed = once(server, "close");
	server.close();
	await closed;
	return address.port;
}

function server(f: Fixture, port: number) {
	const path = join(f.cwd, "server.cjs");
	writeFileSync(path, `require('http').createServer((q,r)=>r.end('ok')).listen(${port},'127.0.0.1');`);
	return `node ${quote(path.replaceAll("\\", "/"))}`;
}

async function waitFile(path: string, child: ChildProcess) {
	const { promise, resolve, reject } = Promise.withResolvers<void>();
	const changed = watch(dirname(path), () => { if (existsSync(path)) resolve(); });
	const exited = () => reject(new Error("runner exited before readiness"));
	const deadline = AbortSignal.timeout(10000);
	const expired = () => reject(new Error("readiness deadline exceeded"));
	child.once("exit", exited);
	deadline.addEventListener("abort", expired, { once: true });
	if (existsSync(path)) resolve();
	try { await promise; } finally {
		changed.close();
		child.removeListener("exit", exited);
		deadline.removeEventListener("abort", expired);
	}
}

// These tests exercise real OS signals and sockets, not an in-process fake clock.
test("unavailable Playwright returns 3 and never attempts installation", (t) => {
	const f = setup(t);
	f.env.FAKE_UNAVAILABLE = "1";
	const out = run(f);
	assert.equal(out.status, 3, out.stdout + out.stderr);
	assert.match(out.stdout, /E2E UNAVAILABLE/);
	assert.equal(readFileSync(f.log, "utf8").trim(), "--no-install playwright --version");
});

test("invalid session and remote URLs are rejected", (t) => {
	const f = setup(t);
	const out = run(f, ["--url", "https://production.example"]);
	assert.equal(out.status, 2, out.stdout + out.stderr);
	const bad = spawnSync(bash, [scripts + "may-e2e.sh", "--session", f.cwd, "--spec", "x"], {
		cwd: f.cwd, env: f.env, encoding: "utf8", timeout: 10000,
	});
	assert.equal(bad.status, 2);
});

for (const code of ["0", "1"]) {
	test(`server stops and artifacts ${code === "0" ? "removed on PASS" : "retained on FAIL"}`, async (t) => {
		const f = setup(t);
		f.env.FAKE_EXIT = code;
		const port = await freePort();
		const out = run(f, ["--start", server(f, port), "--url", `http://127.0.0.1:${port}`, "--wait", "5"]);
		assert.equal(out.status, Number(code), out.stdout + out.stderr);
		assert.match(out.stdout, new RegExp(`RESULT ${code === "0" ? "PASS" : "FAIL"}`));
		assert.equal(existsSync(join(f.dir, "e2e")), code !== "0");
		await assert.rejects(fetch(`http://127.0.0.1:${port}`));
		assert.ok(readFileSync(f.log, "utf8").split("\n").filter(Boolean).every(x => x.startsWith("--no-install playwright")));
	});
}

test("a different bash earlier on PATH does not replace the running interpreter", async (t) => {
	const f = setup(t);
	const bin = join(f.cwd, "bin");
	const realBash = spawnSync(bash, ["-lc", "command -v bash"], { encoding: "utf8", timeout: 5000 }).stdout.trim();
	const npx = join(bin, "npx");
	writeFileSync(npx, readFileSync(npx, "utf8").replace("#!/usr/bin/env bash", `#!${realBash}`));
	writeFileSync(join(bin, "bash"), "#!/bin/sh\necho 'wrong bash on PATH' >&2\nexit 97\n");
	chmodSync(join(bin, "bash"), 0o755);
	const port = await freePort();
	const args = ["--session", f.dir, "--spec", "test.spec.js", "--start", server(f, port), "--url", `http://127.0.0.1:${port}`, "--wait", "5"];
	const out = spawnSync(bash, ["-c", `export PATH=${quote(bin)}:$PATH; exec "$BASH" ${quote(scripts + "may-e2e.sh")} "$@"`, "sh", ...args], {
		cwd: f.cwd, env: f.env, encoding: "utf8", timeout: 15000,
	});
	assert.equal(out.status, 0, out.stdout + out.stderr);
	assert.match(out.stdout, /RESULT PASS/);
	await assert.rejects(fetch(`http://127.0.0.1:${port}`));
});

test("a failed run prints an artifact path that opens outside Bash", (t) => {
	const f = setup(t);
	f.env.FAKE_EXIT = "1";
	const out = run(f);
	assert.equal(out.status, 1, out.stdout + out.stderr);
	const artifacts = out.stdout.match(/^Artifacts: (.+)$/m)?.[1];
	assert.ok(artifacts, out.stdout);
	assert.equal(existsSync(join(artifacts, "trace.txt")), true, `${artifacts} is not a native path`);
});

for (const signal of ["TERM", "KILL"]) {
	test(`server cleanup after ${signal}`, async (t) => {
		const f = setup(t);
		f.env.FAKE_HOLD = "1";
		const port = await freePort();
		const pidfile = join(f.cwd, "runner-pid");
		const args = ["--session", f.dir, "--spec", "test.spec.js", "--start", server(f, port), "--url", `http://127.0.0.1:${port}`, "--wait", "5"];
		const child = spawn(bash, ["-c", `echo $$ > ${quote(pidfile)}; ${f.command} "$@"`, "sh", ...args], {
			cwd: f.cwd, env: f.env, stdio: ["ignore", "pipe", "pipe"],
		});
		try {
			await waitFile(f.env.FAKE_STARTED, child);
			const pid = readFileSync(pidfile, "utf8").trim();
			const ended = once(child, "exit", { signal: AbortSignal.timeout(15000) });
			const killed = spawnSync(bash, ["-c", `kill -${signal} ${pid}`], { encoding: "utf8", timeout: 5000 });
			assert.equal(killed.status, 0, killed.stderr);
			await ended;
			if (signal === "TERM") await assert.rejects(fetch(`http://127.0.0.1:${port}`), "TERM trap must stop the server before explicit recovery");
			const cleanup = spawnSync(bash, [scripts + "may-session.sh", "stop", f.dir], {
				cwd: f.cwd, env: f.env, encoding: "utf8", timeout: 15000,
			});
			assert.equal(cleanup.status, 0, cleanup.stderr);
			assert.equal(existsSync(f.dir), false);
			await assert.rejects(fetch(`http://127.0.0.1:${port}`));
		} finally {
			if (existsSync(f.dir)) spawnSync(bash, [scripts + "may-session.sh", "stop", f.dir], { cwd: f.cwd, env: f.env, timeout: 15000 });
			child.kill();
		}
	});
}

test("TERM during registration cannot launch the command after cleanup", async (t) => {
	const f = setup(t);
	const entered = join(f.cwd, "registration-entered");
	const release = join(f.cwd, "registration-release");
	const onceDir = join(f.cwd, "registration-once");
	const started = join(f.cwd, "command-started");
	const pidfile = join(f.cwd, "runner-pid");
	const catPath = spawnSync(bash, ["-lc", "command -v cat"], { encoding: "utf8", timeout: 5000 }).stdout.trim();
	const fake = join(f.cwd, "bin", "cat");
	writeFileSync(fake, `#!/usr/bin/env bash
parent="$(${quote(catPath)} /proc/$PPID/cmdline 2>/dev/null)"
if [[ "$1" == /proc/*/stat ]] && [[ "$parent" == *may-session.sh*track* ]] && mkdir ${quote(onceDir)} 2>/dev/null; then
 touch ${quote(entered)}
 while [ ! -e ${quote(release)} ]; do sleep 0.02; done
fi
exec ${quote(catPath)} "$@"
`);
	chmodSync(fake, 0o755);
	const command = `node -e ${quote(`require('fs').writeFileSync(${JSON.stringify(started.replaceAll("\\", "/"))},'started');setInterval(()=>{},50);`)}`;
	const child = spawn(bash, ["-c", `echo $$ > ${quote(pidfile)}; ${f.command} "$@"`, "sh", "--session", f.dir, "--spec", "test.spec.js", "--start", command, "--url", "http://127.0.0.1:1", "--wait", "10"], {
		cwd: f.cwd, env: f.env, stdio: ["ignore", "pipe", "pipe"],
	});
	try {
		await waitFile(entered, child);
		const pid = readFileSync(pidfile, "utf8").trim();
		const ended = once(child, "exit", { signal: AbortSignal.timeout(10000) });
		spawnSync(bash, ["-c", `kill -TERM ${pid}`], { timeout: 5000 });
		await ended;
		writeFileSync(release, "go");
		const settled = spawnSync(bash, ["-c", `
until [ -s ${quote(join(f.dir, "pids"))} ]; do
 [ ! -e ${quote(started)} ] || exit 1
 sleep 0.02
done
read -r launched rest < ${quote(join(f.dir, "pids"))}
while kill -0 "$launched" 2>/dev/null; do
 [ ! -e ${quote(started)} ] || exit 1
 sleep 0.02
done
test ! -e ${quote(started)}
`], { cwd: f.cwd, env: f.env, encoding: "utf8", timeout: 7000 });
		assert.equal(settled.status, 0, settled.stdout + settled.stderr);
		assert.equal(existsSync(started), false);
	} finally {
		writeFileSync(release, "go");
		spawnSync(bash, [scripts + "may-session.sh", "stop", f.dir], { cwd: f.cwd, env: f.env, timeout: 15000 });
		child.kill();
	}
});
