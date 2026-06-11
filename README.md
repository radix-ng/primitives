# Radix NG

[![Build Size](https://img.shields.io/bundlephobia/minzip/@radix-ng/primitives@latest?label=bundle%20size&style=flat&colorA=000000&colorB=000000)](https://bundlephobia.com/result?p=@radix-ng/primitives@latest)
[![Version](https://img.shields.io/npm/v/@radix-ng/primitives?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/@radix-ng/primitives)
[![Downloads](https://img.shields.io/npm/dm/@radix-ng/primitives.svg?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/@radix-ng/primitives)
[![License](https://img.shields.io/npm/l/@radix-ng/primitives?style=flat&colorA=000000&colorB=000000)](/LICENSE)
[![Angular](https://img.shields.io/badge/Angular-21+-000000?style=flat&logo=angular&logoColor=fff&colorA=000000&colorB=000000)](https://angular.dev)
[![Discord Chat](https://img.shields.io/discord/1231525968586346567?style=flat&logo=discord&logoColor=fff&color=000)](https://discord.gg/NaJb2XRWX9)

> **Headless, signals-first UI primitives for Angular.**

Radix NG is a low-level UI primitive library for Angular with a focus on accessibility, customization,
and developer experience. The primitives are **headless** — they ship no styles and expose state via
`data-*` attributes, so you can use them as the base layer of your design system or adopt them
incrementally.

The library grew out of an Angular port of [Radix UI](https://www.radix-ui.com/); its API and behavior
now align primarily with [Base UI](https://base-ui.com/).

## Features

- 🎯 **Headless** — no styles, full control. State is exposed through `data-*` attributes.
- ♿ **Accessible** — built to the [WAI-ARIA authoring practices](https://www.w3.org/WAI/ARIA/apg/), with keyboard navigation and focus management.
- ⚡ **Signals-first** — modern Angular API (`input()`, `model()`, `computed()`, `signal()`).
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
  RdxCollapsibleContentDirective
} from '@radix-ng/primitives/collapsible';

@Component({
  selector: 'app-demo',
  imports: [RdxCollapsibleRootDirective, RdxCollapsibleTriggerDirective, RdxCollapsibleContentDirective],
  template: `
    <div rdxCollapsibleRoot>
      <button rdxCollapsibleTrigger>Toggle</button>
      <div rdxCollapsibleContent>Content</div>
    </div>
  `
})
export class DemoComponent {}
```

Primitives are headless: style them via the `data-*` attributes they expose (e.g.
`[data-state="open"]`, `[data-disabled]`) with the tooling of your choice.

## Documentation

- 📖 [radix-ng.com](https://radix-ng.com) — documentation, examples & API reference (Storybook)
- 📄 [radix-ng.com/llms.txt](https://radix-ng.com/llms.txt) — docs for LLMs (full text at [/llms-full.txt](https://radix-ng.com/llms-full.txt))
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

`ng add @radix-ng/primitives` also offers to add a Radix NG section to your `AGENTS.md` /
`CLAUDE.md`, pointing agents at the docs and skills automatically. Plain-Markdown docs for every
component are served at `https://radix-ng.com/components/<name>.md`.

## Components

**Status:** ✅ Completed · 🚀 In Progress · 🛠 In Review

<details>
<summary><strong>Core primitives</strong></summary>

| Primitive       | Status |
| --------------- | ------ |
| Accordion       | ✅     |
| Alert Dialog    | beta   |
| Avatar          | ✅     |
| Aspect Ratio    | ✅     |
| Button          | ✅     |
| Checkbox        | ✅     |
| Collapsible     | ✅     |
| Context Menu    | ✅     |
| Dialog          | ✅     |
| DropdownMenu    | ✅     |
| Form            | ?      |
| Hover Card      | ✅     |
| Label           | ✅     |
| Menubar         | ✅     |
| Navigation Menu | ✅     |
| Popover         | ✅     |
| Progress        | ✅     |
| Radio           | ✅     |
| Select          | beta   |
| Separator       | ✅     |
| Slider          | ✅     |
| Switch          | ✅     |
| Tabs            | ✅     |
| Toast           |        |
| Toggle          | ✅     |
| Toggle Group    | ✅     |
| Toolbar         | ✅     |
| Tooltip         | ✅     |

</details>

<details>
<summary><strong>Dates & inputs</strong></summary>

| Primitive         | Status |
| ----------------- | ------ |
| Calendar          | ✅     |
| Date Field        | ✅     |
| Date Picker       |        |
| Date Range Field  |        |
| Date Range Picker |        |
| Editable          | ✅     |
| Number Field      | ✅     |
| Pagination        | ✅     |
| Range Calendar    |        |
| Stepper           | ✅     |
| Time Field        | ✅     |

</details>

<details>
<summary><strong>Utilities</strong></summary>

| Primitive          | Status |
| ------------------ | ------ |
| FocusOutside       | ✅     |
| PointerDownOutside | ✅     |
| FocusGuards        |        |
| FocusScope         |        |

</details>

## Ecosystem

- [OriginUI for Angular](https://originui-ng.com/) — styled components built on these primitives
- [shadcn/ui for Angular](https://ui.adrianub.dev/) — shadcn-style components
- [DataGrid](https://originui-ng.com/table) — built with [TanStack Table](https://tanstack.com/table/latest)

## Contributing

Contributions are welcome! The repository is an Nx monorepo:

```
.
├── apps
│   ├── radix-docs         documentation (Astro)
│   ├── radix-ssr-testing  SSR tests for unstyled primitives
│   └── radix-storybook    Storybook for primitives
└── packages
    └── primitives         headless primitives (no styling)
```

```bash
pnpm primitives:test       # run tests
pnpm primitives:build      # build the library
pnpm storybook:primitives  # start Storybook
```

## Community

We're excited to see the community adopt Radix NG, raise issues, and provide feedback —
whether it's a feature request, bug report, or a project to showcase.

- [Join our Discord](https://discord.gg/NaJb2XRWX9)
- [Join our Telegram](https://t.me/radixng)
- [GitHub Discussions](https://github.com/radix-ng/primitives/discussions)

## Contributor analytics

![Repobeats analytics image](https://repobeats.axiom.co/api/embed/7c1e0b2754a8973c9cfd458060d168e9dd7b5b8e.svg 'Repobeats analytics image')

## License

This project is licensed under the terms of the [MIT license](/LICENSE).
