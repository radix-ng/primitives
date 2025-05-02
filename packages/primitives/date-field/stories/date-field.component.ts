import { Component, model } from '@angular/core';
import { CalendarDate, DateValue } from '@internationalized/date';
import { RdxVisuallyHiddenInputDirective } from '@radix-ng/primitives/visually-hidden';
import { RdxDateFieldInputDirective } from '../src/date-field-input.directive';
import { RdxDateFieldRootDirective } from '../src/date-field-root.directive';

@Component({
    selector: 'app-date-field',
    imports: [RdxDateFieldRootDirective, RdxDateFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div class="DateFieldWrapper">
            <div class="DateField" #root="rdxDateFieldRoot" rdxDateFieldRoot>
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
            </div>
        </div>
    `,
    styleUrl: 'date-field.styles.css'
})
export class DateFieldComponent {
    readonly value = model<DateValue>();

    readonly defaultValue = new CalendarDate(2024, 2, 28);
}
