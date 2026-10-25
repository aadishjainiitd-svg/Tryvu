# Guided demo design

Two short lessons teach the actual tram controls before a player enters the campaign. Lesson one teaches connecting streets, repairing the efficient route, testing and settlement. Lesson two teaches fare income versus distance cost and choosing a passenger group. They reuse the campaign route engine; their own progress is saved separately and earns no leaderboard points.

Current palette: canvas #f7f8f2, panel #fffefa, text #223c30, forest-green actions #28543e, chartreuse emphasis #ddedaa. Bricolage headings and Source body text stay. See ../../DESIGN.md for the shared Field Guide system; dark map diagrams retain their explicit high-contrast route colors. Use left-aligned short instructions and 44px minimum controls. The memorable visual is a small, labelled tram map with a highlighted next action, not a new dashboard.

Desktop: lesson heading → three live counters → map beside a small speech-bubble guide. Mobile: heading → short guide → counters and map, with no horizontal page scrolling. The guide advances from real actions, can be collapsed and reopened, and has contextual validation. No timer or forced carousel. A legend explains symbols and the credit calculation expands only on request.

Campaign cleanup: one navigation header, plain-language budget labels, fewer always-visible figures, collapsible calculations and completed-attempt details. Preserve the world artwork, existing progress and ranking rules. The shared Field Guide theme now provides the surrounding light surfaces.

Validation: complete both lessons by mouse and keyboard; wrong and empty inputs; alternate passenger selections; reload midway; leaving and returning; tutorial replay without points; mobile layouts; campaign regression checks. Usability with real first-time players remains a separate test.
