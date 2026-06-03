import { cn, demoButton, demoEditable } from '../../storybook/styles';
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
            #root="rdxEditableRoot"
            rdxEditableRoot
            value="Double-click to edit"
            placeholder="Enter text…"
            activationMode="dblclick"
            submitMode="both"
            [class]="e.root"
        >
            <div rdxEditableArea>
                <span #preview="rdxEditablePreview" rdxEditablePreview [class]="e.preview">
                    {{ root.value() || preview.placeholder() }}
                </span>
                <input rdxEditableInput aria-label="Inline value" [class]="e.input" />
            </div>

            @if (root.isEditing()) {
                <div [class]="e.controls">
                    <button rdxEditableSubmitTrigger [class]="cn(b.base, b.primary, b.size.sm)">Save</button>
                    <button rdxEditableCancelTrigger [class]="cn(b.base, b.ghost, b.size.sm)">Cancel</button>
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
