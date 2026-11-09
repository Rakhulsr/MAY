# Token benchmark

Compares coordinator and worker token use between MAY versions on two small, independent Node projects. Fixtures use only the Node standard library; nothing is installed.

| Scenario | Fixture | Task size |
|---|---|---|
| B-S | `fixtures/orders` | One module plus its consumer |
| B-M | `fixtures/notes` | Store, HTTP API, client and HTML render contract |

Oracles in `oracles/` stay outside the run project, so workers cannot edit them. `reference/` holds one passing solution, used only by `tests/benchmark.test.ts` to prove each oracle is satisfiable. Do not give the reference to a run.

## Run protocol

Use the same harness version, model, reasoning level and permission mode for every run of a pair. Record them.

1. Prepare a fresh project: `node tests/benchmark/prepare-run.mjs orders` (or `notes`). It prints the session, project, oracle and cleanup commands.
2. Start a **new** harness session with the printed project as its working directory. Paste the scenario prompt below exactly.
3. Answer MAY questions only with "use your recommendation" and approve plans unchanged. Count every other user message as an intervention.
4. When the run reports completion, run the printed oracle command and record its exit.
5. Locate the coordinator log. Claude Code: `~/.claude/projects/<encoded project path>/<session id>.jsonl`. OMP: `~/.omp/agent/sessions/<encoded project path>/<timestamp>_<id>.jsonl`. Count it with `node tests/benchmark/count-tokens.mjs <log>`; worker logs in the matching folder are included.
6. Run the printed cleanup command.

Record per run: MAY version, harness and version, model, scenario, oracle exit, coordinator total and `maxContext`, coordinator calls, worker count and totals, run total, interventions, and any failure. Failed or unrun runs are reported, not dropped. One run per cell measures one observation, not a reliable average.

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
