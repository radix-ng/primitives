# Switch

#### A control that allows the user to toggle between checked and not checked.

```typescript
import { Component } from '@angular/core';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { RdxSwitchRoot, RdxSwitchThumb } from '@radix-ng/primitives/switch';

@Component({
    selector: 'switch-default-example',
    imports: [RdxLabelDirective, RdxSwitchRoot, RdxSwitchThumb],
    template: `
        <label class="text-foreground flex items-center gap-3 text-sm font-medium" rdxLabel htmlFor="airplane-mode">
            Airplane mode
            <button
                class="bg-muted data-[checked]:bg-primary focus-visible:ring-ring relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-0 p-0 shadow-sm transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="airplane-mode"
                rdxSwitchRoot
                defaultChecked
            >
                <span
                    class="bg-background pointer-events-none block size-5 translate-x-0.5 rounded-full shadow-sm transition-transform data-[checked]:translate-x-[22px]"
                    rdxSwitchThumb
                ></span>
            </button>
        </label>
    `
})
export class SwitchDefaultExample {}
```

## Features

- ✅ Can be controlled or uncontrolled.
- ✅ Full keyboard navigation.
- ✅ Supports disabled, read-only and required states.
- ✅ Hidden native input for form submission and screen readers.

## Import

```typescript
import { RdxSwitchRoot, RdxSwitchThumb, RdxSwitchInput } from '@radix-ng/primitives/switch';
```

