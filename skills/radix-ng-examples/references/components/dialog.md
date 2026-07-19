# Dialog

A window overlaid on the page, rendering the content underneath inert.

> Index — full source of each example is one click away in `../examples/dialog--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Opens and closes from a native button trigger.
- ✅ Supports uncontrolled state, `defaultOpen`, and Angular two-way binding with `[(open)]`.
- ✅ Supports modal, non-modal, and focus-trapping-only behavior.
- ✅ Locks document scrolling and disables outside pointer events while modal.
- ✅ Closes on Escape, outside pointer interaction, or an explicit close button.
- ✅ Keeps the dialog open on outside clicks with `disablePointerDismissal`.
- ✅ Traps and restores focus through the shared Focus Scope behavior.
- ✅ Exposes state and transition attributes (`data-open`, `data-closed`, `data-starting-style`, `data-ending-style`) for styling.
- ✅ Keeps portal content mounted while CSS exit keyframes finish.
- ✅ Links the popup to optional title and description parts for accessible labeling.
- ✅ Supports multiple triggers, controlled `triggerId`, and detached triggers through a shared handle.
- ✅ Supports nested dialogs with `data-nested` / `data-nested-dialog-open` styling hooks.
- ✅ Provides an optional scrollable `Viewport` for outside-scroll dialogs.

## Import

```typescript
import {
    createRdxDialogHandle,
    RdxDialogBackdrop,
    RdxDialogClose,
    RdxDialogDescription,
    RdxDialogPopup,
    RdxDialogPortal,
    RdxDialogRoot,
    RdxDialogTitle,
    RdxDialogTrigger,
    RdxDialogViewport
} from '@radix-ng/primitives/dialog';
```

Or import all parts through the module:

```typescript
import { RdxDialogModule } from '@radix-ng/primitives/dialog';
```

The `dialogImports` array re-exports every part for standalone `imports`.

## Anatomy

Apply the parts to your own markup. `rdxDialogPortal` is a **structural** directive: it teleports the
backdrop and popup into `document.body` while the dialog is open and keeps them mounted until the
closed-state CSS exit keyframes on every root element finish. Because the dialog has two root nodes
(backdrop + popup), use the explicit `<ng-template rdxDialogPortal>` form (pass `[container]` for a
custom portal target).

```html
<div rdxDialogRoot>
    <button rdxDialogTrigger>Open</button>

    <ng-template rdxDialogPortal>
        <div rdxDialogBackdrop></div>
        <div rdxDialogPopup>
            <h2 rdxDialogTitle>Edit profile</h2>
            <p rdxDialogDescription>Make changes to your profile.</p>
            <button rdxDialogClose>Close</button>
        </div>
    </ng-template>
</div>
```

## Examples

- [Default](../examples/dialog--default.md)
- [Controlled](../examples/dialog--controlled.md)
- [Non-modal](../examples/dialog--non-modal.md)
- [Trap focus only](../examples/dialog--trap-focus-only.md)
- [Without pointer dismissal](../examples/dialog--without-pointer-dismissal.md)
- [Multiple triggers](../examples/dialog--multiple-triggers.md)
- [Controlled mode with multiple triggers](../examples/dialog--controlled-mode-with-multiple-triggers.md)
- [Detached triggers](../examples/dialog--detached-triggers.md)
- [Nested dialogs](../examples/dialog--nested-dialogs.md)
- [Close confirmation](../examples/dialog--close-confirmation.md)
- [Outside scroll](../examples/dialog--outside-scroll.md)
- [Inside scroll](../examples/dialog--inside-scroll.md)
- [Placing elements outside the popup](../examples/dialog--placing-elements-outside-the-popup.md)
- [Open from a menu](../examples/dialog--open-from-a-menu.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/dialog.json`
- Styling (parts + `data-*`): `references/styling-contract/dialog.json`
