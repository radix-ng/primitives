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
        <div style="width: 250px;">
            <div
                #root="rdxEditableRoot"
                rdxEditableRoot
                placeholder="Enter text ..."
                autoResize
                value="Click to edit"
                style="flex-direction: column; display: flex; gap: 1rem;"
            >
                <div rdxEditableArea style="color: white;">
                    <span #preview="rdxEditablePreview" rdxEditablePreview style="width: 250px;">
                        {{ root.value() || preview.placeholder() }}
                    </span>
                    <input rdxEditableInput />
                </div>
                @if (!root.isEditing()) {
                    <button class="Button" rdxEditableEditTrigger>Edit</button>
                } @else {
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="Button" rdxEditableSubmitTrigger>Submit</button>
                        <button class="Button red" rdxEditableCancelTrigger>Cancel</button>
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
        Button {
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
            background-color: white;
            color: #27a65d;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            border: 1px solid;
            outline: none;
            width: max-content;
        }
        .Button:hover {
            background-color: #fafafa;
        }
        .Button:focus {
            box-shadow: 0 0 0 2px black;
        }

        .Button.red {
            background-color: var(--red-9);
            color: white;
        }
    `
})
export class Editable {}
