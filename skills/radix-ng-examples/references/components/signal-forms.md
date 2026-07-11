# Signal Forms

#### Bridge Angular [Signal Forms](https://angular.dev/guide/forms/signals) into headless `Field` and `Form`.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { email as emailFormat, form, FormField, required } from '@angular/forms/signals';
import {
    RdxFieldControl,
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot
} from '@radix-ng/primitives/field';
import { RdxFormRoot, RdxFormSubmitEvent } from '@radix-ng/primitives/form';
import { cn, demoButton, demoInput } from '../../storybook/styles';
import { RdxSignalField } from '../src/signal-field';
import { RdxSignalForm } from '../src/signal-form';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'signal-forms-field-example',
    imports: [
        FormField,
        RdxFormRoot,
        RdxSignalForm,
        RdxFieldRoot,
        RdxSignalField,
        RdxFieldLabel,
        RdxFieldControl,
        RdxFieldDescription,
        RdxFieldError
    ],
    template: `
        <form
            class="flex w-80 flex-col gap-3"
            [rdxSignalForm]="loginForm"
            (onFormSubmit)="onSubmit($event)"
            rdxFormRoot
        >
            <!--
              No manual [invalid]/[touched]/[dirty]/[disabled] on rdxFieldRoot — rdxSignalField drives them
              from the Signal Forms field, and the field expression is bound exactly once (on [formField]).
            -->
            <div class="flex flex-col gap-2" rdxFieldRoot required>
                <label [class]="labelClass" rdxFieldLabel>Email</label>
                <input [class]="inputClass" [formField]="email" rdxFieldControl rdxSignalField type="email" />
                <p [class]="descriptionClass" rdxFieldDescription>Use the email connected to your account.</p>
                <p #err="rdxFieldError" [class]="errorClass" rdxFieldError>{{ err.messages().join(' ') }}</p>
            </div>

            <button [class]="buttonClass" type="submit">Submit</button>
        </form>
    `
})
export class SignalFormsFieldExample {
    protected readonly inputClass = cn(
        demoInput,
        'data-[invalid]:border-destructive data-[invalid]:ring-destructive/20'
    );
    protected readonly buttonClass = cn(demoButton.base, demoButton.primary, demoButton.size.md, 'self-start');
    protected readonly labelClass = 'text-foreground text-sm font-medium data-[disabled]:opacity-50';
    protected readonly descriptionClass = 'text-muted-foreground text-sm';
    protected readonly errorClass = 'text-destructive text-sm';

    readonly model = signal({ email: '' });
    readonly loginForm = form(this.model, (path) => {
        required(path.email, { message: 'Email is required.' });
        emailFormat(path.email, { message: 'Enter a valid email address.' });
    });

    get email() {
        return this.loginForm.email;
    }

    // `(onFormSubmit)` is RdxFormRoot's guarded submit — it fires only when the form is valid (an
    // invalid submit focuses the first invalid field instead), so this runs only on a valid form.
    onSubmit(event: RdxFormSubmitEvent): void {
        console.log(event.values, this.model());
    }
}
```

`@radix-ng/primitives/signal-forms` is the **optional** integration entry: it imports
`@angular/forms/signals` so the headless `field` / `form` primitives don't have to. Controls stay dual
(they also work with Reactive / template-driven forms via `ControlValueAccessor`) — this entry only
feeds authoritative Signal Forms state into the accessibility layer.

## Features

- ✅ Reads state from the **same `[formField]` binding** — the field is written once, not twice.
- ✅ Drives `Field`'s `data-invalid` / `data-disabled` / `data-required` / `data-dirty` / `data-touched`
  and the error _content_ (`rdxFieldError.messages()`) from the bound Signal Forms field.
- ✅ Aggregates form-level `data-invalid` / `data-dirty` / `data-touched` / `data-submitting` and routes
  field errors by `name`.
- ✅ Optionally delegates submission to Angular's public `submit()` lifecycle — validation, touched state,
  concurrent-submit protection, `submitting()`, and returned submission errors remain Angular-owned.
- ✅ Leaves `@angular/forms` out of every other entry — install it only when you use this one.

## Import

```ts
import { RdxSignalField, RdxSignalForm } from '@radix-ng/primitives/signal-forms';
```

## Anatomy

`rdxSignalField` sits on the control next to `[formField]`; `rdxSignalForm` sits on the form root next to
`rdxFormRoot`. No state is bound by hand — both read it from Signal Forms.

```html
<form rdxFormRoot [rdxSignalForm]="loginForm">
    <div rdxFieldRoot>
        <label rdxFieldLabel>Email</label>
        <input rdxFieldControl [formField]="loginForm.email" rdxSignalField />
        <p rdxFieldDescription>Use your account email.</p>
        <p rdxFieldError #err="rdxFieldError">{{ err.messages().join(' ') }}</p>
    </div>
