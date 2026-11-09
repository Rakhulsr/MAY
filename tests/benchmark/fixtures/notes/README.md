# Notes fixture

Small notes service using only the Node standard library.

- `notes.js`: in-memory store. `addNote({ title, body })` returns `{ id, title, body }`; title is trimmed and required, body defaults to `""`.
- `server.js`: `createApp()` returns an HTTP server. `GET /notes` lists notes; `POST /notes` with a JSON body creates one (201) or returns 400 with `{ error }`.
- `client.js`: `fetchNotes(baseUrl)` calls `GET /notes`.
- `render.js`: `renderNotes(notes)` returns escaped HTML.

Run `npm test` or `npm start`.
