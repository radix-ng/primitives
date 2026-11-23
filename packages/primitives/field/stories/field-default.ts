import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxFieldControl,
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot
} from '@radix-ng/primitives/field';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'field-default-example',
    imports: [RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldDescription, RdxFieldError],
    template: `
        <div class="flex w-64 max-w-full flex-col items-start gap-1" rdxFieldRoot required>
            <label class="text-foreground text-sm font-bold" rdxFieldLabel>Email</label>
            <input
                class="demo-input h-8 self-stretch px-2"
                rdxFieldControl
                type="email"
                placeholder="name@example.com"
            />
            <p class="text-muted-foreground text-sm" rdxFieldDescription>Used for account notifications.</p>
            <p class="text-destructive text-sm" rdxFieldError>Enter a valid email address.</p>
        </div>
    `
})
export class FieldDefaultExample {}
