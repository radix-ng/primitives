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
