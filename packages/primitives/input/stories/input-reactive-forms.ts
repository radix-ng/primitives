import { demoInput } from '../../storybook/styles';
import { RdxInputDirective } from '../src/input.directive';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RdxFieldDescription, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'input-reactive-forms-example',
    imports: [ReactiveFormsModule, RdxFieldRoot, RdxFieldLabel, RdxFieldDescription, RdxFieldError, RdxInputDirective],
    template: `
        <div
            class="flex w-80 flex-col gap-2"
            rdxFieldRoot
            required
            [invalid]="email.invalid && (email.dirty || email.touched)"
            [dirty]="email.dirty"
            [touched]="email.touched"
        >
            <label class="text-foreground text-sm font-medium" rdxFieldLabel>Email</label>
            <input rdxInput type="email" placeholder="name@example.com" [class]="inputClass" [formControl]="email" />
            <p class="text-muted-foreground text-sm" rdxFieldDescription>Use the email connected to your account.</p>
            <p class="text-destructive text-sm" rdxFieldError>Email must be valid.</p>
        </div>
    `
})
export class InputReactiveFormsExample {
    readonly email = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] });
    protected readonly inputClass = demoInput;
}
