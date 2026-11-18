import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxFieldControl,
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot
} from '@radix-ng/primitives/field';

import { fieldDescription, fieldError, fieldLabel } from './field.shared';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'field-default-example',
    imports: [RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldDescription, RdxFieldError],
    template: `
        <div class="flex w-80 flex-col gap-2" rdxFieldRoot required>
            <label [class]="labelClass" rdxFieldLabel>Email</label>
            <input
                class="border-border bg-background text-foreground placeholder:text-muted-foreground h-9 w-full rounded-md border px-3 text-sm outline-none"
                rdxFieldControl
                type="email"
                placeholder="name@example.com"
            />
            <p [class]="descriptionClass" rdxFieldDescription>Used for account notifications.</p>
            <p [class]="errorClass" rdxFieldError>Enter a valid email address.</p>
        </div>
    `
})
export class FieldDefaultExample {
    protected readonly labelClass = fieldLabel;
    protected readonly descriptionClass = fieldDescription;
    protected readonly errorClass = fieldError;
}
