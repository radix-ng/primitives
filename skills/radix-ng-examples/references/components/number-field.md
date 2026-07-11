# Number Field

#### A numeric input with stepper buttons, drag-to-scrub, locale-aware formatting and keyboard control.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideDynamicIcon, LucideMinus as Minus, LucidePlus as Plus } from '@lucide/angular';
import {
    RdxNumberFieldDecrement,
    RdxNumberFieldGroup,
    RdxNumberFieldIncrement,
    RdxNumberFieldInput,
    RdxNumberFieldRoot
} from '@radix-ng/primitives/number-field';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'number-field-default-example',
    imports: [
        LucideDynamicIcon,
        RdxNumberFieldRoot,
        RdxNumberFieldGroup,
        RdxNumberFieldInput,
        RdxNumberFieldIncrement,
        RdxNumberFieldDecrement
    ],
    template: `
        <div class="flex flex-col gap-1.5" [id]="'quantity'" [defaultValue]="100" [min]="0" rdxNumberFieldRoot>
            <label class="text-foreground text-sm font-medium" for="quantity">Quantity</label>
            <div
                class="border-border bg-background focus-within:ring-ring flex h-9 w-fit items-center rounded-md border shadow-sm focus-within:ring-2"
                rdxNumberFieldGroup
            >
                <button
                    class="text-foreground hover:bg-muted flex size-9 items-center justify-center rounded-l-md outline-none select-none disabled:pointer-events-none disabled:opacity-40"
                    rdxNumberFieldDecrement
                >
                    <svg class="flex" [lucideIcon]="Minus" size="16" />
                </button>
                <input
                    class="text-foreground h-9 w-16 bg-transparent text-center tabular-nums outline-none"
                    rdxNumberFieldInput
                />
                <button
                    class="text-foreground hover:bg-muted flex size-9 items-center justify-center rounded-r-md outline-none select-none disabled:pointer-events-none disabled:opacity-40"
                    rdxNumberFieldIncrement
                >
                    <svg class="flex" [lucideIcon]="Plus" size="16" />
                </button>
            </div>
        </div>
    `
})
export class NumberFieldDefaultExample {
    protected readonly Minus = Minus;
    protected readonly Plus = Plus;
}
```

## Features

- ✅ Controlled or uncontrolled value, with cancelable `(onValueChange)` and `(onValueCommitted)`.
- ✅ Stepper buttons with press-and-hold auto-repeat.
- ✅ Keyboard control — arrow keys, `Home`/`End`, plus `Alt` (small) and `Shift` (large) steps.
- ✅ Drag-to-scrub via the Scrub Area (Pointer Lock with an optional virtual cursor).
- ✅ Optional mouse-wheel scrubbing while focused.
- ✅ Locale-aware parsing and formatting (decimal, percent, currency, unit) via `Intl.NumberFormat`.
- ✅ `min`/`max` clamping with optional `allowOutOfRange` for direct text entry, and `snapOnStep`.
- ✅ Works with Angular reactive and template-driven forms.

## Preface

Formatting and parsing build on [@internationalized/number](https://react-spectrum.adobe.com/internationalized/number/index.html),
so numbers are read and displayed according to the chosen `locale` and `format` options.

## Import

```ts
import {
  RdxNumberFieldRoot,
  RdxNumberFieldGroup,
  RdxNumberFieldInput,
  RdxNumberFieldIncrement,
  RdxNumberFieldDecrement,
  RdxNumberFieldScrubArea,
  RdxNumberFieldScrubAreaCursor
} from '@radix-ng/primitives/number-field';
```

## Anatomy

Import all parts and piece them together.

```html
<div rdxNumberFieldRoot>
  <span rdxNumberFieldScrubArea>
    <label>Label</label>
    <span rdxNumberFieldScrubAreaCursor></span>
  </span>
  <div rdxNumberFieldGroup>
    <button rdxNumberFieldDecrement></button>
    <input rdxNumberFieldInput />
    <button rdxNumberFieldIncrement></button>
  </div>
</div>
```

Add `<input rdxNumberFieldHiddenInput />` only when browser-native numeric constraint validation
(`min` / `max` / `step` / `required`) or autofill is required. Normal named form serialization is
provided by the root, so it does not need an extra input.

## Change events

`onValueChange` emits `{ value, eventDetails }`. `onValueCommitted` still emits the committed
number (or `null`). Call `eventDetails.cancel()` to reject a value before it updates.

```html
<div [value]="value()" (onValueChange)="setValue($event)" rdxNumberFieldRoot>
    ...
