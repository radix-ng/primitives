# Tooltip

Displays contextual information when a trigger is hovered or focused.

> Index — full source of each example is one click away in `../examples/tooltip--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Opens on hover and keyboard focus, closes on blur, pointer leave, click, or Escape.
- ✅ Configurable open `delay`, `closeDelay`, and an instant-open `timeout` window.
- ✅ A `Provider` shares delays and the instant-open window across a group of tooltips.
- ✅ Supports uncontrolled state, `defaultOpen`, and Angular two-way binding with `[(open)]`.
- ✅ Supports multiple and detached triggers through a `Handle`.
- ✅ Can follow the cursor with `trackCursorAxis`.
- ✅ Positions content with the shared Floating UI-based Popper, with an optional custom `anchor`.
- ✅ Exposes `data-open`, `data-closed`, `data-side`, `data-align`, and a `data-instant` reason (`delay` / `dismiss` / `focus` / `tracking-cursor`) for styling.
- ✅ Keeps portal content mounted while CSS exit keyframes finish.

## Import

```typescript
import {
    RdxTooltip,
    RdxTooltipArrow,
    RdxTooltipPopup,
    RdxTooltipPortal,
    RdxTooltipPositioner,
    RdxTooltipProvider,
    RdxTooltipTrigger
} from '@radix-ng/primitives/tooltip';
```

Or import all parts through the array:

```typescript
import { tooltipImports } from '@radix-ng/primitives/tooltip';
```

## Anatomy

Apply the parts to your own markup. `rdxTooltipPortal` is a **structural** directive: it teleports its
content into `document.body` while the tooltip is open and keeps it mounted until any closed-state CSS
exit keyframes on its root element finish. Use the `*` microsyntax on the positioner (or the explicit
`<ng-template rdxTooltipPortal>` form with `[container]` for a custom portal target):

```html
<ng-container rdxTooltip>
    <button rdxTooltipTrigger>+</button>

    <div *rdxTooltipPortal sideOffset="8" rdxTooltipPositioner>
        <div rdxTooltipPopup>Add to library</div>
        <span rdxTooltipArrow></span>
    </div>
</ng-container>
```

`rdxTooltipPositioner` owns positioning and exposes `data-side` / `data-align` plus the `--anchor-*`,
`--available-*`, and `--transform-origin` CSS variables. `rdxTooltipPopup` carries `role="tooltip"`.

## Examples

- [Default](../examples/tooltip--default.md)
- [Provider](../examples/tooltip--provider.md)
- [Per-trigger delay](../examples/tooltip--per-trigger-delay.md)
- [Disabled trigger](../examples/tooltip--disabled-trigger.md)
- [Tracking the cursor](../examples/tooltip--tracking-the-cursor.md)
- [Moving anchors](../examples/tooltip--moving-anchors.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/tooltip.json`
- Styling (parts + `data-*`): `references/styling-contract/tooltip.json`
