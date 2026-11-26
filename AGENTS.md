# Radix NG Primitives — Agent Guide

Angular headless UI primitives: signals-first, composed through DI and `hostDirectives`.
Base UI is the primary API/behavior reference; Radix UI is secondary.

## Sources and scope

- Versions, commands and CI behavior come from `package.json`, `.nvmrc`, Nx project files and `.github/workflows/`.
- Public API comes from primitive source/barrels; documented examples come from Storybook. Accepted decisions and intentional deviations live in [ADRs](docs/adr/README.md).
- Reserve ADRs for significant, lasting decisions. Routine fixes, tests and parity increments do not require a new ADR; follow the [creation and update criteria](docs/adr/README.md#when-to-write-or-update-an-adr).
- Contributor skills live in `.agents/skills/`; `.claude/skills/` contains relative symlinks to them. These project rules take precedence over general framework guidance, including the vendored Angular skill's CLI/build defaults. Use Nx/package scripts here.
- Skills listed in `skills-lock.json` are upstream-managed: keep their files and the lock unchanged unless the task explicitly requests an upstream skill update. Put project overrides here or in project-owned skills.
- `skills/` is the separately distributed **consumer** bundle. See [its pipeline](docs/engineering/consumer-skills.md) before changing generated files.
- Read only the guides relevant to the task. Start with [the engineering map](docs/engineering/README.md) when you need project context.

## Workflow routing

| Task                                            | Use                                                        |
| ----------------------------------------------- | ---------------------------------------------------------- |
| Find architecture or a shared mechanism         | [Engineering map](docs/engineering/README.md)              |
| Add a primitive or a new compound part          | [radix-primitive](.agents/skills/radix-primitive/SKILL.md) |
| Write or change stories / public MDX            | [radix-storybook](.agents/skills/radix-storybook/SKILL.md) |
| Choose, write or run regression checks          | [radix-testing](.agents/skills/radix-testing/SKILL.md)     |
| Review a primitive                              | [radix-review](.agents/skills/radix-review/SKILL.md)       |
| Maintain engineering docs or agent instructions | [radix-docs](.agents/skills/radix-docs/SKILL.md)           |

## Runtime invariants

- Use standalone components, directives and pipes with direct imports; do not introduce NgModules or `standalone: false`.
- Keep primitives headless; expose each part's documented boolean state attributes (`data-open`, `data-closed`, `data-checked`, etc.). Follow the per-part contract instead of introducing a generic `data-state` enum.
- Use signal inputs/models/outputs and typed `createContext` interfaces. Pass the docs path to `createContext`; use `undefined` to remove host attributes.
- Prefer `hostDirectives` composition. Thin positioners extend `RdxPopperContentWrapper`; see [composition](docs/engineering/composition.md).
- Avoid `NgZone` wrappers and independent platform sniffing. Reuse owned core utilities.
- Use constructors for DI/host setup, reactive APIs for input-driven work, render hooks for DOM measurements, and `DestroyRef` for cleanup. See [patterns](docs/engineering/patterns.md) for details.
- Preserve native semantics, associated labels, keyboard/focus behavior and RTL. Trace accessibility claims to source and tests.

## Storybook styling

- Base new stories on the closest existing story for the same primitive. Reuse part shapes, colors, and focus styles. Change styling when the request calls for it or the behavior needs a visible distinction.
- Use Tailwind v4 utilities directly in story templates and standalone story components.
- Do not add story-local CSS files, Angular `styleUrl` / `styleUrls` / `styles`, inline `<style>` blocks, or `style="..."` attributes.
- Prefer semantic tokens for shared roles. Use the shared Base UI palette with `dark:` variants when an example needs a specific shade. See [demo colors](docs/engineering/ux-guidelines.md#semantic-tokens-tailwind-v4).
- Theme values belong in the shared `@theme`. Stable class combinations that change together may live in the shared theme's `@layer components`; keep demo-specific layout and state utilities visible in templates.
- Use `packages/primitives/storybook/tailwind-demo.ts` for the shared Storybook demo shell. Storybook and Playground load common demo recipes from `apps/radix-storybook/.storybook/main.css`.
- Dynamic variant selection in TS uses typed parameters and complete Tailwind class names. See [demo styling](docs/engineering/ux-guidelines.md#demo-styling-system) for the shared surface and source-preview contract.
- Copyable examples use explicit directive imports from public entry points. Show component/wrapper sources and the rendered CSS via raw `Source` blocks; verify copied examples with the [external AOT check](tools/storybook-portability/README.md).
- If a demo cannot reasonably be expressed with Tailwind utilities, explain why and ask before adding CSS.

## Verification

Use the Node version in `.nvmrc` (`nvm use` when available) and pnpm. Scope local checks to the affected primitive and consumers; broaden when failures or shared dependencies warrant it. Full suites are CI gates or an explicit verification task.

- Unit: `pnpm exec vitest run --config packages/primitives/vite.config.ts packages/primitives/<name>/__tests__`
- Layout, positioning, visibility or interaction-time errors: add/run a real-browser behavior regression; jsdom cannot prove the fix.
- Pinned comparisons: `pnpm test-parity <name>`; reference preparation and `BASE_UI_SOURCE` are documented in [upstream references](docs/engineering/upstream-reference.md).
- New entry points/runtime APIs: `pnpm primitives:build`; include affected consumer/template checks.
- Public API, story source or MDX changes: `pnpm skills:build` and include generated output.
- Agent instructions/skills/engineering docs: `pnpm agents:check`.
- Lint uses `--max-warnings=0`. Format changed files; avoid repository-wide autofixes for a local edit.