</div>
```

```ts
setValue(change: RdxNumberFieldValueChangeEvent) {
    if (change.value != null && change.value > this.limit()) {
        change.eventDetails.cancel();
        return;
    }

    this.value.set(change.value);
}
```

## Examples

### Default

A basic field with a label, stepper buttons and a `min` of `0`.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideDynamicIcon, LucideMinus as Minus, LucidePlus as Plus } from '@lucide/angular';
import {
    RdxNumberFieldDecrement,
    RdxNumberFieldGroup,
    RdxNumberFieldIncrement,
    RdxNumberFieldInput,
    RdxNumberFieldRoot
} from '@radix-ng/primitives/number-field';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'number-field-default-example',
    imports: [
        LucideDynamicIcon,
        RdxNumberFieldRoot,
        RdxNumberFieldGroup,
        RdxNumberFieldInput,
        RdxNumberFieldIncrement,
        RdxNumberFieldDecrement
    ],
    template: `
        <div class="flex flex-col gap-1.5" [id]="'quantity'" [defaultValue]="100" [min]="0" rdxNumberFieldRoot>
            <label class="text-foreground text-sm font-medium" for="quantity">Quantity</label>
            <div
                class="border-border bg-background focus-within:ring-ring flex h-9 w-fit items-center rounded-md border shadow-sm focus-within:ring-2"
                rdxNumberFieldGroup
            >
                <button
                    class="text-foreground hover:bg-muted flex size-9 items-center justify-center rounded-l-md outline-none select-none disabled:pointer-events-none disabled:opacity-40"
                    rdxNumberFieldDecrement
                >
                    <svg class="flex" [lucideIcon]="Minus" size="16" />
                </button>
                <input
                    class="text-foreground h-9 w-16 bg-transparent text-center tabular-nums outline-none"
                    rdxNumberFieldInput
                />
                <button
                    class="text-foreground hover:bg-muted flex size-9 items-center justify-center rounded-r-md outline-none select-none disabled:pointer-events-none disabled:opacity-40"
                    rdxNumberFieldIncrement
                >
                    <svg class="flex" [lucideIcon]="Plus" size="16" />
                </button>
            </div>
        </div>
    `
})
export class NumberFieldDefaultExample {
    protected readonly Minus = Minus;
    protected readonly Plus = Plus;
}
```

### Decimal

Fractional steps with `signDisplay` and fraction-digit formatting.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideDynamicIcon, LucideMinus as Minus, LucidePlus as Plus } from '@lucide/angular';
import {
    RdxNumberFieldDecrement,
    RdxNumberFieldGroup,
    RdxNumberFieldIncrement,
    RdxNumberFieldInput,
    RdxNumberFieldRoot
} from '@radix-ng/primitives/number-field';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'number-field-decimal-example',
    imports: [
        LucideDynamicIcon,
        RdxNumberFieldRoot,
        RdxNumberFieldGroup,
        RdxNumberFieldInput,
        RdxNumberFieldIncrement,
        RdxNumberFieldDecrement
    ],
    template: `
        <div
            class="flex flex-col gap-1.5"
            id="decimal"
            [defaultValue]="0"
            [format]="format"
            [step]="0.1"
            rdxNumberFieldRoot
        >
            <label class="text-foreground text-sm font-medium" for="decimal">Decimal</label>
            <div
                class="border-border bg-background focus-within:ring-ring flex h-9 w-fit items-center rounded-md border shadow-sm focus-within:ring-2"
                rdxNumberFieldGroup
            >
                <button
                    class="text-foreground hover:bg-muted flex size-9 items-center justify-center rounded-l-md outline-none select-none disabled:pointer-events-none disabled:opacity-40"
                    rdxNumberFieldDecrement
                >
                    <svg class="flex" [lucideIcon]="Minus" size="16" />
                </button>
                <input
                    class="text-foreground h-9 w-20 bg-transparent text-center tabular-nums outline-none"
                    rdxNumberFieldInput
                />
                <button
                    class="text-foreground hover:bg-muted flex size-9 items-center justify-center rounded-r-md outline-none select-none disabled:pointer-events-none disabled:opacity-40"
                    rdxNumberFieldIncrement
                >
                    <svg class="flex" [lucideIcon]="Plus" size="16" />
                </button>
            </div>
        </div>
    `
})
export class NumberFieldDecimalExample {
    protected readonly format: Intl.NumberFormatOptions = {
        signDisplay: 'exceptZero',
        minimumFractionDigits: 1,
        maximumFractionDigits: 2
    };

