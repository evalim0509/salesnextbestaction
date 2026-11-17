# Working on this repository

- `REQUIREMENTS.md` is the owner's living business requirements. Whenever a feature is added, changed or removed, update the matching requirement rows, the model section if rules changed, and add a dated line to the change log, in the same commit as the code.
- Hard rules from the owner: no LLM or outside service, no outside scripts or fonts, no typing for the salesperson except visit notes and the deal amount, the product name is Nudge, plain English, phone first. Every score factor needs both a plain sentence and a technical trace.
- Static site with no build step. Scoring thresholds live in `RULES` in `js/engine.js`.
- After changing rules or parsers run `node tests/engine.test.js`. If sample data changes, rerun `python3 tools/make_sample_data.py` then `node tools/make_sample_customer_files.js`.
- Every chat reply must end with a `trail([...])` "How I got this" block. Customer-facing exports must never contain scores, risk labels or visit notes.
- When a file the app loads is added or renamed, add it to `FILES` in `sw.js` and bump `CACHE`.
- Replies must be glanceable: lead with tiles, meters or bars and at most a line or two of text; put sentences and calculations inside `more(...)` or `trail(...)` expanders.
- Notes with `type: 'context'` are knowledge only: never score them, never count them as a visit, never put them in customer-facing exports.
- The rules must never change themselves. Tuning comes only from `state.tuning`, which is written when a manager taps Apply.
- When any rule or threshold in `RULES` changes, bump `RULES.version` and `RULES.date`.
- Recommendation replies call `trail(rows, true)` so the blind-spots line is added; sales-data facts pass `orders(c, key)` as a third trail element.
- Every new screen label or engine sentence needs a Malay pair in `js/i18n-pairs.js` (use {x} for names, numbers and dates). `node tests/engine.test.js` fails on engine sentences without one; user text and document quotes go in an element with class `nt`.
- Rep screens show bands (Likely/Maybe/Unlikely, At risk/Watch/Steady), never raw scores or points; those live in the trail.
- Only the holdout result may be called "incremental". Track-record numbers are reported as found; never tune tests or wording to make Nudge look better than a baseline.
- Optional columns (Area/Postcode, Group, Credit Hold, Overdue Amount) and sheets (Targets, Campaigns, Credit) must never be required; without them the app behaves as before.
