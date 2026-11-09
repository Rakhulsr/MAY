import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { fetchNotes } from "./client.js";
import { addNote, listNotes, resetNotes } from "./notes.js";
import { renderNotes } from "./render.js";
import { createApp } from "./server.js";

afterEach(resetNotes);

async function withServer(run) {
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("addNote trims title and defaults body", () => {
  assert.deepEqual(addNote({ title: "  Hi " }), { id: 1, title: "Hi", body: "" });
  assert.throws(() => addNote({ title: " " }), TypeError);
});

test("POST then GET /notes through the client", async () => {
  await withServer(async (base) => {
    const created = await fetch(`${base}/notes`, { method: "POST", body: JSON.stringify({ title: "A", body: "b" }) });
    assert.equal(created.status, 201);
    assert.deepEqual(await fetchNotes(base), listNotes());
    const bad = await fetch(`${base}/notes`, { method: "POST", body: JSON.stringify({ title: 1 }) });
    assert.equal(bad.status, 400);
  });
});

test("renderNotes escapes content", () => {
  assert.equal(renderNotes([{ id: 1, title: "<x>", body: "a&b" }]), '<ul class="notes"><li data-id="1"><h2>&lt;x&gt;</h2><p>a&amp;b</p></li></ul>');
});