</form>
```

## Examples

### Field driven by Signal Forms

The `rdxFieldRoot` carries no manual `[invalid]`/`[touched]`/`[dirty]` — `rdxSignalField` maps them from
the field, including the validation message shown by `rdxFieldError`.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { email as emailFormat, form, FormField, required } from '@angular/forms/signals';
import {
    RdxFieldControl,
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot
} from '@radix-ng/primitives/field';
import { RdxFormRoot, RdxFormSubmitEvent } from '@radix-ng/primitives/form';
import { cn, demoButton, demoInput } from '../../storybook/styles';
import { RdxSignalField } from '../src/signal-field';
import { RdxSignalForm } from '../src/signal-form';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'signal-forms-field-example',
    imports: [
        FormField,
        RdxFormRoot,
        RdxSignalForm,
        RdxFieldRoot,
        RdxSignalField,
        RdxFieldLabel,
        RdxFieldControl,
        RdxFieldDescription,
        RdxFieldError
    ],
    template: `
        <form
            class="flex w-80 flex-col gap-3"
            [rdxSignalForm]="loginForm"
            (onFormSubmit)="onSubmit($event)"
            rdxFormRoot
        >
            <!--
              No manual [invalid]/[touched]/[dirty]/[disabled] on rdxFieldRoot — rdxSignalField drives them
              from the Signal Forms field, and the field expression is bound exactly once (on [formField]).
            -->
            <div class="flex flex-col gap-2" rdxFieldRoot required>
                <label [class]="labelClass" rdxFieldLabel>Email</label>
                <input [class]="inputClass" [formField]="email" rdxFieldControl rdxSignalField type="email" />
                <p [class]="descriptionClass" rdxFieldDescription>Use the email connected to your account.</p>
                <p #err="rdxFieldError" [class]="errorClass" rdxFieldError>{{ err.messages().join(' ') }}</p>
            </div>

            <button [class]="buttonClass" type="submit">Submit</button>
        </form>
    `
})
export class SignalFormsFieldExample {
    protected readonly inputClass = cn(
        demoInput,
        'data-[invalid]:border-destructive data-[invalid]:ring-destructive/20'
    );
    protected readonly buttonClass = cn(demoButton.base, demoButton.primary, demoButton.size.md, 'self-start');
    protected readonly labelClass = 'text-foreground text-sm font-medium data-[disabled]:opacity-50';
    protected readonly descriptionClass = 'text-muted-foreground text-sm';
    protected readonly errorClass = 'text-destructive text-sm';

    readonly model = signal({ email: '' });
    readonly loginForm = form(this.model, (path) => {
        required(path.email, { message: 'Email is required.' });
        emailFormat(path.email, { message: 'Enter a valid email address.' });
    });

    get email() {
        return this.loginForm.email;
    }

    // `(onFormSubmit)` is RdxFormRoot's guarded submit — it fires only when the form is valid (an
    // invalid submit focuses the first invalid field instead), so this runs only on a valid form.
    onSubmit(event: RdxFormSubmitEvent): void {
        console.log(event.values, this.model());
    }
}
```

