# TanStack Form

#### Build accessible forms with **TanStack Form** and **Zod**, using the headless `Field` parts.

This guide ports the shadcn/ui [TanStack Form](https://tanstack.com/form) guide to Angular. You'll
create a form with `injectForm`, validate it with a **Zod** schema through TanStack's Standard Schema
support, handle errors, and keep everything accessible — the headless `Field` markup is identical to the
Signal Forms recipe, only the engine differs.

> **Angular-first note:** [Signal Forms](?path=/docs/recipes-forms-signal-forms--docs) is the recommended
> path — its `rdxSignalField` adapter reports field state into `Field` automatically, so you write no
> per-field `[invalid]`/`[touched]`. TanStack exposes a field `api` rather than a `ControlValueAccessor`,
> so this recipe stays a **manual integration**: each field forwards its `[invalid]`/`[touched]` and the
> controlled `[value]`/`(input)`/`(blur)` wiring itself. There's no TanStack runtime adapter (the
> published library has no TanStack dependency).

> **Note:** Browser validation is intentionally disabled (`novalidate` on the `<form>`) so schema
> validation and the `Field` error region own the messaging — in production code you'd keep basic
> browser validation as a fallback.

## Demo

A bug report with a text input and a textarea. On submit the values are validated and any errors are
shown next to each field.

```typescript
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
```

## Approach

- `injectForm` manages form state; the `[tanstackField]` directive exposes a per-field `api` (value,
  `handleChange`, `handleBlur`, `state.meta`) via its `field` export (`#title="field"`).
- The headless `Field` parts render the accessible label/description/error and wire `for` /
  `aria-describedby` / `aria-invalid`.
- Client-side validation uses **Zod** through Standard Schema, with real-time feedback.
- A field is shown invalid once it is touched and no longer valid (`isTouched && !isValid`).

## Anatomy

```html
<form (submit)="$event.preventDefault(); form.handleSubmit()" novalidate>
    <ng-container [tanstackField]="form" name="title" [validators]="titleValidators" #title="field">
        <div rdxFieldRoot [invalid]="isInvalid(title)" [touched]="title.api.state.meta.isTouched" required>
            <label rdxFieldLabel>Bug Title</label>
            <input
                rdxFieldControl
                [value]="title.api.state.value"
                (input)="title.api.handleChange($any($event.target).value)"
                (blur)="title.api.handleBlur()"
            />
            <p rdxFieldDescription>Provide a concise title for your bug report.</p>
            <p rdxFieldError>{{ messages(title) }}</p>
        </div>
    </ng-container>
    <button type="submit">Submit</button>
</form>
```

## Form

### Create a schema

Define the shape of the form with a Zod schema.

```ts
import { z } from 'zod';

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
```

### Set up the form

Use `injectForm` to create the form instance, and attach the schema per field with the directive's
`[validators]` input. TanStack accepts any Standard Schema, so the same Zod schema slice
(`formSchema.shape.title`) drives both `onChange` (live feedback) and `onSubmit` (so a pristine submit
also reports).

```ts
import { injectForm } from '@tanstack/angular-form';

protected readonly titleValidators = {
    onChange: formSchema.shape.title,
    onSubmit: formSchema.shape.title
};

protected readonly reportForm = injectForm({
    defaultValues: { title: '', description: '' },
    onSubmit: ({ value }) => {
        // value is validated and typed
    }
});
```

### Build the form

```typescript
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
```

## Validation

### Validation modes

Attach a validator per trigger on the `[tanstackField]` directive's `validators` input:

| Mode       | Description                          |
| ---------- | ------------------------------------ |
| `onChange` | Validation triggers on every change. |
| `onBlur`   | Validation triggers on blur.         |
| `onSubmit` | Validation triggers on submit.       |

```ts
protected readonly titleValidators = {
    onChange: formSchema.shape.title,
    onBlur: formSchema.shape.title,
    onSubmit: formSchema.shape.title
};
```

## Displaying errors

Drive the `Field`'s state from the field's `meta` and gate display on interaction:

- Bind `[invalid]` on `rdxFieldRoot` so it hides `rdxFieldError` and clears `aria-invalid` until invalid.
- Read messages from `field.api.state.meta.errors` (Zod issues), deduped (a field may run `onChange`
  + `onSubmit`).

```ts
protected isInvalid(field: FieldRef): boolean {
    const meta = field.api.state.meta;
    return meta.isTouched && !meta.isValid;
}
```

## Working with different field types

Compound Radix controls are controlled with `[value]`/`(onValueChange)` (or `[checked]`/
`(onCheckedChange)`), piping the change into `handleChange`.

