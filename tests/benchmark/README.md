# Token benchmark

This benchmark compares token use and task results between MAY versions. Each run starts with a fresh sample project, asks an agent to make the same change, and checks the result with an independent oracle. A passing oracle means that run met the oracle's checks; it does not prove every requirement or establish that one version is better.

| Scenario | Fixture | Task size |
|---|---|---|
| B-S | `fixtures/orders` | One module plus its consumer |
| B-M | `fixtures/notes` | Store, HTTP API, client and HTML render contract |
| B-L | `fixtures/notes` | Four phases across store, API, client and render |

Oracles in `oracles/` stay outside the run project, so workers cannot edit them. `reference/` holds one passing solution, used only by `tests/benchmark.test.ts` to prove each oracle is satisfiable. Do not give the reference to a run.

## Run protocol

Use the same harness version, model, reasoning level and permission mode for every run of a pair. Record them.

1. Prepare a fresh project: `node tests/benchmark/prepare-run.mjs orders` (or `notes`). It prints the session, project, oracle and cleanup commands.
2. Start a **new** harness session with the printed project as its working directory. Paste the scenario prompt below exactly.
3. Answer MAY questions only with "use your recommendation" and approve plans unchanged. Count every other user message as an intervention.
4. When the run reports completion, run the printed oracle command and record its exit.
5. Locate the coordinator log. Claude Code: `~/.claude/projects/<encoded project path>/<session id>.jsonl`. OMP: `~/.omp/agent/sessions/<encoded project path>/<timestamp>_<id>.jsonl`. Count it with `node tests/benchmark/count-tokens.mjs <log>`; worker logs in the matching folder are included. `weighted` converts tokens to input-equivalent tokens at Anthropic price ratios (cache read 0.1, cache write 1.25, output 5), closer to what a usage limit or bill feels like than the raw `total`.
6. Run the printed cleanup command.

Record per run: MAY version, harness and version, model, scenario, oracle exit, coordinator total and `maxContext`, coordinator calls, worker count and totals, run total, interventions, and any failure. Failed or unrun runs are reported, not dropped. One run per cell measures one observation, not a reliable average.

Read results alongside the model, harness, number of runs, and oracle outcome. A lower token count on a failed task is not a saving. Compare costs only when the provider's pricing and accounting are known; `weighted` uses Anthropic-specific ratios and must not be treated as Codex cost. Small scenarios cannot establish performance on long sessions.

This repository currently includes `tests/` in the npm package allowlist, so benchmark fixtures and reports under that directory are included too. Review the package inventory and remove private paths or data before publishing.

## Prompts

### B-S

```text
Use MAY for this task. Extend listOrders(status) in orders.js: no argument returns all orders, "pending" or "shipped" returns only matching orders, and any other value throws RangeError. Extend listOrderIds(status) in consumer.js to return the IDs for the requested status while keeping its no-argument behavior. Add regression tests and update README.md. Do not commit.
```

### B-M

```text
Use MAY for this task. Add tags to notes across the store, API, client and render:
- addNote accepts optional tags: an array of strings. Trim and lowercase each tag, drop empty ones, and remove duplicates keeping first order. Missing tags become []. A non-array value or any non-string item throws TypeError, and POST /notes answers 400.
- Every returned note includes tags.
- GET /notes?tag=X trims and lowercases X the same way, then returns only notes that have that tag. A missing or empty tag returns all notes.
- fetchNotes(baseUrl, tag) sends tag as a query parameter when given and keeps fetchNotes(baseUrl) working.
- renderNotes renders each note's tags after its body as <ul class="tags"><li class="tag">tag</li></ul>, HTML-escaped. Notes without tags render no tag list.
Add regression tests and update README.md. Do not commit.
```

### B-L

Prepare with `node tests/benchmark/prepare-run.mjs notes-l`; it uses the notes fixture and the `notes-l` oracle.

```text
Use MAY for this task. Extend the notes project in phases, reviewing each phase before the next:
1. Tags, exactly as follows:
- addNote accepts optional tags: an array of strings. Trim and lowercase each tag, drop empty ones, and remove duplicates keeping first order. Missing tags become []. A non-array value or any non-string item throws TypeError, and POST /notes answers 400.
- Every returned note includes tags.
- GET /notes?tag=X trims and lowercases X the same way, then returns only notes that have that tag. A missing or empty tag returns all notes.
- fetchNotes(baseUrl, tag) sends tag as a query parameter when given and keeps fetchNotes(baseUrl) working.
- renderNotes renders each note's tags after its body as <ul class="tags"><li class="tag">tag</li></ul>, HTML-escaped. Notes without tags render no tag list.
2. Edit and delete: updateNote(id, patch) in the store applies title, body and tags with the same validation as addNote, throws TypeError on invalid input without changing the note, and throws RangeError for an unknown id. deleteNote(id) removes a note and throws RangeError for an unknown id. Ids are never reused. PATCH /notes/:id answers 200 with the updated note, 400 on invalid input and 404 for an unknown id. DELETE /notes/:id answers 204, or 404 for an unknown id.
3. Pagination: GET /notes accepts limit (integer 1-100) and offset (integer 0 or more), applied after the tag filter in id order. Any other value answers 400. Every GET /notes response has an x-total-count header with the number of notes matching the tag filter.
4. Client and render: add fetchPage(baseUrl, { tag, limit, offset }) returning { notes, total }, updateNote(baseUrl, id, patch) returning the updated note, and deleteNote(baseUrl, id); both reject on a non-success status. Add renderPager({ offset, limit, total }) returning <nav class="pager">Showing A–B of T</nav> with A = offset + 1 and B = min(offset + limit, total), or <nav class="pager">No notes</nav> when total is 0.
Add regression tests and update README.md. Do not commit.
```

### B-M-O

The B-M prompt with its first sentence replaced by:

```text
Use MAY in Orchestrated mode for this task: dispatch native workers for implementation and independent review.
```

Use it when B-M stays Direct, so coordinator and worker behavior is exercised.

## Reports

- [0.2.0 exploratory comparison](benchmark-0.2.0.md)
- [0.2.0 and 0.3.0 results on Claude Code and Oh My Pi](benchmark-0.3.0.md)