### Two ways to surface field errors

There are **two modes** for routing a field's validation messages into `rdxFieldError.messages()` — pick
**one per field**:

1. **Per-field adapter** — put `rdxSignalField` on the control. It reads the bound field's `errors()`
   directly and registers them on the enclosing `rdxFieldRoot`. Use this when the field already needs the
   adapter for `data-invalid` / `data-touched` / `data-dirty` state (the common case).
2. **Form-level name routing** — set a `name` on `rdxFieldRoot` that matches the field key; the
   `rdxSignalForm` adapter's `errorsFor(name)` resolves it (dotted paths like `address.street` work). Use
   this when a field only needs its _messages_ from the form and not the per-field state attributes — no
   `rdxSignalField` needed.

Using **both** for the same field is harmless — `messages()` deduplicates by text, so a message shared by
the two sources renders once — but prefer a single mode for clarity.

### When validity is displayed (`validationMode`)

`rdxSignalField` reports the field's **actual** state; the `Field` decides **when** to surface it from
its `validationMode` (set on `rdxFormRoot`, or per field on `rdxFieldRoot`). The default is `'onBlur'`:
an empty required field stays **neutral** — neither `data-valid` nor `data-invalid`, `rdxFieldError`
hidden (Base UI's tri-state `valid: boolean | null`) — until it is touched or the form is submitted, then
it reflects real validity. No manual `[invalid]`/`[touched]` wiring.

| Mode         | Reveals validity when…                          |
| ------------ | ----------------------------------------------- |
| `'always'`   | immediately (eager)                             |
| `'onChange'` | the value changes (dirty), or touched/submitted |
| `'onBlur'`   | the field is touched, or submitted (default)    |
| `'onSubmit'` | a submit has been attempted                     |

```html
<!-- onBlur is the default; set another mode on the form (or a field) to override -->
<form rdxFormRoot validationMode="onSubmit">…</form>
```

The Form records the submit attempt **before** checking validity, so an invalid pristine submit is
blocked (and the first invalid field focused) and its errors revealed — the submit handler needs no
`markAsTouched()` ritual:

```ts
onSubmit() {
    // Only runs on a valid submit; rdxFormRoot blocks + reveals errors otherwise.
}
```

> Only server/external errors (`rdxFormRoot`'s `errors` input) bypass the gate — they show immediately.
> Client validation is mode-gated whether it flows through the per-field `rdxSignalField` **or** the
> form-level `rdxSignalForm` name-routing.

### Angular-owned submission (`rdxSignalSubmit`)

Add the opt-in `rdxSignalSubmit` input when the form created by `form()` defines a
`submission.action`. The adapter delegates the native submit to Angular's public `submit()` API; it does
not also emit `rdxFormRoot.onFormSubmit`, avoiding duplicate user side effects.

```html
<form rdxFormRoot [rdxSignalForm]="accountForm" rdxSignalSubmit>
  <!-- fields -->
  <button type="submit" [disabled]="accountForm().submitting()">
    {{ accountForm().submitting() ? 'Saving…' : 'Save' }}
  </button>
</form>
```

```ts
readonly accountForm = form(
  this.model,
  (path) => required(path.email, { message: 'Email is required.' }),
  {
    submission: {
      action: async (field) => {
        const result = await this.api.createAccount(field().value());
        if (result.emailTaken) {
          return {
            kind: 'emailTaken',
            message: 'This email is already registered.',
            fieldTree: field.email
          };
        }
      }
    }
  }
);
```

Angular marks interactive fields touched, blocks invalid forms, guards concurrent submits, updates
`submitting()`, and attaches returned errors to their `fieldTree`. Radix NG keeps the Base UI-facing
responsibilities: error presentation, accessible relationships, and first-invalid focus.

`rdxSignalSubmit` is deliberately opt-in in 1.x. Without it, `[rdxSignalForm]` remains a state adapter
and `rdxFormRoot` keeps its existing `(onFormSubmit)` path.

The separate `rdxFormRoot[errors]` channel remains Base UI-compatible in either mode: a visible external
error blocks delegation until the field is edited and that error is cleared.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { email as emailFormat, form, FormField, required } from '@angular/forms/signals';
import {
    RdxFieldControl,
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot
} from '@radix-ng/primitives/field';
import { RdxFormRoot } from '@radix-ng/primitives/form';
import { cn, demoButton, demoInput } from '../../storybook/styles';
import { RdxSignalField } from '../src/signal-field';
import { RdxSignalForm } from '../src/signal-form';

const takenEmail = 'taken@radix-ng.com';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'signal-forms-submission-example',
    imports: [
        FormField,
        RdxFormRoot,
        RdxSignalForm,
        RdxFieldRoot,
        RdxSignalField,
        RdxFieldLabel,
        RdxFieldControl,
        RdxFieldDescription,
        RdxFieldError
    ],
    template: `
        <form class="flex w-80 flex-col gap-3" [rdxSignalForm]="accountForm" rdxFormRoot rdxSignalSubmit>
            <div class="flex flex-col gap-2" rdxFieldRoot>
                <label [class]="labelClass" rdxFieldLabel>Email</label>
                <input
                    [class]="inputClass"
                    [formField]="accountForm.email"
                    rdxFieldControl
                    rdxSignalField
                    type="email"
                />
                <p [class]="descriptionClass" rdxFieldDescription>Use {{ takenEmail }} to preview a server error.</p>
                <p #err="rdxFieldError" [class]="errorClass" rdxFieldError>{{ err.messages().join(' ') }}</p>
            </div>

            <button [class]="buttonClass" [disabled]="accountForm().submitting()" type="submit">
                {{ accountForm().submitting() ? 'Creating account…' : 'Create account' }}
            </button>

            @if (submittedEmail(); as email) {
                <p class="text-muted-foreground text-sm" role="status">Account created for {{ email }}.</p>
            }
        </form>
    `
})
export class SignalFormsSubmissionExample {
    protected readonly takenEmail = takenEmail;
    protected readonly inputClass = cn(
        demoInput,
        'data-[invalid]:border-destructive data-[invalid]:ring-destructive/20'
    );
    protected readonly buttonClass = cn(
        demoButton.base,
        demoButton.primary,
        demoButton.size.md,
        'self-start disabled:cursor-wait disabled:opacity-60'
    );
    protected readonly labelClass = 'text-foreground text-sm font-medium data-[disabled]:opacity-50';
    protected readonly descriptionClass = 'text-muted-foreground text-sm';
    protected readonly errorClass = 'text-destructive text-sm';

