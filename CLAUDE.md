# Holdview

Portfolio intelligence platform. Parses brokerage PDF statements into structured
holdings and surfaces concentration risk.

**Stack:** Python / FastAPI / PostgreSQL / SQLAlchemy backend, React / TypeScript
frontend. Dockerized (Postgres, backend, nginx-served frontend via
`docker-compose.yml`) and deployed on AWS as of 2026-09-22. `SECRET_KEY` and
`DATABASE_URL` are required env vars; the app fails at import without them.

## Working contract

Updated 2026-09-22: the project is deployed. Claude may now write code directly
instead of only pressure-testing Tony's own attempts. This replaces the prior
"do not write his code for him" rule everywhere, not just for polish work.

Understanding is still mandatory and still checked, not assumed. After writing
a non-trivial change, explain it, then have Tony restate what it does and why
in his own words before moving on. If the restatement is wrong or thin, correct
it before proceeding, don't just move to the next task.

Be direct when something is wrong. Do not validate a broken approach and quietly
fix it later.

Engineering decisions are made on merit (correctness, what the app actually
needs), never chosen because they'd produce a good resume metric. Once work is
picked on merit, measure it (latency, throughput, error rates, etc.) so real
wins become quantifiable after the fact. Numbers are a byproduct, not a
selection criterion.

No em dashes in drafted writing.

## Repo conventions

- `ADR/` — architecture decision records, one per decision. ADR-003 covers the
  parser. Write these when a decision is made, not for open questions.
- `LEARNINGS.md` — dated journal, three sections per entry: what I did today,
  what I didn't know before, what still needs work.
- `VOCAB.md` — new terminology.
- `NEETCODE.md` — DSA progress, unrelated to the app.

## Recurring blind spots

- **Early return on every match.** Returning inside a loop when the intent was
  to keep scanning or collect all matches. Has bitten him in Java and TypeScript.
- **Template literals.** Writing interpolated paths in double quotes
  (`"/portfolios/{id}/analysis"`) instead of backticks
  (`` `/portfolios/${portfolio.id}/analysis` ``).

## Principles he already holds, worth invoking by name

- Silent failure is worse than a crash. A component that fails quietly is
  indistinguishable from one that had nothing to do.
- Whitelist over blacklist for state detection.
- Least privilege and blast-radius thinking on credentials.
- API-first over scraping: hunt for the JSON endpoint before reaching for a
  headless browser.

---

# Open: parser review (2026-08-08)

Reviewed `backend/app/services/parsers/robinhood.py` (27 lines). Findings below
are unresolved. They are deliberately phrased as questions. Do not hand him the
patch.

## 1. Silent row drops (the important one)

Line 23 filters holdings rows with
`len(tokens) >= 5 and tokens[1] in ("Margin", "Cash")`. Anything inside the
holdings section that fails this test is silently discarded.

A holding that fails to parse does not raise, it disappears. Concentration
analysis then runs on an incomplete portfolio and returns a number that looks
plausible and is wrong. That is a worse outcome than crashing, and it is the
same failure mode as his "silent failure is worse than a crash" principle from
the restock bot.

Question to put to him: he is currently whitelisting what counts as a holding
row and discarding the remainder without inspection. What would he need to know
about the non-matching lines to tell a real holding he failed to parse apart
from formatting noise? What is the right behavior once he can tell the
difference: raise, collect into a warnings list on the Statement record, or
something else?

## 2. Debug print left in

Line 15 prints every line of the holdings section to stdout. Beyond log noise,
that writes a user's brokerage positions into the logs. Should come out before
anything else in this file changes.

## 3. Negative quantities

`Decimal(tokens[2])` throws on a short position rendered as `(100)`. Open
question: does the statement he tested against contain any short positions, and
does Robinhood use parentheses or a leading minus?

## 4. `in_holdings` never resets

Set to `True` on the section header and never set back to `False`. The function
returns on the first `Total Securities` terminator, so it does not currently
bite. Open question: what happens with a multi-account statement containing two
holdings sections?

## 5. No test fixture

There is no sample PDF or fixture in the repo, so the parser cannot be iterated
on or regression-tested without a real statement on hand. Worth a redacted
fixture before any of the above changes land. `backend/scratch/test_parser.py`
is tracked and hardcodes a path in his Downloads folder, so it only runs on his
machine.

## 6. Uncaught non-ParseError exceptions

`upload_statement` in `main.py` only catches `ParseError`. A `Decimal`
`InvalidOperation` from a malformed token escapes as a 500 and leaves the
Statement stuck at `pending`. Question: which failures should count as a failed
parse, and where should that boundary live?

---

# Open: deploy and API review (2026-09-29)

Read through the whole repo after the AWS deploy. Same rule as above: phrased as
questions, do not hand him the patch.

## 1. Upload failure is invisible in the UI

The backend returns 201 with `status="failed"` on a bad parse, and
`StatementResponse` omits `error_message`. `uploadStatement` in `api.ts` only
checks `response.ok`. Question: what does the user see when a parse fails, and
how would he tell that apart from a successful upload of an empty statement?
This is his silent-failure principle applied across the API boundary.

## 2. `VITE_API_URL` is set at the wrong time

`docker-compose.yml` sets it as a runtime `environment:` on the frontend
container, but Vite inlines env vars at build time and `frontend/Dockerfile` has
no `ARG`. Question: where does the deployed bundle actually get its API URL, and
how would he verify that from the browser?

## 3. Unauthenticated `GET /users`

Lists every registered email to anyone. Question: who is the intended caller of
this route, and what is the blast radius if it stays?

## 4. Dev settings on the deployed stack

Postgres credentials are `holdview/holdview`, the DB port is published on the
host, the backend runs `uvicorn --reload` with a source bind mount, and CORS and
the API URL use plain http on a bare IP. Question: which of these are acceptable
for the current stage, and which violate least privilege on a public host?

---

# Also outstanding

- Docker work is committed (`5199d84`). Working tree still has uncommitted
  deploy changes: `SECRET_KEY` from env in `core/security.py`, AWS IP in CORS
  and `VITE_API_URL`, and a `str(storage_path)` fix in `main.py`.
- Commits `195335d` and `d2bb381` carry identical messages
  ("Add holdings/analysis toggle with section-scoped error and empty states"),
  which usually means a double-commit rather than an intended amend.
