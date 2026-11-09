// Usage: node count-tokens.mjs <coordinator-session.jsonl>...
// Reads Claude Code or OMP session logs. Worker logs are found in the directory that
// shares the coordinator file's name (Claude `<id>/subagents/*.jsonl`, OMP `<id>/<Worker>.jsonl`).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

export function countFile(file) {
  const seen = new Set();
  const sum = { calls: 0, input: 0, cacheRead: 0, cacheWrite: 0, output: 0, maxContext: 0 };
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    if (!line.includes('"usage"')) continue;
    let entry;
    try { entry = JSON.parse(line); } catch { continue; }
    const message = entry.message || {};
    const usage = message.usage || entry.usage;
    if (!usage) continue;
    // Claude Code writes one line per content block with the same message id.
    if (message.id) {
      if (seen.has(message.id)) continue;
      seen.add(message.id);
    }
    const input = usage.input_tokens ?? usage.input ?? 0;
    const cacheRead = usage.cache_read_input_tokens ?? usage.cacheRead ?? 0;
    const cacheWrite = usage.cache_creation_input_tokens ?? usage.cacheWrite ?? 0;
    const output = usage.output_tokens ?? usage.output ?? 0;
    if (input + cacheRead + cacheWrite + output === 0) continue;
    sum.calls++;
    sum.input += input;
    sum.cacheRead += cacheRead;
    sum.cacheWrite += cacheWrite;
    sum.output += output;
    sum.maxContext = Math.max(sum.maxContext, input + cacheRead + cacheWrite);
  }
  sum.total = sum.input + sum.cacheRead + sum.cacheWrite + sum.output;
  // Input-equivalent tokens at Anthropic's price ratios: cache read 0.1x, 5-minute cache write 1.25x, output 5x.
  sum.weighted = Math.round(sum.input + 0.1 * sum.cacheRead + 1.25 * sum.cacheWrite + 5 * sum.output);
  return sum;
}

const walk = (dir) => readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith('.jsonl') ? [join(dir, e.name)] : []);

export function countRun(coordinatorFile) {
  const companion = coordinatorFile.replace(/\.jsonl$/, '');
  const workers = existsSync(companion) ? walk(companion).map((file) => ({ file: basename(file), ...countFile(file) })) : [];
  const coordinator = countFile(coordinatorFile);
  const total = coordinator.total + workers.reduce((n, w) => n + w.total, 0);
  const weighted = coordinator.weighted + workers.reduce((n, w) => n + w.weighted, 0);
  return { file: basename(coordinatorFile), coordinator, workers, total, weighted };
}

if (import.meta.main) {
  const files = process.argv.slice(2);
  if (!files.length) {
    console.error('Usage: node count-tokens.mjs <coordinator-session.jsonl>...');
    process.exit(2);
  }
  for (const file of files) console.log(JSON.stringify(countRun(file), null, 2));
}
