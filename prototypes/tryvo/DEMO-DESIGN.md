# Guided demo design

Two short lessons teach the actual tram controls before a player enters the campaign. Lesson one teaches connecting streets, repairing the efficient route, testing and settlement. Lesson two teaches fare income versus distance cost and choosing a passenger group. They reuse the campaign route engine; their own progress is saved separately and earns no leaderboard points.

Palette: canvas #18181c, panel #252429, text #f3f0f8, lavender #c2b3ff, coral #ffb19a, success #a3d4bd. Existing Bricolage headings and Source body text stay. Use left-aligned short instructions and 44px minimum controls. The memorable visual is a small, labelled tram map with a highlighted next action, not a new dashboard.

Desktop: lesson heading → three live counters → map beside a small speech-bubble guide. Mobile: heading → short guide → counters and map, with no horizontal page scrolling. The guide advances from real actions, can be collapsed and reopened, and has contextual validation. No timer or forced carousel. A legend explains symbols and the credit calculation expands only on request.

Campaign cleanup: one navigation header, plain-language budget labels, fewer always-visible figures, collapsible calculations and completed-attempt details. Keep the user's charcoal theme, world artwork, existing progress and ranking rules.

Validation: complete both lessons by mouse and keyboard; wrong and empty inputs; alternate passenger selections; reload midway; leaving and returning; tutorial replay without points; mobile layouts; campaign regression checks. Usability with real first-time players remains a separate test.
