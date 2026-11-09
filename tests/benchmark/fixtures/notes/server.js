import { createServer } from "node:http";
import { addNote, listNotes } from "./notes.js";

function send(res, status, value) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(value));
}

async function readJson(req) {
  let text = "";
  for await (const chunk of req) text += chunk;
  return JSON.parse(text || "{}");
}

export function createApp() {
  return createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname !== "/notes") return send(res, 404, { error: "not found" });
    if (req.method === "GET") return send(res, 200, listNotes());
    if (req.method === "POST") {
      try {
        return send(res, 201, addNote(await readJson(req)));
      } catch (error) {
        return send(res, 400, { error: error.message });
      }
    }
    return send(res, 405, { error: "method not allowed" });
  });
}
