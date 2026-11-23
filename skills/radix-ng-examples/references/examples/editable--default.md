# Editable — Default

> One example from the [Editable](../components/editable.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

The preview above uses this standalone component. Copy the setup and shared files below as well.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxEditableArea,
    RdxEditableCancelTrigger,
    RdxEditableEditTrigger,
    RdxEditableInput,
    RdxEditablePreview,
    RdxEditableRoot,
    RdxEditableSubmitTrigger
} from '@radix-ng/primitives/editable';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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
            class="flex w-[260px] flex-col gap-3"
            #root="rdxEditableRoot"
            rdxEditableRoot
            value="Click to edit"
            placeholder="Enter text…"
            submitMode="both"
        >
            <div rdxEditableArea>
                <span
                    class="demo-editable-preview data-[placeholder-shown]:text-muted-foreground demo-focus inline-block min-h-9 w-full px-3 py-1.5"
                    #preview="rdxEditablePreview"
                    rdxEditablePreview
                >
                    {{ root.value() || preview.placeholder() }}
                </span>
                <input class="demo-input h-9 w-full px-3" rdxEditableInput aria-label="Inline value" />
            </div>

            @if (!root.isEditing()) {
                <button class="demo-button demo-button-outline h-8 px-3 text-xs" rdxEditableEditTrigger>Edit</button>
            } @else {
                <div class="flex gap-2">
                    <button class="demo-button demo-button-primary h-8 px-3 text-xs" rdxEditableSubmitTrigger>
                        Save
                    </button>
                    <button class="demo-button demo-button-ghost h-8 px-3 text-xs" rdxEditableCancelTrigger>
                        Cancel
                    </button>
                </div>
            }
        </div>
    `
})
export class EditableDefaultExample {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
