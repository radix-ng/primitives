import { Component } from '@angular/core';
import { DateValue } from '@internationalized/date';
import { RdxVisuallyHiddenInputDirective } from '@radix-ng/primitives/visually-hidden';
import { RdxDateFieldInputDirective } from '../src/date-field-input.directive';
import { RdxDateFieldRootDirective } from '../src/date-field-root.directive';

@Component({
    selector: 'app-date-field-invalid',
    imports: [RdxDateFieldRootDirective, RdxDateFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div class="DateFieldWrapper">
            <label style="color: white;" for="date-field">Appointment (unavailable on 19th)</label>
            <div
                class="DateField"
                id="date-field"
                #root="rdxDateFieldRoot"
                [isDateUnavailable]="isDateUnavailable"
                granularity="day"
                rdxDateFieldRoot
            >
                @for (item of root.segmentContents(); track $index) {
                    @if (item.part === 'literal') {
                        <div class="DateFieldLiteral" [part]="item.part" rdxDateFieldInput>
                            {{ item.value }}
                        </div>
                    } @else {
                        <div class="DateFieldSegment" [part]="item.part" rdxDateFieldInput>
                            {{ item.value }}
                        </div>
                    }
                }
                <input [value]="root.value()" rdxVisuallyHiddenInput feature="focusable" />

                @if (root.isInvalid()) {
                    <span style="color: red; padding-left: 8px;">Invalid Day</span>
                }
            </div>
        </div>
    `,
    styleUrl: 'date-field.styles.css'
})
export class DateFieldInvalid {
    isDateUnavailable(date: DateValue): boolean {
        return date.day === 19;
    }
}
