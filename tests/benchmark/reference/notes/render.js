const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (c) => entities[c]);

function renderTags(tags = []) {
  return tags.length ? `<ul class="tags">${tags.map((tag) => `<li class="tag">${escapeHtml(tag)}</li>`).join("")}</ul>` : "";
}

export function renderNotes(notes) {
  const items = notes.map((note) => `<li data-id="${note.id}"><h2>${escapeHtml(note.title)}</h2><p>${escapeHtml(note.body)}</p>${renderTags(note.tags)}</li>`);
  return `<ul class="notes">${items.join("")}</ul>`;
}
