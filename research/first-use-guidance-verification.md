# First-use guidance verification
Date: 2026-10-25 · author: Codex · timezone: Asia/Kolkata

Scope: local Tryvo frontend on `http://127.0.0.1:8765`, fresh isolated Chromium contexts, synthetic local progress and mocked case responses. No provider credits or production writes.

The gstack CEO/design review established the intended journey in `product/first-use-guidance.md`. Implementation verification used existing Playwright suites, a new behavioral suite and native independent source review. This is scoped implementation verification, not a completed production-release or outside-model certification.

| Check | Result |
|---|---|
| Guidance suite | Pass: visible first action at 320/390/768/1440, phase instructions and optional chat, accepted-case dismissal and reload, all legal neighbour arrows, endpoint visibility/focus, unchanged saved state during orientation |
| Arrival state transitions | Pass: close/reopen, rejected review, reload, accepted review/finalize, exact extra run count and reflection link |
| Attempt identity | Pass: undo invalidates arrival; clear → repair → rebuild identical route requires its own run |
| Saved case | Pass: partial first take resumes selected chapter before building any track; preserved after reload |
| Cases regression | Pass: controlled AI replies, revisions, retry/error, saved drafts, rewards, mobile and offline route exercise |
| Economy regression | Pass: all twelve route levels and aggregate progress/points checks |
| Responsive regression | Pass: existing Field Guide suite across 320/390/760/768/1024/1440 and navigation/focus/contrast checks |
| Motion / travel | Pass: sampled tram movement, arrival hold, cancellation, runtime motion preference, route edits/undo, map controls and return-scroll/focus continuity |
| Tutorials | Pass: both lessons, keyboard, validation/reload, undo, mobile help/reset and no campaign rewards |
| Static | Changed JavaScript parses; `git diff --check` passes |

Visual inspection: Explore desktop/mobile, case dialog and mobile route guidance. The first action is above the map; route instructions stack with a full-width action on phones. Choice arrows appear only on the playable repaired board. Focus and state text accompany color. Local captures and logs are retained under ignored `tmp/first-use-guidance/`.

Review fixes: accepted-case dismissal originally left the route stale; case review cleared the last-result pointer; history matching without attempt identity could inherit an old arrival after clear. Fixed with a guarded route refresh, a draft-scoped checkpoint record ID, invalidation on edits/undo/pickups/clear, and endpoint finalization. The independent reviewer rechecked those fixes and found no remaining actionable issue within the inspected scope.

Limits: no actual first-time participant study, Safari/Firefox pass, screen-reader session or live AI quality evaluation. Claude CLI was unavailable for an outside review. Existing historical development claims in the README are not new validation from this pass. The next product test is whether a stranger can explain the purpose and complete the loop without verbal coaching.
