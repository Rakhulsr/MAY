// Runs Bash for npm scripts and tests. On Windows a bare `bash` can be the WSL launcher,
// so use the Git Bash that ships with the Git on PATH.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

/** MAY_BASH overrides; on Windows, `bin/bash.exe` of the Git for Windows install on PATH (an error if there is none, never a bare `bash`, which can be WSL); otherwise `bash`. */
export function resolveBash(env: NodeJS.ProcessEnv = process.env): string {
	if (env.MAY_BASH) return env.MAY_BASH;
	if (process.platform !== "win32") return "bash";
	try {
		// <git root>/mingw64/libexec/git-core → <git root>/bin/bash.exe
		const gitCore = execFileSync("git", ["--exec-path"], { encoding: "utf8", env }).trim();
		const gitBash = join(gitCore, "..", "..", "..", "bin", "bash.exe");
		if (existsSync(gitBash)) return gitBash;
	} catch {
		// Fall through to the explicit error below.
	}
	throw new Error("Git for Windows bin/bash.exe not found via `git --exec-path`; install Git for Windows or set MAY_BASH.");
}

if (import.meta.main) {
	const result = spawnSync(resolveBash(), process.argv.slice(2), { stdio: "inherit" });
	if (result.error) throw result.error;
	if (result.signal) process.kill(process.pid, result.signal);
	process.exit(result.status ?? 1);
}
