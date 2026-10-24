# Tryvo: decisions that move the tram

The campaign now has twelve authored business cases. AI plays the client and reviews a player's recommendation. The town, route budgets, passenger choices, one-time game awards and compact progress dashboard remain connected.

## Play

Open http://127.0.0.1:8765/#explore, choose a journey and click its striped obstruction or **Open client case**.

1. Read the fictional client brief and record a first judgment before opening evidence.
2. Read three exhibits. Optionally question the AI client (up to eight questions).
3. Write a decision, supporting evidence, an alternative/trade-off and a next test.
4. Receive case-specific feedback. An accepted recommendation opens the route and grants the existing travel benefits.
5. Build and run the tram. At arrival, a new development challenges the earlier business decision. Respond before completing the journey.

The two guided Demo lessons still teach the controls offline. Every campaign case also offers **Use offline route exercise** if AI is unavailable or the player prefers the original numeric challenge.

## Cases

| Journey | Client decision | Practice |
|---|---|---|
| 1 | A hotel with falling bookings | Separate demand from conversion and diagnose causes |
| 2 | Annual pen demand in Kota | Segment a market, calculate and label assumptions |
| 3 | A delivery company's expansion | Compare growth with operational reliability |
| 4 | A proposed price cut | Contribution margin, capacity and cannibalisation |
| 5 | An apparently declining demand dashboard | Confounding factors and experiment design |
| 6 | Peak-hour tram allocation | Capacity, competing stakeholders and commitments |
| 7 | A city's water budget | Prioritisation under resource constraints |
| 8 | A sensitive public announcement | Communicate uncertainty without overpromising |
| 9 | Market-stall inventory | Demand scenarios, costs and censored sales |
| 10 | A festival and a storm forecast | Safety, uncertainty and contingent decisions |
| 11 | Marketplace growth and disputes | Trust, false positives and incentive trade-offs |
| 12 | A transport network investment | Capital allocation and staged commitments |

All people, businesses and figures are fictional training material. Kota's figures are planning assumptions, not a market-research claim. These are curated scenarios with live dialogue, not unlimited AI-generated cases.

## Review and rewards

Each recommendation receives 0–2 on decision framing, evidence, trade-offs and next test. Server code accepts 5/8 or higher only when every dimension is at least 1. The model supplies dimension feedback; it does not select credits or points. Multiple defensible recommendations are supported.

Existing game rules apply: 20 points for an accepted repair/arrival decision, plus 10 for the first accepted submission without a thinking nudge; route completion awards stay unchanged. Failed reviews grant nothing. Replays cannot farm awards. Travel credits remain separate from points. A changed route invalidates its prior arrival review; the repair decision can remain valid.

The AI rubric is fallible, model-dependent feedback on a specific case. It is not a universal ability score, proof of independent performance or evidence of general cognitive improvement. Client conversations are explicitly recorded as AI-supported practice.

## Local server and key

Run `python server.py --port 8765` from this folder. Use this server instead of `python -m http.server`: a static server cannot provide client conversations. Standard-library Python is sufficient; there are no Python package dependencies.

The actual key belongs in the workspace root's ignored `.env.tryvo`, **outside this served folder**:

```text
GROQ_API_KEY=your-private-key
GROQ_MODEL=openai/gpt-oss-120b
```

The supplied credential is for **Groq**, not xAI Grok. The model was selected from the account's available-model list. Credentials are never sent to browser code or stored in localStorage. Only fictional case text and responses are sent to Groq. Rotate a key shared in chat before deployment.

The server binds to loopback, rejects unexpected origins/hosts, restricts static-file access, limits body sizes and AI requests, validates response structure, and gives retries stable request IDs. Request logs do not contain credentials. Sessions and cached responses live in the ignored workspace `.tryvo-local` folder. Reset Demo clears browser progress; server-side case sessions are retained locally until this private folder is removed while the server is stopped. Browser saves contain only non-sensitive demonstration text; use fictional information.

This is a local prototype, not a production API. A public deployment needs authentication, per-user quotas, retention controls and server-owned game scores. Browser-local leaderboard data can be edited by its owner. No real money, business actions, bookings or transport operations occur.

## Files

- `server.py`: same-origin static server, Groq proxy, persisted case sessions, validated reviews and retry cache.
- `assets/business-cases.json`: canonical authored dossier bank for server prompts.
- `js/case-data.js`: matching browser dossier bank.
- `js/case-workbench.js` and `css/cases.css`: responsive brief → evidence/client → memo → review interface.
- Existing rescue engine/UI and campaign files integrate case acceptance, route rewards and progress receipts. Older arithmetic records continue using their original grading rules.

## Verification

### MindScore and the practice coach

My progress includes a separate MindScore card. It counts existing eligible investigation points, 30-point first-pass/unhinted case awards, and route awards when both decisions were first-pass/unhinted and the first route test had no failure or route nudge. It excludes later passes, replays and legacy route-layout awards. Existing total game points and the demo leaderboard retain their original rules. No new points are awarded by generating a report. The recorded client-chat split is descriptive; no-chat is not verified independence.

`POST /api/practice-report` receives the latest reviewed session ID for each level/stage plus browser-reported game totals. The server loads its own saved decisions and reviews, validates report citations, caches unchanged evidence and produces a three-session practice plan. All exercises must be feasible alone in 5–15 minutes inside the fictional game or on paper. The report cannot infer whether AI harms this user's cognition or prescribe a brain reset. Separate unfamiliar checks, equivalent task/support conditions and a suitable study would be needed to investigate learning or causal effects.

Reports are saved in browser state and in the ignored private SQLite store. Reset Demo clears the browser report together with other progress; it does not delete local server sessions. Tests: `tests/report-server.py`, `tests/mindscore-browser.cjs`; a real Groq smoke report is in `tests/report-live-result.json`.

- Live Groq chat grounded in the hotel's E2/E3 exhibits and a successful four-part review (`tests/cases-live-result.json`).
- Browser tests with deterministic API fixtures: empty input, saved drafts, failed review, revision, provider outage, retry, arrival twist, rewards once, refresh, 320/390px layouts, Escape and offline fallback.
- Server tests: validation, cached retries, locked accepted decisions and required evidence dimension.
- Existing 12-route engine/browser suites, economy edge cases, both guided lessons, reset and saved-record preservation.

The automated review fixtures test product behaviour, not model quality. The live smoke test does not establish consistent grading across all twelve cases. Evaluate rubric consistency with real users before treating these scores as useful assessment data.
