import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { RdxRadioGroupDirective, RdxRadioIndicatorDirective, RdxRadioItemDirective } from '@radix-ng/primitives/radio';
import { RdxRadioItemInputDirective } from '../src/radio-item-input.directive';

@Component({
    selector: 'radio-groups-forms-example',
    standalone: true,
    template: `
        <div
            class="RadioGroupRoot"
            [(ngModel)]="hotelRoom"
            orientation="vertical"
            rdxRadioRoot
            aria-label="View density"
        >
            @for (room of rooms; track $index) {
                <div class="RadioGroup">
                    <button class="RadioGroupItem" [value]="room" [id]="room" rdxRadioItem>
                        <div class="RadioGroupIndicator" rdxRadioIndicator></div>
                        <input class="Input" rdxRadioItemInput feature="fully-hidden" />
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
        RdxRadioGroupDirective,
        RdxRadioItemInputDirective
    ]
})
export class RadioGroupComponent {
    hotelRoom: string | undefined;
    rooms = ['Default', 'Comfortable'];
}
