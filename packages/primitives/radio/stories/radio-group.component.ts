import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { RdxRadioGroupDirective, RdxRadioIndicatorDirective, RdxRadioItemDirective } from '@radix-ng/primitives/radio';
import { cn, demoButton, demoRadio } from '../../storybook/styles';

@Component({
    selector: 'radio-groups-forms-example',
    template: `
        <form class="flex w-72 flex-col gap-4" (ngSubmit)="submit()">
            <div
                [(ngModel)]="hotelRoom"
                [class]="r.group"
                name="hotelRoom"
                rdxRadioRoot
                required
                aria-label="Hotel room"
            >
                @for (room of rooms; track room) {
                    <label [class]="r.row" rdxLabel>
                        <span [class]="r.item" [value]="room" rdxRadioItem>
                            <span [class]="r.indicator" rdxRadioIndicator></span>
                        </span>
                        <span [class]="r.label">
                            {{ room }}
                        </span>
                    </label>
                }
            </div>

            <button [class]="cn(b.base, b.primary, b.size.md)" type="submit">Submit</button>

            @if (submittedRoom) {
                <p class="text-muted-foreground text-sm">
                    <span>
                        Submitted room:
                        {{ submittedRoom }}
                    </span>
                </p>
            }
        </form>
    `,
    imports: [FormsModule, RdxLabelDirective, RdxRadioItemDirective, RdxRadioIndicatorDirective, RdxRadioGroupDirective]
})
export class RadioGroupComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly r = demoRadio;

    hotelRoom: string | undefined;
    submittedRoom: string | undefined;
    rooms = ['Default', 'Comfortable'];

    submit(): void {
        this.submittedRoom = this.hotelRoom;
    }
}
