import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { RdxRadioGroupDirective, RdxRadioIndicatorDirective, RdxRadioItemDirective } from '@radix-ng/primitives/radio';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'radio-groups-forms-example',
    standalone: true,
    template: `
        <div class="RadioGroupRoot" [(ngModel)]="hotelRoom" RadioRoot aria-label="View density">
            @for (room of rooms; track room) {
                <div class="RadioGroup">
                    <button class="RadioGroupItem" [value]="room" [id]="room" RadioItem>
                        <div class="RadioGroupIndicator" RadioIndicator></div>
                        <input class="Input" RadioIndicator type="radio" aria-hidden="true" tabindex="-1" />
                    </button>
                    <label class="Label" [htmlFor]="room" rdxLabel>
                        {{ room }}
                    </label>
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
        RdxLabelDirective,
        RdxRadioItemDirective,
        RdxRadioIndicatorDirective,
        RdxRadioGroupDirective
    ]
})
export class RadioGroupComponent {
    hotelRoom: string | undefined;
    rooms = ['Default', 'Comfortable'];
}
