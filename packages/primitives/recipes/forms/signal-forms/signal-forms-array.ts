import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { applyEach, email as emailFormat, form, FormField, required } from '@angular/forms/signals';
import { LucidePlus, LucideX } from '@lucide/angular';
import { RdxFieldControl, RdxFieldError, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormRoot } from '@radix-ng/primitives/form';
import { RdxSignalField } from '@radix-ng/primitives/signal-forms';

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
        <form class="flex w-100 flex-col gap-5" (onFormSubmit)="onSubmit()" rdxFormRoot>
            <div class="flex flex-col gap-1">
                <span class="demo-label data-[disabled]:opacity-50">Email addresses</span>
                <p class="text-muted-foreground text-sm">
                    Add up to {{ max }} email addresses where we can contact you.
                </p>
            </div>

            @for (entry of model().emails; track index; let index = $index) {
                <div class="flex flex-col gap-1.5" [name]="fieldName(index)" rdxFieldRoot>
                    <div class="flex items-center gap-2">
                        <input
                            class="demo-input data-[invalid]:border-destructive data-[invalid]:ring-destructive/30 h-9 w-full px-3"
                            [formField]="contactsForm.emails[index].address"
                            rdxFieldControl
                            rdxSignalField
                            type="email"
                            placeholder="name@example.com"
                            autocomplete="off"
                        />
                        @if (model().emails.length > 1) {
                            <button
                                class="demo-button demo-button-ghost size-9 p-0"
                                [attr.aria-label]="'Remove email ' + (index + 1)"
                                (click)="removeEmail(index)"
                                type="button"
                            >
                                <svg lucideX size="16"></svg>
                            </button>
                        }
                    </div>
                    <p class="text-destructive text-sm" #emailError="rdxFieldError" rdxFieldError>
                        {{ emailError.messages().join(' ') }}
                    </p>
                </div>
            }

            <button
                class="demo-button demo-button-outline h-9 gap-2 self-start px-4"
                [disabled]="model().emails.length >= max"
                (click)="addEmail()"
                type="button"
            >
                <svg lucidePlus size="16"></svg>
                Add email address
            </button>

            <button class="demo-button demo-button-primary h-9 px-4" type="submit">Save contacts</button>

            @if (result()) {
                <p class="text-muted-foreground text-sm">Saved {{ result()!.emails.length }} address(es).</p>
            }
        </form>
    `
})
export class SignalFormsArray {
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
