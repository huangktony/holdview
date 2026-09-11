# Holdview

Portfolio intelligence platform. Parses brokerage PDF statements into structured
holdings and surfaces concentration risk.

**Stack:** Python / FastAPI / PostgreSQL / SQLAlchemy backend, React / TypeScript
frontend. Docker work in progress (uncommitted as of 2026-08-08).

## Working contract

Tony reasons first. Do not write his code for him.

Pressure-test his approach, ask the question that points at the gap, and explain
new-vocabulary constructs as they come up during building rather than as an
upfront lecture. Escalate from question, to nudge, to hint, to partial structure,
and only then to a full answer, and only when he is actually stuck.

Be direct when something is wrong. Do not validate a broken approach and quietly
fix it later.

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
fixture before any of the above changes land.

---

# Also outstanding

- Working tree has uncommitted Docker work: `Dockerfile`, `docker-compose.yml`,
  `.dockerignore`, plus modifications to `alembic.ini`, `alembic/env.py`, and
  `app/db/database.py`.
- Commits `195335d` and `d2bb381` carry identical messages
  ("Add holdings/analysis toggle with section-scoped error and empty states"),
  which usually means a double-commit rather than an intended amend.
