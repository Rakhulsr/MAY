import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const target = process.argv[2];
if (!target) throw new Error('Usage: node notes.mjs <fixture-directory>');
const load = (file) => import(pathToFileURL(resolve(target, file)).href);
const { addNote, listNotes, resetNotes } = await load('notes.js');
const { createApp } = await load('server.js');
const { fetchNotes } = await load('client.js');
const { renderNotes } = await load('render.js');

resetNotes();
assert.deepEqual(addNote({ title: 'Plain' }).tags, []);
assert.deepEqual(addNote({ title: 'Mixed', tags: [' Work ', 'work', '', 'Home'] }).tags, ['work', 'home']);
assert.throws(() => addNote({ title: 'Bad', tags: 'work' }), TypeError);
assert.throws(() => addNote({ title: 'Bad', tags: ['ok', 1] }), TypeError);
assert.equal(listNotes().length, 2);
assert.ok(listNotes().every((note) => Array.isArray(note.tags)));

const server = createApp().listen(0);
await new Promise((done) => server.once('listening', done));
const base = `http://127.0.0.1:${server.address().port}`;
try {
  const post = (body) => fetch(`${base}/notes`, { method: 'POST', body: JSON.stringify(body) });
  const created = await post({ title: 'Trip', tags: ['Travel', 'a&b'] });
  assert.equal(created.status, 201);
  assert.deepEqual((await created.json()).tags, ['travel', 'a&b']);
  assert.equal((await post({ title: 'Bad', tags: [null] })).status, 400);
  assert.deepEqual((await (await fetch(`${base}/notes?tag=%20WORK`)).json()).map(({ title }) => title), ['Mixed']);
  assert.equal((await (await fetch(`${base}/notes`)).json()).length, 3);
  assert.equal((await (await fetch(`${base}/notes?tag=`)).json()).length, 3);
  assert.deepEqual((await fetchNotes(base, 'a&b')).map(({ title }) => title), ['Trip']);
  assert.equal((await fetchNotes(base)).length, 3);
} finally {
  await new Promise((done) => server.close(done));
}

const html = renderNotes([{ id: 7, title: 'T', body: 'b', tags: ['x<y'] }, { id: 8, title: 'U', body: '', tags: [] }]);
assert.ok(html.includes('<ul class="tags"><li class="tag">x&lt;y</li></ul>'), html);
assert.equal(html.split('class="tags"').length, 2, 'notes without tags render no tag list');
resetNotes();
console.log('notes: PASS');
