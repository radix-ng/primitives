import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { form, FormField, maxLength, minLength, required } from '@angular/forms/signals';
import {
    RdxFieldControl,
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot
} from '@radix-ng/primitives/field';
import { RdxFormRoot } from '@radix-ng/primitives/form';
import { RdxSignalField } from '@radix-ng/primitives/signal-forms';

type BugReport = { title: string; description: string };

/**
 * Bug report built with **Angular Signal Forms** and the headless `Field` parts.
 *
 * `form()` owns the value and validation; `rdxSignalField` (on each control next
 * to `[formField]`) reports the field's actual state into the `Field` — no manual
 * `[invalid]`/`[touched]` bindings. `rdxFormRoot`'s default `validationMode="onBlur"`
 * keeps each field neutral until it is touched or the form is submitted: the form records
 * the submit attempt before checking validity, so a pristine invalid submit is blocked
 * (and the first invalid field focused) and the errors appear — the submit handler needs
 * no `markAsTouched()` ritual. (Browser validation stays off via `rdxFormRoot` `novalidate`.)
 *
 * These recipes use the per-field `rdxSignalField`; the form-level `rdxSignalForm`
 * name-routing is an equivalent path (its client errors are gated by `validationMode`
 * too, and it exposes per-name touched/dirty so onBlur reveals on the bound control's blur).
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'signal-forms-bug-report',
    imports: [
        FormField,
        RdxFormRoot,
        RdxFieldRoot,
        RdxFieldLabel,
        RdxFieldControl,
        RdxFieldDescription,
        RdxFieldError,
        RdxSignalField
    ],
    template: `
        <form class="flex w-100 flex-col gap-5" (onFormSubmit)="onSubmit()" rdxFormRoot>
            <div class="flex flex-col gap-1.5" name="title" rdxFieldRoot>
                <label class="demo-label data-[disabled]:opacity-50" rdxFieldLabel>Bug Title</label>
                <input
                    class="demo-input data-[invalid]:border-destructive data-[invalid]:ring-destructive/30 h-9 w-full px-3"
                    [formField]="reportForm.title"
                    rdxFieldControl
                    rdxSignalField
                    placeholder="Login button not working on mobile"
                    autocomplete="off"
                />
                <p class="text-muted-foreground text-sm" rdxFieldDescription>
                    Provide a concise title for your bug report.
                </p>
                <p class="text-destructive text-sm" #titleError="rdxFieldError" rdxFieldError>
                    {{ titleError.messages().join(' ') }}
                </p>
            </div>

            <div class="flex flex-col gap-1.5" name="description" rdxFieldRoot>
                <label class="demo-label data-[disabled]:opacity-50" rdxFieldLabel>Description</label>
                <textarea
                    class="demo-input data-[invalid]:border-destructive data-[invalid]:ring-destructive/30 min-h-24 w-full px-3 py-2"
                    [formField]="reportForm.description"
                    rdxFieldControl
                    rdxSignalField
                    placeholder="When I click the login button on my phone, nothing happens…"
                ></textarea>
                <p class="text-muted-foreground text-sm" rdxFieldDescription>
                    The more details, the faster we can reproduce it.
                </p>
                <p class="text-destructive text-sm" #descError="rdxFieldError" rdxFieldError>
                    {{ descError.messages().join(' ') }}
                </p>
            </div>

            <button class="demo-button demo-button-primary h-9 px-4" type="submit">Submit</button>

            @if (result()) {
                <p class="text-muted-foreground text-sm">Submitted: "{{ result()!.title }}"</p>
            }
        </form>
    `
})
export class SignalFormsBugReport {
    protected readonly result = signal<BugReport | null>(null);

    protected readonly model = signal<BugReport>({ title: '', description: '' });
    protected readonly reportForm = form(this.model, (path) => {
        required(path.title, { message: 'Bug title is required.' });
        minLength(path.title, 5, { message: 'Bug title must be at least 5 characters.' });
        maxLength(path.title, 32, { message: 'Bug title must be at most 32 characters.' });

        required(path.description, { message: 'Description is required.' });
        minLength(path.description, 20, { message: 'Description must be at least 20 characters.' });
        maxLength(path.description, 100, { message: 'Description must be at most 100 characters.' });
    });

    // `rdxFormRoot` blocks an invalid submit and reveals the errors itself — this only runs when valid.
    protected onSubmit(): void {
        this.result.set(this.model());
    }
}
