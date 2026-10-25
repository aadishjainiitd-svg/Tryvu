# Interaction source attribution

Reference: [Brad Traversy, 50projects50days](https://github.com/bradtraversy/50projects50days).
Inspected revision: `c92b0bc3a87fc95d44b89552b7b6a2eeb36ca481`. Copyright (c) 2022 Brad Traversy. MIT licence retained in `vendor/50projects50days/LICENSE`.

Inspected `index.html`, `style.css` and `script.js` for each example before adaptation:

| Example | Source at inspected revision | Tryvo adaptation |
|---|---|---|
| progress-steps | [source](https://github.com/bradtraversy/50projects50days/tree/c92b0bc3a87fc95d44b89552b7b6a2eeb36ca481/progress-steps) | Connected numbered stages and completed/current styling. Uses actual mission phase, semantic navigation and safe review; no independent incrementing step counter or validation bypass. |
| live-user-filter | [source](https://github.com/bradtraversy/50projects50days/tree/c92b0bc3a87fc95d44b89552b7b6a2eeb36ca481/live-user-filter) | Case-insensitive filtering of existing mission entries on input; adds district/status combinations, result counts, empty state and reset. No remote user API. |
| toast-notification | [source](https://github.com/bradtraversy/50projects50days/tree/c92b0bc3a87fc95d44b89552b7b6a2eeb36ca481/toast-notification) | Temporary action feedback with a timer; one replaceable polite status region instead of stacked/random messages. Failures remain persistent. |
| mobile-tab-navigation | [source](https://github.com/bradtraversy/50projects50days/tree/c92b0bc3a87fc95d44b89552b7b6a2eeb36ca481/mobile-tab-navigation) | Bottom navigation with icons and labels at mobile widths. Reuses existing hash links and state, supports keyboard and safe-area spacing; no clickable list items or duplicate panel state. |

Adapted interaction logic is in `js/app.js`, shell markup in `index.html`, and scoped styling in `css/interactions.css`. Typography, colours, local artwork and scoring remain Tryvo's. No external fonts, image services, icon CDN or new runtime dependencies were imported.

Original HTML5 Boilerplate and bundled font attribution remains in place; see README.md.

## Field Guide redesign (2026-10-25)

The new presentation in `css/fieldguide.css` and the chapter collection in `js/campaign.js` are original implementation. The supplied [React Bits Split Text](https://reactbits.dev/text-animations/split-text), [Magic UI](https://magicui.design), [21st.dev](https://21st.dev) and [shadcn/ui button documentation](https://ui.shadcn.com/docs/components/base/button) informed motion restraint and component hierarchy; none of their source code was copied and no related package was installed. Existing town artwork and fonts are reused. The navigation now uses a desktop horizontal bar and mobile drawer; the earlier mobile-tab adaptation remains in the legacy style history.
