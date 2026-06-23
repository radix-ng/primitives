# Date Field

####  Enables users to input specific dates within a designated field.

```typescript
import { RdxDateFieldInputDirective } from '../src/date-field-input.directive';
import { RdxDateFieldRootDirective } from '../src/date-field-root.directive';
import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { DateValue } from '@internationalized/date';
import { Granularity } from '@radix-ng/primitives/core';
import { RdxVisuallyHiddenInputDirective } from '@radix-ng/primitives/visually-hidden';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'app-date-field',
    imports: [RdxDateFieldRootDirective, RdxDateFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div
            #root="rdxDateFieldRoot"
            class="border-input bg-background text-foreground data-[invalid]:border-destructive inline-flex items-center rounded-md border px-3 py-2 text-sm shadow-xs select-none"
            rdxDateFieldRoot
            [locale]="locale()"
            [granularity]="granularity()"
            [(value)]="value"
        >
            @for (item of root.segmentContents(); track $index) {
                @if (item.part === 'literal') {
                    <div class="text-muted-foreground px-0.5" rdxDateFieldInput [part]="item.part">
                        {{ item.value }}
                    </div>
                } @else {
                    <div
                        class="hover:bg-muted focus:bg-accent focus:text-accent-foreground data-[placeholder]:text-muted-foreground rounded px-1 tabular-nums focus:outline-none"
                        rdxDateFieldInput
                        [part]="item.part"
                    >
                        {{ item.value }}
                    </div>
                }
            }
            <input rdxVisuallyHiddenInput feature="focusable" [value]="root.value()" />
        </div>
    `
})
export class DateFieldComponent {
    /** Locale used to format and order the segments. */
    readonly locale = input<string>('en');

    /** How much of the date/time to render — `'day'` shows date only, `'second'` adds the time. */
    readonly granularity = input<Granularity>('day');

    readonly value = model<DateValue | undefined>();
}
```

## Features

- ✅ Full keyboard navigation
- ✅ Can be controlled or uncontrolled
- ✅ Focus is fully managed
- ✅ Localization support
- ✅ Highly composable
- ✅ Accessible by default
- ✅ Supports both date and date-time formats

## Preface

The component depends on the [@internationalized/date package](https://react-spectrum.adobe.com/internationalized/date/index.html),
which solves a lot of the problems that come with working with dates and times in JavaScript.

We highly recommend reading through the documentation for the package to get a solid feel
for how it works, and you'll need to install it in your project to use the date-related components.

## Installation

Install the date package.

```bash
npm install @internationalized/date
```

Install the component from your command line.

```bash
npm install @radix-ng/primitives
```

## Anatomy

Import all parts and piece them together.

```html
<div rdxDateFieldRoot>
    <div rdxDateFieldInput></div>
    <input rdxVisuallyHiddenInput />
</div>
```

## API Reference

### Root

`RdxDateFieldRootDirective` Contains all the parts of a date field

### Input

`RdxDateFieldInputDirective` Contains the date field segments

## Examples

### With locale

#### Gregorian

```html
<app-date-field granularity="second" />
```

#### Hebrew

```html
<app-date-field locale="he" granularity="second" />
```

#### Taiwan

```html
<app-date-field locale="zh-TW" granularity="second" />
```

#### Japanese

```html
<app-date-field locale="ja" granularity="second" />
```

#### Persian

```html
<app-date-field locale="fa-IR" granularity="second" />
```

#### Russian

```html
<app-date-field locale="ru" granularity="second" />
```

### Invalid

```typescript
import { RdxDateFieldInputDirective } from '../src/date-field-input.directive';
import { RdxDateFieldRootDirective } from '../src/date-field-root.directive';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DateValue } from '@internationalized/date';
import { RdxVisuallyHiddenInputDirective } from '@radix-ng/primitives/visually-hidden';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'app-date-field-invalid',
    imports: [RdxDateFieldRootDirective, RdxDateFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div class="flex flex-col gap-2">
            <label class="text-foreground text-sm font-medium" for="date-field-invalid">
                Appointment (unavailable on 19th)
            </label>
            <div
                #root="rdxDateFieldRoot"
                class="border-input bg-background text-foreground data-[invalid]:border-destructive inline-flex items-center rounded-md border px-3 py-2 text-sm shadow-xs select-none"
                id="date-field-invalid"
                granularity="day"
                rdxDateFieldRoot
                [isDateUnavailable]="isDateUnavailable"
            >
                @for (item of root.segmentContents(); track $index) {
                    @if (item.part === 'literal') {
                        <div class="text-muted-foreground px-0.5" rdxDateFieldInput [part]="item.part">
                            {{ item.value }}
                        </div>
                    } @else {
                        <div
                            class="hover:bg-muted focus:bg-accent focus:text-accent-foreground data-[placeholder]:text-muted-foreground rounded px-1 tabular-nums focus:outline-none"
                            rdxDateFieldInput
                            [part]="item.part"
                        >
                            {{ item.value }}
                        </div>
                    }
                }
                <input rdxVisuallyHiddenInput feature="focusable" [value]="root.value()" />

                @if (root.isInvalid()) {
                    <span class="text-destructive pl-2">Invalid Day</span>
                }
            </div>
        </div>
    `
})
export class DateFieldInvalid {
    isDateUnavailable(date: DateValue): boolean {
        return date.day === 19;
    }
}
```

## Accessibility

### Keyboard Interactions

| Key                        | Description                                          |
| -------------------------- | ---------------------------------------------------- |
| `ArrowLeft` / `ArrowRight` | Move focus to the previous / next segment.           |
| `ArrowUp` / `ArrowDown`    | Increment / decrement the focused segment.           |
| `0`–`9`                    | Type a value directly into the focused segment.      |
| `Backspace`                | Clear the last digit of the focused segment's value. |
