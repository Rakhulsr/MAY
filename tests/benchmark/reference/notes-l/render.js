const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (c) => entities[c]);

function renderTags(tags = []) {
  if (!tags.length) return "";
  return `<ul class="tags">${tags.map((tag) => `<li class="tag">${escapeHtml(tag)}</li>`).join("")}</ul>`;
}

export function renderNotes(notes) {
  const items = notes.map((note) => `<li data-id="${note.id}"><h2>${escapeHtml(note.title)}</h2><p>${escapeHtml(note.body)}</p>${renderTags(note.tags)}</li>`);
  return `<ul class="notes">${items.join("")}</ul>`;
}

export function renderPager({ offset, limit, total }) {
  if (total === 0) return '<nav class="pager">No notes</nav>';
  const first = offset + 1;
  const last = Math.min(offset + limit, total);
  return `<nav class="pager">Showing ${first}–${last} of ${total}</nav>`;
}
