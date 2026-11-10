import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { bash, tempDir } from "./helpers.ts";

const script = fileURLToPath(new URL("../skills/may/scripts/may-bridge.sh", import.meta.url));

function packet(kind: string, payload: object) {
	return {
		schema_version: "mip/1",
		id: "packet-1",
		kind,
		created_at: "2026-01-02T03:04:05Z",
		parents: ["packet-0"],
		source: { harness: "example", model: "example-model" },
		context: { revision: null, fingerprint: "abc123", scope: ["src"] },
		task: { goal: "Evaluate the design", constraints: ["Keep the interface small"] },
		claims: [{ id: "claim-1", statement: "The option may work", status: "supported", evidence_ids: ["evidence-1"] }],
		evidence: [{ id: "evidence-1", type: "file", locator: "src/example.ts", verification: "verified" }],
		open_questions: ["What remains uncertain?"],
		payload,
	};
}

const payloads = {
	brief: { questions: ["Which approach fits?"] },
	proposal: { options: [{ id: "option-1", description: "Use a small interface", advantages: ["Simple"], risks: ["Limited flexibility"] }], recommendation: "option-1" },
	review: { target_id: "packet-0", findings: [{ statement: "The option needs evidence", assessment: "unsupported", reason: "No measurement was supplied" }] },
	resolution: { decisions: [{ statement: "Use the small interface", status: "accepted", reason: "It meets the constraints" }], disagreements: ["Future flexibility remains uncertain"] },
};

function run(cwd: string, ...args: string[]) {
	return spawnSync(bash, [script, ...args], { cwd, encoding: "utf8", timeout: 15000 });
}

function validate(cwd: string, content: string) {
	const file = join(cwd, "packet with spaces.json");
	writeFileSync(file, content);
	return run(cwd, "validate", file);
}

for (const [kind, payload] of Object.entries(payloads)) {
	test(`validates a representative ${kind} packet from a disposable directory`, (t) => {
		const out = validate(tempDir(t, "may bridge "), JSON.stringify(packet(kind, payload)));
		assert.equal(out.status, 0, out.stdout + out.stderr);
		assert.ok((out.stdout + out.stderr).trim(), "validation should explain the result");
	});
}

test("rejects invalid JSON without echoing the untrusted content", (t) => {
	const content = '{"secret":"do-not-echo-this-content",';
	const out = validate(tempDir(t), content);
	assert.equal(out.status, 1, out.stdout + out.stderr);
	assert.ok((out.stdout + out.stderr).trim());
	assert.doesNotMatch(out.stdout + out.stderr, /do-not-echo-this-content/);
});

test("rejects an unknown schema version", (t) => {
	const value = { ...packet("brief", payloads.brief), schema_version: "mip/2" };
	const out = validate(tempDir(t), JSON.stringify(value));
	assert.equal(out.status, 1, out.stdout + out.stderr);
});

test("rejects malformed packets, wrong types, and unknown fields", (t) => {
	const base = packet("brief", payloads.brief);
	const cases = [
		null,
		{ ...base, task: { goal: "", constraints: [] } },
		{ ...base, parents: "packet-0" },
		{ ...base, created_at: "not-a-date" },
		{ ...base, unexpected: true },
		{ ...base, payload: { questions: [42] } },
		{ ...base, claims: [{ ...base.claims[0], status: "certain" }] },
		{ ...base, evidence: [base.evidence[0], base.evidence[0]] },
		{ ...base, claims: [base.claims[0], base.claims[0]] },
	];
	const dir = tempDir(t);
	for (const [index, value] of cases.entries()) {
		const out = validate(dir, JSON.stringify(value));
		assert.equal(out.status, 1, `case ${index}: ${out.stdout}${out.stderr}`);
	}
});

test("rejects evidence references that do not resolve within the packet", (t) => {
	const base = packet("brief", payloads.brief);
	const value = { ...base, claims: [{ ...base.claims[0], evidence_ids: ["missing"] }] };
	const out = validate(tempDir(t), JSON.stringify(value));
	assert.equal(out.status, 1, out.stdout + out.stderr);
});

test("rejects a proposal recommendation that does not identify an option", (t) => {
	const value = packet("proposal", { ...payloads.proposal, recommendation: "missing" });
	const out = validate(tempDir(t), JSON.stringify(value));
	assert.equal(out.status, 1, out.stdout + out.stderr);
});

