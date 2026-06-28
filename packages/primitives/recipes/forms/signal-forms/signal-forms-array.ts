import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { applyEach, email as emailFormat, form, FormField, required } from '@angular/forms/signals';
import { LucidePlus, LucideX } from '@lucide/angular';
import { RdxFieldControl, RdxFieldError, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormRoot } from '@radix-ng/primitives/form';
import { RdxSignalField } from '@radix-ng/primitives/signal-forms';
import {
    cn,
    recipeDescription,
    recipeError,
    recipeField,
    recipeForm,
    recipeGhostButton,
    recipeInput,
    recipeLabel,
    recipeReset,
    recipeSubmit
} from '../forms-recipes.shared';

type Contacts = { emails: { address: string }[] };

const MAX_EMAILS = 5;

/**
 * Dynamic **array fields** with Signal Forms: add up to five email addresses,
 * remove individual rows, and validate each entry independently. `applyEach`
 * applies the per-item schema; mutating the model signal reshapes the field tree.
 * Each row's control gets `rdxSignalField`, so errors surface automatically after the row
 * is touched or the form is submitted (`rdxFormRoot`'s default `validationMode="onBlur"` +
 * submit-attempt blocking — no `markAsTouched()` in the handler).
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'signal-forms-array',
    imports: [
        FormField,
        RdxFormRoot,
        RdxSignalField,
        RdxFieldRoot,
        RdxFieldControl,
        RdxFieldError,
        LucidePlus,
        LucideX
    ],
    template: `
        <form [class]="form0" (onFormSubmit)="onSubmit()" rdxFormRoot>
            <div class="flex flex-col gap-1">
                <span [class]="label">Email addresses</span>
                <p [class]="description">Add up to {{ max }} email addresses where we can contact you.</p>
            </div>

            @for (entry of model().emails; track index; let index = $index) {
                <div [class]="field" [name]="fieldName(index)" rdxFieldRoot>
                    <div class="flex items-center gap-2">
                        <input
                            [class]="input"
                            [formField]="contactsForm.emails[index].address"
                            rdxFieldControl
                            rdxSignalField
                            type="email"
                            placeholder="name@example.com"
                            autocomplete="off"
                        />
                        @if (model().emails.length > 1) {
                            <button
                                [class]="ghost"
                                [attr.aria-label]="'Remove email ' + (index + 1)"
                                (click)="removeEmail(index)"
                                type="button"
                            >
                                <svg lucideX size="16"></svg>
                            </button>
                        }
                    </div>
                    <p #emailError="rdxFieldError" [class]="error" rdxFieldError>
                        {{ emailError.messages().join(' ') }}
                    </p>
                </div>
            }

            <button [class]="addButton" [disabled]="model().emails.length >= max" (click)="addEmail()" type="button">
                <svg lucidePlus size="16"></svg>
                Add email address
            </button>

            <button [class]="submit" type="submit">Save contacts</button>

            @if (result()) {
                <p [class]="description">Saved {{ result()!.emails.length }} address(es).</p>
            }
        </form>
    `
})
export class SignalFormsArray {
    protected readonly form0 = recipeForm;
    protected readonly field = recipeField;
    protected readonly label = recipeLabel;
    protected readonly input = recipeInput;
    protected readonly description = recipeDescription;
    protected readonly error = recipeError;
    protected readonly submit = recipeSubmit;
    protected readonly ghost = recipeGhostButton;
    protected readonly addButton = cn(recipeReset, 'self-start gap-2');
    protected readonly max = MAX_EMAILS;

    protected readonly result = signal<Contacts | null>(null);

    protected readonly model = signal<Contacts>({ emails: [{ address: '' }] });
    protected readonly contactsForm = form(this.model, (path) => {
        applyEach(path.emails, (item) => {
            required(item.address, { message: 'Email is required.' });
            emailFormat(item.address, { message: 'Enter a valid email address.' });
        });
    });

    protected fieldName(index: number): string {
        return `emails.${index}.address`;
    }

    protected addEmail(): void {
        this.model.update((current) => ({ emails: [...current.emails, { address: '' }] }));
    }

    protected removeEmail(index: number): void {
        this.model.update((current) => ({ emails: current.emails.filter((_, i) => i !== index) }));
    }

    // `rdxFormRoot` blocks an invalid submit and reveals the errors itself — this only runs when valid.
    protected onSubmit(): void {
        this.result.set(this.model());
    }
}
