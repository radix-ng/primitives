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
import { cn, demoButton, demoEditable } from '../../storybook/styles';

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