    protected readonly submittedEmail = signal<string | null>(null);
    readonly model = signal({ email: '' });
    readonly accountForm = form(
        this.model,
        (path) => {
            required(path.email, { message: 'Email is required.' });
            emailFormat(path.email, { message: 'Enter a valid email address.' });
        },
        {
            submission: {
                action: async (field) => {
                    this.submittedEmail.set(null);
                    await new Promise((resolve) => setTimeout(resolve, 600));

                    const email = field.email().value();
                    if (email.toLowerCase() === takenEmail) {
                        return {
                            kind: 'emailTaken',
                            message: 'This email is already registered.',
                            fieldTree: field.email
                        };
                    }

                    this.submittedEmail.set(email);
                    return undefined;
                }
            }
        }
    );
}
```

### Pending async validation

Signal Forms exposes `pending()` directly. Radix NG does not invent a `data-pending` attribute that Base
UI does not publish; it uses pending internally only to preserve tri-state validity. While validation is
pending, Field and control publish neither `data-valid` nor `data-invalid`.

```html
@if (accountForm.email().pending()) {
  <p role="status">Checking email…</p>
}
```

## Control authoring — the shared state surface

Every Radix NG form control exposes the optional Signal Forms `FormUiControl` state
(`invalid` / `pending` / `errors` / `touched` / `dirty` inputs + a `touch` output) so `[formField]` can write it and
the control can reflect it as `data-*` / `aria-invalid`. Instead of re-declaring that block on every
primitive, three reusable pieces live in **`@radix-ng/primitives/core`** — controls inherit and compose
them rather than copy-paste:

> **Single-source contract.** A control's own `invalid` / `errors` inputs reflect on its `data-*` /
> `aria-invalid` only when it is used **standalone**. **Inside a `Field`, the `Field` owns the displayed
> validity** (so the control honours the field's `validationMode` neutral state, and field + control never
> disagree). To make a field invalid, drive it through the Field: `rdxSignalField` (Signal Forms) or
> `[invalid]` on `rdxFieldRoot` — not the control's own `invalid` input.

- **`RdxFormUiControlBase`** — an abstract `@Directive()` that declares the six members **once** and
  builds the derived state (`formUi`). A control gets the whole surface with a single `extends` and only
  adds its own `value` / `checked` model. The declarations have to stay on a directive class: Angular's
  compiler only discovers `input()` / `model()` as field initializers, and Signal Forms binds
  form-written state onto the **single directive that carries the value model** — so inheritance keeps
  them co-located there (a host directive could not).
- **`createFormUiState(...)`** — derives `invalidState` / `pendingState` / `touchedState` / `dirtyState` and the dual
  `markAsTouched` (it bridges the control's `ControlValueAccessor` when it has one, so the same call
  notifies Reactive / template-driven forms too). The base calls it; a control that cannot extend the
  base calls it directly. Compound controls also get `formUiStateContext()` to surface the state to a
  child part (e.g. select reflects on its trigger).
- **`RdxFormUiStateHost`** + **`provideFormUiState(...)`** — a host directive that reflects the state as
  `aria-invalid` / `data-invalid|valid|touched|dirty` and marks touched on focus-out, so those host
  bindings aren't repeated either.

```ts
import { inject, Directive, model } from '@angular/core';
import {
    RdxFormUiControlBase,
    RdxFormUiStateHost,
    provideFormUiState,
    RdxFormValueControl
} from '@radix-ng/primitives/core';

