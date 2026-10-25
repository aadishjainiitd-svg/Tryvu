# Tryvo redesign verification
Date: 2026-10-25 · author: Codex · timezone: Asia/Kolkata
Target: local clone of aadishjainiitd-svg/Tryvu at `codex/tryvu-design-revamp`, based on `24d4ed2`.

## Scope and isolation

Reviewed the existing interface and presentation changes using the installed gstack design/engineering/QA/review workflows. Used gstack headless Chromium for initial visual inspection and the existing Playwright suites for reproducible journeys. All interactions ran against the local Python server at port 8765, with new browser contexts and synthetic progress. Provider paths in case/report tests use controlled responses. No live provider request, credential setup, external publication or deployment was performed.

## Results

| Check | Actual outcome |
|---|---|
| `tests/fieldguide-browser.cjs` | Passed: all main surfaces at 320, 390, 760, 768, 1024 and 1440px; no horizontal page overflow; hero clears header; browse-all expands in place; featured card launches its own level; mobile drawer reaches viewport bottom; closed drawer inert; Escape restores focus; tutorial guide does not overlap map/counters; tutorial text/counter contrast; reduced-motion and normal-motion; no browser errors or failed resources. |
| `tests/tutorial.cjs` | Passed both complete lessons, wrong/empty answer validation, keyboard route construction, reload/undo, fare comparisons, campaign handoff, mobile guide controls, original investigation access and reset. Updated one assertion to use the Demo link's accessible name, since the desktop navigation no longer displays a secondary label. |
| `tests/tutorial-preservation.cjs` | Passed saved campaign/investigation preservation, normal-motion and mobile guide visibility. |
| `tests/cases-browser.cjs` | Passed first judgment, exhibits, chat, simulated outage/retry, persisted recommendation draft, failed then successful review, arrival decision, one-time rewards, 320/390px dialogs, Escape and offline exercise. |
| `tests/mindscore-browser.cjs` | Passed empty state, eligible points, report outage/retry/cache/persistence, unchanged game points, 320/390px and keyboard close. |
| `tests/economy-browser.cjs` | Passed all twelve repair → route → dispatch → score journeys and 15 aggregate browser checks, including refresh, reports and reset. |
| `tests/economy-engine.cjs` | Passed all twelve routes, budget/repair/dispatch/rebate persistence, no point farming, fares, boarding and capacity. |
| `tests/cases-engine.cjs` | Passed twelve AI-reviewed routes, persisted history, single awards, route-bound arrival review and rubric validation. |
| `tests/api-config.cjs` | Passed hosted/local API routing and script order. |
| Static check | Changed JavaScript parses; `git diff --check` clean. |

## Findings fixed and rechecked

1. Legacy selector specificity overrode the chapter's dark background. Scoped the new selectors and removed mixed-specificity groupings that hid text on the wrong surface.
2. A blurred fixed header created a containing block for the mobile drawer, reducing it to a 48px strip. Disabled header backdrop filtering on mobile. The regression test checks drawer bounds and actual controls.
3. The tutorial's desktop `top:110px` offset leaked into its relative mobile layout, overlapping counters by 92px. Reset at <=900px; geometry checks cover phone and tablet.
4. Legacy dark counter backgrounds, a dark independent-check row, several low-contrast muted labels and an unsupported trophy glyph were found in visual/contrast checks. Applied paper surfaces, stronger label colors and a local inline SVG trophy. Targeted contrast assertions protect tutorial text/counters.
5. Native in-host review found the drawer and guide-offset issues and no additional unsafe interpolation or route/state contract change. It reviewed test/fixture changes in summary mode only. This was another agent in the same harness, not an outside model opinion.

## Limits

Chromium was exercised; Safari, Firefox, physical devices and manual screen-reader use were not. Selected computed text contrast was checked, not a complete accessibility certification. The AI paths used mocks; model response quality, live Groq quota/availability, production hosting and remote deployment are unverified. Existing frontend modules and backend contracts are retained. The CSS still layers over historical feature styles, so future visual work should use the regression suite and inspect specificity.

Screenshots in the README and `prototypes/tryvo/screenshots/` document the new system. Case/report screenshots use authored test data; progress screenshots are demonstration state, not real user outcomes.

## Future Atlas follow-up · 2026-10-25

Added native CSS/SVG/Web Animations, map view controls and a persistent motion toggle after the user requested richer animation and a more futuristic interface. Inspected final desktop and 390px screenshots, the route-focused view and source changes. Fixed adjacent mobile footer controls and tightened the delegated view selector to actual buttons.

