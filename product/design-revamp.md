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
Performance: reuse one local artwork and locally bundled fonts. Animate only opacity/transform with a reduced-motion alternative. Do not add continuous pointer effects, WebGL, external runtime requests or image carousels. A failed font load has sans-serif fallbacks; failed image loads leave navigation and chapter buttons operable.

## Implementation tasks
1. Reshape the shell and Explore page, preserving all event contracts.
2. Apply a shared visual system to cases, route controls, lessons, progress, rankings and dialogs.
3. Exercise the existing flows; inspect desktop and mobile screenshots; fix findings.
4. Save evidence, sources and a concise handoff. Keep publication separate.
