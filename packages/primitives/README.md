# @radix-ng/primitives

> **Headless, signals-first UI primitives for Angular 21 and 22.**

Compose keyboard interaction and focus management into your own markup with Angular directives.
Style each part with CSS or Tailwind using its documented `data-*` attributes.
[Base UI](https://base-ui.com/) is the primary reference for component APIs and behavior.

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
  RdxCollapsiblePanelDirective,
  RdxCollapsibleRootDirective,
  RdxCollapsibleTriggerDirective
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
- 📄 Component Markdown at `https://radix-ng.com/docs/components/<name>.md`

## For AI coding assistants

- **Agent Skills** (Claude Code, Cursor, Codex, Copilot, and others via [skills.sh](https://skills.sh)) —
  bundles the API contract, working examples, the `data-*` styling contract, and common mistakes,
  fully offline:

  ```bash
  npx skills add radix-ng/primitives/skills
  ```

- [LLM documentation index](https://radix-ng.com/docs/llms.txt) and
  [full reference](https://radix-ng.com/docs/llms-full.txt)

## Community

- [GitHub](https://github.com/radix-ng/primitives) · [Discussions](https://github.com/radix-ng/primitives/discussions)
- [Discord](https://discord.gg/NaJb2XRWX9) · [Telegram](https://t.me/headless_angular)

## License

[MIT](https://github.com/radix-ng/primitives/blob/main/LICENSE)