- **Input / Textarea** — `[value]` + `(input)="…handleChange(…)"` + `(blur)="…handleBlur()"`.
- **Select** — `[value]` on `rdxSelectRoot`, `(onValueChange)="…handleChange($any($event.value))"`.
- **Radio group** — `[value]` on `rdxRadioRoot`, `(onValueChange)`.
- **Checkbox group** — `[value]` + `[allValues]` on `rdxCheckboxGroup`, `(onValueChange)`.
- **Switch** — `[checked]` on `rdxSwitchRoot`, `(onCheckedChange)="…handleChange($any($event.checked))"`.

```html
<!-- Select -->
<div rdxSelectRoot [value]="area.api.state.value" (onValueChange)="area.api.handleChange($any($event.value))">
    <button rdxSelectTrigger (blur)="area.api.handleBlur()">
        <span rdxSelectValue placeholder="Select an area…" #v="rdxSelectedValue">{{ v.slotText() }}</span>
    </button>
    <!-- …portal / popup / items… -->
</div>
```

### Complex form

A complete issue form combining input, select, radio group, checkbox group, switch and textarea,
validated by one Zod schema (each field validates against `formSchema.shape.<key>`).

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxGroupDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';
import {
    RdxFieldControl,
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot
} from '@radix-ng/primitives/field';
import {
    RdxRadioGroupDirective,
    RdxRadioIndicatorDirective,
    RdxRadioItemDirective,
    RdxRadioItemInputDirective
} from '@radix-ng/primitives/radio';
import {
    RdxSelectItem,
    RdxSelectItemIndicator,
    RdxSelectItemText,
    RdxSelectList,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectPositioner,
    RdxSelectRoot,
    RdxSelectTrigger,
    RdxSelectValue
} from '@radix-ng/primitives/select';
import { RdxSwitchRoot, RdxSwitchThumb } from '@radix-ng/primitives/switch';
import { injectForm, TanStackField } from '@tanstack/angular-form';
import { z } from 'zod';
import {
    cn,
    recipeCheckbox,
    recipeDescription,
    recipeError,
    recipeField,
    recipeFieldContent,
    recipeFieldRow,
    recipeForm,
    recipeInput,
    recipeLabel,
    recipeRadio,
    recipeReset,
    recipeSelectIndicator,
    recipeSelectItem,
    recipeSelectList,
    recipeSelectPopup,
    recipeSelectTrigger,
    recipeSubmit,
    recipeSwitch,
    recipeSwitchThumb,
    recipeTextarea
} from '../forms-recipes.shared';

type FieldRef = { api: { state: { meta: { isTouched: boolean; isValid: boolean; errors: unknown[] } } } };

const AREAS = [
    { value: 'ui', label: 'User Interface' },
    { value: 'api', label: 'API' },
    { value: 'docs', label: 'Documentation' }
];
const PRIORITIES = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
];
const LABELS = [
    { value: 'bug', label: 'Bug' },
    { value: 'enhancement', label: 'Enhancement' },
    { value: 'question', label: 'Question' }
];

const formSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters.'),
    area: z.string().min(1, 'Choose an area.'),
    priority: z.string().min(1, 'Choose a priority.'),
    labels: z.array(z.string()).min(1, 'Pick at least one label.'),
    notify: z.boolean(),
    details: z.string().min(10, 'Add at least 10 characters of detail.')
});

