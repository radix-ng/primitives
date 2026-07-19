# Alert Dialog

A modal dialog that interrupts the user with important content and expects a response.

> Index — full source of each example is one click away in `../examples/alert-dialog--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Always modal: document scrolling is locked and outside pointer events are disabled.
- ✅ Does not close on outside interaction — requires an explicit choice; Escape still closes.
- ✅ Renders the popup with `role="alertdialog"` for assertive screen-reader semantics.
- ✅ Supports uncontrolled state, `defaultOpen`, and Angular two-way binding with `[(open)]`.
- ✅ Supports multiple triggers, controlled `triggerId`, and detached triggers through a shared handle.
- ✅ Traps and restores focus; links the popup to title and description for accessible labeling.

## Import

```typescript
import {
    alertDialogImports,
    createRdxAlertDialogHandle,
    RdxAlertDialogBackdrop,
    RdxAlertDialogClose,
    RdxAlertDialogDescription,
    RdxAlertDialogPopup,
    RdxAlertDialogPortal,
    RdxAlertDialogRoot,
    RdxAlertDialogTitle,
    RdxAlertDialogTrigger
} from '@radix-ng/primitives/alert-dialog';
```

Or import all parts through the module:

```typescript
import { RdxAlertDialogModule } from '@radix-ng/primitives/alert-dialog';
```

## Anatomy

```html
<div rdxAlertDialogRoot>
    <button rdxAlertDialogTrigger>Delete</button>

    <ng-template rdxAlertDialogPortal>
        <div rdxAlertDialogBackdrop></div>
        <div rdxAlertDialogPopup>
            <h2 rdxAlertDialogTitle>Are you sure?</h2>
            <p rdxAlertDialogDescription>This action cannot be undone.</p>
            <button rdxAlertDialogClose>Cancel</button>
            <button rdxAlertDialogClose>Confirm</button>
        </div>
    </ng-template>
</div>
```

## Examples

- [Default](../examples/alert-dialog--default.md)
- [Controlled](../examples/alert-dialog--controlled.md)
- [Multiple triggers](../examples/alert-dialog--multiple-triggers.md)
- [Controlled mode with multiple triggers](../examples/alert-dialog--controlled-mode-with-multiple-triggers.md)
- [Detached triggers](../examples/alert-dialog--detached-triggers.md)
- [Close confirmation](../examples/alert-dialog--close-confirmation.md)
- [Open from a menu](../examples/alert-dialog--open-from-a-menu.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/alert-dialog.json`
- Styling (parts + `data-*`): `references/styling-contract/alert-dialog.json`
