import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxFieldDescription, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { demoInput } from '../../storybook/styles';
import { RdxInputDirective } from '../src/input.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'input-field-example',
    imports: [RdxFieldRoot, RdxFieldLabel, RdxFieldDescription, RdxFieldError, RdxInputDirective],
    template: `
        <div class="flex w-80 flex-col gap-2" rdxFieldRoot required>
            <label class="text-foreground text-sm font-medium" rdxFieldLabel>Email</label>
            <input [class]="inputClass" rdxInput type="email" placeholder="name@example.com" />
            <p class="text-muted-foreground text-sm" rdxFieldDescription>Used for account notifications.</p>
            <p class="text-destructive text-sm" rdxFieldError>Enter a valid email address.</p>
        </div>
    `
})
export class InputFieldExample {
    protected readonly inputClass = demoInput;
}
