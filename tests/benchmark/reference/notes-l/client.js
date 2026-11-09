async function call(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`${init?.method ?? "GET"} ${url.pathname} failed: ${res.status}`);
  return res;
}

export async function fetchNotes(baseUrl, tag) {
  const url = new URL("/notes", baseUrl);
  if (tag !== undefined) url.searchParams.set("tag", tag);
  return (await call(url)).json();
}

export async function fetchPage(baseUrl, { tag, limit, offset } = {}) {
  const url = new URL("/notes", baseUrl);
  if (tag !== undefined) url.searchParams.set("tag", tag);
  if (limit !== undefined) url.searchParams.set("limit", String(limit));
  if (offset !== undefined) url.searchParams.set("offset", String(offset));
  const res = await call(url);
  return { notes: await res.json(), total: Number(res.headers.get("x-total-count")) };
}

export async function updateNote(baseUrl, id, patch) {
  const url = new URL(`/notes/${id}`, baseUrl);
  return (await call(url, { method: "PATCH", body: JSON.stringify(patch) })).json();
}

export async function deleteNote(baseUrl, id) {
  await call(new URL(`/notes/${id}`, baseUrl), { method: "DELETE" });
}
