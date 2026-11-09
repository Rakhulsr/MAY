import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const target = process.argv[2];
if (!target) throw new Error('Usage: node notes-l.mjs <fixture-directory>');
// B-L includes all of B-M.
execFileSync(process.execPath, [resolve(dirname(fileURLToPath(import.meta.url)), 'notes.mjs'), target], { stdio: 'inherit' });

const load = (file) => import(pathToFileURL(resolve(target, file)).href);
const store = await load('notes.js');
const { createApp } = await load('server.js');
const client = await load('client.js');
const { renderPager } = await load('render.js');

store.resetNotes();
const a = store.addNote({ title: 'A', tags: ['x'] });
store.addNote({ title: 'B' });
assert.deepEqual(store.updateNote(a.id, { title: ' A2 ', tags: [' Y ', 'y'] }), { id: a.id, title: 'A2', body: '', tags: ['y'] });
assert.throws(() => store.updateNote(a.id, { title: ' ' }), TypeError);
assert.throws(() => store.updateNote(a.id, { tags: [1] }), TypeError);
assert.equal(store.listNotes()[0].title, 'A2', 'a rejected patch leaves the note unchanged');
assert.deepEqual(store.listNotes()[0].tags, ['y']);
assert.throws(() => store.updateNote(99, { title: 'Z' }), RangeError);
store.deleteNote(a.id);
assert.throws(() => store.deleteNote(a.id), RangeError);
assert.deepEqual(store.listNotes().map(({ title }) => title), ['B']);
assert.equal(store.addNote({ title: 'C' }).id, 3, 'ids are never reused');
store.resetNotes();

const server = createApp().listen(0);
await new Promise((done) => server.once('listening', done));
const base = `http://127.0.0.1:${server.address().port}`;
const req = (path, init) => fetch(`${base}${path}`, init);
try {
  for (let i = 1; i <= 5; i++) await req('/notes', { method: 'POST', body: JSON.stringify({ title: `N${i}`, tags: i % 2 ? ['odd'] : [] }) });
  const patched = await req('/notes/2', { method: 'PATCH', body: JSON.stringify({ body: 'new', tags: ['Odd'] }) });
  assert.equal(patched.status, 200);
  assert.deepEqual(await patched.json(), { id: 2, title: 'N2', body: 'new', tags: ['odd'] });
  assert.equal((await req('/notes/2', { method: 'PATCH', body: JSON.stringify({ tags: 'odd' }) })).status, 400);
  assert.equal((await req('/notes/42', { method: 'PATCH', body: JSON.stringify({ title: 'Z' }) })).status, 404);
  const deleted = await req('/notes/4', { method: 'DELETE' });
  assert.equal(deleted.status, 204);
  assert.equal((await req('/notes/4', { method: 'DELETE' })).status, 404);

  const page = await req('/notes?limit=2&offset=1');
  assert.equal(page.status, 200);
  assert.equal(page.headers.get('x-total-count'), '4');
  assert.deepEqual((await page.json()).map(({ id }) => id), [2, 3]);
  const tagged = await req('/notes?tag=ODD&limit=1&offset=2');
  assert.equal(tagged.headers.get('x-total-count'), '4');
  assert.deepEqual((await tagged.json()).map(({ id }) => id), [3]);
  const all = await req('/notes');
  assert.equal(all.headers.get('x-total-count'), '4');
  assert.equal((await all.json()).length, 4);
  for (const query of ['limit=0', 'limit=101', 'limit=-1', 'limit=2.5', 'limit=x', 'offset=-1', 'offset=1.5']) {
    assert.equal((await req(`/notes?${query}`)).status, 400, query);
  }

  const result = await client.fetchPage(base, { tag: 'odd', limit: 2, offset: 0 });
  assert.equal(result.total, 4);
  assert.deepEqual(result.notes.map(({ id }) => id), [1, 2]);
  assert.deepEqual(await client.updateNote(base, 1, { title: 'One' }), { id: 1, title: 'One', body: '', tags: ['odd'] });
  await client.deleteNote(base, 1);
  await assert.rejects(client.deleteNote(base, 1));
  await assert.rejects(client.updateNote(base, 1, { title: 'Gone' }));
  assert.equal((await client.fetchNotes(base)).length, 3);
} finally {
  await new Promise((done) => server.close(done));
}

assert.equal(renderPager({ offset: 0, limit: 2, total: 5 }), '<nav class="pager">Showing 1–2 of 5</nav>');
assert.equal(renderPager({ offset: 4, limit: 2, total: 5 }), '<nav class="pager">Showing 5–5 of 5</nav>');
assert.equal(renderPager({ offset: 0, limit: 2, total: 0 }), '<nav class="pager">No notes</nav>');
store.resetNotes();
console.log('notes-l: PASS');
