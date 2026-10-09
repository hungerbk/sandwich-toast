# Tests

[한국어](./README.md) · **English**

## Running checks

Run `npm ci` first. CI uses Node 24.13.0 for every PR, pushes to main, and manual runs.

- `npm run check`: formatting, lint, types, tests, library/demo builds, and size budgets. CI uses the same command.
- `npm test`: run tests once.
- `npm run test:watch`: rerun tests on changes.
- `npm run typecheck`: check product and test types.
- `npm run check:size`: check the built `dist` files. Run `npm run build` first.

See [development setup](../CONTRIBUTING.md#english) for formatting and [asset documentation](../src/lib/assets/README.en.md#size-budgets) for budgets and measurement rules. To require CI before merging, select the `check` job in GitHub branch protection settings.

## Automated coverage

- **Store/API**: subscriptions, snapshots, defaults, overrides, duration boundaries, and dismissal arguments
- **Lifecycle**: timer pause/resume/reset, reordering, dismissal races, and unmount cleanup
- **Interaction**: hover/focus/click, arrow navigation, focus restoration, and label associations
- **Display policies**: scale normalization, no display limit, development warnings for duplicate Toasters without blocking rendering
- **Live regions**: initial empty regions, status/alert separation, and node preservation/addition/removal
- **SSR/hydration**: Node server rendering and no-op server APIs, client DOM preservation, portals, and nonce propagation
- **StrictMode**: core timer, interaction, and hydration lifecycles

The public API does not support changing duration after creation or an initially paused Toaster prop. Initial pause is tested as a hook boundary case; public Toaster pause is tested through hover/focus events.

## Automation limits

jsdom does not verify actual layout or speech. Animation mocks control completion and cancellation without checking visual effects. Tab traversal and native Enter/Space clicks do not run automatically, so tests only verify that those keys are not intercepted.

Nonce propagation is checked, but actual CSP enforcement and Next.js RSC integration are not. Production warning branches are checked by changing the environment value, not by running a production React bundle.

## Manual QA

- Cards, close buttons, and focus indicators at a 320px viewport, all six positions, and scale 0.5–1.5
- Ellipsis, button overlap, and keyboard hint placement with long messages and enlarged text
- Tab/Shift+Tab, arrow keys, Enter/Space, focus after dismissal, and mouse hover navigation
- Expansion, navigation, and dismissal with reduced motion enabled
- Image quality and style/image rendering under the actual CSP policy
- Single screen reader announcements and unwanted rereading of the full list after reorder/removal

Live-region DOM tests do not guarantee announcements without omissions or duplicates. Skipped or interrupted consecutive announcements observed with VoiceOver are tracked separately. Record automated results separately from actual browser verification.
