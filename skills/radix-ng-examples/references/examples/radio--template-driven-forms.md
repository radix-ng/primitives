# Radio Group — Template-driven forms

> One example from the [Radio Group](../components/radio.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Radio group works with `ngModel`, native form submission, and a submit button. This example keeps
`rdxRadioItemInput` for native `required` validation and label activation.

```typescript
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
                class="flex flex-col gap-2.5"
                [(ngModel)]="hotelRoom"
                name="hotelRoom"
                rdxRadioRoot
                required
                aria-label="Hotel room"
            >
                @for (room of rooms; track room) {
                    <label class="flex items-center gap-3" rdxLabel>
                        <span
                            class="demo-radio-item demo-focus flex size-6 items-center justify-center disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                            [value]="room"
                            rdxRadioItem
                        >
                            <span
                                class="after:bg-primary flex size-full items-center justify-center after:block after:size-2.5 after:rounded-full data-[state=unchecked]:hidden"
                                rdxRadioIndicator
                            ></span>
                            <input rdxRadioItemInput />
                        </span>
                        <span class="demo-label">
                            {{ room }}
                        </span>
                    </label>
                }
            </div>

            <button class="demo-button demo-button-primary h-9 px-4" type="submit">Submit</button>

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
    hotelRoom: string | undefined;
    submittedRoom: string | undefined;
    rooms = ['Default', 'Comfortable'];

    submit(): void {
        this.submittedRoom = this.hotelRoom;
    }
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