/**
 * The same complete issue form built with **TanStack Form** and **Zod**. One Zod
 * schema validates the whole form (Standard Schema); compound Radix controls are
 * bound with `[value]`/`(onValueChange)` (or `[checked]`/`(onCheckedChange)`)
 * into the field's `handleChange`. Errors surface once a field is touched and no
 * longer valid; `reset()` restores the defaults.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'tanstack-complex',
    imports: [
        TanStackField,
        RdxFieldRoot,
        RdxFieldLabel,
        RdxFieldControl,
        RdxFieldDescription,
        RdxFieldError,
        RdxSelectRoot,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPortal,
        RdxSelectPositioner,
        RdxSelectPopup,
        RdxSelectList,
        RdxSelectItem,
        RdxSelectItemText,
        RdxSelectItemIndicator,
        RdxRadioGroupDirective,
        RdxRadioItemDirective,
        RdxRadioIndicatorDirective,
        RdxRadioItemInputDirective,
        RdxCheckboxGroupDirective,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxSwitchRoot,
        RdxSwitchThumb,
        LucideCheck,
        LucideChevronDown
    ],
    template: `
        <form [class]="form0" (submit)="$event.preventDefault(); issueForm.handleSubmit()" novalidate>
            <!-- Text input -->
            <ng-container #title="field" [tanstackField]="issueForm" [validators]="v.title" name="title">
                <div [class]="field" [invalid]="isInvalid(title)" [touched]="isTouched(title)" rdxFieldRoot required>
                    <label [class]="label" rdxFieldLabel>Title</label>
                    <input
                        [class]="input"
                        [value]="title.api.state.value"
                        (input)="title.api.handleChange($any($event.target).value)"
                        (blur)="title.api.handleBlur()"
                        rdxFieldControl
                        placeholder="Short summary"
                        autocomplete="off"
                    />
                    <p [class]="error" rdxFieldError>{{ messages(title) }}</p>
                </div>
            </ng-container>

            <!-- Select -->
            <ng-container #area="field" [tanstackField]="issueForm" [validators]="v.area" name="area">
                <div [class]="field" [invalid]="isInvalid(area)" [touched]="isTouched(area)" rdxFieldRoot required>
                    <label [class]="label" rdxFieldLabel>Area</label>
                    <div
                        [value]="area.api.state.value"
                        (onValueChange)="area.api.handleChange($any($event.value))"
                        rdxSelectRoot
                    >
                        <button [class]="selectTrigger" (blur)="area.api.handleBlur()" rdxSelectTrigger>
                            <span #areaValue="rdxSelectedValue" rdxSelectValue placeholder="Select an area…">
                                {{ areaValue.slotText() }}
                            </span>
                            <svg lucideChevronDown size="16"></svg>
                        </button>
                        <div class="z-[100]" *rdxSelectPortal [sideOffset]="6" rdxSelectPositioner>
                            <div [class]="selectPopup" rdxSelectPopup>
                                <div [class]="selectList" rdxSelectList>
                                    @for (option of areas; track option.value) {
                                        <div [class]="selectItem" [value]="option.value" rdxSelectItem>
                                            <span [class]="selectIndicator" rdxSelectItemIndicator>
                                                <svg lucideCheck size="16"></svg>
                                            </span>
                                            <span rdxSelectItemText>{{ option.label }}</span>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <p [class]="error" rdxFieldError>{{ messages(area) }}</p>
                </div>
            </ng-container>

            <!-- Radio group -->
            <ng-container #priority="field" [tanstackField]="issueForm" [validators]="v.priority" name="priority">
                <div
                    [class]="field"
                    [invalid]="isInvalid(priority)"
                    [touched]="isTouched(priority)"
                    rdxFieldRoot
                    required
                >
                    <span [class]="label">Priority</span>
                    <div
                        [class]="radio.group"
                        [value]="priority.api.state.value"
                        (onValueChange)="priority.api.handleChange($any($event.value))"
                        aria-label="Priority"
                        rdxRadioRoot
                    >
                        @for (option of priorities; track option.value) {
                            <label [class]="radio.row">
                                <span [class]="radio.item" [value]="option.value" rdxRadioItem>
                                    <span [class]="radio.indicator" rdxRadioIndicator></span>
                                    <input rdxRadioItemInput />
                                </span>
                                <span [class]="radio.label">{{ option.label }}</span>
                            </label>
                        }
                    </div>
                    <p [class]="error" rdxFieldError>{{ messages(priority) }}</p>
                </div>
            </ng-container>

            <!-- Checkbox group -->
            <ng-container #labels="field" [tanstackField]="issueForm" [validators]="v.labels" name="labels">
                <div [class]="field" [invalid]="isInvalid(labels)" [touched]="isTouched(labels)" rdxFieldRoot>
                    <span [class]="label">Labels</span>
                    <div
                        class="flex flex-col gap-2.5"
                        [value]="labels.api.state.value"
                        [allValues]="allLabels"
                        (onValueChange)="labels.api.handleChange($any($event.value))"
                        aria-label="Labels"
                        rdxCheckboxGroup
                    >
                        @for (option of labelOptions; track option.value) {
                            <label class="flex items-center gap-3">
                                <div [name]="option.value" rdxCheckboxRoot>
                                    <button
                                        [class]="checkbox.button"
                                        [attr.aria-label]="option.label"
                                        rdxCheckboxButton
                                    >
                                        <svg
                                            [class]="checkbox.indicator"
                                            rdxCheckboxIndicator
                                            size="16"
                                            lucideCheck
                                        ></svg>
                                    </button>
                                </div>
                                <span [class]="radio.label">{{ option.label }}</span>
                            </label>
                        }
                    </div>
                    <p [class]="error" rdxFieldError>{{ messages(labels) }}</p>
                </div>
            </ng-container>

            <!-- Switch -->
            <ng-container #notify="field" [tanstackField]="issueForm" name="notify">
                <div [class]="fieldRow" rdxFieldRoot>
                    <div [class]="fieldContent">
                        <span [class]="label">Email updates</span>
                        <p [class]="description">Get notified when this issue changes status.</p>
                    </div>
                    <button
                        [class]="switchClass"
                        [checked]="notify.api.state.value"
                        (onCheckedChange)="notify.api.handleChange($any($event.checked))"
                        aria-label="Email updates"
                        rdxSwitchRoot
                    >
                        <span [class]="switchThumb" rdxSwitchThumb></span>
                    </button>
                </div>
            </ng-container>

            <!-- Textarea -->
            <ng-container #details="field" [tanstackField]="issueForm" [validators]="v.details" name="details">
                <div
                    [class]="field"
                    [invalid]="isInvalid(details)"
                    [touched]="isTouched(details)"
                    rdxFieldRoot
                    required
                >
                    <label [class]="label" rdxFieldLabel>Details</label>
                    <textarea
                        [class]="textarea"
                        [value]="details.api.state.value"
                        (input)="details.api.handleChange($any($event.target).value)"
                        (blur)="details.api.handleBlur()"
                        rdxFieldControl
                        placeholder="Steps to reproduce, expected vs. actual…"
                    ></textarea>
                    <p [class]="error" rdxFieldError>{{ messages(details) }}</p>
                </div>
            </ng-container>

            <div class="flex gap-3">
                <button [class]="submit" type="submit">Create issue</button>
                <button [class]="reset" (click)="issueForm.reset()" type="button">Reset</button>
            </div>

            @if (result()) {
                <p [class]="description">Created issue "{{ result()!.title }}" ({{ result()!.area }})</p>
            }
        </form>
    `
})
export class TanstackComplex {
    protected readonly form0 = recipeForm;
    protected readonly field = recipeField;
    protected readonly fieldRow = recipeFieldRow;
    protected readonly fieldContent = recipeFieldContent;
    protected readonly label = recipeLabel;
    protected readonly input = recipeInput;
    protected readonly textarea = recipeTextarea;
    protected readonly description = recipeDescription;
    protected readonly error = recipeError;
    protected readonly submit = recipeSubmit;
    protected readonly reset = cn(recipeReset, 'self-start');
    protected readonly selectTrigger = recipeSelectTrigger;
    protected readonly selectPopup = recipeSelectPopup;
    protected readonly selectList = recipeSelectList;
    protected readonly selectItem = recipeSelectItem;
    protected readonly selectIndicator = recipeSelectIndicator;
    protected readonly switchClass = recipeSwitch;
    protected readonly switchThumb = recipeSwitchThumb;
    protected readonly radio = recipeRadio;
    protected readonly checkbox = recipeCheckbox;

    protected readonly areas = AREAS;
    protected readonly priorities = PRIORITIES;
    protected readonly labelOptions = LABELS;
    protected readonly allLabels = LABELS.map((l) => l.value);

    protected readonly result = signal<z.infer<typeof formSchema> | null>(null);

    // One Zod schema is the source of truth; each field validates against its slice
    // on change (live feedback) and on submit (so a pristine submit also reports).
    protected readonly v = {
        title: { onChange: formSchema.shape.title, onSubmit: formSchema.shape.title },
        area: { onChange: formSchema.shape.area, onSubmit: formSchema.shape.area },
        priority: { onChange: formSchema.shape.priority, onSubmit: formSchema.shape.priority },
        labels: { onChange: formSchema.shape.labels, onSubmit: formSchema.shape.labels },
        details: { onChange: formSchema.shape.details, onSubmit: formSchema.shape.details }
    };

    protected readonly issueForm = injectForm({
        defaultValues: {
            title: '',
            area: '',
            priority: '',
            labels: [] as string[],
            notify: true,
            details: ''
        },
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
```

## Resetting the form

Call `reset()` to restore the default values.

```html
<button type="button" (click)="form.reset()">Reset</button>
```

## Array fields

`mode="array"` enables `pushValue` / `removeValue` on the parent field. Each row is its own
`[tanstackField]` addressed with bracket notation (`emails[i].address`); the parent validates the array
length while each row validates its own address.

```ts
const emailsLength = z
    .array(z.unknown())
    .min(1, 'Add at least one email address.')
    .max(5, 'You can add up to 5 email addresses.');
const address = z.email('Enter a valid email address.');
```

```html
<ng-container [tanstackField]="form" name="emails" mode="array" [validators]="emailsValidators" #emails="field">
    @for (entry of $any(emails.api.state.value); track index; let index = $index) {
        <ng-container
            [tanstackField]="form"
            [name]="'emails[' + index + '].address'"
            [validators]="addressValidators"
            #sub="field"
        >
            <!-- input bound to sub.api.state.value -->
        </ng-container>
    }
    <button type="button" (click)="emails.api.pushValue({ address: '' })">Add email address</button>
</ng-container>
```

```typescript
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
```

## See also

- **Primitives / Field**, **Primitives / Form** — the headless layers these recipes compose.
- **Recipes / Forms / Signal Forms** — the same forms built with Angular Signal Forms.
