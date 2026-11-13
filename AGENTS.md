# Radix NG Primitives — Agent Guide

Angular headless UI primitives: signals-first, composed through DI and `hostDirectives`.
Base UI is the primary API/behavior reference; Radix UI is secondary.

## Sources and scope

- Versions, commands and CI behavior come from `package.json`, `.nvmrc`, Nx project files and `.github/workflows/`.
- Public API comes from primitive source/barrels; documented examples come from Storybook. Accepted decisions and intentional deviations live in [ADRs](docs/adr/README.md).
- Contributor skills live in `.agents/skills/`; `.claude/skills/` contains relative symlinks to them. These project rules take precedence over general framework guidance, including the vendored Angular skill's CLI/build defaults. Use Nx/package scripts here.
- Skills listed in `skills-lock.json` are upstream-managed: keep their files and the lock unchanged unless the task explicitly requests an upstream skill update. Put project overrides here or in project-owned skills.
- `skills/` is the separately distributed **consumer** bundle. See [its pipeline](docs/engineering/consumer-skills.md) before changing generated files.
- Read only the guides relevant to the task. Start with [the engineering map](docs/engineering/README.md) when you need project context.

## Workflow routing

| Task                                            | Use                                                                        |
| ----------------------------------------------- | -------------------------------------------------------------------------- |
| Find architecture or a shared mechanism         | [radix-project-knowledge](.agents/skills/radix-project-knowledge/SKILL.md) |
| Add a primitive or a new compound part          | [radix-primitive](.agents/skills/radix-primitive/SKILL.md)                 |
| Write or change stories / public MDX            | [radix-storybook](.agents/skills/radix-storybook/SKILL.md)                 |
| Choose, write or run regression checks          | [radix-testing](.agents/skills/radix-testing/SKILL.md)                     |
| Review a primitive                              | [radix-review](.agents/skills/radix-review/SKILL.md)                       |
| Maintain engineering docs or agent instructions | [radix-docs](.agents/skills/radix-docs/SKILL.md)                           |

## Runtime invariants

- Keep primitives headless; expose each part's documented boolean state attributes (`data-open`, `data-closed`, `data-checked`, etc.). Follow the per-part contract instead of introducing a generic `data-state` enum.
- Use signal inputs/models/outputs and typed `createContext` interfaces. Pass the docs path to `createContext`; use `undefined` to remove host attributes.
- Prefer `hostDirectives` composition. Thin positioners extend `RdxPopperContentWrapper`; see [composition](docs/engineering/composition.md).
- Do not introduce `@angular/cdk`, `NgZone` wrappers or independent platform sniffing. Reuse owned core utilities.
- Use constructors for DI/host setup, reactive APIs for input-driven work, render hooks for DOM measurements, and `DestroyRef` for cleanup. See [patterns](docs/engineering/patterns.md) for details.
- Preserve native semantics, associated labels, keyboard/focus behavior and RTL. Trace accessibility claims to source and tests.

## Storybook styling

- Use Tailwind v4 utilities directly in story templates and standalone story components.
- Do not add story-local CSS files, Angular `styleUrl` / `styleUrls` / `styles`, inline `<style>` blocks, or `style="..."` attributes.
- Use semantic tokens such as `bg-background`, `text-foreground`, `bg-muted`, `border-border`, and `text-primary-foreground`.
- Use `packages/primitives/storybook/tailwind-demo.ts` for the shared Storybook demo shell; reuse shared style constants for repeated patterns.
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