    protected readonly Minus = Minus;
    protected readonly Plus = Plus;
}
```

### Percentage

`format: { style: 'percent' }` displays and parses the value as a percentage.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideDynamicIcon, LucideMinus as Minus, LucidePlus as Plus } from '@lucide/angular';
import {
    RdxNumberFieldDecrement,
    RdxNumberFieldGroup,
    RdxNumberFieldIncrement,
    RdxNumberFieldInput,
    RdxNumberFieldRoot
} from '@radix-ng/primitives/number-field';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'number-field-percentage-example',
    imports: [
        LucideDynamicIcon,
        RdxNumberFieldRoot,
        RdxNumberFieldGroup,
        RdxNumberFieldInput,
        RdxNumberFieldIncrement,
        RdxNumberFieldDecrement
    ],
    template: `
        <div
            class="flex flex-col gap-1.5"
            id="percentage"
            [defaultValue]="0.05"
            [format]="format"
            [step]="0.01"
            rdxNumberFieldRoot
        >
            <label class="text-foreground text-sm font-medium" for="percentage">Percentage</label>
            <div
                class="border-border bg-background focus-within:ring-ring flex h-9 w-fit items-center rounded-md border shadow-sm focus-within:ring-2"
                rdxNumberFieldGroup
            >
                <button
                    class="text-foreground hover:bg-muted flex size-9 items-center justify-center rounded-l-md outline-none select-none disabled:pointer-events-none disabled:opacity-40"
                    rdxNumberFieldDecrement
                >
                    <svg class="flex" [lucideIcon]="Minus" size="16" />
                </button>
                <input
                    class="text-foreground h-9 w-20 bg-transparent text-center tabular-nums outline-none"
                    rdxNumberFieldInput
                />
                <button
                    class="text-foreground hover:bg-muted flex size-9 items-center justify-center rounded-r-md outline-none select-none disabled:pointer-events-none disabled:opacity-40"
                    rdxNumberFieldIncrement
                >
                    <svg class="flex" [lucideIcon]="Plus" size="16" />
                </button>
            </div>
        </div>
    `
})
export class NumberFieldPercentageExample {
    protected readonly format: Intl.NumberFormatOptions = {
        style: 'percent'
    };

    protected readonly Minus = Minus;
    protected readonly Plus = Plus;
}
```

### Currency