test("rejects input larger than 256 KiB", (t) => {
	const value = packet("brief", { questions: ["x".repeat(256 * 1024)] });
	const out = validate(tempDir(t), JSON.stringify(value));
	assert.equal(out.status, 1, out.stdout + out.stderr);
});

test("reports invalid invocations with exit status 2", (t) => {
	const dir = tempDir(t);
	for (const args of [[], ["validate"], ["unknown"], ["validate", "one", "two"]]) {
		const out = run(dir, ...args);
		assert.equal(out.status, 2, `${args.join(" ")}: ${out.stdout}${out.stderr}`);
		assert.ok((out.stdout + out.stderr).trim());
	}
});

test("rejects ambiguous duplicate JSON keys, including escaped keys", (t) => {
	const base = JSON.stringify(packet("brief", payloads.brief));
	const duplicated = base.replace('"kind":"brief"', '"kind":"brief","k\\u0069nd":"proposal"');
	const out = validate(tempDir(t), duplicated);
	assert.equal(out.status, 1, out.stdout + out.stderr);
});

test("rejects impossible calendar dates", (t) => {
	const base = packet("brief", payloads.brief);
	const out = validate(tempDir(t), JSON.stringify({ ...base, created_at: "2026-02-30T12:00:00Z" }));
	assert.equal(out.status, 1, out.stdout + out.stderr);
});

test("rejects a time outside the date-time format", (t) => {
	const base = packet("brief", payloads.brief);
	const out = validate(tempDir(t), JSON.stringify({ ...base, created_at: "2026-01-01T24:00:00Z" }));
	assert.equal(out.status, 1, out.stdout + out.stderr);
});

test("rejects invalid UTF-8 and directories", (t) => {
	const dir = tempDir(t);
	const file = join(dir, "invalid.json");
	writeFileSync(file, Buffer.from([0xff]));
	for (const target of [file, dir]) {
		const out = run(dir, "validate", target);
		assert.equal(out.status, 1, out.stdout + out.stderr);
	}
});

test("treats packet instructions as data without executing them", (t) => {
	const dir = tempDir(t);
	const target = join(dir, "executed");
	const content = packet("brief", { questions: [`$(touch '${target}')`] });
	const out = validate(dir, JSON.stringify(content));
	assert.equal(out.status, 0, out.stdout + out.stderr);
	assert.equal(existsSync(target), false);
});

test("reports unavailable Node without installing anything", (t) => {
	const dir = tempDir(t);
	const out = spawnSync(bash, [script, "validate", "unused.json"], {
		cwd: dir, env: { ...process.env, PATH: dir }, encoding: "utf8", timeout: 15000,
	});
	assert.equal(out.status, 2, out.stdout + out.stderr);
	assert.match(out.stderr, /Node/);
});

test("rejects a symbolic link to a valid packet", (t) => {
	const dir = tempDir(t);
	const file = join(dir, "packet.json");
	const link = join(dir, "link.json");
	writeFileSync(file, JSON.stringify(packet("brief", payloads.brief)));
	try {
		symlinkSync(file, link, "file");
	} catch (error) {
		if (process.platform === "win32" && ["EPERM", "EACCES"].includes((error as NodeJS.ErrnoException).code ?? "")) {
			t.skip("Windows does not permit creating a symbolic link");
			return;
		}
		throw error;
	}
	const out = run(dir, "validate", link);
	assert.equal(out.status, 1, out.stdout + out.stderr);
});

const hostSignals = ["HERDR_ENV", "ZELLIJ", "TMUX", "HC_TERMINAL_ID", "WEZTERM_PANE", "WT_SESSION", "TERM_PROGRAM", "ZED_TERM", "MAY_HOST"];

