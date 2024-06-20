import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { RdxLabelRootDirective } from '@radix-ng/primitives/label';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
    RdxRadioGroupDirective,
    RdxRadioIndicatorDirective,
    RdxRadioItemDirective
} from '@radix-ng/primitives/radio';

@Component({
    selector: 'radio-groups-forms-example',
    standalone: true,
    template: `
        <div RadioRoot [(ngModel)]="hotelRoom" class="RadioGroupRoot" aria-label="View density">
            @for (room of rooms; track room) {
                <div class="RadioGroup">
                    <button RadioItem class="RadioGroupItem" [value]="room" [id]="room">
                        <div RadioIndicator class="RadioGroupIndicator"></div>
                        <input
                            RadioIndicator
                            type="radio"
                            aria-hidden="true"
                            tabindex="-1"
                            class="Input"
                        />
                    </button>
                    <label LabelRoot [htmlFor]="room" class="Label">{{ room }}</label>
                </div>
            }
        </div>
        <p>
            <span>Your room is: {{ hotelRoom }}</span>
        </p>
    `,
    styleUrl: 'radio-group.styles.scss',
    imports: [
        FormsModule,
        RdxLabelRootDirective,
        RdxRadioItemDirective,
        RdxRadioIndicatorDirective,
        RdxRadioGroupDirective
    ]
})
export class RadioGroupComponent {
    hotelRoom: string | undefined;
    rooms = ['Default', 'Comfortable'];
}
