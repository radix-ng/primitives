---
name: project
description: Overview of Radix NG Primitives — what it is, who it's for, core features, and scope
metadata:
  type: project
---

# Radix NG Primitives

**Package:** `@radix-ng/primitives`, published as tree-shakeable secondary entries (`@radix-ng/primitives/<name>`).
Use the [library manifest](../../packages/primitives/package.json) for the current repository version and supported Angular peers, and the [changelog](../../packages/primitives/CHANGELOG.md) for release history.

## What it is

A headless, signals-first UI primitive library for Angular. Primitives ship **no styles** — they expose state via `data-*` attributes so consumers can build any design system on top. Modeled on [Base UI](https://base-ui.com/) (primary API/behavior reference) and originally ported from [Radix UI](https://www.radix-ui.com/) (secondary reference for patterns Base UI doesn't cover).

## Audience

Angular developers building their own design systems or adopting accessible headless components. The library targets Angular's signals API; compatibility is declared in the library manifest rather than duplicated here.

## Core features

- **Headless** — no styles; state via `data-*` attributes
- **Accessible** — WAI-ARIA authoring practices, keyboard nav, focus management
- **Signals-first** — `input()`, `model()`, `computed()`, `signal()`, `linkedSignal()`
- **Composable** — `hostDirectives` composition pattern; primitives reuse each other
- **Granular** — each primitive is a separate secondary entry point; tree-shakeable
- **`ng add` schematic** — installs peer deps automatically

## Out of scope

- No visual styling or CSS shipped
- No opinionated design tokens (consumers bring their own)
- Not a full component library — consumers compose the headless primitives with their own styling

## Finding a primitive

Use the secondary entries in [workspace paths](../../tsconfig.base.json) to locate source and the generated [documentation index](../../skills/radix-ng-examples/references/llms.txt) to locate public usage. This avoids maintaining a separate catalog or component count here.

The form layer composes as **Form → Fieldset → Field → control** (`input`, checkbox, radio, …): `field` owns one control's label/description/error/state, `fieldset` groups fields, and `form` (top layer) maps server errors onto fields by name, intercepts submit, and resets field state. See architecture.md for the cross-entry dependency direction.