// Run the bridge with a clean host environment, a PATH that starts with stub host CLIs, and the given signals.
function runHost(cwd: string, bin: string, signals: Record<string, string>, ...args: string[]) {
	const env: Record<string, string | undefined> = {};
	for (const [key, value] of Object.entries(process.env)) {
		if (!hostSignals.includes(key.toUpperCase()) && key.toUpperCase() !== "PATH") env[key] = value;
	}
	env.PATH = signals.PATH ?? `${bin}${process.platform === "win32" ? ";" : ":"}${process.env.PATH ?? process.env.Path ?? ""}`;
	const { PATH: _path, ...rest } = signals;
	// Pass arguments through the environment: on Windows the MSYS runtime re-parses quotes in a native command line.
	args.forEach((arg, i) => { env[`MAY_TEST_ARG_${i}`] = arg; });
	const forward = `a=(); for ((i=0; i<${args.length}; i++)); do v=MAY_TEST_ARG_$i; a+=("\${!v}"); done; exec "$BASH" "$0" "\${a[@]}"`;
	return spawnSync(bash, ["-c", forward, script], { cwd, env: { ...env, ...rest }, encoding: "utf8", timeout: 15000 });
}

// A stub host CLI that appends its name and argv (one per line) to calls.log and prints `output`.
function stub(bin: string, name: string, output = "", status = 0) {
	const file = join(bin, name);
	const log = join(bin, "calls.log").replaceAll("\\", "/");
	writeFileSync(file, [
		"#!/usr/bin/env bash",
		`printf '%s\\n' "$(basename "$0")" "$@" @@end >> '${log}'`,
		`printf '%s\\n' '${output}'`,
		`exit ${status}`,
		"",
	].join("\n"));
	chmodSync(file, 0o755);
}

function calls(bin: string) {
	const log = join(bin, "calls.log");
	return existsSync(log) ? readFileSync(log, "utf8").split("@@end\n").filter(Boolean).map((c) => c.trimEnd().split("\n")) : [];
}

function bashPwd(cwd: string) {
	return spawnSync(bash, ["-c", "pwd"], { cwd, encoding: "utf8" }).stdout.trim();
}

test("host reports the innermost controllable host from environment signals", (t) => {
	const dir = tempDir(t);
	const cases: [Record<string, string>, string][] = [
		[{}, "none"],
		[{ HERDR_ENV: "1" }, "herdr"],
		[{ ZELLIJ: "0" }, "zellij"],
		[{ TMUX: "/tmp/tmux-1/default,1,0" }, "tmux"],
		[{ HC_TERMINAL_ID: "t12" }, "herdr-app"],
		[{ WEZTERM_PANE: "3" }, "wezterm"],
		[{ WT_SESSION: "guid" }, "windows-terminal"],
		[{ TERM_PROGRAM: "vscode" }, "vscode"],
		[{ ZED_TERM: "true" }, "zed"],
		[{ TERM_PROGRAM: "zed" }, "zed"],
		[{ HERDR_ENV: "1", WT_SESSION: "guid" }, "herdr"],
		[{ TMUX: "x", HC_TERMINAL_ID: "t1", TERM_PROGRAM: "vscode" }, "tmux"],
		[{ HC_TERMINAL_ID: "t1", WT_SESSION: "guid" }, "herdr-app"],
		[{ HERDR_ENV: "0" }, "none"],
		[{ MAY_HOST: "wezterm", HERDR_ENV: "1" }, "wezterm"],
	];
	for (const [signals, expected] of cases) {
		const out = runHost(dir, dir, signals, "host");
		assert.equal(out.status, 0, `${JSON.stringify(signals)}: ${out.stderr}`);
		assert.equal(out.stdout.trim(), expected, JSON.stringify(signals));
	}
});

test("host rejects an unknown MAY_HOST override", (t) => {
	const dir = tempDir(t);
	const out = runHost(dir, dir, { MAY_HOST: "konsole" }, "host");
	assert.equal(out.status, 2, out.stdout + out.stderr);
	assert.match(out.stderr, /MAY_HOST/);
});

