# Signal Forms

#### Build accessible forms with Angular **Signal Forms** and the headless `Field` parts.

This guide builds the same forms you'll find on the React side of the ecosystem, using Angular's
built-in [Signal Forms](https://angular.dev/guide/forms/signals/overview) as the engine and Radix NG's `Form`,
`Field` and control primitives for accessible, unstyled markup. You'll create a form with `form()`,
validate it with the schema validators, surface errors, and keep everything keyboard- and
screen-reader-friendly.

> **Note:** Browser validation is intentionally off (`Form` renders `novalidate`) so schema validation
> and the `Field` error region own the messaging.

## Demo

A bug report with a text input and a textarea. On submit the values are validated and any errors are
shown next to each field.

```typescript
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
```

## Approach

Signal Forms owns the value and the validation; the headless parts own structure and accessibility.

- `form(model, schema)` holds the value (a `signal`) and the validation rules.
- `rdxSignalField` (on each control next to `[formField]`) maps the bound field's `invalid` / `touched` /
  `dirty` / `errors` into the enclosing `Field` automatically — **no manual `[invalid]`/`[touched]` per
  field**.
- `Field` (`rdxFieldRoot` + `rdxFieldLabel` / `rdxFieldDescription` / `rdxFieldError`) renders the label,
  description and the polite error region, wiring `for` / `aria-describedby` / `aria-invalid` for you.
- `rdxFormRoot`'s default `validationMode="onBlur"` keeps each field neutral until it is touched or the form is submitted;
  `rdxFormRoot` records the submit attempt before checking validity, so a pristine invalid submit is
  blocked (first invalid field focused) and the errors appear — the Base UI / shadcn "reveal after
  interaction" behavior, with **no `markAsTouched()` ritual** in your code.

## Anatomy

A single field bound to Signal Forms. The control's value is written **once** with `[formField]`, and
`rdxSignalField` drives the Field's state and error from it — the field needs no manual state bindings.

```html
<form rdxFormRoot>
    <div rdxFieldRoot name="title">
        <label rdxFieldLabel>Bug Title</label>
        <input rdxFieldControl rdxSignalField [formField]="reportForm.title" />
        <p rdxFieldDescription>Provide a concise title for your bug report.</p>
        <p rdxFieldError #err="rdxFieldError">{{ err.messages().join(' ') }}</p>
    </div>
    <button type="submit">Submit</button>
</form>
```

## Set up the form

Define the model as a `signal` and describe the validation with the schema function. Each validator
takes an optional `message`.

```ts
import { form, minLength, maxLength, required } from '@angular/forms/signals';

type BugReport = { title: string; description: string };

readonly model = signal<BugReport>({ title: '', description: '' });
readonly reportForm = form(this.model, (path) => {
    required(path.title, { message: 'Bug title is required.' });
    minLength(path.title, 5, { message: 'Bug title must be at least 5 characters.' });
    maxLength(path.title, 32, { message: 'Bug title must be at most 32 characters.' });
});
```

## Displaying errors

`rdxSignalField` does the gating for you: the Field stays **neutral** (neither
`data-valid` nor `data-invalid`, `rdxFieldError` hidden) until the field is touched or the form is
submitted, then reveals real validity — no per-field helper. Because `rdxFormRoot` records the submit
attempt **before** checking validity, a pristine invalid submit is blocked and its errors revealed, so
your handler only runs on a valid submit:

```ts
protected onSubmit(): void {
    this.result.set(this.model());
}
```

`rdxFieldError` reads its text from `messages()` (the bound field's Signal Forms errors) and stays hidden
(plus `aria-invalid` off) until the field is invalid **and** revealed (touched or submitted).

> These recipes use the per-field `rdxSignalField`; the form-level `rdxSignalForm` name-routing also
> honours `validationMode` (its routed client errors are gated the same way). Only the Form's server
> `errors` input shows immediately.

## Field types

The complex example wires every control type to Signal Forms with a single `[formField]` binding plus
`rdxSignalField` on the same element — no per-field state bindings.

- **Input / Textarea** — `[formField]` + `rdxFieldControl rdxSignalField` on the native control.
- **Select** — `[formField]` + `rdxSignalField` on `rdxSelectRoot`; the trigger inherits `aria-invalid`.
- **Radio group** — `[formField]` + `rdxSignalField` on `rdxRadioRoot`; each `rdxRadioItem` carries a `value`.
- **Checkbox group** — `[formField]` + `[allValues]` + `rdxSignalField` on `rdxCheckboxGroup` (`string[]`).
- **Switch** — `[formField]` on `rdxSwitchRoot` for a boolean (no error to gate).

```html
<!-- Select -->
<div rdxFieldRoot name="area">
    <label rdxFieldLabel>Area</label>
    <div rdxSelectRoot rdxSignalField [formField]="issueForm.area">
        <button rdxSelectTrigger>
            <span rdxSelectValue placeholder="Select an area…" #v="rdxSelectedValue">{{ v.slotText() }}</span>
        </button>
        <!-- …portal / popup / items… -->
    </div>
    <p rdxFieldError #err="rdxFieldError">{{ err.messages().join(' ') }}</p>
</div>
```

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { form, FormField, minLength, required, validate } from '@angular/forms/signals';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxGroupDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';
import { RdxFieldControl, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormRoot } from '@radix-ng/primitives/form';
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
import { RdxSignalField } from '@radix-ng/primitives/signal-forms';
import { RdxSwitchRoot, RdxSwitchThumb } from '@radix-ng/primitives/switch';

type Issue = {
    title: string;
    area: string;
    priority: string | null;
    labels: string[];
    notify: boolean;
    details: string;
};

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

/**
 * A complete issue form covering every control type — text input, select, radio
 * group, checkbox group, switch and textarea — wired to **Signal Forms** and the
 * headless `Field` parts. Each control binds its value with a single `[formField]`
 * and gets `rdxSignalField`, so the Field's state and error surface automatically and,
 * with `rdxFormRoot`'s default `validationMode="onBlur"`, only after the field is touched
 * or the form is submitted — no manual `[invalid]`/`[touched]` per field. `rdxFormRoot`
 * records the submit attempt and blocks an invalid submit (focusing the first invalid
 * field), so the submit handler needs no `markAsTouched()`.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'signal-forms-complex',
    imports: [
        FormField,
        RdxFormRoot,
        RdxSignalField,
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
        <form class="flex w-100 flex-col gap-5" (onFormSubmit)="onSubmit()" rdxFormRoot>
            <!-- Text input -->
            <div class="flex flex-col gap-1.5" name="title" rdxFieldRoot>
                <label class="demo-label data-[disabled]:opacity-50" rdxFieldLabel>Title</label>
                <input
                    class="demo-input data-[invalid]:border-destructive data-[invalid]:ring-destructive/30 h-9 w-full px-3"
                    [formField]="issueForm.title"
                    rdxFieldControl
                    rdxSignalField
                    placeholder="Short summary"
                    autocomplete="off"
                />
                <p class="text-destructive text-sm" #titleError="rdxFieldError" rdxFieldError>
                    {{ titleError.messages().join(' ') }}
                </p>
            </div>

            <!-- Select -->
            <div class="flex flex-col gap-1.5" name="area" rdxFieldRoot>
                <label class="demo-label data-[disabled]:opacity-50" rdxFieldLabel>Area</label>
                <div [formField]="issueForm.area" rdxSelectRoot rdxSignalField>
                    <button
                        class="demo-select-trigger data-[placeholder]:text-muted-foreground data-[invalid]:border-destructive data-[invalid]:aria-invalid:ring-destructive/30 demo-focus inline-flex min-h-9 w-full items-center justify-between gap-2 px-3 py-1.5 disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
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
                                            <svg class="size-4 shrink-0" lucideCheck size="16" aria-hidden="true"></svg>
                                        </span>
                                        <span rdxSelectItemText>{{ option.label }}</span>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <p class="text-destructive text-sm" #areaError="rdxFieldError" rdxFieldError>
                    {{ areaError.messages().join(' ') }}
                </p>
            </div>

            <!-- Radio group -->
            <div class="flex flex-col gap-1.5" name="priority" rdxFieldRoot>
                <span class="demo-label data-[disabled]:opacity-50">Priority</span>
                <div
                    class="flex flex-col gap-2.5"
                    [formField]="issueForm.priority"
                    rdxRadioRoot
                    rdxSignalField
                    aria-label="Priority"
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
                <p class="text-destructive text-sm" #priorityError="rdxFieldError" rdxFieldError>
                    {{ priorityError.messages().join(' ') }}
                </p>
            </div>

            <!-- Checkbox group -->
            <div class="flex flex-col gap-1.5" name="labels" rdxFieldRoot>
                <span class="demo-label data-[disabled]:opacity-50">Labels</span>
                <div
                    class="flex flex-col gap-2.5"
                    [formField]="issueForm.labels"
                    [allValues]="allLabels"
                    rdxCheckboxGroup
                    rdxSignalField
                    aria-label="Labels"
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
                <p class="text-destructive text-sm" #labelsError="rdxFieldError" rdxFieldError>
                    {{ labelsError.messages().join(' ') }}
                </p>
            </div>

            <!-- Switch -->
            <div class="flex items-start justify-between gap-4" name="notify" rdxFieldRoot>
                <div class="flex flex-col gap-1.5">
                    <span class="demo-label data-[disabled]:opacity-50">Email updates</span>
                    <p class="text-muted-foreground text-sm">Get notified when this issue changes status.</p>
                </div>
                <button
                    class="demo-switch demo-focus data-[checked]:bg-primary relative inline-flex h-6 w-11 shrink-0 items-center p-0 disabled:cursor-not-allowed disabled:opacity-50"
                    [formField]="issueForm.notify"
                    aria-label="Email updates"
                    rdxSwitchRoot
                >
                    <span
                        class="demo-switch-thumb pointer-events-none block size-5 translate-x-0.5 transition-transform data-[checked]:translate-x-[22px]"
                        rdxSwitchThumb
                    ></span>
                </button>
            </div>

            <!-- Textarea -->
            <div class="flex flex-col gap-1.5" name="details" rdxFieldRoot>
                <label class="demo-label data-[disabled]:opacity-50" rdxFieldLabel>Details</label>
                <textarea
                    class="demo-input data-[invalid]:border-destructive data-[invalid]:ring-destructive/30 min-h-24 w-full px-3 py-2"
                    [formField]="issueForm.details"
                    rdxFieldControl
                    rdxSignalField
                    placeholder="Steps to reproduce, expected vs. actual…"
                ></textarea>
                <p class="text-destructive text-sm" #detailsError="rdxFieldError" rdxFieldError>
                    {{ detailsError.messages().join(' ') }}
                </p>
            </div>

            <button class="demo-button demo-button-primary h-9 px-4" type="submit">Create issue</button>

            @if (result()) {
                <p class="text-muted-foreground text-sm">
                    Created issue "{{ result()!.title }}" ({{ result()!.area }})
                </p>
            }
        </form>
    `
})
export class SignalFormsComplex {
    protected readonly areas = AREAS;
    protected readonly priorities = PRIORITIES;
    protected readonly labelOptions = LABELS;
    protected readonly allLabels = LABELS.map((l) => l.value);

    protected readonly result = signal<Issue | null>(null);

    protected readonly model = signal<Issue>({
        title: '',
        area: '',
        priority: null,
        labels: [],
        notify: true,
        details: ''
    });
    protected readonly issueForm = form(this.model, (path) => {
        required(path.title, { message: 'Title is required.' });
        minLength(path.title, 5, { message: 'Title must be at least 5 characters.' });
        required(path.area, { message: 'Choose an area.' });
        required(path.priority, { message: 'Choose a priority.' });
        validate(path.labels, (ctx) =>
            ctx.value().length > 0 ? undefined : { kind: 'minLabels', message: 'Pick at least one label.' }
        );
        required(path.details, { message: 'Details are required.' });
        minLength(path.details, 10, { message: 'Add at least 10 characters of detail.' });
    });

    // `rdxFormRoot` blocks an invalid submit and reveals the errors itself — this only runs when valid.
    protected onSubmit(): void {
        this.result.set(this.model());
    }
}
```

## Array fields

Mutating the model signal reshapes the field tree; `applyEach` applies the per-item schema so each row
validates independently. Add up to five rows and remove individual ones.

```ts
import { applyEach, email, form, required } from '@angular/forms/signals';

readonly model = signal<{ emails: { address: string }[] }>({ emails: [{ address: '' }] });
readonly contactsForm = form(this.model, (path) => {
    applyEach(path.emails, (item) => {
        required(item.address, { message: 'Email is required.' });
        email(item.address, { message: 'Enter a valid email address.' });
    });
});

addEmail() {
    this.model.update((c) => ({ emails: [...c.emails, { address: '' }] }));
}
```

```typescript
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
```

## See also

- **Primitives / Signal Forms** — the `rdxSignalForm` / `rdxSignalField` adapter reference.
- **Primitives / Field**, **Primitives / Form** — the headless layers these recipes compose.
- **Recipes / Forms / TanStack Form** — the same forms built with TanStack Form.

## Setup and shared files

These examples use Angular standalone components and Tailwind CSS v4. Install
`@radix-ng/primitives` and `@lucide/angular`. Copy the component from **Show code** and any shared files below,
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
