import { Component } from '@angular/core';
import { RdxVisuallyHiddenInputDirective } from '@radix-ng/primitives/visually-hidden';
import { RdxEditableArea } from '../src/editable-area';
import { RdxEditableCancelTrigger } from '../src/editable-cancel-trigger';
import { RdxEditableEditTrigger } from '../src/editable-edit-trigger';
import { RdxEditableInput } from '../src/editable-input';
import { RdxEditablePreview } from '../src/editable-preview';
import { RdxEditableRoot } from '../src/editable-root';
import { RdxEditableSubmitTrigger } from '../src/editable-submit-trigger';

@Component({
    selector: 'story-editable',
    imports: [
        RdxEditableRoot,
        RdxEditableEditTrigger,
        RdxEditableSubmitTrigger,
        RdxEditablePreview,
        RdxEditableCancelTrigger,
        RdxEditableInput,
        RdxEditableArea,
        RdxVisuallyHiddenInputDirective
    ],
    template: `
        <div class="w-[250px]">
            <div
                class="flex flex-col gap-4"
                #root="rdxEditableRoot"
                rdxEditableRoot
                placeholder="Enter text ..."
                autoResize
                value="Click to edit"
            >
                <div class="text-foreground" rdxEditableArea>
                    <span class="inline-block w-[250px]" #preview="rdxEditablePreview" rdxEditablePreview>
                        {{ root.value() || preview.placeholder() }}
                    </span>
                    <input rdxEditableInput />
                </div>
                @if (!root.isEditing()) {
                    <button class="Button" rdxEditableEditTrigger type="button">Edit</button>
                } @else {
                    <div class="flex gap-2">
                        <button class="Button" rdxEditableSubmitTrigger type="button">Submit</button>
                        <button class="Button red" rdxEditableCancelTrigger type="button">Cancel</button>
                    </div>
                }
                <input
                    [value]="root.value()"
                    [disabled]="root.disabled()"
                    [required]="root.required()"
                    rdxVisuallyHiddenInput
                    type="text"
                />
            </div>
        </div>
    `,
    styles: `
        button {
            all: unset;
        }
        .Button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 0.5rem;
            font-weight: 500;
            font-size: 0.875rem;
            padding-left: 15px;
            padding-right: 15px;
            line-height: 35px;
            height: 35px;
            background-color: var(--background);
            color: var(--foreground);
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            border: 1px solid var(--border);
            outline: none;
            width: max-content;
        }
        .Button:hover {
            background-color: var(--muted);
        }
        .Button:focus {
            box-shadow: 0 0 0 2px var(--ring);
        }

        .Button.red {
            background-color: var(--primary);
            color: var(--primary-foreground);
        }
    `
})
export class Editable {}
