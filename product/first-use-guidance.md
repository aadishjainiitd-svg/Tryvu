# First-use guidance: CEO goal → design → implementation
Date: 2026-10-25 · author: Codex, working with Maan · timezone: Asia/Kolkata

User request: make the frontend intuitive for a stranger, add directional cues, and use gstack so the design follows the product goal. This is a scoped implementation request. No separate saved CEO plan was found in either project checkout or the available gstack artifacts. The following CEO-lens brief is derived from the current Tryvo README, the APM brief and the existing product. It is not a claim of a prior CEO approval or user research.

## CEO-lens review — hold scope

**Outcome:** a first-time visitor understands that their own judgment is the activity: make an initial call, inspect evidence, defend a recommendation, use the unlocked route, respond to new information and review their contribution. The tram gives the decision a visible consequence. The map must not make the product look like an unexplained transport puzzle.

**Audience assumption:** a new visitor with no knowledge of the case/route mechanics. **Observed:** Explore leads with a town; route pages show many controls but no prominent current task; the optional AI chat occupies much of the case desk; closing the arrival case leaves the obvious Run button, which repeats travel. **Unverified:** whether the product creates repeat demand or transferable reasoning benefits. No new benefit claim is added.

**Protective mechanism:** make the person attempt, question and decide. Navigation assistance is not reasoning assistance. Directional arrows may identify every legal adjacent connection, but must not reveal an optimal route, supply case answers, mark a nudge as used or change points.

**Alternatives considered:** arrows alone would leave the purpose unclear; a forced introductory tour would interrupt returning users and add dismissal state; a small persistent explanation plus state-aware guidance solves the visible gap using existing controls. Select the latter under the user's requested usability scope.

**Dream-state progression:** attractive but unexplained map → clear next action with visible cause/effect → a product whose repeat use and learning value can later be tested with people. This pass establishes interface clarity, not product-market fit.

**Scope/complexity:** reuse campaign, route, case and feedback renderers. One presentation stylesheet, no new service, dependency, backend call or persistent onboarding state. Keep all chapters available. Preserve direct map controls and tests of incomplete routes. No forced tour, account flow, score redesign or change to the case rubric.

CEO review dimensions:

| Dimension | Decision / implication |
|---|---|
| Architecture | Derive guidance from the existing draft and evaluator; native delegated controls execute the same actions. |
| Errors and rescue | Explain invalid plans using evaluator feedback; keep offline case exercises, saved drafts and retries. |
| Security | Escape authored text as before; do not add remote content or data collection. |
| Edge cases | Cover resumed cases, repaired routes, partial routes, invalid routes, arrival dialogs closed, completed/replayed trips and reset. |
| Testing | Test next-action contracts and unchanged routes/hint flags/awards, not just element existence. |
| Performance | Add a handful of SVG arrow paths and small static sections; no continuous animation or new network request. |
| Observability | Use existing visible status/error regions; no analytics or fabricated onboarding metrics. |
| Deployment | Local topic branch; rollback is a scoped revert. Publication remains outside this request. |
| Maintainability | Evaluator determines readiness; UI never duplicates route finance rules. |
| Future fit | A small human first-use study should test purpose recall and unassisted completion. If people still treat it only as a map game, revisit the case/map framing. |
| Design | One primary next action, short labelled arrows, consistent terminology, keyboard and phone support. |

## Designer handoff — seven review passes

1. **Information architecture:** the opening viewport explains the case → route → reflection loop and provides a start/resume CTA. The route page presents its current task before the budget/map. The case desk explains the current phase. Existing navigation stays intact.
2. **Interaction states:** state table below. Guidance comes from saved state, so reload/resume/reset cannot leave a stale onboarding overlay.
3. **Journey/emotional arc:** orient (“I know why I’m here”) → attempt (“my first take matters”) → investigate (“questions are optional”) → build (“I know the controls; the route is my choice”) → respond (“arrival has a next step”) → reflect (“I can see my decisions”). These are design intentions, not observed emotions.
4. **Originality/restraint:** use the existing town, forest palette and paper surfaces. Arrows indicate a real action or legal neighbour; no floating tutorial mascot, flashing spotlight or decorative arrow field.
5. **Design system:** reuse Bricolage/Source, current green tokens and button styles. A narrow three-step strip and next-action panel share existing radii/borders. Do not introduce another palette or icon library.
6. **Responsive/accessibility:** at 760px and below, stack next-action copy/button; the map remains horizontally scrollable where needed. Keep action targets at least 44px. Step labels and text convey state, with aria-current on the current step. Arrows are decorative; keyboard labels identify legal next connections. “Show connections” moves focus to the route endpoint without selecting a street. Respect reduced motion for scrolling.
7. **Unresolved decisions:** no new product-policy choice is needed within this presentation scope. Real newcomer validation remains unverified. Do not present automated review as an interview or user-test consensus.

