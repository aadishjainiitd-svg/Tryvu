# Redesign references · 2026-10-25
The user supplied a design-resource collection. This pass consulted:
- https://21st.dev — component discovery; useful as a pattern catalogue, not a replacement product structure.
- https://reactbits.dev/text-animations/split-text — staggered text entrance inspiration. Implemented independently in CSS with reduced-motion support; no React Bits code copied.
- https://magicui.design — polished interaction reference. No library installed or component source copied.
- https://ui.shadcn.com/docs/components/base/button — consistent button hierarchy and native link/button semantics. Existing vanilla controls retained.
- https://godly.website — redirected to recent.design and could not be retrieved. No claim of inspecting examples there.

Decision: art-led composition, varied visual hierarchy, deliberate spacing and restrained entrances suit a thoughtful illustrated game. Keep the existing vanilla runtime and use native browser animation for its small set of effects. All illustration and font assets are already bundled with the existing attribution files. No new paid assets or fabricated testimonials/metrics.

## Precise journey interactions · 2026-10-25

Revisited the user's collection for this follow-up:
- [GSAP MotionPath](https://gsap.com/docs/v3/Plugins/MotionPathPlugin/) — path-following and alignment as an interaction pattern. Implemented independently with native keyframes between the actual board coordinates; station callbacks follow animation completion, with acceleration/deceleration and dwell at meaningful stops.
- [Motion layout animations](https://motion.dev/docs/react-layout-animations) — continuity between interface states. Adapted the principle to brief page entries, newly drawn route segments and updated counters. Preserved the exact launcher/scroll context on return. This is not a port of React layoutId or a claim to use Motion's library.
- [React Bits Animated Content](https://reactbits.dev/animations/animated-content) — short, staged content arrivals. Retained the existing native reveal system and made return navigation skip those arrivals.
- [shadcn/ui Breadcrumb](https://ui.shadcn.com/docs/components/base/breadcrumb) — reviewed navigation-context patterns. Kept Tryvo's compact existing return links; improved their focus/scroll behavior rather than adding another navigation row.

These are independently implemented interaction patterns. No third-party component source or licensed visual asset was copied, and no dependency was installed.
