# @radix-ng/primitives

> **Headless, signals-first UI primitives for Angular.**

Radix NG is a low-level UI primitive library for Angular with a focus on accessibility,
customization, and developer experience. The primitives are **headless** — they ship no styles and
expose state via `data-*` attributes, so you can use them as the base layer of your design system
or adopt them incrementally.

The library grew out of an Angular port of [Radix UI](https://www.radix-ui.com/); its API and
behavior now align primarily with [Base UI](https://base-ui.com/).

## Installation

```bash
ng add @radix-ng/primitives
```

The schematic installs the runtime peer dependencies and can add AI assistant instructions
(`AGENTS.md` / `CLAUDE.md`) to your workspace. Manual install:

```bash
npm install @radix-ng/primitives @floating-ui/dom @internationalized/date @internationalized/number
```

## Quick start

Each primitive is its own secondary entry point — import only what you use:

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

Style the parts via the `data-*` attributes they expose (e.g. `[data-state="open"]`,
`[data-disabled]`) with any CSS approach — Tailwind, CSS modules, vanilla CSS.

## Documentation

- 📖 [radix-ng.com](https://radix-ng.com) — documentation, examples & API reference
- 📄 Plain-Markdown docs for every component: `https://radix-ng.com/components/<name>.md`

## For AI coding assistants

- **Agent Skills** (Claude Code, Cursor, Codex, Copilot, and others via [skills.sh](https://skills.sh)) —
  bundles the API contract, working examples, the `data-*` styling contract, and common mistakes,
  fully offline:

  ```bash
  npx skills add radix-ng/primitives/skills
  ```

- **llms.txt** — [radix-ng.com/llms.txt](https://radix-ng.com/llms.txt) (index) ·
  [radix-ng.com/llms-full.txt](https://radix-ng.com/llms-full.txt) (all docs in one file)

## Community

- [GitHub](https://github.com/radix-ng/primitives) · [Discussions](https://github.com/radix-ng/primitives/discussions)
- [Discord](https://discord.gg/NaJb2XRWX9) · [Telegram](https://t.me/radixng)

## License

[MIT](https://github.com/radix-ng/primitives/blob/main/LICENSE)
