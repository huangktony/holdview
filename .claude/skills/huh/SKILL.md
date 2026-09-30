---
name: huh
description: Explain code changes in plain, jargon-free language at a high level with moderate depth. Use when Tony says /huh, asks "what changed", "explain this branch/worktree/commit/diff", or says he doesn't understand a change.
---

# huh

Tony wants to understand a change without needing to already know the jargon.
Explain it the way you would to a smart person who has never seen this codebase.

## 1. Find what to explain

Use the argument if given: a commit hash, a file, a branch name, or a phrase like
"the parser changes". If there is no argument, explain everything on the current
branch that is not yet on `main`, plus uncommitted work:

- `git status --short`
- `git log main..HEAD --oneline` (skip if it errors or the branch is `main`)
- `git diff main...HEAD` and `git diff` (uncommitted)

Read the changed files in full where the diff alone would be confusing. Read the
code around a change, not just the changed lines. Never explain a diff you have
not actually looked at.

## 2. Explain it in this shape

**The short version.** One or two sentences: what changed, in terms of what the
app now does differently for a user or for Tony.

**Why it was needed.** The problem before the change. Use a concrete example
("before, if a statement had a row the parser did not recognise, it just vanished
and the percentages looked fine but were wrong").

**How it works now.** Walk through the change in the order things happen, in
plain steps. Use an everyday analogy when it makes the mechanism click. Keep it
to what matters; skip mechanical edits like renamed imports.

**What to watch out for.** Real risks, tradeoffs, or things left undone. If the
change has a flaw, say so directly. Do not soften it.

**Where to look.** A short list of the key files, as clickable links with line
numbers, so Tony can open the real code.

Aim for roughly 150 to 300 words for a small change, more only if the change is
genuinely large. For a multi-part branch, group by purpose, not by file.

## 3. Language rules

- No jargon without a plain-words definition the first time it appears. If a
  technical term is unavoidable, say it once, define it in a few words, and
  move on.
- Prefer "the server", "the database", "the login token" over framework or
  library names. Name the library only when Tony needs to search for it.
- Describe behavior, not syntax. "It now checks whether the upload failed before
  refreshing the table" beats "it adds a conditional on statement.status".
- Tie it to Holdview's own terms and to principles Tony already holds (silent
  failure is worse than a crash, least privilege) when they genuinely apply.
- No em dashes.

## 4. Close the loop

End with one question that checks understanding of the most important idea in
the change, phrased so Tony has to reason, not recall. Example: "If this
statement had two holdings sections, what would the parser do now?" Per the
working contract in CLAUDE.md, understanding is checked, not assumed, so wait
for his answer and correct it if it is off before moving on.

If you used a term that is new to him, offer to add it to `VOCAB.md`. Do not
add it without asking.

## Do not

- Do not change any code while explaining. This skill is read-only.
- Do not explain what you have not read.
- Do not pad with a recap of the rules above.
