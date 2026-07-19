# Editable — Double-click to edit

> One example from the [Editable](../components/editable.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Set `activationMode="dblclick"` so the preview only enters edit mode on double-click instead of on focus.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
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
    changeDetection: ChangeDetectionStrategy.Eager,
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
