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
    styles: `
        .DateFieldWrapper {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .DateField {
            display: flex;
            padding: 0.5rem;
            align-items: center;
            border-radius: 0.25rem;
            border-width: 1px;
            text-align: center;
            background-color: #ffffff;
            user-select: none;
            color: var(--green-10);
            border: 1px solid var(--gray-9);
        }

        .DateField::placeholder {
            color: var(--mauve-5);
        }

        .DateFieldLiteral {
            padding: 0.25rem;
        }

        .DateFieldSegment {
            padding: 0.25rem;
        }

        .DateFieldSegment:hover {
            background-color: var(--grass-4);
        }

        .DateFieldSegment:focus {
            background-color: var(--grass-2);
        }

        .datefieldsegment: [aria-valuetext= 'Empty'] {
            color: var(--grass-6);
        }
    `
})
export class DateFieldComponent {
    readonly value = model<DateValue>();

    readonly defaultValue = new CalendarDate(2024, 2, 28);
}
