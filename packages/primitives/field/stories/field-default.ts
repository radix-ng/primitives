import { RdxFieldControl } from '../src/field-control';
import { RdxFieldDescription } from '../src/field-description';
import { RdxFieldError } from '../src/field-error';
import { RdxFieldLabel } from '../src/field-label';
import { RdxFieldRoot } from '../src/field-root';
import { fieldDescription, fieldError, fieldLabel } from './field.shared';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'field-default-example',
    imports: [RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldDescription, RdxFieldError],
    template: `
        <div class="flex w-80 flex-col gap-2" rdxFieldRoot required>
            <label rdxFieldLabel [class]="labelClass">Email</label>
            <input rdxFieldControl type="email" placeholder="name@example.com" [class]="inputClass" />
            <p rdxFieldDescription [class]="descriptionClass">Used for account notifications.</p>
            <p rdxFieldError [class]="errorClass">Enter a valid email address.</p>
        </div>
    `
})
export class FieldDefaultExample {
    protected readonly inputClass =
        'border-border bg-background text-foreground placeholder:text-muted-foreground h-9 w-full rounded-md border px-3 text-sm outline-none';
    protected readonly labelClass = fieldLabel;
    protected readonly descriptionClass = fieldDescription;
    protected readonly errorClass = fieldError;
}
