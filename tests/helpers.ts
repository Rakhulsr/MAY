import { execFileSync } from "node:child_process";
import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join } from "node:path";
import type { TestContext } from "node:test";
import { resolveBash } from "../scripts/bash.ts";

// Absolute, so tests that replace PATH can still launch Bash (resolveBash returns a bare `bash` off Windows).
const found = resolveBash();
export const bash = isAbsolute(found) ? found : execFileSync(found, ["-c", 'printf %s "$BASH"'], { encoding: "utf8" });

export function tempDir(t: TestContext, prefix = "may-test-") {
	const dir = realpathSync.native(mkdtempSync(join(tmpdir(), prefix)));
	t.after(() => rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 }));
	return dir;
}

export function git(cwd: string, ...args: string[]) {
	return execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@example.com", ...args], {
		cwd,
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	});
}

export function gitRepo(t: TestContext) {
	const dir = tempDir(t, "may-repo-");
	git(dir, "init", "-q", "-b", "main");
	return dir;
}
