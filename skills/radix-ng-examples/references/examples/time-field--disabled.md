# Time Field — Disabled

> One example from the [Time Field](../components/time-field.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

A disabled field is inert and exposes `data-disabled` for styling.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Time } from '@internationalized/date';
import { RdxTimeFieldInputDirective, RdxTimeFieldRootDirective } from '@radix-ng/primitives/time-field';
import { RdxVisuallyHiddenInputDirective } from '@radix-ng/primitives/visually-hidden';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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
