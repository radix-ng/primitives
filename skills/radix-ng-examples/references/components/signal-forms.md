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

## Control authoring — the shared state surface

Every Radix NG form control exposes the optional Signal Forms `FormUiControl` state
(`invalid` / `errors` / `touched` / `dirty` inputs + a `touch` output) so `[formField]` can write it and
the control can reflect it as `data-*` / `aria-invalid`. Instead of re-declaring that block on every
primitive, three reusable pieces live in **`@radix-ng/primitives/core`** — controls inherit and compose
them rather than copy-paste:

- **`RdxFormUiControlBase`** — an abstract `@Directive()` that declares the five members **once** and
  builds the derived state (`formUi`). A control gets the whole surface with a single `extends` and only
  adds its own `value` / `checked` model. The declarations have to stay on a directive class: Angular's
  compiler only discovers `input()` / `model()` as field initializers, and Signal Forms binds
  form-written state onto the **single directive that carries the value model** — so inheritance keeps
  them co-located there (a host directive could not).
- **`createFormUiState(...)`** — derives `invalidState` / `touchedState` / `dirtyState` and the dual
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
    // invalid / errors / touched / dirty / touch + formUi are inherited — nothing else to declare.
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

`rdxSignalField` has no inputs — it reads the field from the co-located `[formField]` directive.

`rdxSignalForm` takes the root field:
