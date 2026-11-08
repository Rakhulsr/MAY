import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, symlinkSync, utimesSync, writeFileSync, chmodSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { tempDir } from "./helpers.ts";
const bash = process.env.MAY_BASH ?? (["C:/Program Files/Git/bin/bash.exe"].find(existsSync) || "bash");
const root = fileURLToPath(new URL("..", import.meta.url));
const script = "skills/may/scripts/may-session.sh";
const run = (tmp: string, ...args: string[]) => spawnSync(bash, [script, ...args], { cwd: root, encoding: "utf8", timeout: 15000, env: { ...process.env, TMPDIR: tmp } });
const quote = (s: string) => `'${s.replaceAll("'", "'\\''")}'`;
function session(tmp: string, name = "may-test") {
 const dir = join(tmp, name); mkdirSync(dir, { recursive: true }); writeFileSync(join(dir, ".may-session"), "MAY session\n"); return dir;
}
function fixture(tmp: string) {
 const marker = join(tmp, "ticks");
 const out = spawnSync(bash, ["-lc", `bash -c ${quote(`while :; do printf x >> ${quote(marker)}; sleep 0.1; done & wait`)} >/dev/null 2>&1 </dev/null & echo $!`], { encoding: "utf8", timeout: 5000 });
 assert.equal(out.status, 0, out.stderr);
 const dir = session(tmp, "may-process"); const pid = out.stdout.trim(); const tracked = run(tmp, "track", dir, pid); assert.equal(tracked.status, 0, tracked.stderr);
 return { dir, marker, pid };
}
test("start creates a marked temp directory and prints only its path", (t) => {
 const tmp = tempDir(t, "may tmp "); const out = run(tmp, "start"); assert.equal(out.status, 0, out.stderr);
 const dir = out.stdout.trim(); assert.match(dir, /may-[^/\\]+$/);
 assert.equal(spawnSync(bash, ["-lc", 'test -e "$1"', "sh", `${dir}/.may-session`], { timeout: 5000 }).status, 0);
 assert.equal(out.stdout.trim().split(/\r?\n/).length, 1);
});
test("stop removes a validated session folder", (t) => { const tmp = tempDir(t, "may tmp "); const dir = session(tmp); const out = run(tmp, "stop", dir); assert.equal(out.status, 0, out.stderr); assert.equal(existsSync(dir), false); });
test("stop --keep leaves the folder and prints its path", (t) => { const tmp = tempDir(t, "may tmp "); const dir = session(tmp); const out = run(tmp, "stop", dir, "--keep"); assert.equal(out.status, 0, out.stderr); assert.equal(existsSync(dir), true); assert.equal(out.stdout.trim(), dir); });
test("stop rejects unsafe or unmarked targets without deleting them", (t) => {
 const tmp = tempDir(t, "may tmp "); const plain = join(tmp, "may-unmarked"); mkdirSync(plain); const outside = session(tempDir(t, "may outside "), "may-outside");
 for (const target of ["", ".", "/", process.env.HOME ?? process.env.USERPROFILE!, plain, outside]) { const out = run(tmp, "stop", target); assert.equal(out.status, 2, `${target}: ${out.stderr}`); }
 assert.equal(existsSync(plain), true); assert.equal(existsSync(outside), true);
});
test("sweep removes only old marked sessions and preserves young sessions", (t) => {
 const tmp = tempDir(t, "may tmp "); const old = session(tmp, "may-old"); const young = session(tmp, "may-young"); const age = new Date(Date.now() - 25 * 3600000); utimesSync(old, age, age);
 const out = run(tmp, "sweep"); assert.equal(out.status, 0, out.stderr); assert.equal(existsSync(old), false); assert.equal(existsSync(young), true); assert.match(out.stdout, /may-old/);
});
test("sweep leaves a marked session while a tracked process is alive", (t) => {
 const tmp = tempDir(t, "may tmp "); const {dir} = fixture(tmp); const age = new Date(Date.now() - 25 * 3600000); utimesSync(dir, age, age);
 try { const out = run(tmp, "sweep"); assert.equal(out.status, 0, out.stderr); assert.equal(existsSync(dir), true); } finally { run(tmp, "stop", dir); }
});
test("stop terminates a tracked process and its descendant before deleting recovery data", (t) => {
 const tmp = tempDir(t, "may tmp "); const {dir, marker} = fixture(tmp);
 try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 400); const out = run(tmp, "stop", dir); assert.equal(out.status, 0, out.stderr); assert.equal(existsSync(dir), false);
 const before = readFileSync(marker, "utf8"); Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500); assert.equal(readFileSync(marker, "utf8"), before); } finally { if (existsSync(dir)) run(tmp, "stop", dir); }
});
test("failed process termination retains the session and recorded PID", { skip: process.platform !== "win32" }, (t) => {
 const tmp = tempDir(t, "may tmp "); const {dir, pid} = fixture(tmp); const bin = join(tmp, "bin"); mkdirSync(bin); const fake = join(bin, "taskkill"); writeFileSync(fake, "#!/usr/bin/env bash\nexit 1\n"); chmodSync(fake, 0o755);
 try { const out = spawnSync(bash, ["-c", `export PATH=${quote(bin)}:$PATH; bash ${quote(script)} stop ${quote(dir)}`], { cwd: root, encoding: "utf8", timeout: 10000, env: {...process.env, TMPDIR: tmp} });
 assert.equal(out.status, 1, out.stdout+out.stderr); assert.equal(existsSync(dir), true); assert.match(readFileSync(join(dir,"pids"),"utf8"), new RegExp(pid)); } finally { run(tmp, "stop", dir); }
});

