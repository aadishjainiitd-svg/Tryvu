# Tryvo visual redesign
Date: 2026-10-25 · author: Codex, working with Maan · timezone: Asia/Kolkata

Scope: redesign the existing Tryvu repository requested by Maan. Retain Tryvo's product name, twelve cases, route economics, saved progress, AI boundaries and existing offline paths. No deployment or provider spending.

## Design review before implementation
Observed: the current 232px sidebar takes space away from the world; lavender/coral panels and similar heading sizes flatten hierarchy; the map is stretched; much of the supporting UI uses hard-coded dark colors. The existing local town illustration and Bricolage/Source typefaces are reusable assets.

Direction selected for implementation under the user's request for a complete revamp: an illustrated field guide. Warm-white canvas, deep forest ink, botanical green, chartreuse highlights, spacious horizontal navigation and a more immersive town map. A green next-journey panel provides a clear action. Editorial typography and quiet staggered entrances reference the supplied ecosystem without introducing a React runtime.

Seven design passes: information architecture retains all four navigation destinations and elevates the next journey; interaction states retain empty/error/loading/disabled/saved states; the emotional arc goes from exploration to an approachable decision desk; originality comes from the town and route metaphor rather than decorative effects; shared colors/radii/buttons apply to all surfaces; 320px mobile, keyboard focus and reduced motion are required; no unresolved product-policy change is needed. These are design judgments, not user research or user approval of a visual mockup.

## Engineering review before implementation
Architecture: existing data → campaign home renderer → delegated data-campaign handlers → existing rescue/case engines. Change presentation at that boundary. Keep data attributes, hash navigation, score identifiers, API payloads and storage keys stable. No backend changes.
Code quality: consolidate new presentation into an explicitly last-loaded stylesheet; scope dark illustrated game-map exceptions; format the new campaign renderer for maintainability. Avoid a framework migration and animation dependencies for a static app. Existing mobile menu state/focus management remains reusable.
Tests: reuse browser coverage for tutorials, case review/outages, rewards, report dialogs, mobile overflow and saved progress. Existing engine tests cover scoring preservation. Add a focused visual smoke check only for uncovered redesign navigation/overflow/accessibility behavior.
Initial performance direction: reuse one local artwork and locally bundled fonts. Animate opacity/transform with a reduced-motion alternative. Keep the runtime light. A failed font load has sans-serif fallbacks; failed image loads leave navigation and chapter buttons operable. The user subsequently requested richer animation; the follow-up below replaces the initial restriction on pointer effects.

## Implementation tasks
1. Reshape the shell and Explore page, preserving all event contracts.
2. Apply a shared visual system to cases, route controls, lessons, progress, rankings and dialogs.
3. Exercise the existing flows; inspect desktop and mobile screenshots; fix findings.
4. Save evidence, sources and a concise handoff. Keep publication separate.

## Follow-up: Future Atlas

User request: more adventurous animation and a more futuristic interface that still feels carefully designed. Keep the illustrated town, forest palette and readable decision screens. Add an instrument-like map toolbar, brighter route signals, larger typography, depth and deliberate arrival motion. These are design decisions under the user's requested scope, not research findings.

The map offers Scenery and Routes views; the latter dims the illustration to foreground the actual chapter connections. The underlying twelve destinations remain identical. Animated highlights follow that existing path. Hover/focus provides the actual place and skill. Split-line title reveals, staggered cards, pointer depth, a single hover sheen and short dialog entrances carry the additional motion. No artificial live metrics, invented activity feeds or decorative loading states were added.

Engineering boundary: a separate CSS/JS presentation layer, native Web Animations, IntersectionObserver and event-driven requestAnimationFrame. Use a separate motion preference key; never change game storage or API contracts. Reset pointer state and disconnect observers on main-page replacement. Skip route/form-update reveals. Pause continuous route strokes off-screen and in hidden tabs; provide a persistent toggle and honor OS reduced motion. No additional dependency or asset download is required.

Verification focuses on the new functional controls and cleanup behavior, plus the existing responsive and case suites. Full desktop/mobile screenshots and a short local recording document the final appearance. See the dated follow-up in the verification report.
