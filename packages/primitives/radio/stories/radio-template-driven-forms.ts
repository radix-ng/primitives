import { cn, demoButton, demoRadio } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import {
    RdxRadioGroupDirective,
    RdxRadioIndicatorDirective,
    RdxRadioItemDirective,
    RdxRadioItemInputDirective
} from '@radix-ng/primitives/radio';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'radio-template-driven-forms-example',
    template: `
        <form class="flex w-72 flex-col gap-4" (ngSubmit)="submit()">
            <div
                name="hotelRoom"
                rdxRadioRoot
                required
                aria-label="Hotel room"
                [class]="r.group"
                [(ngModel)]="hotelRoom"
            >
                @for (room of rooms; track room) {
                    <label rdxLabel [class]="r.row">
                        <span rdxRadioItem [class]="r.item" [value]="room">
                            <span rdxRadioIndicator [class]="r.indicator"></span>
                            <input rdxRadioItemInput />
                        </span>
                        <span [class]="r.label">
                            {{ room }}
                        </span>
                    </label>
                }
            </div>

            <button type="submit" [class]="cn(b.base, b.primary, b.size.md)">Submit</button>

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
    imports: [
        FormsModule,
        RdxLabelDirective,
        RdxRadioItemDirective,
        RdxRadioItemInputDirective,
        RdxRadioIndicatorDirective,
        RdxRadioGroupDirective
    ]
})
export class RadioTemplateDrivenFormsComponent {
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
