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
    RdxCheckboxIndicatorPresenceDirective,
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
        RdxCheckboxIndicatorPresenceDirective,
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
                                        *rdxCheckboxIndicatorPresence
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

[Download demo-styles.css](../demo-styles.css)

</details>
