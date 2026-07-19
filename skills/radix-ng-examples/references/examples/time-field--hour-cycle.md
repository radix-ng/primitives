# Time Field — Hour cycle

> One example from the [Time Field](../components/time-field.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

`hourCycle` forces a 12-hour (with a day-period segment) or 24-hour clock regardless of the locale default.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxTimeFieldInputDirective, RdxTimeFieldRootDirective } from '@radix-ng/primitives/time-field';
import { RdxVisuallyHiddenInputDirective } from '@radix-ng/primitives/visually-hidden';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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
