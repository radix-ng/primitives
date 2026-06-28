import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucidePlus, LucideX } from '@lucide/angular';
import { RdxFieldControl, RdxFieldError, RdxFieldRoot } from '@radix-ng/primitives/field';
import { injectForm, TanStackField } from '@tanstack/angular-form';
import { z } from 'zod';
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

type FieldRef = { api: { state: { meta: { isTouched: boolean; isValid: boolean; errors: unknown[] } } } };

const MAX_EMAILS = 5;

type Contacts = { emails: { address: string }[] };

// The array-length rules validate the parent `emails` field while each row
// validates its own `address` against the Zod email schema (Standard Schema).
const emailsLengthSchema = z
    .array(z.unknown())
    .min(1, 'Add at least one email address.')
    .max(MAX_EMAILS, `You can add up to ${MAX_EMAILS} email addresses.`);
const addressSchema = z.email('Enter a valid email address.');

/**
 * Dynamic **array fields** with TanStack Form and **Zod**: `mode="array"` enables
 * `pushValue` / `removeValue`; the Zod array schema validates the array length and
 * each item independently. Each row is its own `[tanstackField]` addressed by
 * bracket notation (`emails[i].address`).
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'tanstack-array',
    imports: [TanStackField, RdxFieldRoot, RdxFieldControl, RdxFieldError, LucidePlus, LucideX],
    template: `
        <form [class]="form0" (submit)="$event.preventDefault(); contactsForm.handleSubmit()" novalidate>
            <div class="flex flex-col gap-1">
                <span [class]="label">Email addresses</span>
                <p [class]="description">Add up to {{ max }} email addresses where we can contact you.</p>
            </div>

            <ng-container
                #emails="field"
                [tanstackField]="contactsForm"
                [validators]="emailsValidators"
                mode="array"
                name="emails"
            >
                @for (entry of $any(emails.api.state.value); track index; let index = $index) {
                    <ng-container
                        #sub="field"
                        [tanstackField]="contactsForm"
                        [validators]="addressValidators"
                        [name]="'emails[' + index + '].address'"
                    >
                        <div
                            [class]="field"
                            [invalid]="isInvalid(sub)"
                            [touched]="isTouched(sub)"
                            rdxFieldRoot
                            required
                        >
                            <div class="flex items-center gap-2">
                                <input
                                    [class]="input"
                                    [value]="sub.api.state.value"
                                    (input)="sub.api.handleChange($any($event.target).value)"
                                    (blur)="sub.api.handleBlur()"
                                    rdxFieldControl
                                    type="email"
                                    placeholder="name@example.com"
                                    autocomplete="off"
                                />
                                @if ($any(emails.api.state.value).length > 1) {
                                    <button
                                        [class]="ghost"
                                        [attr.aria-label]="'Remove email ' + (index + 1)"
                                        (click)="emails.api.removeValue(index)"
                                        type="button"
                                    >
                                        <svg lucideX size="16"></svg>
                                    </button>
                                }
                            </div>
                            <p [class]="error" rdxFieldError>{{ messages(sub) }}</p>
                        </div>
                    </ng-container>
                }

                @if (arrayError(emails)) {
                    <p [class]="error">{{ arrayError(emails) }}</p>
                }

                <button
                    [class]="addButton"
                    [disabled]="$any(emails.api.state.value).length >= max"
                    (click)="emails.api.pushValue({ address: '' })"
                    type="button"
                >
                    <svg lucidePlus size="16"></svg>
                    Add email address
                </button>
            </ng-container>

            <button [class]="submit" type="submit">Save contacts</button>

            @if (result()) {
                <p [class]="description">Saved {{ result()!.emails.length }} address(es).</p>
            }
        </form>
    `
})
export class TanstackArray {
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

    protected readonly emailsValidators = { onChange: emailsLengthSchema, onSubmit: emailsLengthSchema };
    protected readonly addressValidators = { onChange: addressSchema, onSubmit: addressSchema };

    protected readonly contactsForm = injectForm({
        defaultValues: { emails: [{ address: '' }] as { address: string }[] },
        onSubmit: ({ value }) => {
            this.result.set(value);
        }
    });

    protected isInvalid(field: FieldRef): boolean {
        const meta = field.api.state.meta;
        return meta.isTouched && !meta.isValid;
    }

    protected isTouched(field: FieldRef): boolean {
        return field.api.state.meta.isTouched;
    }

    protected messages(field: FieldRef): string {
        const meta = field.api.state.meta;
        if (!meta.isTouched) {
            return '';
        }
        return this.toText(meta.errors);
    }

    /** Array-level message (min/max) shown only after the field has been touched. */
    protected arrayError(field: FieldRef): string {
        return field.api.state.meta.isTouched ? this.toText(field.api.state.meta.errors) : '';
    }

    /** Deduped Zod messages (a field may run its onChange + onSubmit validator). */
    private toText(errors: unknown[]): string {
        const seen = new Set<string>();
        for (const error of errors) {
            const message = typeof error === 'string' ? error : ((error as { message?: string })?.message ?? '');
            if (message) {
                seen.add(message);
            }
        }
        return [...seen].join(', ');
    }
}
