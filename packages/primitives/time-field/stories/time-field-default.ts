import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxTimeFieldInputDirective, RdxTimeFieldRootDirective } from '@radix-ng/primitives/time-field';
import { RdxVisuallyHiddenInputDirective } from '@radix-ng/primitives/visually-hidden';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'time-field-default-example',
    imports: [RdxTimeFieldRootDirective, RdxTimeFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div class="flex flex-col gap-1.5">
            <label class="text-foreground text-sm font-medium" id="time-default-label">Time</label>
            <div
                #root="rdxTimeFieldRoot"
                class="border-border bg-background text-foreground focus-within:ring-ring data-[invalid]:border-destructive inline-flex w-fit items-center rounded-md border px-3 py-2 text-sm shadow-sm select-none focus-within:ring-2 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                aria-labelledby="time-default-label"
                rdxTimeFieldRoot
            >
                @for (item of root.segmentContents(); track $index) {
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
                <input rdxVisuallyHiddenInput feature="focusable" [value]="root.value()" />
            </div>
        </div>
    `
})
export class TimeFieldDefaultExample {}
