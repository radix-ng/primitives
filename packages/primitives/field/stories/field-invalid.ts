import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxFieldControl,
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot
} from '@radix-ng/primitives/field';

import { fieldDescription, fieldError, fieldInputInvalid, fieldLabel } from './field.shared';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'field-invalid-example',
    imports: [RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldDescription, RdxFieldError],
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
            <p id="workspace-error" [class]="errorClass" rdxFieldError>Workspace name is required.</p>
        </div>
    `
})
export class FieldInvalidExample {
    protected readonly inputClass = fieldInputInvalid;
    protected readonly labelClass = fieldLabel;
    protected readonly descriptionClass = fieldDescription;
    protected readonly errorClass = fieldError;
}
