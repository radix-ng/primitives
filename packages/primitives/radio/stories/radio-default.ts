import { ChangeDetectionStrategy, Component } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import {
    RdxRadioGroupDirective,
    RdxRadioIndicatorDirective,
    RdxRadioIndicatorPresenceDirective,
    RdxRadioItemDirective,
    RdxRadioItemInputDirective
} from '@radix-ng/primitives/radio';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'radio-default-example',
    template: `
        <form>
            <div
                class="flex flex-col items-start gap-1"
                [aria-labelledby]="labelId + 'heading'"
                rdxRadioRoot
                name="density"
            >
                <div class="text-foreground text-sm font-bold" [id]="labelId + 'heading'">View density</div>
                @for (option of options; track option.value) {
                    <label class="flex items-center gap-2" rdxLabel>
                        <span
                            class="demo-choice size-4 rounded-full"
                            [value]="option.value"
                            [aria-labelledby]="labelId + '-' + option.value"
                            rdxRadioItem
                        >
                            <span
                                class="size-2 rounded-full bg-current"
                                *rdxRadioIndicatorPresence
                                rdxRadioIndicator
                            ></span>
                            <input rdxRadioItemInput />
                        </span>
                        <span class="text-foreground text-sm" [id]="labelId + '-' + option.value">
                            {{ option.label }}
                        </span>
                    </label>
                }
            </div>
        </form>
    `,
    imports: [
        RdxLabelDirective,
        RdxRadioItemDirective,
        RdxRadioItemInputDirective,
        RdxRadioIndicatorDirective,
        RdxRadioIndicatorPresenceDirective,
        RdxRadioGroupDirective
    ]
})
export class RadioDefaultComponent {
    protected readonly labelId = injectId('radio-density-label-');
    protected readonly options = [
        { value: 'default', label: 'Default' },
        { value: 'comfortable', label: 'Comfortable' },
        { value: 'compact', label: 'Compact' }
    ];
}
