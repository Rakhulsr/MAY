let notes = [];
let nextId = 1;

export function resetNotes() {
  notes = [];
  nextId = 1;
}

export function listNotes() {
  return notes.map((note) => ({ ...note, tags: [...note.tags] }));
}

function normalizeTags(tags = []) {
  if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== "string")) throw new TypeError("tags must be an array of strings");
  return [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
}

export function addNote(input) {
  if (!input || typeof input.title !== "string" || !input.title.trim()) {
    throw new TypeError("title must be a non-empty string");
  }
  const body = input.body === undefined ? "" : input.body;
  if (typeof body !== "string") throw new TypeError("body must be a string");
  const note = { id: nextId++, title: input.title.trim(), body, tags: normalizeTags(input.tags) };
  notes.push(note);
  return { ...note, tags: [...note.tags] };
}
