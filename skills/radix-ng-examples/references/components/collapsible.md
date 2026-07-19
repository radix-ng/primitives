# Collapsible

A collapsible panel controlled by a button.

> Index — full source of each example is one click away in `../examples/collapsible--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Can be controlled or uncontrolled.
- ✅ Full keyboard support.
- ✅ Exposes open/close state via `data-open` / `data-closed` for styling.
- ✅ Enter and exit transitions via `data-starting-style` / `data-ending-style`.
- ✅ Exposes the panel size as `--collapsible-panel-height` / `--collapsible-panel-width` for height/width animations.
- ✅ Closed panels unmount by default, matching Base UI.
- ✅ Optional `keepMounted` and `hiddenUntilFound` keep the closed panel in the DOM while hidden.
- ✅ Cancelable `onOpenChange` events include the reason, source event, and trigger.

## Import

Get started with importing the directives:

```typescript
import {
  RdxCollapsibleRootDirective,
  RdxCollapsibleTriggerDirective,
  RdxCollapsiblePanelDirective
} from '@radix-ng/primitives/collapsible';
```

## Anatomy

Assemble the collapsible from its parts.

```html
<div rdxCollapsibleRoot>
  <button rdxCollapsibleTrigger>Trigger</button>
  <div rdxCollapsiblePanel>Panel</div>
</div>
```

By default, a closed panel is removed from the DOM. Add `keepMounted` when the element must remain
mounted after the close transition, or `hiddenUntilFound` when collapsed content should remain
discoverable by browser find-in-page.

## Examples

- [Keep mounted](../examples/collapsible--keep-mounted.md)
- [Animation](../examples/collapsible--animation.md)
- [External trigger](../examples/collapsible--external-trigger.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/collapsible.json`
- Styling (parts + `data-*`): `references/styling-contract/collapsible.json`
