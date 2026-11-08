// Runs Bash for npm scripts and tests. On Windows a bare `bash` can be the WSL launcher,
// so use the Git Bash that ships with the Git on PATH.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

/** MAY_BASH overrides; on Windows, `bin/bash.exe` of the Git for Windows install on PATH; otherwise `bash`. */
export function resolveBash(): string {
	if (process.env.MAY_BASH) return process.env.MAY_BASH;
	if (process.platform !== "win32") return "bash";
	// <git root>/mingw64/libexec/git-core → <git root>/bin/bash.exe
	const gitCore = execFileSync("git", ["--exec-path"], { encoding: "utf8" }).trim();
	const gitBash = join(gitCore, "..", "..", "..", "bin", "bash.exe");
	return existsSync(gitBash) ? gitBash : "bash";
}

if (import.meta.main) {
	const result = spawnSync(resolveBash(), process.argv.slice(2), { stdio: "inherit" });
	if (result.error) throw result.error;
	process.exit(result.status ?? 1);
}
