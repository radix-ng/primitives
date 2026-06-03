import { demoRadio } from '../../storybook/styles';
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
    selector: 'radio-disabled-example',
    template: `
        <div
            rdxRadioRoot
            name="density-disabled"
            disabled
            aria-label="View density"
            [class]="r.group"
            [value]="'comfortable'"
        >
            <label rdxLabel [class]="r.row">
                <span rdxRadioItem value="default" [class]="r.item">
                    <span rdxRadioIndicator [class]="r.indicator"></span>
                    <input rdxRadioItemInput />
                </span>
                <span [class]="r.label">Default</span>
            </label>
            <label rdxLabel [class]="r.row">
                <span rdxRadioItem value="comfortable" [class]="r.item">
                    <span rdxRadioIndicator [class]="r.indicator"></span>
                    <input rdxRadioItemInput />
                </span>
                <span [class]="r.label">Comfortable</span>
            </label>
            <label rdxLabel [class]="r.row">
                <span rdxRadioItem value="compact" [class]="r.item">
                    <span rdxRadioIndicator [class]="r.indicator"></span>
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
