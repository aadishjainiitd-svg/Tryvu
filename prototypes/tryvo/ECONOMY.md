# Tram economy update

The 12-level campaign now uses repairable shortcuts and a route economy. The old `state.rescue` is retained verbatim; the new campaign saves in `state.tram`. Existing eligible investigation points and original 50-point journey awards remain in the total. Earlier routes have their own collapsed archive in My progress.

## Play loop

1. Open a level and inspect its distance allowance, tram capacity and cost per kilometre.
2. Click the striped obstruction on the efficient route. Solve its distance/cost challenge to reopen it. Later challenges also compare passenger revenue against route cost.
3. Connect adjacent streets. Every connection represents 1 km. The live preview shows distance, route costs, fares, balance and operating net.
4. From level 5, choose optional groups of 6, 5 or 9 passengers. Fares arrive at boarding, and the riverside group has a disclosed boarding fee. Capacity and available cash matter; future fares cannot pay for an earlier street.
5. Run the tram. A larger tram requires a marked service stop. A route must meet distance, capacity, cash, passenger and operating-target constraints.
6. At arrival, solve the contextual dispatch puzzle and calculate the actual route's operating net. Correct dispatch settles a 1-credit rebate, or 2 for a first correct submission without a nudge.

Map size grows from 6 × 5 to 9 × 7; tram size grows from 1 to 4 cars; cost rises from 1 to 3 credits/km. Early levels allow only an efficient trip. Later levels allow 2 extra kilometres for pickup trade-offs, but the long unrepaired detour always exceeds the allowance. Different levels provide a reopened shortcut, a reduced repair toll, or extra route credits. First-try repair adds 1 credit. Credits are per-run resources, not leaderboard points.

Operating net is fares minus travel, repair and boarding costs, before rewards. These festival services may run at a disclosed subsidy/negative net; the objective is to meet the stated operating target, not manufacture positive profit. In the later route comparison, six direct riders can use less subsidy than fifteen riders after extra distance and boarding fees.

## Points

- Obstruction: 20, plus 10 for first submission correct without a nudge.
- Final dispatch: 20, plus the same 10-point first-submission bonus.
- Successful arrival: 40.
- Efficient arrival: 20.
- Fare-target arrival: 10 on fare levels.

Each award is recorded once per level. Wrong attempts, refresh, clearing a draft and replay cannot reset first-try eligibility or duplicate points. Correct replays retain the original first-try benefit for their route but do not add another award. The desktop sidebar and mobile header update immediately; Rankings uses that same total against 12 labelled fictional players. Equal scores share rank.

## Validation

Current suites are `tests/economy-engine.cjs`, `tests/economy-browser.cjs` and `tests/economy-edge.cjs`. Earlier journey browser suites describe superseded layouts. The engine suite checks every level's feasible efficient path and infeasible detour, gating, cash, scoring and duplicate prevention, plus fares, boarding fees and capacity. Browser suites exercise all 12 complete journeys, refresh, leaderboard position, report expansion, 390/320px layouts, reset, keyboard inputs, errors, old-record preservation and normal-motion animation. Result JSON and review screenshots are alongside the prototype.

All puzzles and opponents are authored simulations. There is no live AI negotiation, banking, online competition or cognitive-health assessment.