`format: { style: 'currency', currency: 'EUR' }` renders a currency value.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideDynamicIcon, LucideMinus as Minus, LucidePlus as Plus } from '@lucide/angular';
import {
    RdxNumberFieldDecrement,
    RdxNumberFieldGroup,
    RdxNumberFieldIncrement,
    RdxNumberFieldInput,
    RdxNumberFieldRoot
} from '@radix-ng/primitives/number-field';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'number-field-currency-example',
    imports: [
        LucideDynamicIcon,
        RdxNumberFieldRoot,
        RdxNumberFieldGroup,
        RdxNumberFieldInput,
        RdxNumberFieldIncrement,
        RdxNumberFieldDecrement
    ],
    template: `
        <div class="flex flex-col gap-1.5" [id]="'currency'" [defaultValue]="5" [format]="format" rdxNumberFieldRoot>
            <label class="text-foreground text-sm font-medium" for="currency">Price</label>
            <div
                class="border-border bg-background focus-within:ring-ring flex h-9 w-fit items-center rounded-md border shadow-sm focus-within:ring-2"
                rdxNumberFieldGroup
            >
                <button
                    class="text-foreground hover:bg-muted flex size-9 items-center justify-center rounded-l-md outline-none select-none disabled:pointer-events-none disabled:opacity-40"
                    rdxNumberFieldDecrement
                >
                    <svg class="flex" [lucideIcon]="Minus" size="16" />
                </button>
                <input
                    class="text-foreground h-9 w-28 bg-transparent text-center tabular-nums outline-none"
                    rdxNumberFieldInput
                />
                <button
                    class="text-foreground hover:bg-muted flex size-9 items-center justify-center rounded-r-md outline-none select-none disabled:pointer-events-none disabled:opacity-40"
                    rdxNumberFieldIncrement
                >
                    <svg class="flex" [lucideIcon]="Plus" size="16" />
                </button>
            </div>
        </div>
    `
})
export class NumberFieldCurrencyExample {
    protected readonly format: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: 'EUR',
        currencyDisplay: 'symbol'
    };

    protected readonly Minus = Minus;
    protected readonly Plus = Plus;
}
```

### Scrub Area

Drag the label horizontally to change the value; a virtual cursor follows the pointer.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    LucideDynamicIcon,
    LucideMinus as Minus,
    LucideMoveHorizontal as Move,
    LucidePlus as Plus
} from '@lucide/angular';
import {
    RdxNumberFieldDecrement,
    RdxNumberFieldGroup,
    RdxNumberFieldIncrement,
    RdxNumberFieldInput,
    RdxNumberFieldRoot,
    RdxNumberFieldScrubArea,
    RdxNumberFieldScrubAreaCursor
} from '@radix-ng/primitives/number-field';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'number-field-scrub-example',
    imports: [
        LucideDynamicIcon,
        RdxNumberFieldRoot,
        RdxNumberFieldGroup,
        RdxNumberFieldInput,
        RdxNumberFieldIncrement,
        RdxNumberFieldDecrement,
        RdxNumberFieldScrubArea,
        RdxNumberFieldScrubAreaCursor
    ],
    template: `
        <div class="flex flex-col gap-1.5" [id]="'scrub'" [defaultValue]="0" rdxNumberFieldRoot>
            <div
                class="text-foreground flex w-fit cursor-ew-resize items-center gap-1.5 text-sm font-medium select-none"
                rdxNumberFieldScrubArea
            >
                <svg class="flex" [lucideIcon]="Move" size="16" />
                <label for="scrub">Drag to scrub</label>
                <span class="text-popover-foreground" rdxNumberFieldScrubAreaCursor>
                    <svg class="flex" [lucideIcon]="Move" size="20" />
                </span>
            </div>
            <div
                class="border-border bg-background focus-within:ring-ring flex h-9 w-fit items-center rounded-md border shadow-sm focus-within:ring-2"
                rdxNumberFieldGroup
            >
                <button
                    class="text-foreground hover:bg-muted flex size-9 items-center justify-center rounded-l-md outline-none select-none disabled:pointer-events-none disabled:opacity-40"
                    rdxNumberFieldDecrement
                >
                    <svg class="flex" [lucideIcon]="Minus" size="16" />
                </button>
                <input
                    class="text-foreground h-9 w-16 bg-transparent text-center tabular-nums outline-none"
                    rdxNumberFieldInput
                />
                <button
                    class="text-foreground hover:bg-muted flex size-9 items-center justify-center rounded-r-md outline-none select-none disabled:pointer-events-none disabled:opacity-40"
                    rdxNumberFieldIncrement
                >
                    <svg class="flex" [lucideIcon]="Plus" size="16" />
                </button>
            </div>
        </div>
    `
})
export class NumberFieldScrubExample {
    protected readonly Minus = Minus;
    protected readonly Plus = Plus;
    protected readonly Move = Move;
}
```

### Reactive Forms

The control integrates with `formControlName`, exposing the numeric value to the form.

