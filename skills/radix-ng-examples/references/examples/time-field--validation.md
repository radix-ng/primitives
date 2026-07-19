# Time Field — Validation

> One example from the [Time Field](../components/time-field.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

`minValue` / `maxValue` mark out-of-range values with `data-invalid` on the root and each segment.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Time } from '@internationalized/date';
import { RdxTimeFieldInputDirective, RdxTimeFieldRootDirective } from '@radix-ng/primitives/time-field';
import { RdxVisuallyHiddenInputDirective } from '@radix-ng/primitives/visually-hidden';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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
