import { Component } from '@angular/core';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { RdxRadioGroupDirective, RdxRadioIndicatorDirective, RdxRadioItemDirective } from '@radix-ng/primitives/radio';
import { demoRadio } from '../../storybook/styles';

@Component({
    selector: 'radio-default-example',
    template: `
        <form>
            <div [class]="r.group" rdxRadioRoot name="density" orientation="vertical" aria-label="View density">
                <label [class]="r.row" rdxLabel>
                    <span [class]="r.item" rdxRadioItem value="default">
                        <span [class]="r.indicator" rdxRadioIndicator></span>
                    </span>
                    <span [class]="r.label">Default</span>
                </label>
                <label [class]="r.row" rdxLabel>
                    <span [class]="r.item" rdxRadioItem value="comfortable">
                        <span [class]="r.indicator" rdxRadioIndicator></span>
                    </span>
                    <span [class]="r.label">Comfortable</span>
                </label>
                <label [class]="r.row" rdxLabel>
                    <span [class]="r.item" rdxRadioItem value="compact">
                        <span [class]="r.indicator" rdxRadioIndicator></span>
                    </span>
                    <span [class]="r.label">Compact</span>
                </label>
            </div>
        </form>
    `,
    imports: [RdxLabelDirective, RdxRadioItemDirective, RdxRadioIndicatorDirective, RdxRadioGroupDirective]
})
export class RadioDefaultComponent {
    protected readonly r = demoRadio;
}
