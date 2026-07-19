# Accordion

A vertically stacked set of interactive headings that each reveal an associated section of content.

> Index — full source of each example is one click away in `../examples/accordion--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Native button keyboard interaction (`Space` / `Enter`) with browser tab order.
- ✅ Base UI state hooks: `data-open` / `data-panel-open` plus enter/leave `data-starting-style` / `data-ending-style`.
- ✅ Exposes horizontal/vertical orientation state for styling.
- ✅ Expand a single item or multiple items at once (`multiple`).
- ✅ Can be controlled or uncontrolled.
- ✅ Cancelable `onValueChange` (root) and `onOpenChange` (item) events carry an `eventDetails` payload.
- ✅ Exposes the panel size as `--accordion-panel-height` / `--accordion-panel-width` for animations.
- ✅ Keep collapsed panels mounted (`keepMounted`) or findable by browser search (`hiddenUntilFound`).

## Import

Get started with importing the directives:

```typescript
import {
  RdxAccordionRootDirective,
  RdxAccordionItemDirective,
  RdxAccordionHeaderDirective,
  RdxAccordionTriggerDirective,
  RdxAccordionPanelDirective
} from '@radix-ng/primitives/accordion';
```

## Anatomy

```html
<div rdxAccordionRoot>
  <div rdxAccordionItem>
    <div rdxAccordionHeader>
      <button rdxAccordionTrigger></button>
    </div>
    <div rdxAccordionPanel></div>
  </div>
</div>
```

## Examples

- [Disabled](../examples/accordion--disabled.md)
- [Multiple](../examples/accordion--multiple.md)
- [Collapsible](../examples/accordion--collapsible.md)
- [Horizontal](../examples/accordion--horizontal.md)
- [Events](../examples/accordion--events.md)
- [Keep mounted](../examples/accordion--keep-mounted.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/accordion.json`
- Styling (parts + `data-*`): `references/styling-contract/accordion.json`
