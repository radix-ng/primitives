import { Component } from '@angular/core';
import { RdxFieldControl } from '../src/field-control';
import { RdxFieldDescription } from '../src/field-description';
import { RdxFieldError } from '../src/field-error';
import { RdxFieldLabel } from '../src/field-label';
import { RdxFieldRoot } from '../src/field-root';
import { fieldDescription, fieldError, fieldInputInvalid, fieldLabel } from './field.shared';

@Component({
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
