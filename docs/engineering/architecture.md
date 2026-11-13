# Architecture

Radix NG is a headless Angular primitive library. Consumers own markup and visual design; directives own interaction, accessibility and state. Base UI is the primary behavioral reference, adapted to Angular signals, DI and view lifecycle. See [project scope](project.md).

## Stack and layout

Use root `package.json` for development versions, `packages/primitives/package.json` for supported Angular peers/runtime dependencies, and `.nvmrc` for Node. Nx and pnpm manage the workspace; avoid copying version numbers into agent instructions.

| Location                         | Responsibility                                                                     |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| `packages/primitives/<name>/`    | Secondary entry: barrel, `ng-package.json`, source, tests and stories              |
| `packages/primitives/core/`      | DOM utilities, signals helpers, forms adapters and neutral floating infrastructure |
| `packages/primitives/storybook/` | Shared demo classes, shell and styling handbook                                    |
| `apps/radix-storybook/`          | Storybook, public docs and static LLM endpoints                                    |
| `apps/radix-playground/`         | Consumer integration playground                                                    |
| `apps/radix-ssr-testing/`        | SSR rendering and public-template checks                                           |
| `apps/radix-perf-testing/`       | Real-browser Vitest benchmarks                                                     |
| `apps/visual-regression/`        | Playwright story behavior and screenshots                                          |
| `apps/parity-testing/`           | Differential scenarios against pinned Base UI sources                              |
| `.agents/skills/`                | Contributor workflows; Claude uses symlinks to these                               |
| `skills/`                        | Separately distributed consumer skills generated from public docs/source           |
| `tools/scripts/`                 | Build, API-doc and consumer-skill generation                                       |

Register a new secondary entry in root `tsconfig.base.json`. Runtime imports belong in library peer dependencies and the `ng-add` schematic; see [installation](installation.md).

## Composition boundaries

Families publish explicit typed interfaces through `createContext`. Child parts resolve required context or opt into optional context explicitly. Compose with `hostDirectives` by default. Shared thin positioners intentionally extend `RdxPopperContentWrapper`, with inherited inputs and config providers.

The floating tree in `core/floating` is neutral shared infrastructure. Dismissal, focus, trigger registries, pointer blocking, scroll lock and popup lifecycle coordinate through it rather than maintaining separate global layer stacks.

Angular projected children resolve context through their declaring injector tree. Composite owners bridge wrapper/list projection; putting Root on the wrapper host preserves that ownership. Portal/presence owns mounted views and exit completion; application-owned `@if` remains a separate lifecycle boundary.

For implementation constraints, use [composition primitives](composition.md), [per-family notes](primitive-families.md), [the mechanism index](mechanisms.md) and [core utilities](core-utilities.md). Open only the subject being changed.

## Forms and browser behavior

Form → Fieldset → Field → control separates form errors/submission, field state/labels, and control values. Angular forms integration and the native browser input bridge are distinct responsibilities. See [forms](forms.md), [Signal Forms readiness](signal-forms-readiness.md), and [date/time editing](date-time.md).

The library does not depend on Angular CDK. Reuse [owned replacements](cdk-migration.md) rather than reintroducing it.

## Decisions and verification

Accepted decisions and intentional differences live in [the ADR index](../adr/README.md). Current implementations and tests establish what is actually shipped; report mismatches with intended design.

Verification is selected by [radix-testing](../../.agents/skills/radix-testing/SKILL.md). SSR is included in affected CI tests/builds. Public documentation and consumer skills share [one generation pipeline](consumer-skills.md); contributor setup is checked separately.
