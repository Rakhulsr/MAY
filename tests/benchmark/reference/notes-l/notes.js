let notes = [];
let nextId = 1;

export function resetNotes() {
  notes = [];
  nextId = 1;
}

const copy = (note) => ({ ...note, tags: [...note.tags] });

export function normalizeTag(tag) {
  return String(tag ?? "").trim().toLowerCase();
}

function normalizeTags(tags = []) {
  if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== "string")) throw new TypeError("tags must be an array of strings");
  return [...new Set(tags.map(normalizeTag).filter(Boolean))];
}

function checkTitle(title) {
  if (typeof title !== "string" || !title.trim()) throw new TypeError("title must be a non-empty string");
  return title.trim();
}

function checkBody(body) {
  if (typeof body !== "string") throw new TypeError("body must be a string");
  return body;
}

export function listNotes(tag) {
  const wanted = normalizeTag(tag);
  return notes.filter((note) => !wanted || note.tags.includes(wanted)).map(copy);
}

export function addNote(input) {
  if (!input) throw new TypeError("title must be a non-empty string");
  const note = {
    id: nextId,
    title: checkTitle(input.title),
    body: checkBody(input.body === undefined ? "" : input.body),
    tags: normalizeTags(input.tags),
  };
  nextId++;
  notes.push(note);
  return copy(note);
}

function find(id) {
  const note = notes.find((item) => item.id === id);
  if (!note) throw new RangeError(`note ${id} not found`);
  return note;
}

export function updateNote(id, patch) {
  const note = find(id);
  if (!patch || typeof patch !== "object") throw new TypeError("patch must be an object");
  const next = { ...note };
  if ("title" in patch) next.title = checkTitle(patch.title);
  if ("body" in patch) next.body = checkBody(patch.body);
  if ("tags" in patch) next.tags = normalizeTags(patch.tags);
  Object.assign(note, next);
  return copy(note);
}

export function deleteNote(id) {
  const index = notes.indexOf(find(id));
  notes.splice(index, 1);
}
