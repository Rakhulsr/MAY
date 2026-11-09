import { createServer } from "node:http";
import { addNote, deleteNote, listNotes, updateNote } from "./notes.js";

function send(res, status, value, headers = {}) {
  res.writeHead(status, { "content-type": "application/json", ...headers });
  res.end(value === undefined ? undefined : JSON.stringify(value));
}

async function readJson(req) {
  let text = "";
  for await (const chunk of req) text += chunk;
  return JSON.parse(text || "{}");
}

function pageParam(value, fallback, min, max) {
  if (value === null) return fallback;
  if (!/^\d+$/.test(value)) return NaN;
  const number = Number(value);
  return number < min || number > max ? NaN : number;
}

function fail(res, error) {
  if (error instanceof RangeError) return send(res, 404, { error: error.message });
  return send(res, 400, { error: error.message });
}

export function createApp() {
  return createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname === "/notes") {
      if (req.method === "GET") {
        const notes = listNotes(url.searchParams.get("tag"));
        const limit = pageParam(url.searchParams.get("limit"), notes.length, 1, 100);
        const offset = pageParam(url.searchParams.get("offset"), 0, 0, Number.MAX_SAFE_INTEGER);
        if (Number.isNaN(limit) || Number.isNaN(offset)) return send(res, 400, { error: "invalid limit or offset" });
        return send(res, 200, notes.slice(offset, offset + limit), { "x-total-count": String(notes.length) });
      }
      if (req.method === "POST") {
        try {
          return send(res, 201, addNote(await readJson(req)));
        } catch (error) {
          return send(res, 400, { error: error.message });
        }
      }
      return send(res, 405, { error: "method not allowed" });
    }
    const match = /^\/notes\/(\d+)$/.exec(url.pathname);
    if (!match) return send(res, 404, { error: "not found" });
    const id = Number(match[1]);
    try {
      if (req.method === "PATCH") return send(res, 200, updateNote(id, await readJson(req)));
      if (req.method === "DELETE") {
        deleteNote(id);
        return send(res, 204);
      }
    } catch (error) {
      return fail(res, error);
    }
    return send(res, 405, { error: "method not allowed" });
  });
}
