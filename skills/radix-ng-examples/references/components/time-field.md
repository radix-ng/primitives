# Time Field

#### A segmented time input that lets users enter a time hour-by-hour with full keyboard control and localization.

```typescript
import { Component } from '@angular/core';
import { RdxTimeFieldInputDirective, RdxTimeFieldRootDirective } from '@radix-ng/primitives/time-field';
import { RdxVisuallyHiddenInputDirective } from '@radix-ng/primitives/visually-hidden';

@Component({
    selector: 'time-field-default-example',
    imports: [RdxTimeFieldRootDirective, RdxTimeFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div class="flex flex-col gap-1.5">
            <label class="text-foreground text-sm font-medium" id="time-default-label">Time</label>
            <div
                class="border-border bg-background text-foreground focus-within:ring-ring data-[invalid]:border-destructive inline-flex w-fit items-center rounded-md border px-3 py-2 text-sm shadow-sm select-none focus-within:ring-2 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                #root="rdxTimeFieldRoot"
                aria-labelledby="time-default-label"
                rdxTimeFieldRoot
            >
                @for (item of root.segmentContents(); track $index) {
                    @if (item.part === 'literal') {
                        <span class="text-muted-foreground px-px" [part]="item.part" rdxTimeFieldInput>
                            {{ item.value }}
                        </span>
                    } @else {
                        <div
                            class="data-[placeholder]:text-muted-foreground hover:bg-muted focus:bg-primary focus:text-primary-foreground rounded px-0.5 tabular-nums outline-none"
                            [part]="item.part"
                            rdxTimeFieldInput
                        >
                            {{ item.value }}
                        </div>
                    }
                }
                <input [value]="root.value()" rdxVisuallyHiddenInput feature="focusable" />
            </div>
        </div>
    `
})
export class TimeFieldDefaultExample {}
```

## Features

- ✅ Editable, individually focusable segments (hour, minute, second, day period).
- ✅ Full keyboard navigation — arrow keys move between and increment/decrement segments.
- ✅ Controlled or uncontrolled value via the `value` model.
- ✅ 12- and 24-hour cycles with an automatic day-period segment.
- ✅ Configurable `granularity` (`hour` / `minute` / `second`).
- ✅ `minValue` / `maxValue` range validation exposed through `data-invalid`.
- ✅ Locale-aware formatting (segment order, separators, numbering system).
- ✅ Headless and accessible — state is published via `data-*` attributes for you to style.

> Time Field is a Radix NG addition — it has no Base UI counterpart — but it follows the same
> headless, signals-first, `data-*`-driven conventions as the rest of the library.

## Preface

The component builds on the [@internationalized/date](https://react-spectrum.adobe.com/internationalized/date/index.html)
package, which solves a lot of the problems that come with working with dates and times in
JavaScript. Values are represented as `Time` / `CalendarDateTime` objects from that package, so
you'll need to install it to use the time-related primitives.

## Installation

Install the date package.

```bash
npm install @internationalized/date
```

Install the component from your command line.

```bash
npm install @radix-ng/primitives
```

## Import

```ts
import { RdxTimeFieldRootDirective, RdxTimeFieldInputDirective } from '@radix-ng/primitives/time-field';
import { RdxVisuallyHiddenInputDirective } from '@radix-ng/primitives/visually-hidden';
```

## Anatomy

Assemble the field from the root, an input segment rendered per `segmentContents()` entry, and an
optional visually-hidden input for native form participation.

```html
<div rdxTimeFieldRoot>
  @for (item of root.segmentContents(); track $index) {
  <div rdxTimeFieldInput [part]="item.part">{{ item.value }}</div>
  }
  <input rdxVisuallyHiddenInput feature="focusable" />
</div>
```

## Examples

### Default

A basic field rendering hour and minute segments.

```typescript
import { Component } from '@angular/core';
import { RdxTimeFieldInputDirective, RdxTimeFieldRootDirective } from '@radix-ng/primitives/time-field';
import { RdxVisuallyHiddenInputDirective } from '@radix-ng/primitives/visually-hidden';