### Concrete screen map

```text
EXPLORE: purpose + start/resume → Decide → Connect → Respond & reflect → world/chapter choice
ROUTE:  chapter → current step + one next action → budget → map + available arrows → details
CASE:   phase strip → short directional explanation → brief/evidence/memo/feedback → existing action
RETURN: saved context → updated next action → completed contribution in My progress
```

| State | User sees | Next action |
|---|---|---|
| First visit / no completed journeys | Purpose, three-step loop, clear first-journey CTA and optional controls lesson | Enter first journey |
| Unrepaired or partly written case | “Start with the client case” / continue the case; explanation that the recommendation opens the shortcut | Existing obstacle/case action |
| Repaired, no route | “Connect your first street”; depot, equal legal-neighbour arrows | Show map and focus current endpoint |
| Partial valid route | “Keep connecting to the festival”; undo reminder | Show available connections |
| Invalid route / failed run | Actual evaluator feedback | Revise on map; tests remain available |
| Ready route | “Your route is ready to run” | Existing Run action |
| At arrival, dialog closed | “Respond to the new development” | Existing arrival/checkpoint action, without replaying travel |
| Accepted arrival review dismissed / reloaded | “Your arrival decision is ready” | Finish via the existing run engine from the endpoint, then reflect |
| Completed run | Completion and reflection prompt | My progress; existing next-chapter handoff retained |
| Case evidence | Read exhibits; AI client questions explicitly optional | Existing recommendation action |
| Loading/error | Existing disabled controls, saved-draft status, retry/offline escape | Existing recovery controls |

## Engineering review

Saved draft → E.obstacleOK / E.evaluate → derived step + text → existing data-rescue action.
Missing case draft means first use; a repaired offline case still counts as repaired; an arrival record ID scoped to the current draft preserves the arrival handoff when review clears lastId. Route edits, undo and pickup changes invalidate that ID; clear replaces the draft. Record identity plus path/pickup/edit-count validation prevents a fresh identical route from inheriting an earlier arrival. An evaluator error should not be swallowed or converted into fake readiness. New SVG arrows use the same adjacency/blocked/path rules as editing and exclude an unrepaired obstruction. In a recorded-route modal, no live suggestion arrows are shown.

“Show connections” scrolls/focuses only: no save, route edit, hint flag or network call. An arrival CTA opens the same case/offline checkpoint handler. Extra recommendation control uses data-case-next=recommend and reuses the existing phase handler and remains disabled during requests. Preserve all existing button selectors; scope new duplicate actions with their dedicated guide attribute so old selectors remain unique.

## Test plan for QA

- Fresh Explore clearly states the loop and first action at 320/390/768/1440 widths. Existing chapter links and resume still work.
- Fresh route next action opens its real case. Guidance updates after repair and reload.
- Show-connections preserves serialized game state, focuses the endpoint and brings the map into view below the fixed header. Every arrow points to a legal neighbour; no optimal-route hint is recorded.
- Partial, ready, invalid, arrival and completed states show the correct action. Arrival reopening must not add another run/history entry.
- Case evidence exposes an optional-chat explanation and a usable recommendation shortcut; existing draft, error/retry, acceptance and revision paths remain intact.
- Run the existing case, twelve-route economy, tutorial and responsive suites. Add focused behavior coverage for the new guidance states; retire no tests.
- Inspect desktop/mobile screenshots and keyboard flow. Browser simulation is not a real stranger usability study.

## Implementation tasks
1. Add concise purpose, start/resume action and three-step strip to Explore.
2. Add derived next-action guide and equal-choice connection arrows to route play; preserve existing controls.
3. Clarify the case/evidence handoff and optional client questions; align the existing Help copy.
4. Exercise actual flows and edge cases, review visual fit and document findings.

## Review results and verification

Native source review caught three concrete handoff defects during implementation: accepted case dismissal did not refresh the locked route; arrival review cleared lastId and hid the correct next action; and matching an arrival by route geometry/edit count could confuse a new attempt with an older identical one. All three were fixed and covered by browser regressions. The final independent source recheck found no remaining actionable issue within this scope. An outside Claude review was unavailable because its CLI is not installed; no outside-model result is claimed.

Passed: new guidance suite; existing case suite with controlled provider responses; full twelve-level economy suite; responsive Field Guide checks at six widths; journey-polish travel/navigation checks; motion controls and runtime reduced motion; both guided tutorial lessons, mobile controls and reset. JavaScript parsing and whitespace checks also passed. Desktop/mobile screenshots were inspected. See `research/first-use-guidance-verification.md` for evidence and limits.

No live provider call, real newcomer interview, deployment or learning-outcome validation was performed. The next product validation remains purpose recall and independent completion by someone unfamiliar with Tryvo.
