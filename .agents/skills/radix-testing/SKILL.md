---
name: radix-testing
description: Choose and run focused Radix NG unit, accessibility, browser, pinned comparison, SSR or performance checks; diagnose zoneless test failures.
---

# Radix NG verification

Choose the layer that can observe the changed behavior, then read the matching section of [layer details](references/layers.md).

| Change                                                           | Check                                                                 |
| ---------------------------------------------------------------- | --------------------------------------------------------------------- |
| Signals, DI, values, event handlers                              | Primitive's Vitest specs                                              |
| Roles, labels, ARIA                                              | Vitest + jest-axe; keyboard/focus behavior where applicable           |
| Layout, scroll, positioning, visibility, interaction-time throws | Storybook `*.behavior.spec.ts` in a real browser                      |
| Behavior aligned with Base UI                                    | Affected [pinned comparisons](../../../apps/parity-testing/README.md) |
| SSR, hydration, ids or public template compatibility             | SSR render spec and affected SSR app build                            |
| Intended visual change                                           | Relevant screenshot spec; review baseline changes                     |
| Measured render/update performance                               | Focused browser benchmark                                             |

## Local scope

Start with the changed primitive and affected consumers. Menu mechanisms also serve Context Menu and Menubar. Start browser iteration with one engine; verify affected scenarios in other supported engines before handing off an engine-sensitive change. Full suite runs belong to CI or explicit requests.

```bash
pnpm exec vitest run --config packages/primitives/vite.config.ts packages/primitives/<name>/__tests__
pnpm test-parity <name> --project=chromium
pnpm exec playwright test -c apps/visual-regression/playwright.config.ts <name>.behavior --project=chromium
pnpm exec nx run radix-ssr-testing:test
pnpm primitives:ssr:build
```

The Playwright config reuses an existing Storybook at `:4400` locally. The test suite is zoneless: use Vitest timers/render stability, not `fakeAsync`/`tick`. CI includes affected SSR tests and builds; [the workflow](../../../.github/workflows/ci.yml) is authoritative.

For instructions/docs-only changes, use `pnpm agents:check` and format the changed files. No library-wide runtime suite is needed for a prose or symlink change.
