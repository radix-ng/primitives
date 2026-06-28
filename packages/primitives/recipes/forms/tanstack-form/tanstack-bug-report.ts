import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    RdxFieldControl,
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot
} from '@radix-ng/primitives/field';
import { injectForm, TanStackField } from '@tanstack/angular-form';
import { z } from 'zod';
import {
    recipeDescription,
    recipeError,
    recipeField,
    recipeForm,
    recipeInput,
    recipeLabel,
    recipeSubmit,
    recipeTextarea
} from '../forms-recipes.shared';

/** Structural view of the `[tanstackField]` exportAs ref used in the templates. */
type FieldRef = { api: { state: { meta: { isTouched: boolean; isValid: boolean; errors: unknown[] } } } };

const formSchema = z.object({
    title: z
        .string()
        .min(5, 'Bug title must be at least 5 characters.')
        .max(32, 'Bug title must be at most 32 characters.'),
    description: z
        .string()
        .min(20, 'Description must be at least 20 characters.')
        .max(100, 'Description must be at most 100 characters.')
});

/**
 * Bug report built with **TanStack Form** and **Zod**, mirroring the shadcn/ui guide. A single Zod schema
 * validates the whole form via TanStack's Standard Schema integration; each field is shown invalid when
 * it is touched and no longer valid (`isTouched && !isValid`).
 *
 * Unlike the Signal Forms recipe — where `rdxSignalField` reports state into the `Field` automatically —
 * TanStack exposes a field `api` rather than a `ControlValueAccessor`, so this stays a **manual
 * integration**: each field forwards `[invalid]` / `[touched]` and the controlled `[value]` / `(input)` /
 * `(blur)` wiring itself.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'tanstack-bug-report',
    imports: [TanStackField, RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldDescription, RdxFieldError],
    template: `
        <form [class]="form0" (submit)="$event.preventDefault(); reportForm.handleSubmit()" novalidate>
            <ng-container #title="field" [tanstackField]="reportForm" [validators]="titleValidators" name="title">
                <div
                    [class]="field"
                    [invalid]="isInvalid(title)"
                    [touched]="title.api.state.meta.isTouched"
                    rdxFieldRoot
                    required
                >
                    <label [class]="label" rdxFieldLabel>Bug Title</label>
                    <input
                        [class]="input"
                        [value]="title.api.state.value"
                        (input)="title.api.handleChange($any($event.target).value)"
                        (blur)="title.api.handleBlur()"
                        rdxFieldControl
                        placeholder="Login button not working on mobile"
                        autocomplete="off"
                    />
                    <p [class]="description" rdxFieldDescription>Provide a concise title for your bug report.</p>
                    <p [class]="error" rdxFieldError>{{ messages(title) }}</p>
                </div>
            </ng-container>

            <ng-container
                #description="field"
                [tanstackField]="reportForm"
                [validators]="descriptionValidators"
                name="description"
            >
                <div
                    [class]="field"
                    [invalid]="isInvalid(description)"
                    [touched]="description.api.state.meta.isTouched"
                    rdxFieldRoot
                    required
                >
                    <label [class]="label" rdxFieldLabel>Description</label>
                    <textarea
                        [class]="textarea"
                        [value]="description.api.state.value"
                        (input)="description.api.handleChange($any($event.target).value)"
                        (blur)="description.api.handleBlur()"
                        rdxFieldControl
                        placeholder="When I click the login button on my phone, nothing happens…"
                    ></textarea>
                    <p [class]="descriptionClass" rdxFieldDescription>
                        The more details, the faster we can reproduce it.
                    </p>
                    <p [class]="error" rdxFieldError>{{ messages(description) }}</p>
                </div>
            </ng-container>

            <button [class]="submit" type="submit">Submit</button>

            @if (result()) {
                <p [class]="descriptionClass">Submitted: "{{ result()!.title }}"</p>
            }
        </form>
    `
})
export class TanstackBugReport {
    protected readonly form0 = recipeForm;
    protected readonly field = recipeField;
    protected readonly label = recipeLabel;
    protected readonly input = recipeInput;
    protected readonly textarea = recipeTextarea;
    protected readonly descriptionClass = recipeDescription;
    protected readonly error = recipeError;
    protected readonly submit = recipeSubmit;

    protected readonly result = signal<z.infer<typeof formSchema> | null>(null);

    // One Zod schema is the source of truth; each field validates against its slice on change (live
    // feedback) and on submit (so a pristine submit also reports).
    protected readonly titleValidators = { onChange: formSchema.shape.title, onSubmit: formSchema.shape.title };
    protected readonly descriptionValidators = {
        onChange: formSchema.shape.description,
        onSubmit: formSchema.shape.description
    };

    protected readonly reportForm = injectForm({
        defaultValues: { title: '', description: '' },
        onSubmit: ({ value }) => {
            this.result.set(value);
        }
    });

    protected isInvalid(field: FieldRef): boolean {
        const meta = field.api.state.meta;
        return meta.isTouched && !meta.isValid;
    }

    /** Deduped Zod messages (a field may run its onChange + onSubmit validator). */
    protected messages(field: FieldRef): string {
        const meta = field.api.state.meta;
        if (!meta.isTouched) {
            return '';
        }
        const seen = new Set<string>();
        for (const error of meta.errors) {
            const message = typeof error === 'string' ? error : ((error as { message?: string })?.message ?? '');
            if (message) {
                seen.add(message);
            }
        }
        return [...seen].join(', ');
    }
}