test("ordinary and trailing-slash symlink aliases cannot escape the temp root", (t) => {
 const tmp = tempDir(t, "may tmp ");
 const outside = session(tempDir(t, "may outside "), "may-external");
 const evidence = join(outside, "e2e"); mkdirSync(evidence); writeFileSync(join(evidence, "keep"), "untouched");
 const alias = join(tmp, "may-link");
 symlinkSync(outside, alias, process.platform === "win32" ? "junction" : "dir");
 for (const target of [alias, alias.replaceAll("\\", "/") + "/"]) {
  const out = run(tmp, "stop", target);
  assert.equal(out.status, 2, target + out.stderr);
  assert.equal(readFileSync(join(evidence, "keep"), "utf8"), "untouched");
 }
});

test("a recorded process identity mismatch never kills the current PID owner", (t) => {
 const tmp = tempDir(t, "may tmp "); const { dir, marker } = fixture(tmp);
 const record = readFileSync(join(dir, "pids"), "utf8");
 const fields = record.trim().split(/\s+/); fields[1] = "mismatched-start-identity";
 try {
  writeFileSync(join(dir, "pids"), fields.join(" ") + "\n");
  const out = run(tmp, "stop", dir);
  assert.equal(out.status, 1, out.stdout + out.stderr);
  assert.equal(existsSync(dir), true);
  const before = readFileSync(marker, "utf8");
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 300);
  assert.ok(readFileSync(marker, "utf8").length > before.length);
 } finally {
  if (existsSync(dir)) { writeFileSync(join(dir, "pids"), record); run(tmp, "stop", dir); }
 }
});

