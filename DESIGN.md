# Tryvo — the illustrated field guide

Tryvo should feel like a thoughtful, beautifully made game about a place worth exploring. The town illustration, human choices and approachable language carry its identity. The surrounding interface is quiet enough for both map play and careful reading.

## Shared design system

`prototypes/tryvo/css/fieldguide.css` is the last-loaded presentation system. It overrides earlier feature-specific styles; the earlier modules still own game geometry and legacy layouts. Keep changes to shared visual tokens here and verify affected product surfaces in a browser.

| Role | Value |
|---|---|
| Canvas | `#f7f8f2` |
| Paper panels | `#fffefa` |
| Raised surface | `#edf1e7` |
| Primary text | `#223c30` |
| Secondary text | `#626f65` |
| Borders | `#dce2d7` |
| Action | `#28543e` |
| Action hover | `#193e2b` |
| Highlight | `#ddedaa` |
| Featured chapter | `#244b38` |

Display: bundled Bricolage Grotesque, 550–650 weight. Body and controls: bundled Source Sans 3. Both use local files, variable font weights and `font-display:swap`. Preserve font attribution. Headings use negative tracking; labels use limited tracking. Use ordinary sentences and specific destinations for actions.

## Composition

Desktop navigation is a horizontal bar. At 760px and below it becomes the existing accessible drawer with focus trapping, Escape and an inert closed panel. Do not put a filter, transform or containment property on its mobile header: those change the fixed drawer's containing block.

Explore opens with a spacious title and short explanation, then the map paired with the next chapter. The map remains the visual anchor. The chapter collection shows actual case topics; every card launches its associated journey. The complete index is a native disclosure that opens in place without changing the app route.

Paper surfaces hold cases, exhibits, journals and reports. Dark green is reserved for the next chapter and map labels. Dark diagram backgrounds may retain their explicit route, obstacle and station colors; preserve meaning and contrast instead of globally recoloring SVG geometry.

Radii: buttons/inputs 8–9px; ordinary panels 12px; map and chapter 16px; dialogs 18px. Capsules are reserved for navigation, state and compact skill tags. Avoid nesting decorative cards around every sentence.

## Motion and accessibility

Entrances use opacity plus a 12px translation, lasting 600ms with small staggering. Hover changes are 180–200ms. No animation gates a task. Reduced-motion preference removes animation and animated scrolling. Never hide content until an observer runs.

All controls retain native button/link semantics and accessible names. Preserve the `data-*` event contracts, DOM score identifiers, dialog behavior and hash routes. Selected controls have explicit styling; disabled controls remain disabled. Keep readable contrast on input, error, loading, completed and empty states. Check actual computed backgrounds: older `:is()` lists may have higher specificity than expected.

The tutorial guide is sticky only above 900px. Below that, it uses normal document flow and `top:auto`; the counters and map must follow without overlap.

## Verification

Run `node prototypes/tryvo/tests/fieldguide-browser.cjs` with the local server running and Playwright available. It covers chapter links, the in-place index, all main pages at six viewport widths, mobile drawer geometry/focus, tutorial overlap, selected text contrast and normal-motion arrival. Existing tutorial, cases, economy and MindScore suites cover the underlying flows.

Reference rationale and limitations are in `research/design-references.md` and `research/design-revamp-verification.md`. No third-party component source was copied in this pass.
