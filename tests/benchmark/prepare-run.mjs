// Usage: node prepare-run.mjs <orders|notes|notes-l>
// Copies a fixture into a new marked MAY session as a disposable Git project.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveBash } from '../../scripts/bash.ts';

const here = dirname(fileURLToPath(import.meta.url));
const name = process.argv[2];
// B-L reuses the notes fixture with a larger task and its own oracle.
const fixture = join(here, 'fixtures', (name ?? '').replace(/-l$/, ''));
if (!name || !/^[a-z]+(-l)?$/.test(name) || !existsSync(fixture) || !existsSync(join(here, 'oracles', `${name}.mjs`))) {
  console.error('Usage: node prepare-run.mjs <orders|notes|notes-l>');
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
