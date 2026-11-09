export async function fetchNotes(baseUrl) {
  const res = await fetch(new URL("/notes", baseUrl));
  if (!res.ok) throw new Error(`GET /notes failed: ${res.status}`);
  return res.json();
}
