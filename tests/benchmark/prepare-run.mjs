// Usage: node prepare-run.mjs <orders|notes>
// Copies a fixture into a new marked MAY session as a disposable Git project.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveBash } from '../../scripts/bash.ts';

const here = dirname(fileURLToPath(import.meta.url));
const name = process.argv[2];
const fixture = join(here, 'fixtures', name ?? '');
if (!name || !/^[a-z]+$/.test(name) || !existsSync(fixture)) {
  console.error('Usage: node prepare-run.mjs <orders|notes>');
  process.exit(2);
}
const sessionScript = resolve(here, '../../skills/may/scripts/may-session.sh');
const session = execFileSync(resolveBash(), [sessionScript, 'start'], { encoding: 'utf8' }).trim();
const project = join(session, 'project');
cpSync(fixture, project, { recursive: true });
const git = (...args) => execFileSync('git', ['-c', 'user.name=benchmark', '-c', 'user.email=benchmark@example.invalid', ...args], { cwd: project, stdio: 'ignore' });
git('init', '-q', '-b', 'main');
git('add', '-A');
git('commit', '-q', '-m', `benchmark fixture ${name}`);
console.log(`session ${session}`);
console.log(`project ${project}`);
console.log(`oracle  node "${join(here, 'oracles', `${name}.mjs`)}" "${project}"`);
console.log(`cleanup "${resolveBash()}" "${sessionScript}" stop "${session}"`);
