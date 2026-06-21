import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { email as emailFormat, form, FormField, required } from '@angular/forms/signals';
import {
    RdxFieldControl,
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot
} from '@radix-ng/primitives/field';
import { RdxFormRoot } from '@radix-ng/primitives/form';
import { cn, demoButton, demoInput } from '../../storybook/styles';
import { RdxSignalField } from '../src/signal-field';
import { RdxSignalForm } from '../src/signal-form';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'signal-forms-field-example',
    imports: [
        FormField,
        RdxFormRoot,
        RdxSignalForm,
        RdxFieldRoot,
        RdxSignalField,
        RdxFieldLabel,
        RdxFieldControl,
        RdxFieldDescription,
        RdxFieldError
    ],
    template: `
        <form class="flex w-80 flex-col gap-3" [rdxSignalForm]="loginForm" (submit)="onSubmit($event)" rdxFormRoot>
            <!--
              No manual [invalid]/[touched]/[dirty]/[disabled] on rdxFieldRoot — rdxSignalField drives them
              from the Signal Forms field, and the field expression is bound exactly once (on [formField]).
            -->
            <div class="flex flex-col gap-2" rdxFieldRoot required>
                <label [class]="labelClass" rdxFieldLabel>Email</label>
                <input [class]="inputClass" [formField]="email" rdxFieldControl rdxSignalField type="email" />
                <p [class]="descriptionClass" rdxFieldDescription>Use the email connected to your account.</p>
                <p #err="rdxFieldError" [class]="errorClass" rdxFieldError>{{ err.messages().join(' ') }}</p>
            </div>

            <button [class]="buttonClass" type="submit">Submit</button>
        </form>
    `
})
export class SignalFormsFieldExample {
    protected readonly inputClass = cn(
        demoInput,
        'data-[invalid]:border-destructive data-[invalid]:ring-destructive/20'
    );
    protected readonly buttonClass = cn(demoButton.base, demoButton.primary, demoButton.size.md, 'self-start');
    protected readonly labelClass = 'text-foreground text-sm font-medium data-[disabled]:opacity-50';
    protected readonly descriptionClass = 'text-muted-foreground text-sm';
    protected readonly errorClass = 'text-destructive text-sm';

    readonly model = signal({ email: '' });
    readonly loginForm = form(this.model, (path) => {
        required(path.email, { message: 'Email is required.' });
        emailFormat(path.email, { message: 'Enter a valid email address.' });
    });

    get email() {
        return this.loginForm.email;
    }

    onSubmit(event: Event): void {
        event.preventDefault();
        console.log(this.model());
    }
}
