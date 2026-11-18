import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import {
    RdxRadioGroupDirective,
    RdxRadioIndicatorDirective,
    RdxRadioItemDirective,
    RdxRadioItemInputDirective
} from '@radix-ng/primitives/radio';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'radio-default-example',
    template: `
        <form>
            <div class="flex flex-col gap-2.5" rdxRadioRoot name="density" aria-label="View density">
                <label class="flex items-center gap-3" rdxLabel>
                    <span
                        class="demo-radio-item demo-focus flex size-6 items-center justify-center disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                        rdxRadioItem
                        value="default"
                    >
                        <span
                            class="after:bg-primary flex size-full items-center justify-center after:block after:size-2.5 after:rounded-full data-[state=unchecked]:hidden"
                            rdxRadioIndicator
                        ></span>
                        <input rdxRadioItemInput />
                    </span>
                    <span class="demo-label">Default</span>
                </label>
                <label class="flex items-center gap-3" rdxLabel>
                    <span
                        class="demo-radio-item demo-focus flex size-6 items-center justify-center disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                        rdxRadioItem
                        value="comfortable"
                    >
                        <span
                            class="after:bg-primary flex size-full items-center justify-center after:block after:size-2.5 after:rounded-full data-[state=unchecked]:hidden"
                            rdxRadioIndicator
                        ></span>
                        <input rdxRadioItemInput />
                    </span>
                    <span class="demo-label">Comfortable</span>
                </label>
                <label class="flex items-center gap-3" rdxLabel>
                    <span
                        class="demo-radio-item demo-focus flex size-6 items-center justify-center disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                        rdxRadioItem
                        value="compact"
                    >
                        <span
                            class="after:bg-primary flex size-full items-center justify-center after:block after:size-2.5 after:rounded-full data-[state=unchecked]:hidden"
                            rdxRadioIndicator
                        ></span>
                        <input rdxRadioItemInput />
                    </span>
                    <span class="demo-label">Compact</span>
                </label>
            </div>
        </form>
    `,
    imports: [
        RdxLabelDirective,
        RdxRadioItemDirective,
        RdxRadioItemInputDirective,
        RdxRadioIndicatorDirective,
        RdxRadioGroupDirective
    ]
})
export class RadioDefaultComponent {}