- `motion-browser.cjs`: passed Scenery/Routes selection and aria-pressed states, unchanged game storage/hash, keyboard pin readout, pointer cleanup, synchronized motion switches, pause persistence after reload, off-screen pausing/resuming, runtime reduced-motion override without overwriting the saved preference, three repeated page remounts, and normal-motion case entry/edit/Escape. No browser exceptions.
- `fieldguide-browser.cjs`: reran successfully at all six widths, covering overflow, mobile drawer/focus, tutorial geometry/contrast, chapter links and normal-motion case entry. No failed resources or browser exceptions.
- `cases-browser.cjs`: reran successfully with mocked providers, including failed-request retry, draft persistence, failed/successful review, one-time rewards, arrival decision, mobile dialogs and offline path.
- `api-config.cjs`: passed API routing and script loading checks. Changed JavaScript parses and `git diff --check` passes.

The new motion suite initially exposed two test assumptions: the map remained partially visible at the footer in a 1120px-tall viewport, and a media-query change event had not fired by the immediate assertion. The final test uses a shorter viewport for the off-screen check and waits for the OS preference event. Both production behaviors then passed.

The recording is at local ignored path `tmp/future-atlas/future-atlas-motion.webm`. Current desktop/mobile screenshots replace the previous field-guide captures; `screenshots/future-atlas-routes.png` shows the route-focused mode. Hidden-tab pausing is implemented but was not independently automated; real-device GPU performance and Safari/Firefox remain unverified. No live provider requests or remote publication occurred in this follow-up.

## Precise journey interactions · 2026-10-25

Focused findings and verified fixes:

1. **Travel/arrival sequencing:** the tutorial changed marker coordinates without interpolation and replaced the map immediately at the final coordinate. Campaign movement used independent timers and could advance before the final CSS movement completed. Shared native-keyframe travel now waits for each leg to finish, pauses at boarded stops, and holds the final position before completion. Turning motion off finishes the presentation; leaving the page cancels callbacks. Scores and route evaluation remain engine-owned.
2. **Continuity on edits and navigation:** route changes replaced the entire page with no local visual feedback, and return links always reset browsing. Newly added segments now draw briefly; real changed counters receive emphasis. Return links preserve the exact launch control, scroll and index expansion. Supported browser history traversal does likewise. Ordinary top-level navigation still opens at the top. A synchronous before-render event supplies presentation context without delaying game actions.
3. **Review correction:** a native source reviewer identified that contextual help can be the first child of main. Fixed return flags and page entrance targeting to use actual page sections; the new test checks that returning disables the hero entrance.

Actual verification:

| Check | Result |
|---|---|
| `journey-polish-browser.cjs` | Passed. Samples real intermediate tram positions, verifies a visible final-position hold before tutorial/case forms open, cancels a trip on leaving, switches motion off mid-trip, restores expanded index/scroll/exact focus at 1440px and 390px, restores chapter-card focus on browser Back, verifies route-draw settling and Undo. No browser exceptions. |
| `economy-browser.cjs` | Passed all twelve repair → route → dispatch → score journeys and 15 aggregate checks. Providers bypassed via existing offline exercises. |
| `tutorial.cjs` | Passed both complete lessons, validation, keyboard controls, reload, Undo, handoff, mobile/tablet layouts, guide behavior, investigations and reset. |
| `tutorial-preservation.cjs` | Passed normal-motion arrival, existing campaign/award preservation and mobile guide visibility. |
| `fieldguide-browser.cjs` | Passed six-width responsive, navigation, drawer, contrast/geometry and normal-motion entry checks. |
| `motion-browser.cjs` | Passed motion controls, preferences, route views, observer/remount behavior and dialog interaction. |
| `economy-engine.cjs`, `api-config.cjs` | Passed. Changed JavaScript parses and whitespace checks are clean. |

The history test exposed a rapid-navigation edge: queued hashchange events could render the same final destination twice, resetting focus again. Added a rendered-hash guard and coverage for immediate Back as well as two same-turn hash changes. Browser Back restoration uses feature detection for the Navigation API; explicit return links work without it.

Visual evidence is kept locally in ignored `tmp/precise-journeys/`: before/after route screenshots and a WebM showing connection drawing, tram arrival, the case handoff and chapter return. Recording uses authored offline practice data. This pass introduces no new asset or runtime dependency. Chromium was exercised; Safari/Firefox, physical-device performance and live AI providers remain unverified.
