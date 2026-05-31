import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { RdxRadioGroupDirective, RdxRadioIndicatorDirective, RdxRadioItemDirective } from '@radix-ng/primitives/radio';
import { RdxRadioItemInputDirective } from '../src/radio-item-input.directive';

@Component({
    selector: 'radio-groups-forms-example',
    template: `
        <div
            class="flex flex-col gap-2.5"
            [(ngModel)]="hotelRoom"
            orientation="vertical"
            rdxRadioRoot
            aria-label="View density"
        >
            @for (room of rooms; track $index) {
                <div class="flex items-center gap-3">
                    <button
                        class="border-border bg-background hover:bg-muted focus-visible:ring-ring flex size-6 items-center justify-center rounded-full border shadow-sm outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                        [value]="room"
                        [id]="room"
                        rdxRadioItem
                    >
                        <div
                            class="after:bg-primary flex size-full items-center justify-center after:block after:size-2.5 after:rounded-full data-[state=unchecked]:hidden"
                            rdxRadioIndicator
                        ></div>
                        <input
                            class="pointer-events-none absolute m-0 size-6 -translate-x-full opacity-0"
                            rdxRadioItemInput
                            feature="fully-hidden"
                        />
                    </button>
                    <label class="text-foreground text-sm font-medium" [htmlFor]="room" rdxLabel>
                        {{ room }}
                    </label>
                </div>
            }
        </div>
        <p class="text-muted-foreground mt-3 text-sm">
            <span>Your room is: {{ hotelRoom }}</span>
        </p>
    `,
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
