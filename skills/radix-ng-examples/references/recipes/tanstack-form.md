# TanStack Form

#### Build accessible forms with **TanStack Form** and **Zod**, using the headless `Field` parts.

This guide ports the shadcn/ui [TanStack Form](https://tanstack.com/form) guide to Angular. You'll
create a form with `injectForm`, validate it with a **Zod** schema through TanStack's Standard Schema
support, handle errors, and keep everything accessible — the headless `Field` markup is identical to the
Signal Forms recipe, only the engine differs.

> **Angular-first note:** [Signal Forms](signal-forms.md) is the recommended
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
        <form
            class="flex w-100 flex-col gap-5"
            (submit)="$event.preventDefault(); reportForm.handleSubmit()"
            novalidate
        >
            <ng-container #title="field" [tanstackField]="reportForm" [validators]="titleValidators" name="title">
                <div
                    class="flex flex-col gap-1.5"
                    [invalid]="isInvalid(title)"
                    [touched]="title.api.state.meta.isTouched"
                    rdxFieldRoot
                    required
                >
                    <label class="demo-label data-[disabled]:opacity-50" rdxFieldLabel>Bug Title</label>
                    <input
                        class="demo-input data-[invalid]:border-destructive data-[invalid]:ring-destructive/30 h-9 w-full px-3"
                        [value]="title.api.state.value"
                        (input)="title.api.handleChange($any($event.target).value)"
                        (blur)="title.api.handleBlur()"
                        rdxFieldControl
                        placeholder="Login button not working on mobile"
                        autocomplete="off"
                    />
                    <p [class]="description" rdxFieldDescription>Provide a concise title for your bug report.</p>
                    <p class="text-destructive text-sm" rdxFieldError>{{ messages(title) }}</p>
                </div>
            </ng-container>

            <ng-container
                #description="field"
                [tanstackField]="reportForm"
                [validators]="descriptionValidators"
                name="description"
            >
                <div
                    class="flex flex-col gap-1.5"
                    [invalid]="isInvalid(description)"
                    [touched]="description.api.state.meta.isTouched"
                    rdxFieldRoot
                    required
                >
                    <label class="demo-label data-[disabled]:opacity-50" rdxFieldLabel>Description</label>
                    <textarea
                        class="demo-input data-[invalid]:border-destructive data-[invalid]:ring-destructive/30 min-h-24 w-full px-3 py-2"
                        [value]="description.api.state.value"
                        (input)="description.api.handleChange($any($event.target).value)"
                        (blur)="description.api.handleBlur()"
                        rdxFieldControl
                        placeholder="When I click the login button on my phone, nothing happens…"
                    ></textarea>
                    <p class="text-muted-foreground text-sm" rdxFieldDescription>
                        The more details, the faster we can reproduce it.
                    </p>
                    <p class="text-destructive text-sm" rdxFieldError>{{ messages(description) }}</p>
                </div>
            </ng-container>

            <button class="demo-button demo-button-primary h-9 px-4" type="submit">Submit</button>

            @if (result()) {
                <p class="text-muted-foreground text-sm">Submitted: "{{ result()!.title }}"</p>
            }
        </form>
    `
})
export class TanstackBugReport {
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
        <form
            class="flex w-100 flex-col gap-5"
            (submit)="$event.preventDefault(); reportForm.handleSubmit()"
            novalidate
        >
            <ng-container #title="field" [tanstackField]="reportForm" [validators]="titleValidators" name="title">
                <div
                    class="flex flex-col gap-1.5"
                    [invalid]="isInvalid(title)"
                    [touched]="title.api.state.meta.isTouched"
                    rdxFieldRoot
                    required
                >
                    <label class="demo-label data-[disabled]:opacity-50" rdxFieldLabel>Bug Title</label>
                    <input
                        class="demo-input data-[invalid]:border-destructive data-[invalid]:ring-destructive/30 h-9 w-full px-3"
                        [value]="title.api.state.value"
                        (input)="title.api.handleChange($any($event.target).value)"
                        (blur)="title.api.handleBlur()"
                        rdxFieldControl
                        placeholder="Login button not working on mobile"
                        autocomplete="off"
                    />
                    <p [class]="description" rdxFieldDescription>Provide a concise title for your bug report.</p>
                    <p class="text-destructive text-sm" rdxFieldError>{{ messages(title) }}</p>
                </div>
            </ng-container>

            <ng-container
                #description="field"
                [tanstackField]="reportForm"
                [validators]="descriptionValidators"
                name="description"
            >
                <div
                    class="flex flex-col gap-1.5"
                    [invalid]="isInvalid(description)"
                    [touched]="description.api.state.meta.isTouched"
                    rdxFieldRoot
                    required
                >
                    <label class="demo-label data-[disabled]:opacity-50" rdxFieldLabel>Description</label>
                    <textarea
                        class="demo-input data-[invalid]:border-destructive data-[invalid]:ring-destructive/30 min-h-24 w-full px-3 py-2"
                        [value]="description.api.state.value"
                        (input)="description.api.handleChange($any($event.target).value)"
                        (blur)="description.api.handleBlur()"
                        rdxFieldControl
                        placeholder="When I click the login button on my phone, nothing happens…"
                    ></textarea>
                    <p class="text-muted-foreground text-sm" rdxFieldDescription>
                        The more details, the faster we can reproduce it.
                    </p>
                    <p class="text-destructive text-sm" rdxFieldError>{{ messages(description) }}</p>
                </div>
            </ng-container>

            <button class="demo-button demo-button-primary h-9 px-4" type="submit">Submit</button>

            @if (result()) {
                <p class="text-muted-foreground text-sm">Submitted: "{{ result()!.title }}"</p>
            }
        </form>
    `
})
export class TanstackBugReport {
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
import { RdxFieldControl, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
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
        <form class="flex w-100 flex-col gap-5" (submit)="$event.preventDefault(); issueForm.handleSubmit()" novalidate>
            <!-- Text input -->
            <ng-container #title="field" [tanstackField]="issueForm" [validators]="v.title" name="title">
                <div
                    class="flex flex-col gap-1.5"
                    [invalid]="isInvalid(title)"
                    [touched]="isTouched(title)"
                    rdxFieldRoot
                    required
                >
                    <label class="demo-label data-[disabled]:opacity-50" rdxFieldLabel>Title</label>
                    <input
                        class="demo-input data-[invalid]:border-destructive data-[invalid]:ring-destructive/30 h-9 w-full px-3"
                        [value]="title.api.state.value"
                        (input)="title.api.handleChange($any($event.target).value)"
                        (blur)="title.api.handleBlur()"
                        rdxFieldControl
                        placeholder="Short summary"
                        autocomplete="off"
                    />
                    <p class="text-destructive text-sm" rdxFieldError>{{ messages(title) }}</p>
                </div>
            </ng-container>

            <!-- Select -->
            <ng-container #area="field" [tanstackField]="issueForm" [validators]="v.area" name="area">
                <div
                    class="flex flex-col gap-1.5"
                    [invalid]="isInvalid(area)"
                    [touched]="isTouched(area)"
                    rdxFieldRoot
                    required
                >
                    <label class="demo-label data-[disabled]:opacity-50" rdxFieldLabel>Area</label>
                    <div
                        [value]="area.api.state.value"
                        (onValueChange)="area.api.handleChange($any($event.value))"
                        rdxSelectRoot
                    >
                        <button
                            class="demo-select-trigger data-[placeholder]:text-muted-foreground data-[invalid]:border-destructive data-[invalid]:aria-invalid:ring-destructive/30 demo-focus inline-flex min-h-9 w-full items-center justify-between gap-2 px-3 py-1.5 disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                            (blur)="area.api.handleBlur()"
                            rdxSelectTrigger
                        >
                            <span #areaValue="rdxSelectedValue" rdxSelectValue placeholder="Select an area…">
                                {{ areaValue.slotText() }}
                            </span>
                            <svg class="size-4 shrink-0" lucideChevronDown size="16" aria-hidden="true"></svg>
                        </button>
                        <div class="z-[100]" *rdxSelectPortal [sideOffset]="6" rdxSelectPositioner>
                            <div
                                class="demo-select-popup min-w-[var(--anchor-width,10rem)] will-change-[opacity,transform]"
                                rdxSelectPopup
                            >
                                <div class="p-1" rdxSelectList>
                                    @for (option of areas; track option.value) {
                                        <div
                                            class="demo-select-item data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:text-muted-foreground relative flex min-h-7 items-center gap-2 ps-6 pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                            [value]="option.value"
                                            rdxSelectItem
                                        >
                                            <span
                                                class="absolute start-0 inline-flex w-6 items-center justify-center"
                                                rdxSelectItemIndicator
                                            >
                                                <svg
                                                    class="size-4 shrink-0"
                                                    lucideCheck
                                                    size="16"
                                                    aria-hidden="true"
                                                ></svg>
                                            </span>
                                            <span rdxSelectItemText>{{ option.label }}</span>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <p class="text-destructive text-sm" rdxFieldError>{{ messages(area) }}</p>
                </div>
            </ng-container>

            <!-- Radio group -->
            <ng-container #priority="field" [tanstackField]="issueForm" [validators]="v.priority" name="priority">
                <div
                    class="flex flex-col gap-1.5"
                    [invalid]="isInvalid(priority)"
                    [touched]="isTouched(priority)"
                    rdxFieldRoot
                    required
                >
                    <span class="demo-label data-[disabled]:opacity-50">Priority</span>
                    <div
                        class="flex flex-col gap-2.5"
                        [value]="priority.api.state.value"
                        (onValueChange)="priority.api.handleChange($any($event.value))"
                        aria-label="Priority"
                        rdxRadioRoot
                    >
                        @for (option of priorities; track option.value) {
                            <label class="flex items-center gap-3">
                                <span
                                    class="demo-radio-item demo-focus flex size-6 items-center justify-center disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                                    [value]="option.value"
                                    rdxRadioItem
                                >
                                    <span
                                        class="after:bg-primary flex size-full items-center justify-center after:block after:size-2.5 after:rounded-full data-[state=unchecked]:hidden"
                                        rdxRadioIndicator
                                    ></span>
                                    <input rdxRadioItemInput />
                                </span>
                                <span class="demo-label">{{ option.label }}</span>
                            </label>
                        }
                    </div>
                    <p class="text-destructive text-sm" rdxFieldError>{{ messages(priority) }}</p>
                </div>
            </ng-container>

            <!-- Checkbox group -->
            <ng-container #labels="field" [tanstackField]="issueForm" [validators]="v.labels" name="labels">
                <div
                    class="flex flex-col gap-1.5"
                    [invalid]="isInvalid(labels)"
                    [touched]="isTouched(labels)"
                    rdxFieldRoot
                >
                    <span class="demo-label data-[disabled]:opacity-50">Labels</span>
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
                                        class="demo-checkbox-button demo-focus flex size-6 items-center justify-center disabled:opacity-50 aria-disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                                        [attr.aria-label]="option.label"
                                        rdxCheckboxButton
                                    >
                                        <svg
                                            class="text-primary flex items-center"
                                            rdxCheckboxIndicator
                                            size="16"
                                            lucideCheck
                                        ></svg>
                                    </button>
                                </div>
                                <span class="demo-label">{{ option.label }}</span>
                            </label>
                        }
                    </div>
                    <p class="text-destructive text-sm" rdxFieldError>{{ messages(labels) }}</p>
                </div>
            </ng-container>

            <!-- Switch -->
            <ng-container #notify="field" [tanstackField]="issueForm" name="notify">
                <div class="flex items-start justify-between gap-4" rdxFieldRoot>
                    <div class="flex flex-col gap-1.5">
                        <span class="demo-label data-[disabled]:opacity-50">Email updates</span>
                        <p class="text-muted-foreground text-sm">Get notified when this issue changes status.</p>
                    </div>
                    <button
                        class="demo-switch demo-focus data-[checked]:bg-primary relative inline-flex h-6 w-11 shrink-0 items-center p-0 disabled:cursor-not-allowed disabled:opacity-50"
                        [checked]="notify.api.state.value"
                        (onCheckedChange)="notify.api.handleChange($any($event.checked))"
                        aria-label="Email updates"
                        rdxSwitchRoot
                    >
                        <span
                            class="demo-switch-thumb pointer-events-none block size-5 translate-x-0.5 transition-transform data-[checked]:translate-x-[22px]"
                            rdxSwitchThumb
                        ></span>
                    </button>
                </div>
            </ng-container>

            <!-- Textarea -->
            <ng-container #details="field" [tanstackField]="issueForm" [validators]="v.details" name="details">
                <div
                    class="flex flex-col gap-1.5"
                    [invalid]="isInvalid(details)"
                    [touched]="isTouched(details)"
                    rdxFieldRoot
                    required
                >
                    <label class="demo-label data-[disabled]:opacity-50" rdxFieldLabel>Details</label>
                    <textarea
                        class="demo-input data-[invalid]:border-destructive data-[invalid]:ring-destructive/30 min-h-24 w-full px-3 py-2"
                        [value]="details.api.state.value"
                        (input)="details.api.handleChange($any($event.target).value)"
                        (blur)="details.api.handleBlur()"
                        rdxFieldControl
                        placeholder="Steps to reproduce, expected vs. actual…"
                    ></textarea>
                    <p class="text-destructive text-sm" rdxFieldError>{{ messages(details) }}</p>
                </div>
            </ng-container>

            <div class="flex gap-3">
                <button class="demo-button demo-button-primary h-9 px-4" type="submit">Create issue</button>
                <button
                    class="demo-button demo-button-outline h-9 self-start px-4"
                    (click)="issueForm.reset()"
                    type="button"
                >
                    Reset
                </button>
            </div>

            @if (result()) {
                <p class="text-muted-foreground text-sm">
                    Created issue "{{ result()!.title }}" ({{ result()!.area }})
                </p>
            }
        </form>
    `
})
export class TanstackComplex {
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
        <form
            class="flex w-100 flex-col gap-5"
            (submit)="$event.preventDefault(); contactsForm.handleSubmit()"
            novalidate
        >
            <div class="flex flex-col gap-1">
                <span class="demo-label data-[disabled]:opacity-50">Email addresses</span>
                <p class="text-muted-foreground text-sm">
                    Add up to {{ max }} email addresses where we can contact you.
                </p>
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
                            class="flex flex-col gap-1.5"
                            [invalid]="isInvalid(sub)"
                            [touched]="isTouched(sub)"
                            rdxFieldRoot
                            required
                        >
                            <div class="flex items-center gap-2">
                                <input
                                    class="demo-input data-[invalid]:border-destructive data-[invalid]:ring-destructive/30 h-9 w-full px-3"
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
                                        class="demo-button demo-button-ghost size-9 p-0"
                                        [attr.aria-label]="'Remove email ' + (index + 1)"
                                        (click)="emails.api.removeValue(index)"
                                        type="button"
                                    >
                                        <svg lucideX size="16"></svg>
                                    </button>
                                }
                            </div>
                            <p class="text-destructive text-sm" rdxFieldError>{{ messages(sub) }}</p>
                        </div>
                    </ng-container>
                }

                @if (arrayError(emails)) {
                    <p class="text-destructive text-sm">{{ arrayError(emails) }}</p>
                }

                <button
                    class="demo-button demo-button-outline h-9 gap-2 self-start px-4"
                    [disabled]="$any(emails.api.state.value).length >= max"
                    (click)="emails.api.pushValue({ address: '' })"
                    type="button"
                >
                    <svg lucidePlus size="16"></svg>
                    Add email address
                </button>
            </ng-container>

            <button class="demo-button demo-button-primary h-9 px-4" type="submit">Save contacts</button>

            @if (result()) {
                <p class="text-muted-foreground text-sm">Saved {{ result()!.emails.length }} address(es).</p>
            }
        </form>
    `
})
export class TanstackArray {
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

## Setup and shared files

These examples use Angular standalone components and Tailwind CSS v4. Install
`@radix-ng/primitives` and `@lucide/angular`, `@tanstack/angular-form`, `zod`. Copy the component from **Show code** and any shared files below,
preserving their relative import paths. Import the example component in its parent and use its selector.

Install `tailwindcss`, `@tailwindcss/postcss` and `postcss`. Configure the PostCSS plugin:

```json
{ "plugins": { "@tailwindcss/postcss": {} } }
```

Save the CSS below as `demo-styles.css` next to your global stylesheet. Import Tailwind first,
then the demo styles. Both Storybook and Playground use this same CSS through `main.css`.

```css
@import 'tailwindcss';
@import './demo-styles.css';
```

The shared file supplies theme values, light/dark tokens, common classes and animation keyframes.
Set `data-theme="dark"` on `<html>` for the dark theme; the default is light. The font stacks have
system fallbacks; Inter and JetBrains Mono can be self-hosted for the Storybook typography.

<details>
<summary>demo-styles.css</summary>

```css
@theme {
    --duration-demo-drawer-swipe: 450ms;
    --duration-demo-drawer-keyboard: 200ms;
    --duration-demo-drawer-page-transform: 400ms;
    --duration-demo-drawer-page-radius: 250ms;
    --duration-demo-presence-animation: 300ms;
    --duration-demo-presence-dynamic: 2s;
    --ease-demo-drawer-swipe: cubic-bezier(0.32, 0.72, 0, 1);
    --transition-demo-drawer-swipe: transform var(--duration-demo-drawer-swipe) var(--ease-demo-drawer-swipe);
    --transition-demo-drawer-snap:
        transform var(--duration-demo-drawer-swipe) var(--ease-demo-drawer-swipe),
        box-shadow var(--duration-demo-drawer-swipe) var(--ease-demo-drawer-swipe);
    --transition-demo-drawer-keyboard:
        transform var(--duration-demo-drawer-swipe) var(--ease-demo-drawer-swipe),
        max-height var(--duration-demo-drawer-keyboard) ease;
    --transition-demo-drawer-page:
        transform var(--duration-demo-drawer-page-transform) var(--ease-demo-drawer-swipe),
        border-radius var(--duration-demo-drawer-page-radius) var(--ease-demo-drawer-swipe);
    --transition-demo-drawer: transform 300ms ease, scale 300ms ease, translate 300ms ease;
    --transition-demo-toast-stack: transform 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 320ms ease;
    --transition-demo-toast-swipe: transform 220ms ease;
    --color-*: initial;
    --color-white: white;
    --color-black: black;

    /* Gray scale that is roughly compatible with Tailwind's grays */
    --color-gray-50: oklch(98% 0.25% 264deg);
    --color-gray-75: oklch(97% 0.325% 264deg); /* Not a Tailwind step, don't use it in the demos */
    --color-gray-100: oklch(12% 9.5% 264deg / 5%);
    --color-gray-200: oklch(12% 9% 264deg / 7%);
    --color-gray-300: oklch(12% 8.5% 264deg / 17%);
    --color-gray-400: oklch(12% 8% 264deg / 38%);
    --color-gray-500: oklch(12% 7.5% 264deg / 50%);
    --color-gray-600: oklch(12% 7% 264deg / 67%);
    --color-gray-700: oklch(12% 6% 264deg / 77%);
    --color-gray-800: oklch(12% 5% 264deg / 85%);
    --color-gray-900: oklch(12% 5% 264deg / 90%);
    --color-gray-950: oklch(12% 5% 264deg / 95%);

    /* Functional colors for the docs */
    --color-content: white;
    --color-popup: var(--popover);
    --color-gridline: oklch(91.6% 1% 264deg);
    --color-selection: oklch(80% 50% 264deg / 25%);
    --color-highlight: var(--color-blue);
    --color-line-highlight: oklch(80% 50% 264deg / 10%);
    --color-line-highlight-strong: oklch(80% 50% 264deg / 25%);
    --color-inline-highlight: oklch(80% 50% 264deg / 15%);

    /* Text colors for the docs */
    --color-gray: var(--color-gray-600);
    --color-navy: oklch(31% 25% 264deg);
    --color-blue: oklch(45% 50% 264deg);
    --color-green: oklch(46% 30% 150deg);
    --color-purple: oklch(40% 45% 360deg);
    --color-violet: oklch(40% 60% 300deg);
    --color-red: oklch(50% 55% 31deg);

    /* Typography */
    --font-sans:
        Inter, ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
        'Noto Color Emoji';
    --font-mono:
        'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
        monospace;

    --text-xs: 0.8125rem;
    --text-xs--line-height: 1.25rem;
    --text-xs--letter-spacing: 0.001em;

    --text-sm: 0.875rem;
    --text-sm--line-height: 1.25rem;
    --text-sm--letter-spacing: 0.016em;

    --text-md: 0.9375rem;
    --text-md--line-height: 1.375rem;
    --text-md--letter-spacing: 0.016em;

    --text-base: 1rem;
    --text-base--line-height: 1.5rem;
    --text-base--letter-spacing: 0em;

    --text-lg: 1.125rem;
    --text-lg--line-height: 1.75rem;
    --text-lg--letter-spacing: -0.0025em;

    --text-xl: 1.3125rem;
    --text-xl--line-height: 1.625rem;
    --text-xl--letter-spacing: -0.005em;

    --text-2xl: 1.5rem;
    --text-2xl--line-height: 1.25;
    --text-2xl--letter-spacing: -0.0125em;

    --text-3xl: 1.875rem;
    --text-3xl--line-height: 1.2;
    --text-3xl--letter-spacing: -0.015em;

    --text-4xl: 2.25rem;
    --text-4xl--line-height: 2.5rem;
    --text-4xl--letter-spacing: -0.015em;

    --text-5xl: 3rem;
    --text-5xl--line-height: 1;
    --text-5xl--letter-spacing: -0.015em;

    --text-6xl: 3.75rem;
    --text-6xl--line-height: 0.95;
    --text-6xl--letter-spacing: -0.015em;

    --ease-out-fast: cubic-bezier(0.45, 1.005, 0, 1.005);
    --ease-in-slow: cubic-bezier(0.375, 0.015, 0.545, 0.455);
    --header-height: 3rem;

    --animate-popover-in: popover-in 150ms ease-out;
    --animate-popover-out: popover-out 120ms ease-in forwards;
    --animate-popover-viewport-in: popover-viewport-in 200ms ease-out;
    --animate-popover-viewport-out: popover-viewport-out 200ms ease-in forwards;

    --animate-navigation-menu-popup-in: navigation-menu-popup-in 200ms ease;
    --animate-navigation-menu-popup-out: navigation-menu-popup-out 200ms ease forwards;
    --animate-navigation-menu-content-in: navigation-menu-content-in 250ms ease;
    --animate-navigation-menu-content-out: navigation-menu-content-out 250ms ease forwards;

    --animate-dialog-overlay-in: dialog-overlay-in 150ms ease-out;
    --animate-dialog-overlay-out: dialog-overlay-out 150ms ease-in forwards;
    --animate-dialog-popup-in: dialog-popup-in 150ms ease-out;
    --animate-dialog-popup-out: dialog-popup-out 150ms ease-in forwards;

    --animate-drawer-overlay-in: dialog-overlay-in 250ms ease-out;
    --animate-drawer-overlay-out: dialog-overlay-out 200ms ease-in forwards;
    --animate-drawer-in-bottom: drawer-in-bottom 250ms ease-out;
    --animate-drawer-out-bottom: drawer-out-bottom 200ms ease-in forwards;
    --animate-drawer-in-top: drawer-in-top 250ms ease-out;
    --animate-drawer-out-top: drawer-out-top 200ms ease-in forwards;
    --animate-drawer-in-left: drawer-in-left 250ms ease-out;
    --animate-drawer-out-left: drawer-out-left 200ms ease-in forwards;
    --animate-drawer-in-right: drawer-in-right 250ms ease-out;
    --animate-drawer-out-right: drawer-out-right 200ms ease-in forwards;

    --animate-toast-in: toast-in 300ms cubic-bezier(0.22, 1, 0.36, 1);
    --animate-toast-out: toast-out 250ms ease-in forwards;
    --animate-toast-in-top: toast-in-top 300ms cubic-bezier(0.22, 1, 0.36, 1);
    --animate-toast-out-top: toast-out-top 250ms ease-in forwards;

    --animate-accordion-down: accordion-down 200ms ease-out;
    --animate-accordion-up: accordion-up 200ms ease-out;
    --animate-accordion-right: accordion-right 200ms ease-out;
    --animate-accordion-left: accordion-left 200ms ease-out;

    --animate-tabs-panel-in: tabs-panel-in 250ms ease;
    --animate-tabs-panel-out: tabs-panel-out 200ms ease;
}

@theme {
    /* Semantic colors shared by Tailwind demos */
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    --color-card: var(--card);
    --color-card-foreground: var(--card-foreground);
    --color-popover: var(--popover);
    --color-popover-foreground: var(--popover-foreground);
    --color-primary: var(--primary);
    --color-primary-foreground: var(--primary-foreground);
    --color-muted: var(--muted);
    --color-muted-foreground: var(--muted-foreground);
    --color-destructive: var(--destructive);
    --color-destructive-foreground: var(--destructive-foreground);
    --color-border: var(--border);
    --color-ring: var(--ring);
    --color-input: var(--border);
    --color-accent: var(--muted);
    --color-accent-foreground: var(--foreground);
    /* Distinct accent for search-match highlighting (e.g. fuzzy results). Stays available in demos
       (not reset in the [data-demo] block below), unlike the docs-only `--color-highlight`. */
    --color-match: var(--match);

    --animate-popover-popup-in: popover-popup-in 150ms ease-out;
    --animate-popover-popup-out: popover-popup-out 120ms ease-in forwards;
}

:root {
    --background: white;
    --foreground: oklch(14.5% 1% 264deg);
    --card: white;
    --card-foreground: var(--foreground);
    --popover: white;
    --popover-foreground: var(--foreground);
    --primary: oklch(20.5% 1% 264deg);
    --primary-foreground: white;
    --muted: oklch(96.5% 0.5% 264deg);
    --muted-foreground: oklch(46% 1% 264deg);
    --destructive: oklch(57.7% 0.245 27.325deg);
    --destructive-foreground: white;
    --border: oklch(90% 1% 264deg);
    --ring: oklch(55% 1% 264deg);
    --match: oklch(45% 50% 264deg);
}

:root[data-theme='dark'] {
    --background: oklch(14.5% 1% 264deg);
    --foreground: oklch(96% 0.5% 264deg);
    --card: oklch(18% 1% 264deg);
    --card-foreground: var(--foreground);
    --popover: oklch(18% 1% 264deg);
    --popover-foreground: var(--foreground);
    --primary: oklch(92% 0.5% 264deg);
    --primary-foreground: oklch(18% 1% 264deg);
    --muted: oklch(24% 1% 264deg);
    --muted-foreground: oklch(70% 1% 264deg);
    --destructive: oklch(70.4% 0.191 22.216deg);
    --destructive-foreground: oklch(18% 1% 264deg);
    --border: oklch(30% 1% 264deg);
    --ring: oklch(65% 1% 264deg);
    --match: oklch(69% 50% 264deg);

    --color-gray-50: oklch(17% 0.25% 264deg);
    --color-gray-75: oklch(19% 0.5% 264deg); /* Not a Tailwind step, don't use it in the demos */
    --color-gray-100: oklch(28% 0.75% 264deg / 65%);
    --color-gray-200: oklch(29% 0.75% 264deg / 80%);
    --color-gray-300: oklch(35% 0.75% 264deg / 80%);
    --color-gray-400: oklch(47% 0.875% 264deg / 80%);
    --color-gray-500: oklch(64% 1% 264deg / 80%);
    --color-gray-600: oklch(82% 1% 264deg / 80%);
    --color-gray-700: oklch(92% 1.125% 264deg / 80%);
    --color-gray-800: oklch(93% 0.875% 264deg / 85%);
    --color-gray-900: oklch(95% 0.5% 264deg / 90%);
    --color-gray-950: oklch(94% 0.375% 264deg / 95%);

    /* Functional colors */
    --color-content: black;
    --color-gridline: oklch(24% 1% 264deg);
    --color-highlight: oklch(45% 40% 264deg);
    --color-selection: oklch(50% 50% 264deg / 40%);
    --color-line-highlight: oklch(50% 50% 264deg / 20%);
    --color-line-highlight-strong: oklch(50% 50% 264deg / 35%);
    --color-inline-highlight: oklch(50% 50% 264deg / 35%);

    /* Text colors */
    --color-gray: var(--color-gray-600);
    --color-blue: oklch(69% 50% 264deg);
    --color-green: oklch(75% 25% 150deg);
    --color-navy: oklch(85% 25% 264deg);
    --color-purple: oklch(85% 30% 360deg);
    --color-red: oklch(80% 55% 31deg);
    --color-violet: oklch(80% 60% 280deg);
}

@layer components {
    .demo-surface {
        @apply bg-card text-card-foreground border-border rounded-md border shadow-sm;
    }
}

@keyframes popover-popup-in {
    from {
        opacity: 0;
        transform: translateY(-0.25rem) scale(0.98);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes popover-popup-out {
    from {
        opacity: 1;
        transform: translateY(0) scale(1);
    }

    to {
        opacity: 0;
        transform: translateY(-0.25rem) scale(0.98);
    }
}

@layer components {
    .demo-focus,
    .demo-button,
    .demo-input,
    .demo-combobox-select-trigger {
        @apply focus-visible:ring-ring focus-visible:ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-offset-2;
    }

    .demo-arrow {
        @apply fill-current drop-shadow-[0_1px_0_var(--color-border)];
    }

    .demo-button {
        @apply inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50;
    }

    .demo-button-primary {
        @apply bg-primary text-primary-foreground hover:bg-primary/90;
    }

    .demo-button-secondary {
        @apply bg-muted text-foreground hover:bg-muted/80;
    }

    .demo-button-outline {
        @apply border-border bg-background text-foreground hover:bg-muted border;
    }

    .demo-button-ghost {
        @apply text-foreground hover:bg-muted;
    }

    .demo-button-destructive {
        @apply bg-destructive text-destructive-foreground hover:bg-destructive/90;
    }

    .demo-input {
        @apply border-border bg-background text-foreground placeholder:text-muted-foreground rounded-md border text-sm;
    }

    .demo-select-trigger {
        @apply border-border bg-background text-foreground hover:bg-muted rounded-md border text-start text-sm shadow-sm disabled:cursor-not-allowed;
    }

    .demo-select-popup {
        @apply border-border bg-popover text-popover-foreground rounded-lg border shadow-md;
    }

    .demo-select-item {
        @apply text-popover-foreground cursor-default rounded-sm text-sm leading-none outline-none select-none;
    }

    .demo-select-group-label {
        @apply text-muted-foreground text-xs leading-6;
    }

    .demo-select-scroll-button {
        @apply bg-popover text-muted-foreground hover:bg-muted cursor-default;
    }

    .demo-otp-field-slot {
        @apply border-border bg-background text-foreground rounded-md border text-center font-mono text-lg;
    }

    .demo-label {
        @apply text-foreground text-sm font-medium;
    }

    .demo-editable-preview {
        @apply text-foreground hover:bg-muted cursor-text rounded-md border border-transparent text-sm;
    }

    .demo-calendar-root {
        @apply border-border bg-background rounded-xl border shadow-sm;
    }

    .demo-calendar-head-cell {
        @apply text-muted-foreground rounded-md text-center text-xs;
    }

    .demo-calendar-day {
        @apply text-foreground hover:bg-muted cursor-pointer rounded-full text-sm outline-none;
    }

    .demo-dialog-title {
        @apply text-card-foreground text-base font-semibold;
    }

    .demo-drawer-popup {
        @apply bg-card text-card-foreground shadow-lg;
    }

    .demo-drawer-side-bottom {
        @apply border-border rounded-t-2xl border-t border-b-0;
    }

    .demo-drawer-side-top {
        @apply border-border rounded-b-2xl border-b;
    }

    .demo-drawer-side-left {
        @apply border-border rounded-r-2xl border-r;
    }

    .demo-drawer-side-right {
        @apply border-border rounded-l-2xl border-l;
    }

    .demo-toast-title {
        @apply text-card-foreground text-sm font-semibold;
    }

    .demo-popover-title {
        @apply text-popover-foreground text-sm font-semibold;
    }

    .demo-checkbox-button {
        @apply border-border bg-background rounded-md border shadow-sm disabled:cursor-not-allowed aria-disabled:cursor-not-allowed;
    }

    .demo-radio-item {
        @apply border-border bg-background hover:bg-muted rounded-full border shadow-sm disabled:cursor-not-allowed;
    }

    .demo-avatar-root {
        @apply bg-muted rounded-full select-none;
    }

    .demo-accordion-root {
        @apply border-border bg-card rounded-xl border shadow-xs;
    }

    .demo-accordion-item-h {
        @apply border-border border-r border-b-0;
    }

    .demo-accordion-trigger {
        @apply bg-background text-foreground hover:bg-muted aria-disabled:text-muted-foreground aria-disabled:hover:bg-background cursor-default text-[15px] transition-colors aria-disabled:cursor-not-allowed;
    }

    .demo-accordion-content {
        @apply text-muted-foreground bg-muted text-[15px];
    }

    .demo-navigation-menu-trigger {
        @apply hover:bg-muted focus-visible:bg-muted rounded-md outline-none;
    }

    .demo-navigation-menu-card-link {
        @apply hover:bg-muted focus-visible:bg-muted rounded-md transition-colors outline-none select-none;
    }

    .demo-navigation-menu-card-text {
        @apply text-muted-foreground text-sm leading-snug;
    }

    .demo-tooltip-popup {
        @apply border-border bg-popover text-popover-foreground rounded-md border text-sm select-none;
    }

    .demo-menubar-root {
        @apply border-border bg-background rounded-md border shadow-sm;
    }

    .demo-menubar-trigger {
        @apply hover:bg-muted focus-visible:bg-muted cursor-default rounded-sm text-sm font-medium whitespace-nowrap outline-none select-none;
    }

    .demo-menu-context-area {
        @apply border-border text-muted-foreground focus-visible:outline-ring rounded-md border-2 border-dashed text-sm select-none focus-visible:outline-2;
    }

    .demo-menu-popup {
        @apply bg-popover text-popover-foreground border-border rounded-md border shadow-md outline-none;
    }

    .demo-menu-item {
        @apply cursor-default rounded-sm text-sm outline-none select-none;
    }

    .demo-menu-selectable-item {
        @apply cursor-default rounded-sm text-start text-sm outline-none select-none;
    }

    .demo-menu-group-label {
        @apply text-muted-foreground text-xs font-semibold;
    }

    .demo-cropper-root {
        @apply cursor-move touch-none rounded-lg outline-none;
    }

    .demo-cropper-crop-area {
        @apply border-[3px] border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] group-focus-visible:shadow-[0_0_0_9999px_rgba(0,0,0,0.4),0_0_0_3px_rgba(255,255,255,0.5)];
    }

    .demo-cropper-output {
        @apply bg-muted text-muted-foreground rounded-md text-sm whitespace-pre;
    }

    .demo-combobox-control {
        @apply border-border bg-background rounded-md border;
    }

    .demo-combobox-input {
        @apply text-foreground rounded-md bg-transparent text-sm outline-none;
    }

    .demo-combobox-input-inline {
        @apply text-foreground bg-transparent text-sm outline-none;
    }

    .demo-combobox-trigger {
        @apply text-muted-foreground hover:text-foreground rounded-sm;
    }

    .demo-combobox-popup {
        @apply border-border bg-popover text-popover-foreground rounded-md border shadow-md;
    }

    .demo-combobox-empty {
        @apply text-muted-foreground text-center text-sm;
    }

    .demo-combobox-select-trigger {
        @apply border-border bg-background text-foreground hover:bg-muted rounded-md border text-sm;
    }

    .demo-combobox-popup-input {
        @apply text-foreground rounded-sm bg-transparent text-sm outline-none;
    }

    .demo-combobox-chip {
        @apply bg-muted text-foreground rounded text-xs;
    }
}

@keyframes tabs-panel-in {
    from {
        opacity: 0;
        transform: translateY(6px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes tabs-panel-out {
    from {
        opacity: 1;
        transform: translateY(0);
    }

    to {
        opacity: 0;
        transform: translateY(6px);
    }
}

@keyframes accordion-down {
    from {
        height: 0;
    }

    to {
        height: var(--accordion-panel-height);
    }
}

@keyframes accordion-up {
    from {
        height: var(--accordion-panel-height);
    }

    to {
        height: 0;
    }
}

@keyframes accordion-right {
    from {
        width: 0;
    }

    to {
        width: var(--accordion-panel-width);
    }
}

@keyframes accordion-left {
    from {
        width: var(--accordion-panel-width);
    }

    to {
        width: 0;
    }
}

@keyframes popover-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes popover-out {
    from {
        opacity: 1;
    }

    to {
        opacity: 0;
    }
}

@keyframes popover-viewport-in {
    from {
        opacity: 0;
        transform: translateX(0.5rem);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes popover-viewport-out {
    from {
        opacity: 1;
        transform: translateX(0);
    }

    to {
        opacity: 0;
        transform: translateX(-0.5rem);
    }
}

@keyframes navigation-menu-popup-in {
    from {
        opacity: 0;
        transform: scale(0.96);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes navigation-menu-popup-out {
    from {
        opacity: 1;
        transform: scale(1);
    }

    to {
        opacity: 0;
        transform: scale(0.96);
    }
}

/*
 * Content morph between items. The viewport sets `data-activation-direction` so the entering and
 * leaving content slide toward the newly active trigger.
 */
@keyframes navigation-menu-content-in {
    from {
        opacity: 0;
        transform: translateX(var(--navigation-menu-content-in-x, 0));
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes navigation-menu-content-out {
    from {
        opacity: 1;
        transform: translateX(0);
    }

    to {
        opacity: 0;
        transform: translateX(var(--navigation-menu-content-out-x, 0));
    }
}

@keyframes dialog-overlay-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes dialog-overlay-out {
    from {
        opacity: 1;
    }

    to {
        opacity: 0;
    }
}

/*
 * Centering is handled by the popup's `-translate-x-1/2 -translate-y-1/2` utilities, which Tailwind v4
 * compiles to the standalone `translate` property. These keyframes must therefore animate only
 * `transform: scale()` — re-applying `translate(-50%, -50%)` here would compose with the `translate`
 * property and shift the popup by an extra -50%/-50% for the duration of the animation.
 */
@keyframes dialog-popup-in {
    from {
        opacity: 0;
        transform: scale(0.96);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes dialog-popup-out {
    from {
        opacity: 1;
        transform: scale(1);
    }

    to {
        opacity: 0;
        transform: scale(0.96);
    }
}

/*
 * Drawer slide keyframes. The popup's resting transform is driven by the swipe variables
 * (--drawer-swipe-movement-*), so these animate the full `transform` to slide the panel on/off the
 * matching edge; when the animation ends the resting swipe transform (0 by default) takes over.
 */
@keyframes drawer-in-bottom {
    from {
        transform: translateY(100%);
    }
}

@keyframes drawer-out-bottom {
    to {
        transform: translateY(100%);
    }
}

@keyframes drawer-in-top {
    from {
        transform: translateY(-100%);
    }
}

@keyframes drawer-out-top {
    to {
        transform: translateY(-100%);
    }
}

@keyframes drawer-in-left {
    from {
        transform: translateX(-100%);
    }
}

@keyframes drawer-out-left {
    to {
        transform: translateX(-100%);
    }
}

@keyframes drawer-in-right {
    from {
        transform: translateX(100%);
    }
}

@keyframes drawer-out-right {
    to {
        transform: translateX(100%);
    }
}

@keyframes toast-in {
    from {
        transform: translateX(110%);
        opacity: 0;
    }
}

@keyframes toast-out {
    to {
        transform: translateX(110%);
        opacity: 0;
    }
}

@keyframes toast-in-top {
    from {
        transform: translateY(-120%);
        opacity: 0;
    }
}

@keyframes toast-out-top {
    to {
        transform: translateY(-120%);
        opacity: 0;
    }
}

@layer base {
    body {
        color: var(--foreground);
        background-color: var(--background);
        font-synthesis: none;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
}

@layer components {
    .demo-switch {
        @apply bg-muted cursor-pointer rounded-full border-0 shadow-sm transition-colors;
    }

    .demo-switch-thumb {
        @apply bg-background rounded-full shadow-sm;
    }
}

@layer components {
    .demo-tabs-root {
        @apply border-border bg-background text-foreground rounded-xl border shadow-sm;
    }
}

@layer components {
    .demo-tabs-list {
        @apply border-border bg-muted/30 border-b;
    }
}

@layer components {
    .demo-tabs-tab {
        @apply text-muted-foreground hover:text-foreground text-sm font-medium transition-colors outline-none;
    }
}

@layer components {
    .demo-tabs-panel {
        @apply bg-background text-foreground text-sm leading-6 outline-none;
    }
}

@layer components {
    .demo-toolbar-root {
        @apply border-border bg-background rounded-lg border shadow-sm;
    }
}

@layer components {
    .demo-toolbar-button {
        @apply text-foreground hover:bg-muted rounded-md text-sm font-medium transition-colors outline-none;
    }
}

@layer components {
    .demo-toolbar-toggle {
        @apply text-muted-foreground hover:bg-muted rounded-md transition-colors outline-none;
    }
}

@layer components {
    .demo-toolbar-link {
        @apply text-muted-foreground hover:text-foreground rounded-md text-sm outline-none;
    }
}
```

</details>
