# Radix NG

[![Version](https://img.shields.io/npm/v/@radix-ng/primitives?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/@radix-ng/primitives)
[![Downloads](https://img.shields.io/npm/dm/@radix-ng/primitives.svg?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/@radix-ng/primitives)
[![License](https://img.shields.io/npm/l/@radix-ng/primitives?style=flat&colorA=000000&colorB=000000)](/LICENSE)
[![Angular](https://img.shields.io/badge/Angular-21%20%2F%2022-000000?style=flat&logo=angular&logoColor=fff&colorA=000000&colorB=000000)](https://angular.dev)
[![Discord Chat](https://img.shields.io/discord/1231525968586346567?style=flat&logo=discord&logoColor=fff&color=000)](https://discord.gg/NaJb2XRWX9)

> **Headless, signals-first UI primitives for Angular.**

Use Angular directives to add keyboard interaction and focus management to your own markup. Style
the documented `data-*` states with CSS or Tailwind, and connect supported controls to Angular Forms.
Browse the [live examples and API reference](https://radix-ng.com/docs/).

The library grew out of an Angular port of [Radix UI](https://www.radix-ui.com/).
[Base UI](https://base-ui.com/) is the primary reference for component APIs and behavior.

## Features

- 🎯 **Headless** — your design system supplies the visual styles.
- ♿ **Accessible** — built to the [WAI-ARIA authoring practices](https://www.w3.org/WAI/ARIA/apg/), with keyboard navigation and focus management.
- ⚡ **Signals-first** — modern Angular API (`input()`, `model()`, `computed()`, `signal()`).
- 📝 **Angular-native forms** — shared Field labels, descriptions, and errors across supported form APIs.
- 🧩 **Composable** — primitives compose via `hostDirectives` and shared building blocks.
- 🌗 **Theme-ready** — state-driven styling works with light/dark and any design tokens.
- 📦 **Tree-shakeable** — granular secondary entry points (`@radix-ng/primitives/<name>`).
- 🤖 **AI-ready** — installable [Skills](#ai-assistant-skills) teach AI coding assistants the APIs, examples, and `data-*` styling contract.

## Installation

```bash
ng add @radix-ng/primitives
```

The schematic installs the runtime peer dependencies and can add AI assistant instructions
(`AGENTS.md` / `CLAUDE.md`) to your workspace. Or install manually:

```bash
npm install @radix-ng/primitives @floating-ui/dom @internationalized/date @internationalized/number
```

## Quick start

```ts
import { Component } from '@angular/core';
import {
  RdxCollapsibleRootDirective,
  RdxCollapsibleTriggerDirective,
  RdxCollapsiblePanelDirective
} from '@radix-ng/primitives/collapsible';

@Component({
  selector: 'app-demo',
  imports: [RdxCollapsibleRootDirective, RdxCollapsibleTriggerDirective, RdxCollapsiblePanelDirective],
  template: `
    <div rdxCollapsibleRoot>
      <button rdxCollapsibleTrigger>Toggle</button>
      <div rdxCollapsiblePanel>Content</div>
    </div>
  `
})
export class DemoComponent {}
```

Use `[data-open]` and `[data-closed]` to style the Collapsible panel.

## Angular Forms

Inside an `rdxFieldRoot`, use `rdxNgControlField` with a Reactive Forms or `ngModel` control.
For Signal Forms, apply `rdxSignalField` from `@radix-ng/primitives/signal-forms` alongside
`[formField]`. These adapters expose Angular's validation and interaction state to the Field parts.

Support varies by control. Reactive Forms and `ngModel` use native inputs or primitives with a
`ControlValueAccessor`. Signal Forms is stable in Angular 22. Date Field, Time Field, and Editable
use `model()` for Signal Forms. See the
[control integration matrix](https://radix-ng.com/docs/?path=/docs/primitives-signal-forms--docs#control-integration-matrix),
[complete form examples](https://radix-ng.com/docs/?path=/docs/primitives-signal-forms--docs#one-recipe-two-angular-apis),
and the [migration guide](https://radix-ng.com/docs/?path=/docs/guides-forms-migration--docs) for
upgrades from 1.0.10.

## Documentation

- 📖 [Storybook](https://radix-ng.com/docs/) — component guides, live examples, and API reference
- 📄 [LLM documentation index](https://radix-ng.com/docs/llms.txt) and [full reference](https://radix-ng.com/docs/llms-full.txt)
- 🧩 Component Markdown at `https://radix-ng.com/docs/components/<name>.md`
- 🤖 [AI assistant skills](#ai-assistant-skills) — for Claude Code, Cursor, Copilot, and others
- 🎙 [The Story of My Radix UI Port for Angular](https://frontendconf.ru/moscow/2025/abstracts/16014) — talk, FrontendConf Moscow 2025

## AI assistant skills

Give your AI coding assistant structured knowledge of the primitives — the machine-readable API
contract (selectors, inputs/outputs, two-way bindings), working examples, the `data-*` styling
contract, and a list of common mistakes — so it writes correct, accessible code instead of
guessing. The [Skills](skills/) are self-contained (everything bundled offline) and work with
Claude Code, Cursor, Codex, Cline, Windsurf, GitHub Copilot, Gemini, and other agents via the open
[Agent Skills ecosystem](https://skills.sh).

```bash
npx skills add radix-ng/primitives/skills
```

## Roadmap

Planned, not yet available:

- Date Picker
- Date Range Field
- Date Range Picker
- Range Calendar

Want something else? Open an [issue](https://github.com/radix-ng/primitives/issues) or start a
[discussion](https://github.com/radix-ng/primitives/discussions).

## Ecosystem

- [OriginUI for Angular](https://originui-ng.com/) — styled components built on these primitives
- [shadcn/ui for Angular](https://ui.adrianub.dev/) — shadcn-style components
- [DataGrid](https://originui-ng.com/table) — built with [TanStack Table](https://tanstack.com/table/latest)

## Contributing

For agent-assisted development, start with [AGENTS.md](AGENTS.md) and the [engineering map](docs/engineering/README.md).
Contributor skills live in `.agents/skills/`; `skills/` contains the separately distributed consumer bundle.

Contributions are welcome! The repository is an Nx monorepo:

```
.
├── apps
│   ├── radix-storybook       Storybook docs and examples
│   ├── radix-playground      Angular playground app
│   ├── radix-ssr-testing     SSR smoke-test app
│   ├── radix-perf-testing    performance benchmarks
│   └── visual-regression     Playwright visual and behavior specs
└── packages
    └── primitives         headless primitives (no styling)
```

Use the Node version in [`.nvmrc`](.nvmrc) and the pnpm version in [`package.json`](package.json).

```bash
pnpm install
pnpm primitives:test       # run tests
pnpm primitives:build      # build the library
pnpm storybook:primitives  # start Storybook
pnpm playground            # start the playground app
pnpm test-visual           # build Storybook and run Playwright visual checks
```

## Community

We're excited to see the community adopt Radix NG, raise issues, and provide feedback —
whether it's a feature request, bug report, or a project to showcase.

- [Join our Discord](https://discord.gg/NaJb2XRWX9)
- [Follow development news and releases on Telegram](https://t.me/headless_angular)
- [GitHub Discussions](https://github.com/radix-ng/primitives/discussions)

## Contributor analytics

![Repobeats analytics image](https://repobeats.axiom.co/api/embed/7c1e0b2754a8973c9cfd458060d168e9dd7b5b8e.svg 'Repobeats analytics image')

## License

This project is licensed under the terms of the [MIT license](/LICENSE).
