# Editable — Double-click to edit

> One example from the [Editable](../components/editable.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

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
            class="flex w-[260px] flex-col gap-3"
            #root="rdxEditableRoot"
            rdxEditableRoot
            value="Double-click to edit"
            placeholder="Enter text…"
            activationMode="dblclick"
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

            @if (root.isEditing()) {
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
export class EditableDoubleClickExample {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
