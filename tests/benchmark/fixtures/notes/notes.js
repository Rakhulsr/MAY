let notes = [];
let nextId = 1;

export function resetNotes() {
  notes = [];
  nextId = 1;
}

export function listNotes() {
  return notes.map((note) => ({ ...note }));
}

export function addNote(input) {
  if (!input || typeof input.title !== "string" || !input.title.trim()) {
    throw new TypeError("title must be a non-empty string");
  }
  const body = input.body === undefined ? "" : input.body;
  if (typeof body !== "string") throw new TypeError("body must be a string");
  const note = { id: nextId++, title: input.title.trim(), body };
  notes.push(note);
  return { ...note };
}
