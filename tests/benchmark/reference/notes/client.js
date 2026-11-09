export async function fetchNotes(baseUrl, tag) {
  const url = new URL("/notes", baseUrl);
  if (tag !== undefined) url.searchParams.set("tag", tag);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET /notes failed: ${res.status}`);
  return res.json();
}
