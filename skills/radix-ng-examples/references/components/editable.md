# Editable

An inline text field that swaps a read-only preview for an editable input.

> Index — full source of each example is one click away in `../examples/editable--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Can be controlled (`value`) or uncontrolled (`defaultValue`).
- ✅ Activate by focus, double-click, or a dedicated edit trigger.
- ✅ Submit on blur, `Enter`, or both; cancel on `Escape`.
- ✅ Restores focus to the preview after submit/cancel.
- ✅ Optional auto-resizing input that grows with its content.
- ✅ Headless state exposed via `data-*` attributes.

## Import

```typescript
import {
    RdxEditableRoot,
    RdxEditableArea,
    RdxEditablePreview,
    RdxEditableInput,
    RdxEditableEditTrigger,
    RdxEditableSubmitTrigger,
    RdxEditableCancelTrigger
} from '@radix-ng/primitives/editable';
```

All parts are also bundled in `RdxEditableModule`.

## Anatomy

```html
<div rdxEditableRoot>
    <div rdxEditableArea>
        <span rdxEditablePreview></span>
        <input rdxEditableInput />
    </div>

    <button rdxEditableEditTrigger></button>
    <button rdxEditableSubmitTrigger></button>
    <button rdxEditableCancelTrigger></button>
</div>
```

The `Preview` is focusable (`tabindex="0"`); the `Input` is hidden until edit mode is active. The triggers
are optional — `activationMode` and `submitMode` can drive the whole interaction without them.

## Examples

- [Double-click to edit](../examples/editable--double-click-to-edit.md)
- [Auto-resize](../examples/editable--auto-resize.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/editable.json`
- Styling (parts + `data-*`): `references/styling-contract/editable.json`
