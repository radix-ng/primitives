# Editable

#### An inline text field that swaps a read-only preview for an editable input.

```typescript
import { Component } from '@angular/core';
import {
    RdxEditableArea,
    RdxEditableCancelTrigger,
    RdxEditableEditTrigger,
    RdxEditableInput,
    RdxEditablePreview,
    RdxEditableRoot,
    RdxEditableSubmitTrigger
} from '@radix-ng/primitives/editable';
import { cn, demoButton, demoEditable } from '../../storybook/styles';

@Component({
    selector: 'editable-default-example',
    imports: [
        RdxEditableRoot,
        RdxEditableArea,
        RdxEditablePreview,
        RdxEditableInput,
        RdxEditableEditTrigger,
        RdxEditableSubmitTrigger,
        RdxEditableCancelTrigger
    ],
    template: `
        <div
            #root="rdxEditableRoot"
            [class]="e.root"
            rdxEditableRoot
            value="Click to edit"
            placeholder="Enter text…"
            submitMode="both"
        >
            <div rdxEditableArea>
                <span #preview="rdxEditablePreview" [class]="e.preview" rdxEditablePreview>
                    {{ root.value() || preview.placeholder() }}
                </span>
                <input [class]="e.input" rdxEditableInput aria-label="Inline value" />
            </div>

            @if (!root.isEditing()) {
                <button [class]="cn(b.base, b.outline, b.size.sm)" rdxEditableEditTrigger>Edit</button>
            } @else {
                <div [class]="e.controls">
                    <button [class]="cn(b.base, b.primary, b.size.sm)" rdxEditableSubmitTrigger>Save</button>
                    <button [class]="cn(b.base, b.ghost, b.size.sm)" rdxEditableCancelTrigger>Cancel</button>
                </div>
            }
        </div>
    `
})
export class EditableDefaultExample {
    protected readonly cn = cn;
    protected readonly e = demoEditable;
    protected readonly b = demoButton;
}
```

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

### Double-click to edit

Set `activationMode="dblclick"` so the preview only enters edit mode on double-click instead of on focus.

```typescript
import { Component } from '@angular/core';
import {
    RdxEditableArea,
    RdxEditableCancelTrigger,
    RdxEditableInput,
    RdxEditablePreview,
    RdxEditableRoot,
    RdxEditableSubmitTrigger
} from '@radix-ng/primitives/editable';
import { cn, demoButton, demoEditable } from '../../storybook/styles';

@Component({
    selector: 'editable-double-click-example',
    imports: [
        RdxEditableRoot,
        RdxEditableArea,
        RdxEditablePreview,
        RdxEditableInput,
        RdxEditableSubmitTrigger,
        RdxEditableCancelTrigger
    ],
    template: `
        <div
            #root="rdxEditableRoot"
            [class]="e.root"
            rdxEditableRoot
            value="Double-click to edit"
            placeholder="Enter text…"
            activationMode="dblclick"
            submitMode="both"
        >
            <div rdxEditableArea>
                <span #preview="rdxEditablePreview" [class]="e.preview" rdxEditablePreview>
                    {{ root.value() || preview.placeholder() }}
                </span>
                <input [class]="e.input" rdxEditableInput aria-label="Inline value" />
            </div>

            @if (root.isEditing()) {
                <div [class]="e.controls">
                    <button [class]="cn(b.base, b.primary, b.size.sm)" rdxEditableSubmitTrigger>Save</button>
                    <button [class]="cn(b.base, b.ghost, b.size.sm)" rdxEditableCancelTrigger>Cancel</button>
                </div>
            }
        </div>
    `
})
export class EditableDoubleClickExample {
    protected readonly cn = cn;
    protected readonly e = demoEditable;
    protected readonly b = demoButton;
}
```

### Auto-resize

With `autoResize`, the preview and input overlay in a single grid cell, so the field grows to fit its
content. The parts carry `[data-auto-resize]` for styling.

```typescript
import { Component } from '@angular/core';
import { RdxEditableArea, RdxEditableInput, RdxEditablePreview, RdxEditableRoot } from '@radix-ng/primitives/editable';

@Component({
    selector: 'editable-auto-resize-example',
    imports: [RdxEditableRoot, RdxEditableArea, RdxEditablePreview, RdxEditableInput],
    template: `
        <div
            #root="rdxEditableRoot"
            rdxEditableRoot
            value="Type to grow"
            placeholder="Enter text…"
            autoResize
            submitMode="both"
        >
            <div [class]="area" rdxEditableArea>
                <span #preview="rdxEditablePreview" rdxEditablePreview>
                    {{ root.value() || preview.placeholder() }}
                </span>
                <input rdxEditableInput aria-label="Inline value" />
            </div>
        </div>
    `
})
export class EditableAutoResizeExample {
    // Auto-resize strips the input's native chrome, so the frame lives on the area.
    protected readonly area = [
        'rounded-md border border-border px-3 py-1.5 text-sm text-foreground',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background'
    ].join(' ');
}
```

## API Reference

### Root

`RdxEditableRoot`

| Data attribute             | Present on        | Value                              |
| -------------------------- | ----------------- | ---------------------------------- |
| `[data-placeholder-shown]` | Area, Preview     | When not editing.                  |
| `[data-focus]`             | Area              | While editing.                     |
| `[data-empty]`             | Area              | When the value is empty.           |
| `[data-disabled]`          | Area, Input       | When disabled.                     |
| `[data-readonly]`          | Area, Input       | When read-only.                    |
| `[data-auto-resize]`       | Area, Preview, Input | When `autoResize` is enabled.   |

### Area / Preview

`RdxEditableArea`, `RdxEditablePreview` — read everything from context; no inputs. The preview is the
focusable label that swaps to the input.

### Input

`RdxEditableInput` — the text field. Accepts `aria-label` (defaults to `"editable input"`); all other
state (value, disabled, readonly, required, maxlength) comes from the root.

### Triggers

`RdxEditableEditTrigger`, `RdxEditableSubmitTrigger`, `RdxEditableCancelTrigger` — `<button>` parts that
call `edit` / `submit` / `cancel`. Each accepts `aria-label` (defaults to `"edit"` / `"submit"` /
`"cancel"`).

## Accessibility

### Keyboard Interactions

| Key      | Description                                          |
| -------- | --------------------------------------------------- |
| `Enter`  | Submits when `submitMode` is `enter` or `both`.     |
| `Escape` | Cancels the edit and restores the previous value.   |