for (const exitLeader of [false, true]) {
 test(`owned group cleanup includes TERM-ignoring child with ${exitLeader ? "exited" : "live"} leader`, (t) => {
  const tmp = tempDir(t, "may tmp "); const dir = session(tmp, "may-group");
  const ticks = join(tmp, "ticks"); const ready = join(tmp, "ready"); const release = join(tmp, "release");
  const child = `trap '' TERM; while :; do printf x >> ${quote(ticks)}; sleep 0.1; done`;
  const leader = `bash ${quote(join(root, script).replaceAll("\\", "/"))} track ${quote(dir)} $$; bash -c ${quote(child)} & touch ${quote(ready)}; while [ ! -e ${quote(release)} ]; do sleep 0.05; done`;
  const launched = spawnSync(bash, ["-c", `set -m; bash -c ${quote(leader)} >/dev/null 2>&1 </dev/null & echo $!`], { encoding: "utf8", timeout: 5000, env: { ...process.env, TMPDIR: tmp } });
  assert.equal(launched.status, 0, launched.stderr);
  try {
   const waited = spawnSync(bash, ["-c", `until [ -e ${quote(ready)} ] && [ -s ${quote(ticks)} ]; do sleep 0.05; done`], { timeout: 5000 });
   assert.equal(waited.status, 0);
   const refreshed = run(tmp, "track", dir, launched.stdout.trim());
   assert.equal(refreshed.status, 0, refreshed.stderr);
   const owned = readFileSync(join(dir, "pids"), "utf8");
   if (exitLeader) {
    writeFileSync(release, "go");
    const exited = spawnSync(bash, ["-c", `while kill -0 ${launched.stdout.trim()} 2>/dev/null; do sleep 0.05; done`], { timeout: 5000 });
    assert.equal(exited.status, 0);
    writeFileSync(join(dir, "pids"), owned.trim().split("\n").map(row => {
     const fields = row.split(" "); fields[1] = "different-group-lifetime"; return fields.join(" ");
    }).join("\n") + "\n");
    const refused = run(tmp, "stop", dir);
    assert.equal(refused.status, 1, refused.stdout + refused.stderr);
    assert.equal(existsSync(dir), true);
    writeFileSync(join(dir, "pids"), owned);
   }
   const stopped = run(tmp, "stop", dir);
   assert.equal(stopped.status, 0, stopped.stdout + stopped.stderr);
   assert.equal(existsSync(dir), false);
   const before = readFileSync(ticks, "utf8");
   Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 300);
   assert.equal(readFileSync(ticks, "utf8"), before);
  } finally {
   if (existsSync(dir)) run(tmp, "stop", dir);
  }
 });
}

test("owned group cleanup includes a stopped member", (t) => {
 const tmp = tempDir(t, "may tmp "); const dir = session(tmp, "may-stopped");
 const childPid = join(tmp, "child-pid"); const release = join(tmp, "release");
 const leader = `bash ${quote(join(root, script).replaceAll("\\", "/"))} track ${quote(dir)} $$; sleep 300 & echo $! > ${quote(childPid)}; while [ ! -e ${quote(release)} ]; do sleep 0.05; done`;
 const launched = spawnSync(bash, ["-c", `set -m; bash -c ${quote(leader)} >/dev/null 2>&1 </dev/null & echo $!`], { encoding: "utf8", timeout: 5000, env: { ...process.env, TMPDIR: tmp } });
 assert.equal(launched.status, 0, launched.stderr);
 let child = "";
 const alive = () => spawnSync(bash, ["-c", `kill -0 ${child}`], { timeout: 5000 }).status === 0;
 try {
  const waited = spawnSync(bash, ["-c", `until [ -s ${quote(childPid)} ]; do sleep 0.05; done`], { timeout: 5000 });
  assert.equal(waited.status, 0);
  child = readFileSync(childPid, "utf8").trim();
  const paused = spawnSync(bash, ["-c", `kill -STOP ${child}; until { [ -r /proc/${child}/stat ] && [ "$(cut -d' ' -f3 /proc/${child}/stat)" = T ]; } || ps -o stat= -p ${child} 2>/dev/null | grep -q '^T'; do sleep 0.02; done`], { timeout: 5000 });
  assert.equal(paused.status, 0, paused.stderr);
  const stopped = run(tmp, "stop", dir);
  assert.equal(stopped.status, 0, stopped.stdout + stopped.stderr);
  assert.equal(alive(), false, `stopped group member ${child} survived cleanup`);
  assert.equal(existsSync(dir), false);
 } finally {
  if (child && alive()) spawnSync(bash, ["-c", `kill -CONT ${child}; kill -KILL ${child}`], { timeout: 5000 });
  writeFileSync(release, "go");
  if (existsSync(dir)) run(tmp, "stop", dir);
 }
});
