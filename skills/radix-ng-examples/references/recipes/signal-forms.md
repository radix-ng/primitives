# Signal Forms

#### Build accessible forms with Angular **Signal Forms** and the headless `Field` parts.

This guide builds the same forms you'll find on the React side of the ecosystem, using Angular's
built-in [Signal Forms](https://angular.dev/guide/forms/signals) as the engine and Radix NG's `Form`,
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
import {
    recipeDescription,
    recipeError,
    recipeField,
    recipeForm,
    recipeInput,
    recipeLabel,
    recipeSubmit,
    recipeTextarea
} from './forms-recipes.shared';

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
        <form [class]="form0" (onFormSubmit)="onSubmit()" rdxFormRoot>
            <div [class]="field" name="title" rdxFieldRoot>
                <label [class]="label" rdxFieldLabel>Bug Title</label>
                <input
                    [class]="input"
                    [formField]="reportForm.title"
                    rdxFieldControl
                    rdxSignalField
                    placeholder="Login button not working on mobile"
                    autocomplete="off"
                />
                <p [class]="description" rdxFieldDescription>Provide a concise title for your bug report.</p>
                <p #titleError="rdxFieldError" [class]="error" rdxFieldError>{{ titleError.messages().join(' ') }}</p>
            </div>

            <div [class]="field" name="description" rdxFieldRoot>
                <label [class]="label" rdxFieldLabel>Description</label>
                <textarea
                    [class]="textarea"
                    [formField]="reportForm.description"
                    rdxFieldControl
                    rdxSignalField
                    placeholder="When I click the login button on my phone, nothing happens…"
                ></textarea>
                <p [class]="description" rdxFieldDescription>The more details, the faster we can reproduce it.</p>
                <p #descError="rdxFieldError" [class]="error" rdxFieldError>{{ descError.messages().join(' ') }}</p>
            </div>

            <button [class]="submit" type="submit">Submit</button>

            @if (result()) {
                <p [class]="description">Submitted: "{{ result()!.title }}"</p>
            }
        </form>
    `
})
export class SignalFormsBugReport {
    protected readonly form0 = recipeForm;
    protected readonly field = recipeField;
    protected readonly label = recipeLabel;
    protected readonly input = recipeInput;
    protected readonly textarea = recipeTextarea;
    protected readonly description = recipeDescription;
    protected readonly error = recipeError;
    protected readonly submit = recipeSubmit;

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
import {
    RdxFieldControl,
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot
} from '@radix-ng/primitives/field';
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
import {
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
    recipeSelectIndicator,
    recipeSelectItem,
    recipeSelectList,
    recipeSelectPopup,
    recipeSelectTrigger,
    recipeSubmit,
    recipeSwitch,
    recipeSwitchThumb,
    recipeTextarea
} from './forms-recipes.shared';

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
        <form [class]="form0" (onFormSubmit)="onSubmit()" rdxFormRoot>
            <!-- Text input -->
            <div [class]="field" name="title" rdxFieldRoot>
                <label [class]="label" rdxFieldLabel>Title</label>
                <input
                    [class]="input"
                    [formField]="issueForm.title"
                    rdxFieldControl
                    rdxSignalField
                    placeholder="Short summary"
                    autocomplete="off"
                />
                <p #titleError="rdxFieldError" [class]="error" rdxFieldError>{{ titleError.messages().join(' ') }}</p>
            </div>

            <!-- Select -->
            <div [class]="field" name="area" rdxFieldRoot>
                <label [class]="label" rdxFieldLabel>Area</label>
                <div [formField]="issueForm.area" rdxSelectRoot rdxSignalField>
                    <button [class]="selectTrigger" rdxSelectTrigger>
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
                <p #areaError="rdxFieldError" [class]="error" rdxFieldError>{{ areaError.messages().join(' ') }}</p>
            </div>

            <!-- Radio group -->
            <div [class]="field" name="priority" rdxFieldRoot>
                <span [class]="label">Priority</span>
                <div
                    [class]="radio.group"
                    [formField]="issueForm.priority"
                    rdxRadioRoot
                    rdxSignalField
                    aria-label="Priority"
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
                <p #priorityError="rdxFieldError" [class]="error" rdxFieldError>
                    {{ priorityError.messages().join(' ') }}
                </p>
            </div>

            <!-- Checkbox group -->
            <div [class]="field" name="labels" rdxFieldRoot>
                <span [class]="label">Labels</span>
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
                                <button [class]="checkbox.button" [attr.aria-label]="option.label" rdxCheckboxButton>
                                    <svg [class]="checkbox.indicator" rdxCheckboxIndicator size="16" lucideCheck></svg>
                                </button>
                            </div>
                            <span [class]="radio.label">{{ option.label }}</span>
                        </label>
                    }
                </div>
                <p #labelsError="rdxFieldError" [class]="error" rdxFieldError>{{ labelsError.messages().join(' ') }}</p>
            </div>

            <!-- Switch -->
            <div [class]="fieldRow" name="notify" rdxFieldRoot>
                <div [class]="fieldContent">
                    <span [class]="label">Email updates</span>
                    <p [class]="description">Get notified when this issue changes status.</p>
                </div>
                <button [class]="switchClass" [formField]="issueForm.notify" aria-label="Email updates" rdxSwitchRoot>
                    <span [class]="switchThumb" rdxSwitchThumb></span>
                </button>
            </div>

            <!-- Textarea -->
            <div [class]="field" name="details" rdxFieldRoot>
                <label [class]="label" rdxFieldLabel>Details</label>
                <textarea
                    [class]="textarea"
                    [formField]="issueForm.details"
                    rdxFieldControl
                    rdxSignalField
                    placeholder="Steps to reproduce, expected vs. actual…"
                ></textarea>
                <p #detailsError="rdxFieldError" [class]="error" rdxFieldError>
                    {{ detailsError.messages().join(' ') }}
                </p>
            </div>

            <button [class]="submit" type="submit">Create issue</button>

            @if (result()) {
                <p [class]="description">Created issue "{{ result()!.title }}" ({{ result()!.area }})</p>
            }
        </form>
    `
})
export class SignalFormsComplex {
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
} from './forms-recipes.shared';

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
```

## See also

- **Primitives / Signal Forms** — the `rdxSignalForm` / `rdxSignalField` adapter reference.
- **Primitives / Field**, **Primitives / Form** — the headless layers these recipes compose.
- **Recipes / Forms / TanStack Form** — the same forms built with TanStack Form.
