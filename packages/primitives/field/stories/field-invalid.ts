import { RdxFieldControl } from '../src/field-control';
import { RdxFieldDescription } from '../src/field-description';
import { RdxFieldError } from '../src/field-error';
import { RdxFieldLabel } from '../src/field-label';
import { RdxFieldRoot } from '../src/field-root';
import { fieldDescription, fieldError, fieldInputInvalid, fieldLabel } from './field.shared';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'field-invalid-example',
    imports: [RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldDescription, RdxFieldError],
    template: `
        <div class="flex w-80 flex-col gap-2" rdxFieldRoot invalid required dirty touched>
            <label rdxFieldLabel [class]="labelClass">Workspace name</label>
            <input
                rdxFieldControl
                value=""
                placeholder="acme"
                aria-errormessage="workspace-error"
                [class]="inputClass"
            />
            <p rdxFieldDescription [class]="descriptionClass">Use lowercase letters and hyphens.</p>
            <p id="workspace-error" rdxFieldError [class]="errorClass">Workspace name is required.</p>
        </div>
    `
})
export class FieldInvalidExample {
    protected readonly inputClass = fieldInputInvalid;
    protected readonly labelClass = fieldLabel;
    protected readonly descriptionClass = fieldDescription;
    protected readonly errorClass = fieldError;
}