@Component({
    selector: 'time-field-default-example',
    imports: [RdxTimeFieldRootDirective, RdxTimeFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div class="flex flex-col gap-1.5">
            <label class="text-foreground text-sm font-medium" id="time-default-label">Time</label>
            <div
                class="border-border bg-background text-foreground focus-within:ring-ring data-[invalid]:border-destructive inline-flex w-fit items-center rounded-md border px-3 py-2 text-sm shadow-sm select-none focus-within:ring-2 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                #root="rdxTimeFieldRoot"
                aria-labelledby="time-default-label"
                rdxTimeFieldRoot
            >
                @for (item of root.segmentContents(); track $index) {
                    @if (item.part === 'literal') {
                        <span class="text-muted-foreground px-px" [part]="item.part" rdxTimeFieldInput>
                            {{ item.value }}
                        </span>
                    } @else {
                        <div
                            class="data-[placeholder]:text-muted-foreground hover:bg-muted focus:bg-primary focus:text-primary-foreground rounded px-0.5 tabular-nums outline-none"
                            [part]="item.part"
                            rdxTimeFieldInput
                        >
                            {{ item.value }}
                        </div>
                    }
                }
                <input [value]="root.value()" rdxVisuallyHiddenInput feature="focusable" />
            </div>
        </div>
    `
})
export class TimeFieldDefaultExample {}
```

### Hour cycle

`hourCycle` forces a 12-hour (with a day-period segment) or 24-hour clock regardless of the locale default.

```typescript
import { Component } from '@angular/core';
import { RdxTimeFieldInputDirective, RdxTimeFieldRootDirective } from '@radix-ng/primitives/time-field';
import { RdxVisuallyHiddenInputDirective } from '@radix-ng/primitives/visually-hidden';

@Component({
    selector: 'time-field-hour-cycle-example',
    imports: [RdxTimeFieldRootDirective, RdxTimeFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
                <label class="text-foreground text-sm font-medium" id="time-12h-label">12-hour</label>
                <div
                    class="border-border bg-background text-foreground focus-within:ring-ring inline-flex w-fit items-center rounded-md border px-3 py-2 text-sm shadow-sm select-none focus-within:ring-2"
                    #h12="rdxTimeFieldRoot"
                    [hourCycle]="12"
                    aria-labelledby="time-12h-label"
                    rdxTimeFieldRoot
                >
                    @for (item of h12.segmentContents(); track $index) {
                        @if (item.part === 'literal') {
                            <span class="text-muted-foreground px-px" [part]="item.part" rdxTimeFieldInput>
                                {{ item.value }}
                            </span>
                        } @else {
                            <div
                                class="data-[placeholder]:text-muted-foreground hover:bg-muted focus:bg-primary focus:text-primary-foreground rounded px-0.5 tabular-nums outline-none"
                                [part]="item.part"
                                rdxTimeFieldInput
                            >
                                {{ item.value }}
                            </div>
                        }
                    }
                    <input [value]="h12.value()" rdxVisuallyHiddenInput feature="focusable" />
                </div>
            </div>

            <div class="flex flex-col gap-1.5">
                <label class="text-foreground text-sm font-medium" id="time-24h-label">24-hour</label>
                <div
                    class="border-border bg-background text-foreground focus-within:ring-ring inline-flex w-fit items-center rounded-md border px-3 py-2 text-sm shadow-sm select-none focus-within:ring-2"
                    #h24="rdxTimeFieldRoot"
                    [hourCycle]="24"
                    aria-labelledby="time-24h-label"
                    rdxTimeFieldRoot
                >
                    @for (item of h24.segmentContents(); track $index) {
                        @if (item.part === 'literal') {
                            <span class="text-muted-foreground px-px" [part]="item.part" rdxTimeFieldInput>
                                {{ item.value }}
                            </span>
                        } @else {
                            <div
                                class="data-[placeholder]:text-muted-foreground hover:bg-muted focus:bg-primary focus:text-primary-foreground rounded px-0.5 tabular-nums outline-none"
                                [part]="item.part"
                                rdxTimeFieldInput
                            >
                                {{ item.value }}
                            </div>
                        }
                    }
                    <input [value]="h24.value()" rdxVisuallyHiddenInput feature="focusable" />
                </div>
            </div>
        </div>
    `
})
export class TimeFieldHourCycleExample {}
```

### Granularity

`granularity` controls the smallest editable segment — `hour`, `minute`, or `second`.

```typescript
import { Component } from '@angular/core';
import { Granularity } from '@radix-ng/primitives/core';
import { RdxTimeFieldInputDirective, RdxTimeFieldRootDirective } from '@radix-ng/primitives/time-field';
import { RdxVisuallyHiddenInputDirective } from '@radix-ng/primitives/visually-hidden';

@Component({
    selector: 'time-field-granularity-example',
    imports: [RdxTimeFieldRootDirective, RdxTimeFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div class="flex flex-col gap-4">
            @for (granularity of granularities; track granularity) {
                <div class="flex flex-col gap-1.5">
                    <label class="text-foreground text-sm font-medium capitalize" [id]="granularity + '-label'">
                        {{ granularity }}
                    </label>
                    <div
                        class="border-border bg-background text-foreground focus-within:ring-ring inline-flex w-fit items-center rounded-md border px-3 py-2 text-sm shadow-sm select-none focus-within:ring-2"
                        #root="rdxTimeFieldRoot"
                        [granularity]="granularity"
                        [attr.aria-labelledby]="granularity + '-label'"
                        rdxTimeFieldRoot
                    >
                        @for (item of root.segmentContents(); track $index) {
                            @if (item.part === 'literal') {
                                <span class="text-muted-foreground px-px" [part]="item.part" rdxTimeFieldInput>
                                    {{ item.value }}
                                </span>
                            } @else {
                                <div
                                    class="data-[placeholder]:text-muted-foreground hover:bg-muted focus:bg-primary focus:text-primary-foreground rounded px-0.5 tabular-nums outline-none"
                                    [part]="item.part"
                                    rdxTimeFieldInput
                                >
                                    {{ item.value }}
                                </div>
                            }
                        }
                        <input [value]="root.value()" rdxVisuallyHiddenInput feature="focusable" />
                    </div>
                </div>
            }
        </div>
    `
})
export class TimeFieldGranularityExample {
    protected readonly granularities: Granularity[] = ['hour', 'minute', 'second'];
}
```

### Disabled

A disabled field is inert and exposes `data-disabled` for styling.

```typescript
import { Component } from '@angular/core';
import { Time } from '@internationalized/date';
import { RdxTimeFieldInputDirective, RdxTimeFieldRootDirective } from '@radix-ng/primitives/time-field';
import { RdxVisuallyHiddenInputDirective } from '@radix-ng/primitives/visually-hidden';

@Component({
    selector: 'time-field-disabled-example',
    imports: [RdxTimeFieldRootDirective, RdxTimeFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div class="flex flex-col gap-1.5">
            <label class="text-foreground text-sm font-medium" id="time-disabled-label">Time</label>
            <div
                class="border-border bg-background text-foreground inline-flex w-fit items-center rounded-md border px-3 py-2 text-sm shadow-sm select-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                #root="rdxTimeFieldRoot"
                [value]="value"
                aria-labelledby="time-disabled-label"
                disabled
                rdxTimeFieldRoot
            >
                @for (item of root.segmentContents(); track $index) {
                    @if (item.part === 'literal') {
                        <span class="text-muted-foreground px-px" [part]="item.part" rdxTimeFieldInput>
                            {{ item.value }}
                        </span>
                    } @else {
                        <div
                            class="data-[placeholder]:text-muted-foreground rounded px-0.5 tabular-nums outline-none"
                            [part]="item.part"
                            rdxTimeFieldInput
                        >
                            {{ item.value }}
                        </div>
                    }
                }
                <input [value]="root.value()" rdxVisuallyHiddenInput feature="focusable" />
            </div>
        </div>
    `
})
export class TimeFieldDisabledExample {
    protected readonly value = new Time(12, 30);
}
```

### Readonly

A readonly field can be focused and navigated but not edited.

```typescript
import { Component } from '@angular/core';
import { Time } from '@internationalized/date';
import { RdxTimeFieldInputDirective, RdxTimeFieldRootDirective } from '@radix-ng/primitives/time-field';
import { RdxVisuallyHiddenInputDirective } from '@radix-ng/primitives/visually-hidden';

@Component({
    selector: 'time-field-readonly-example',
    imports: [RdxTimeFieldRootDirective, RdxTimeFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div class="flex flex-col gap-1.5">
            <label class="text-foreground text-sm font-medium" id="time-readonly-label">Time</label>
            <div
                class="border-border bg-muted text-foreground focus-within:ring-ring inline-flex w-fit items-center rounded-md border px-3 py-2 text-sm shadow-sm select-none focus-within:ring-2"
                #root="rdxTimeFieldRoot"
                [value]="value"
                aria-labelledby="time-readonly-label"
                granularity="second"
                readonly
                rdxTimeFieldRoot
            >
                @for (item of root.segmentContents(); track $index) {
                    @if (item.part === 'literal') {
                        <span class="text-muted-foreground px-px" [part]="item.part" rdxTimeFieldInput>
                            {{ item.value }}
                        </span>
                    } @else {
                        <div
                            class="data-[placeholder]:text-muted-foreground focus:bg-primary focus:text-primary-foreground rounded px-0.5 tabular-nums outline-none"
                            [part]="item.part"
                            rdxTimeFieldInput
                        >
                            {{ item.value }}
                        </div>
                    }
                }
                <input [value]="root.value()" rdxVisuallyHiddenInput feature="focusable" />
            </div>
        </div>
    `
})
export class TimeFieldReadonlyExample {
    protected readonly value = new Time(9, 15, 0);
}
```

### Validation

`minValue` / `maxValue` mark out-of-range values with `data-invalid` on the root and each segment.

```typescript
import { Component } from '@angular/core';
import { Time } from '@internationalized/date';
import { RdxTimeFieldInputDirective, RdxTimeFieldRootDirective } from '@radix-ng/primitives/time-field';
import { RdxVisuallyHiddenInputDirective } from '@radix-ng/primitives/visually-hidden';

@Component({
    selector: 'time-field-validation-example',
    imports: [RdxTimeFieldRootDirective, RdxTimeFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div class="flex flex-col gap-1.5">
            <label class="text-foreground text-sm font-medium" id="time-validation-label">
                Office hours (09:00–17:00)
            </label>
            <div
                class="border-border bg-background text-foreground focus-within:ring-ring data-[invalid]:border-destructive data-[invalid]:focus-within:ring-destructive inline-flex w-fit items-center rounded-md border px-3 py-2 text-sm shadow-sm select-none focus-within:ring-2"
                #root="rdxTimeFieldRoot"
                [value]="value"
                [minValue]="minValue"
                [maxValue]="maxValue"
                aria-labelledby="time-validation-label"
                rdxTimeFieldRoot
            >
                @for (item of root.segmentContents(); track $index) {
                    @if (item.part === 'literal') {
                        <span class="text-muted-foreground px-px" [part]="item.part" rdxTimeFieldInput>
                            {{ item.value }}
                        </span>
                    } @else {
                        <div
                            class="data-[placeholder]:text-muted-foreground data-[invalid]:text-destructive hover:bg-muted focus:bg-primary focus:text-primary-foreground rounded px-0.5 tabular-nums outline-none"
                            [part]="item.part"
                            rdxTimeFieldInput
                        >
                            {{ item.value }}
                        </div>
                    }
                }
                <input [value]="root.value()" rdxVisuallyHiddenInput feature="focusable" />
            </div>
            @if (root.isInvalid()) {
                <p class="text-destructive text-xs">Please pick a time between 09:00 and 17:00.</p>
            }
        </div>
    `
})
export class TimeFieldValidationExample {
    protected readonly value = new Time(18, 30);
    protected readonly minValue = new Time(9, 0);
    protected readonly maxValue = new Time(17, 0);
}
```

### Localization

`locale` drives segment order, separators, and the numbering system.

```typescript
import { Component } from '@angular/core';
import { RdxTimeFieldInputDirective, RdxTimeFieldRootDirective } from '@radix-ng/primitives/time-field';
import { RdxVisuallyHiddenInputDirective } from '@radix-ng/primitives/visually-hidden';

interface LocaleExample {
    readonly id: string;
    readonly label: string;
    readonly locale: string;
}

@Component({
    selector: 'time-field-localization-example',
    imports: [RdxTimeFieldRootDirective, RdxTimeFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div class="flex flex-col gap-4">
            @for (example of locales; track example.id) {
                <div class="flex flex-col gap-1.5">
                    <label class="text-foreground text-sm font-medium" [id]="example.id">{{ example.label }}</label>
                    <div
                        class="border-border bg-background text-foreground focus-within:ring-ring inline-flex w-fit items-center rounded-md border px-3 py-2 text-sm shadow-sm select-none focus-within:ring-2"
                        #root="rdxTimeFieldRoot"
                        [locale]="example.locale"
                        [attr.aria-labelledby]="example.id"
                        granularity="second"
                        rdxTimeFieldRoot
                    >
                        @for (item of root.segmentContents(); track $index) {
                            @if (item.part === 'literal') {
                                <span class="text-muted-foreground px-px" [part]="item.part" rdxTimeFieldInput>
                                    {{ item.value }}
                                </span>
                            } @else {
                                <div
                                    class="data-[placeholder]:text-muted-foreground hover:bg-muted focus:bg-primary focus:text-primary-foreground rounded px-0.5 tabular-nums outline-none"
                                    [part]="item.part"
                                    rdxTimeFieldInput
                                >
                                    {{ item.value }}
                                </div>
                            }
                        }
                        <input [value]="root.value()" rdxVisuallyHiddenInput feature="focusable" />
                    </div>
                </div>
            }
        </div>
    `
})
export class TimeFieldLocalizationExample {
    protected readonly locales: LocaleExample[] = [
        { id: 'locale-en', label: 'English (en)', locale: 'en' },
        { id: 'locale-ja', label: 'Japanese (ja)', locale: 'ja' },
        { id: 'locale-fa', label: 'Persian (fa-IR)', locale: 'fa-IR' },
        { id: 'locale-zh', label: 'Taiwan (zh-TW)', locale: 'zh-TW' }
    ];
}
```

## Accessibility

Adheres to the WAI-ARIA practices for composite time entry. The root is a `role="group"`; give it an
accessible name with `aria-labelledby` (or `aria-label`). Each editable segment is a focusable
`contenteditable` element exposing `aria-valuetext` so screen readers announce the current value.

### Keyboard Interactions

| Key                        | Description                                     |
| -------------------------- | ----------------------------------------------- |
| `ArrowLeft` / `ArrowRight` | Move focus to the previous / next segment.      |
| `ArrowUp` / `ArrowDown`    | Increment / decrement the focused segment.      |
| `0`–`9`                    | Type a value directly into the focused segment. |
| `Backspace`                | Clear the focused segment.                      |

## API Reference

### Root

`RdxTimeFieldRootDirective` contains all the parts of a time field and owns the value, placeholder,
granularity, and validation state. Exposes `data-disabled`, `data-readonly`, and `data-invalid`.

### Input

`RdxTimeFieldInputDirective` renders a single segment from `segmentContents()`. Pass the segment
`part`; everything else is read from the root context.
