import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { DateValue } from '@internationalized/date';
import { Granularity } from '@radix-ng/primitives/core';
import { RdxVisuallyHiddenInputDirective } from '@radix-ng/primitives/visually-hidden';
import { RdxDateFieldInputDirective } from '../src/date-field-input.directive';
import { RdxDateFieldRootDirective } from '../src/date-field-root.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'app-date-field',
    imports: [RdxDateFieldRootDirective, RdxDateFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div
            class="border-input bg-background text-foreground data-[invalid]:border-destructive inline-flex items-center rounded-md border px-3 py-2 text-sm shadow-xs select-none"
            #root="rdxDateFieldRoot"
            [(value)]="value"
            [locale]="locale()"
            [granularity]="granularity()"
            rdxDateFieldRoot
        >
            @for (item of root.segmentContents(); track $index) {
                @if (item.part === 'literal') {
                    <div class="text-muted-foreground px-0.5" [part]="item.part" rdxDateFieldInput>
                        {{ item.value }}
                    </div>
                } @else {
                    <div
                        class="hover:bg-muted focus:bg-accent focus:text-accent-foreground data-[placeholder]:text-muted-foreground rounded px-1 tabular-nums focus:outline-none"
                        [part]="item.part"
                        rdxDateFieldInput
                    >
                        {{ item.value }}
                    </div>
                }
            }
            <input [value]="root.value()" rdxVisuallyHiddenInput feature="focusable" />
        </div>
    `
})
export class DateFieldComponent {
    /** Locale used to format and order the segments. */
    readonly locale = input<string>('en');

    /** How much of the date/time to render — `'day'` shows date only, `'second'` adds the time. */
    readonly granularity = input<Granularity>('day');

    readonly value = model<DateValue | null>(null);
}
