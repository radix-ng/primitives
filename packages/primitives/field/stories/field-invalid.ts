import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxFieldControl,
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot,
    RdxFieldValidity
} from '@radix-ng/primitives/field';

import { fieldDescription, fieldError, fieldInputInvalid, fieldLabel } from './field.shared';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'field-invalid-example',
    imports: [RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldDescription, RdxFieldError, RdxFieldValidity],
    template: `
        <div class="flex w-80 flex-col gap-2" rdxFieldRoot invalid required dirty touched>
            <label [class]="labelClass" rdxFieldLabel>Workspace name</label>
            <input
                [class]="inputClass"
                rdxFieldControl
                value=""
                placeholder="acme"
                aria-errormessage="workspace-error"
            />
            <p [class]="descriptionClass" rdxFieldDescription>Use lowercase letters and hyphens.</p>
            <ng-container #validity="rdxFieldValidity" rdxFieldValidity>
                @if (validity.state().valid === false) {
                    <p id="workspace-error" [class]="errorClass" rdxFieldError>Workspace name is required.</p>
                }
            </ng-container>
        </div>
    `
})
export class FieldInvalidExample {
    protected readonly inputClass = fieldInputInvalid;
    protected readonly labelClass = fieldLabel;
    protected readonly descriptionClass = fieldDescription;
    protected readonly errorClass = fieldError;
}
