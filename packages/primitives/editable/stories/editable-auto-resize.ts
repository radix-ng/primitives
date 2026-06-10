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
