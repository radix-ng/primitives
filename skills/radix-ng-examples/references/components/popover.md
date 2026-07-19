# Popover

An accessible popup anchored to a button.

> Index — full source of each example is one click away in `../examples/popover--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Opens and closes from a native button trigger.
- ✅ Supports uncontrolled state, `defaultOpen`, and Angular two-way binding with `[(open)]`.
- ✅ Controls the active trigger externally with `[(triggerId)]` and `defaultTriggerId`.
- ✅ Positions content with the shared Floating UI-based Popper primitive.
- ✅ Supports a custom positioning anchor independently from the trigger.
- ✅ Connects detached roots and multiple triggers through a shared handle.
- ✅ Opens on hover with configurable per-trigger open and close delays.
- ✅ Keeps hover-opened content interactive with a polygon grace area, including nested popup content.
- ✅ Exposes pressed state on triggers for press interactions.
- ✅ Animates content changes between triggers with an optional viewport.
- ✅ Exposes transition lifecycle attributes and `onOpenChangeComplete` for CSS animations.
- ✅ Supports non-modal, modal, and focus-trapping-only behavior.
- ✅ Closes on Escape, outside pointer interaction, or an explicit close button.
- ✅ Controls initial and final focus through the shared Floating Focus Manager behavior.
- ✅ Exposes state, transition, placement, and anchor measurement attributes and CSS variables for styling.
- ✅ Keeps portal content mounted while CSS exit keyframes finish.
- ✅ Links the popup to optional title and description parts for accessible labeling.

## Import

```typescript
import {
    createRdxPopoverHandle,
    RdxPopoverArrow,
    RdxPopoverBackdrop,
    RdxPopoverClose,
    RdxPopoverDescription,
    RdxPopoverPopup,
    RdxPopoverPortal,
    RdxPopoverPositioner,
    RdxPopoverRoot,
    RdxPopoverTitle,
    RdxPopoverTrigger,
    RdxPopoverViewport
} from '@radix-ng/primitives/popover';
```

Or import all parts through the module:

```typescript
import { RdxPopoverModule } from '@radix-ng/primitives/popover';
```

## Anatomy

Apply the parts to your own markup. `rdxPopoverPortal` is a **structural** directive: it teleports
its content into `document.body` while the popover is open and keeps it mounted until the closed-state
CSS exit keyframes on its root element finish.

Use the `*` microsyntax on the positioner for the common single-root case:

```html
<ng-container rdxPopoverRoot>
    <button rdxPopoverTrigger>Open</button>

    <div *rdxPopoverPortal sideOffset="8" rdxPopoverPositioner>
        <div rdxPopoverPopup>
            <span rdxPopoverArrow></span>
            <div rdxPopoverViewport>
                <div>
                    <h2 rdxPopoverTitle>Notifications</h2>
                    <p rdxPopoverDescription>You are all caught up.</p>
                    <button rdxPopoverClose>Close</button>
                </div>
            </div>
        </div>
    </div>
</ng-container>
```

When the content has more than one root node — for example an optional `rdxPopoverBackdrop` next to
the positioner — use the explicit `<ng-template rdxPopoverPortal>` form (and the same form with
`[container]` for a custom portal target):

```html
<ng-template rdxPopoverPortal>
    <div rdxPopoverBackdrop></div>
    <div sideOffset="8" rdxPopoverPositioner>
        <div rdxPopoverPopup>…</div>
    </div>
</ng-template>
```

## Examples

- [Default](../examples/popover--default.md)
- [Controlled](../examples/popover--controlled.md)
- [Controlled mode with multiple triggers](../examples/popover--controlled-mode-with-multiple-triggers.md)
- [Positioning](../examples/popover--positioning.md)
- [Animation](../examples/popover--animation.md)
- [Modal behavior](../examples/popover--modal-behavior.md)
- [Custom anchor](../examples/popover--custom-anchor.md)
- [Detached handles](../examples/popover--detached-handles.md)
- [Opening on hover](../examples/popover--opening-on-hover.md)
- [Animating between triggers](../examples/popover--animating-between-triggers.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/popover.json`
- Styling (parts + `data-*`): `references/styling-contract/popover.json`