@Directive({
    selector: '[myControl]',
    hostDirectives: [RdxFormUiStateHost],
    providers: [provideFormUiState(() => inject(MyControl).formUi)]
})
export class MyControl extends RdxFormUiControlBase implements RdxFormValueControl<string> {
    readonly value = model<string>('');
    // invalid / pending / errors / touched / dirty / touch + formUi are inherited — nothing else to declare.
}
```

**Every** form control ships this surface. Twelve `extends RdxFormUiControlBase` — `select`, `switch`,
`radio`, `number-field`, `toggle-group`, `checkbox-group`, `slider`, `combobox`, `autocomplete`,
`date-field`, `time-field`, `editable` — while `input` and `checkbox` keep their own equivalent inline.
Dual controls (with a `ControlValueAccessor`) override `formUiTouchTarget()` to return their CVA;
CVA-less controls (`select`, `date-field`, `time-field`, `editable`) bind via Signal Forms only. Slider
extends the base but skips the `implements FormValueControl` check (its `number | number[]` value
collides with the shim's scalar `min`/`max`) — it still ships the same runtime surface.

## API Reference

`rdxSignalField` has no inputs — it reads the field from the co-located `[formField]` directive and
reports its actual state. When validity is **displayed** is controlled by `validationMode` on `rdxFormRoot`
/ `rdxFieldRoot`, not on the adapter.

`rdxSignalForm` takes the root field:
