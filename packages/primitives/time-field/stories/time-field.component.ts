import { Component, model } from '@angular/core';
import { Time } from '@internationalized/date';
import { RdxVisuallyHiddenInputDirective } from '@radix-ng/primitives/visually-hidden';

import { TimeValue } from '@radix-ng/primitives/core';
import { RdxTimeFieldInputDirective } from '../src/time-field-input.directive';
import { RdxTimeFieldRootDirective } from '../src/time-field-root.directive';

@Component({
    selector: 'app-time-field',
    imports: [RdxTimeFieldRootDirective, RdxTimeFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div class="DateFieldWrapper">
            <div class="DateField" #root="rdxTimeFieldRoot" locale="ru" rdxTimeFieldRoot>
                @for (item of root.segmentContents(); track $index) {
                    @if (item.part === 'literal') {
                        <div class="DateFieldLiteral" [part]="item.part" rdxTimeFieldInput>
                            {{ item.value }}
                        </div>
                    } @else {
                        <div class="DateFieldSegment" [part]="item.part" rdxTimeFieldInput>
                            {{ item.value }}
                        </div>
                    }
                }
                <input [value]="root.value()" rdxVisuallyHiddenInput feature="focusable" />
            </div>
        </div>
    `,
    styleUrl: 'time-field.styles.css'
})
export class TimeFieldComponent {
    readonly value = model<TimeValue>();

    readonly defaultValue = new Time(10, 0, 0);
}
