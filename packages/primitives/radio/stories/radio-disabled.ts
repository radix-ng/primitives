import { Component } from '@angular/core';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import {
    RdxRadioGroupDirective,
    RdxRadioIndicatorDirective,
    RdxRadioItemDirective,
    RdxRadioItemInputDirective
} from '@radix-ng/primitives/radio';
import { demoRadio } from '../../storybook/styles';

@Component({
    selector: 'radio-disabled-example',
    template: `
        <div
            [class]="r.group"
            [value]="'comfortable'"
            rdxRadioRoot
            name="density-disabled"
            disabled
            aria-label="View density"
        >
            <label [class]="r.row" rdxLabel>
                <span [class]="r.item" rdxRadioItem value="default">
                    <span [class]="r.indicator" rdxRadioIndicator></span>
                    <input rdxRadioItemInput />
                </span>
                <span [class]="r.label">Default</span>
            </label>
            <label [class]="r.row" rdxLabel>
                <span [class]="r.item" rdxRadioItem value="comfortable">
                    <span [class]="r.indicator" rdxRadioIndicator></span>
                    <input rdxRadioItemInput />
                </span>
                <span [class]="r.label">Comfortable</span>
            </label>
            <label [class]="r.row" rdxLabel>
                <span [class]="r.item" rdxRadioItem value="compact">
                    <span [class]="r.indicator" rdxRadioIndicator></span>
                    <input rdxRadioItemInput />
                </span>
                <span [class]="r.label">Compact</span>
            </label>
        </div>
    `,
    imports: [
        RdxLabelDirective,
        RdxRadioItemDirective,
        RdxRadioItemInputDirective,
        RdxRadioIndicatorDirective,
        RdxRadioGroupDirective
    ]
})
export class RadioDisabledComponent {
    protected readonly r = demoRadio;
}
