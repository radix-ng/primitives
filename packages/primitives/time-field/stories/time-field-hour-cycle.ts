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
                    #h12="rdxTimeFieldRoot"
                    class="border-border bg-background text-foreground focus-within:ring-ring inline-flex w-fit items-center rounded-md border px-3 py-2 text-sm shadow-sm select-none focus-within:ring-2"
                    aria-labelledby="time-12h-label"
                    rdxTimeFieldRoot
                    [hourCycle]="12"
                >
                    @for (item of h12.segmentContents(); track $index) {
                        @if (item.part === 'literal') {
                            <span class="text-muted-foreground px-px" rdxTimeFieldInput [part]="item.part">
                                {{ item.value }}
                            </span>
                        } @else {
                            <div
                                class="data-[placeholder]:text-muted-foreground hover:bg-muted focus:bg-primary focus:text-primary-foreground rounded px-0.5 tabular-nums outline-none"
                                rdxTimeFieldInput
                                [part]="item.part"
                            >
                                {{ item.value }}
                            </div>
                        }
                    }
                    <input rdxVisuallyHiddenInput feature="focusable" [value]="h12.value()" />
                </div>
            </div>

            <div class="flex flex-col gap-1.5">
                <label class="text-foreground text-sm font-medium" id="time-24h-label">24-hour</label>
                <div
                    #h24="rdxTimeFieldRoot"
                    class="border-border bg-background text-foreground focus-within:ring-ring inline-flex w-fit items-center rounded-md border px-3 py-2 text-sm shadow-sm select-none focus-within:ring-2"
                    aria-labelledby="time-24h-label"
                    rdxTimeFieldRoot
                    [hourCycle]="24"
                >
                    @for (item of h24.segmentContents(); track $index) {
                        @if (item.part === 'literal') {
                            <span class="text-muted-foreground px-px" rdxTimeFieldInput [part]="item.part">
                                {{ item.value }}
                            </span>
                        } @else {
                            <div
                                class="data-[placeholder]:text-muted-foreground hover:bg-muted focus:bg-primary focus:text-primary-foreground rounded px-0.5 tabular-nums outline-none"
                                rdxTimeFieldInput
                                [part]="item.part"
                            >
                                {{ item.value }}
                            </div>
                        }
                    }
                    <input rdxVisuallyHiddenInput feature="focusable" [value]="h24.value()" />
                </div>
            </div>
        </div>
    `
})
export class TimeFieldHourCycleExample {}