```typescript
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LucideDynamicIcon, LucideMinus as Minus, LucidePlus as Plus } from '@lucide/angular';
import {
    RdxNumberFieldDecrement,
    RdxNumberFieldGroup,
    RdxNumberFieldIncrement,
    RdxNumberFieldInput,
    RdxNumberFieldRoot
} from '@radix-ng/primitives/number-field';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'number-field-reactive-forms',
    imports: [
        ReactiveFormsModule,
        LucideDynamicIcon,
        RdxNumberFieldRoot,
        RdxNumberFieldGroup,
        RdxNumberFieldInput,
        RdxNumberFieldIncrement,
        RdxNumberFieldDecrement
    ],
    template: `
        <form class="space-y-3" [formGroup]="formGroup" (ngSubmit)="onSubmit()">
            <div
                class="flex flex-col gap-1.5"
                id="guests"
                [min]="1"
                [max]="9"
                name="guests"
                formControlName="guests"
                rdxNumberFieldRoot
            >
                <label class="text-foreground text-sm font-medium" for="guests">Guests</label>
                <div
                    class="border-border bg-background focus-within:ring-ring flex h-9 w-fit items-center rounded-md border shadow-sm focus-within:ring-2"
                    rdxNumberFieldGroup
                >
                    <button
                        class="text-foreground hover:bg-muted flex size-9 items-center justify-center rounded-l-md outline-none select-none disabled:pointer-events-none disabled:opacity-40"
                        rdxNumberFieldDecrement
                    >
                        <svg class="flex" [lucideIcon]="Minus" size="16" />
                    </button>
                    <input
                        class="text-foreground h-9 w-16 bg-transparent text-center tabular-nums outline-none"
                        rdxNumberFieldInput
                    />
                    <button
                        class="text-foreground hover:bg-muted flex size-9 items-center justify-center rounded-r-md outline-none select-none disabled:pointer-events-none disabled:opacity-40"
                        rdxNumberFieldIncrement
                    >
                        <svg class="flex" [lucideIcon]="Plus" size="16" />
                    </button>
                </div>
            </div>
            <button
                class="bg-primary text-primary-foreground focus-visible:ring-ring inline-flex h-9 items-center rounded-md px-3 text-sm font-medium shadow-sm outline-none focus-visible:ring-2"
                type="submit"
            >
                Submit
            </button>
        </form>
        <p class="text-muted-foreground mt-3 text-sm">Value: {{ formGroup.value.guests }}</p>
    `
})
export class NumberFieldReactiveForms implements OnInit {
    formGroup!: FormGroup;

    protected readonly Minus = Minus;
    protected readonly Plus = Plus;

    ngOnInit() {
        this.formGroup = new FormGroup({
            guests: new FormControl<number | null>(2)
        });
    }

    onSubmit(): void {
        console.log(this.formGroup.value);
    }
}
```

## API Reference

The state attributes below are shared by most parts; each part's table lists the ones it exposes.

| Attribute        | Present when                                  |
| ---------------- | --------------------------------------------- |
| `data-disabled`  | The field is disabled.                        |
| `data-readonly`  | The field is read-only.                       |
| `data-required`  | The field is required.                        |
| `data-scrubbing` | A scrub gesture is in progress.               |

### Root

`RdxNumberFieldRoot` groups all parts and owns the value, parsing/formatting and stepping logic.

**Data attributes:** `data-disabled`, `data-readonly`, `data-required`, `data-scrubbing`.

### Group

`RdxNumberFieldGroup` groups the input with the stepper buttons (`role="group"`). It reads its
state from the root context and has no inputs.

**Data attributes:** `data-disabled`, `data-readonly`, `data-required`, `data-scrubbing`.

### Input

`RdxNumberFieldInput` the native text input that displays the formatted value and accepts typed
input. It reads everything from the root context and has no inputs.

**Data attributes:** `data-disabled`, `data-readonly`, `data-required`.

### Hidden Input

`RdxNumberFieldHiddenInput` an optional hidden `input[type=number]` that mirrors the value for
native form submission and browser constraint validation. Set `name` (and optionally `form`) on the
root. Not needed when using Angular reactive or template-driven forms.

### Increment / Decrement

`RdxNumberFieldIncrement` and `RdxNumberFieldDecrement` step the value up and down. Each accepts an
optional `disabled` input and is automatically disabled when the value reaches `max`/`min`. They are
also natively disabled while the field is read-only.

**Data attributes:** `data-disabled`, `data-readonly`, `data-pressed` (while held).

### Scrub Area

`RdxNumberFieldScrubArea` an interactive area where the user clicks and drags to change the value.

**Data attributes:** `data-disabled`, `data-readonly`, `data-scrubbing`.

### Scrub Area Cursor

`RdxNumberFieldScrubAreaCursor` an optional custom cursor shown while scrubbing, portaled to the
document body. Hidden on Safari and for touch input. It has no inputs.

## Accessibility

Adheres to the [Spinbutton WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/).

### Keyboard Interactions

| Key                               | Description                           |
| --------------------------------- | ------------------------------------- |
| `ArrowUp`                         | Increase the value by `step`.         |
| `ArrowDown`                       | Decrease the value by `step`.         |
| `Shift` + `ArrowUp` / `ArrowDown` | Increase/decrease by `largeStep`.     |
| `Alt` + `ArrowUp` / `ArrowDown`   | Increase/decrease by `smallStep`.     |
| `Home`                            | Set the value to `min` (if provided). |
| `End`                             | Set the value to `max` (if provided). |
