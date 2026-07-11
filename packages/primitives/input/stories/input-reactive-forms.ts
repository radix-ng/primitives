import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot,
    RdxNgControlField
} from '@radix-ng/primitives/field';
import { demoInput } from '../../storybook/styles';
import { RdxInputDirective } from '../src/input.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'input-reactive-forms-example',
    imports: [
        ReactiveFormsModule,
        RdxFieldRoot,
        RdxFieldLabel,
        RdxFieldDescription,
        RdxFieldError,
        RdxNgControlField,
        RdxInputDirective
    ],
    template: `
        <div class="flex w-80 flex-col gap-2" rdxFieldRoot required>
            <label class="text-foreground text-sm font-medium" rdxFieldLabel>Email</label>
            <input
                [class]="inputClass"
                [formControl]="email"
                rdxInput
                rdxNgControlField
                type="email"
                placeholder="name@example.com"
            />
            <p class="text-muted-foreground text-sm" rdxFieldDescription>Use the email connected to your account.</p>
            <p class="text-destructive text-sm" match="required" rdxFieldError>Email is required.</p>
            <p class="text-destructive text-sm" match="email" rdxFieldError>Enter a valid email address.</p>
        </div>
    `
})
export class InputReactiveFormsExample {
    readonly email = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] });
    protected readonly inputClass = demoInput;
}