test("open uses the detected host's own pane command in the current directory", (t) => {
	const bin = tempDir(t, "may bin ");
	const cwd = tempDir(t, "may cwd ");
	const pwd = bashPwd(cwd);
	const argv = ["pi", "-p", "review the brief"];
	const cases: [Record<string, string>, string, string[]][] = [
		[{ ZELLIJ: "0" }, "zellij", ["zellij", "run", "--cwd", pwd, "--", ...argv]],
		[{ TMUX: "x" }, "tmux", ["tmux", "split-window", "-d", "-P", "-c", pwd, ...argv]],
		[{ HC_TERMINAL_ID: "t1" }, "hc", ["hc", "run", "--bg", "--json", "--no-notify", "--cwd", pwd, "--", ...argv]],
		[{ WEZTERM_PANE: "1" }, "wezterm", ["wezterm", "cli", "split-pane", "--cwd", pwd, "--", ...argv]],
		[{ WT_SESSION: "guid" }, "wt", ["wt", "-w", "0", "split-pane", "-d", pwd, ...argv]],
	];
	for (const [signals, cli, expected] of cases) {
		rmSync(join(bin, "calls.log"), { force: true });
		stub(bin, cli, "pane-7");
		const out = runHost(cwd, bin, signals, "open", ...argv);
		assert.equal(out.status, 0, `${cli}: ${out.stdout}${out.stderr}`);
		assert.match(out.stdout, /pane-7/, cli);
		assert.deepEqual(calls(bin), [expected], cli);
	}
});

test("open in herdr splits beside the caller and types a shell-neutral command", (t) => {
	const bin = tempDir(t, "may bin ");
	const cwd = tempDir(t, "may cwd ");
	stub(bin, "herdr", '{"ok":true,"result":{"origin":{"pane_id":"w1:p1"},"pane": {"pane_id": "w1:p9","cwd":"x"}}}');
	const out = runHost(cwd, bin, { HERDR_ENV: "1" }, "open", "pi", "-p", "review $HOME & the brief");
	assert.equal(out.status, 0, out.stdout + out.stderr);
	assert.equal(out.stdout.trim(), "w1:p9");
	assert.deepEqual(calls(bin), [
		["herdr", "pane", "split", "--current", "--direction", "right", "--cwd", bashPwd(cwd), "--no-focus"],
		["herdr", "pane", "run", "w1:p9", "pi '-p' 'review $HOME & the brief'"],
	]);
});

test("open in herdr refuses arguments it cannot quote for every shell", (t) => {
	const bin = tempDir(t);
	stub(bin, "herdr", '{"result":{"pane":{"pane_id":"w1:p2"}}}');
	for (const argv of [["pi", "it's"], ["pi", "two\nlines"], ["my prog", "x"], ["pi;rm", "x"]]) {
		const out = runHost(bin, bin, { HERDR_ENV: "1" }, "open", ...argv);
		assert.equal(out.status, 2, `${JSON.stringify(argv)}: ${out.stdout}${out.stderr}`);
		assert.ok(out.stderr.trim());
	}
	assert.deepEqual(calls(bin), []);
});

test("open exits 3 without launching anything when the host has no pane CLI", (t) => {
	const bin = tempDir(t);
	for (const cli of ["zellij", "tmux", "hc", "wezterm", "wt", "herdr"]) stub(bin, cli);
	for (const signals of [{}, { TERM_PROGRAM: "vscode" }, { ZED_TERM: "true" }, { MAY_HOST: "none" }]) {
		const out = runHost(bin, bin, signals, "open", "pi", "-p", "x");
		assert.equal(out.status, 3, `${JSON.stringify(signals)}: ${out.stdout}${out.stderr}`);
		assert.match(out.stderr, /headless/);
	}
	assert.deepEqual(calls(bin), []);
});

test("open exits 3 when the detected host CLI is not installed", (t) => {
	const bin = tempDir(t);
	const out = runHost(bin, bin, { ZELLIJ: "0", PATH: bin }, "open", "pi");
	assert.equal(out.status, 3, out.stdout + out.stderr);
	assert.match(out.stderr, /zellij/);
});

test("open exits 1 when the host refuses to open a pane", (t) => {
	const bin = tempDir(t);
	stub(bin, "tmux", "no server running", 1);
	const out = runHost(bin, bin, { TMUX: "x" }, "open", "pi");
	assert.equal(out.status, 1, out.stdout + out.stderr);
	assert.match(out.stderr, /headless/);
});

test("host and open report invalid invocations with exit status 2", (t) => {
	const dir = tempDir(t);
	for (const args of [["host", "extra"], ["open"], ["open", ""]]) {
		const out = runHost(dir, dir, { TMUX: "x" }, ...args);
		assert.equal(out.status, 2, `${args.join(" ")}: ${out.stdout}${out.stderr}`);
		assert.ok(out.stderr.trim());
	}
});