The API follows [Base UI Switch](https://base-ui.com/react/components/switch): a `Root` with a
`Thumb`, plus an optional hidden `Input` for native form submission.

## Anatomy

```html
<button rdxSwitchRoot [(checked)]="checked">
    <input rdxSwitchInput />
    <span rdxSwitchThumb></span>
</button>
```

The `[rdxSwitchInput]` is optional — include it when the switch must submit a value with a native form.

## Examples

### Preselection

Set `defaultChecked` (uncontrolled) or `[checked]` (controlled) to start in the on state.

```typescript
import { Component, signal } from '@angular/core';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { RdxSwitchInput, RdxSwitchRoot, RdxSwitchThumb } from '@radix-ng/primitives/switch';

@Component({
    selector: 'switch-preselection-example',
    imports: [RdxLabelDirective, RdxSwitchRoot, RdxSwitchInput, RdxSwitchThumb],
    template: `
        <label
            class="text-foreground flex items-center gap-3 text-sm font-medium"
            rdxLabel
            htmlFor="airplane-mode-model"
        >
            Airplane mode
            <button
                class="bg-muted data-[checked]:bg-primary focus-visible:ring-ring relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-0 p-0 shadow-sm transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="airplane-mode-model"
                [(checked)]="checked"
                rdxSwitchRoot
            >
                <input rdxSwitchInput />
                <span
                    class="bg-background pointer-events-none block size-5 translate-x-0.5 rounded-full shadow-sm transition-transform data-[checked]:translate-x-[22px]"
                    rdxSwitchThumb
                ></span>
            </button>
        </label>
    `
})
export class SwitchPreselectionExample {
    readonly checked = signal(true);
}
```

### Disabled

When `disabled` is present the switch cannot be focused or toggled.

```typescript
import { Component } from '@angular/core';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { RdxSwitchInput, RdxSwitchRoot, RdxSwitchThumb } from '@radix-ng/primitives/switch';

@Component({
    selector: 'switch-disabled-example',
    imports: [RdxLabelDirective, RdxSwitchRoot, RdxSwitchInput, RdxSwitchThumb],
    template: `
        <label
            class="text-foreground flex items-center gap-3 text-sm font-medium"
            rdxLabel
            htmlFor="airplane-mode-disabled"
        >
            Airplane mode
            <button
                class="bg-muted data-[checked]:bg-primary focus-visible:ring-ring relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-0 p-0 shadow-sm transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="airplane-mode-disabled"
                rdxSwitchRoot
                disabled
            >
                <input rdxSwitchInput />
                <span
                    class="bg-background pointer-events-none block size-5 translate-x-0.5 rounded-full shadow-sm transition-transform data-[checked]:translate-x-[22px]"
                    rdxSwitchThumb
                ></span>
            </button>
        </label>
    `
})
export class SwitchDisabledExample {}
```

### Read-only

A `readonly` switch is focusable and announced, but cannot be toggled.

```typescript
import { Component } from '@angular/core';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { RdxSwitchInput, RdxSwitchRoot, RdxSwitchThumb } from '@radix-ng/primitives/switch';

@Component({
    selector: 'switch-readonly-example',
    imports: [RdxLabelDirective, RdxSwitchRoot, RdxSwitchInput, RdxSwitchThumb],
    template: `
        <label
            class="text-foreground flex items-center gap-3 text-sm font-medium"
            rdxLabel
            htmlFor="airplane-mode-readonly"
        >
            Airplane mode
            <button
                class="bg-muted data-[checked]:bg-primary focus-visible:ring-ring relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-0 p-0 shadow-sm transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="airplane-mode-readonly"
                rdxSwitchRoot
                readonly
                defaultChecked
            >
                <input rdxSwitchInput />
                <span
                    class="bg-background pointer-events-none block size-5 translate-x-0.5 rounded-full shadow-sm transition-transform data-[checked]:translate-x-[22px]"
                    rdxSwitchThumb
                ></span>
            </button>
        </label>
    `
})
export class SwitchReadonlyExample {}
```

### Reactive Forms

Bind the switch to a form control via `formControlName`.

```typescript
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { RdxSwitchInput, RdxSwitchRoot, RdxSwitchThumb } from '@radix-ng/primitives/switch';

@Component({
    selector: 'switch-reactive-forms',
    imports: [ReactiveFormsModule, RdxLabelDirective, RdxSwitchRoot, RdxSwitchInput, RdxSwitchThumb],
    template: `
        <form class="space-y-3" [formGroup]="formGroup" (ngSubmit)="onSubmit()">
            <label
                class="text-foreground flex items-center gap-3 text-sm font-medium"
                rdxLabel
                htmlFor="airplane-mode-form"
            >
                Airplane mode
                <button
                    class="bg-muted data-[checked]:bg-primary focus-visible:ring-ring relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-0 p-0 shadow-sm transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                    id="airplane-mode-form"
                    formControlName="policy"
                    rdxSwitchRoot
                >
                    <input rdxSwitchInput />
                    <span
                        class="bg-background pointer-events-none block size-5 translate-x-0.5 rounded-full shadow-sm transition-transform data-[checked]:translate-x-[22px]"
                        rdxSwitchThumb
                    ></span>
                </button>
            </label>
            <button
                class="bg-primary text-primary-foreground focus-visible:ring-ring inline-flex h-9 items-center rounded-md px-3 text-sm font-medium shadow-sm outline-none focus-visible:ring-2"
                type="submit"
            >
                Submit
            </button>
        </form>
        <p class="mt-3">
            <button
                class="border-border bg-background text-foreground focus-visible:ring-ring inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium shadow-sm outline-none focus-visible:ring-2"
                (click)="setValue()"
                type="button"
            >
                Set preset value
            </button>
        </p>
    `
})
export class SwitchReactiveForms implements OnInit {
    formGroup!: FormGroup;

    ngOnInit() {
        this.formGroup = new FormGroup({
            policy: new FormControl<boolean>(true)
        });
    }

    onSubmit(): void {
        console.log(this.formGroup.value);
    }

    setValue() {
        this.formGroup.setValue({ policy: false });
    }
}
```

## API Reference

### Root

`RdxSwitchRoot`

| Data attribute     | Value                          |
| ------------------ | ------------------------------ |
| `[data-checked]`   | Present when the switch is on. |
| `[data-unchecked]` | Present when the switch is off.|
| `[data-disabled]`  | Present when disabled.         |
| `[data-readonly]`  | Present when read-only.        |
| `[data-required]`  | Present when required.         |

### Thumb

`RdxSwitchThumb` — reads everything from context; no inputs. Exposes `[data-checked]`,
`[data-unchecked]`, `[data-disabled]`, `[data-readonly]`.

### Input

`RdxSwitchInput` — the hidden native checkbox; reads everything from context. Carries `name`/`value`
for form submission.

## Accessibility

Adheres to the [`switch` role requirements](https://www.w3.org/WAI/ARIA/apg/patterns/switch).

### Keyboard Interactions

| Key     | Description                    |
| ------- | ------------------------------ |
| `Space` | Toggles the component's state. |
| `Enter` | Toggles the component's state. |
