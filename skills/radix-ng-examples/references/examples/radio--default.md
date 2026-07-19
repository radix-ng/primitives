# Radio Group — Default

> One example from the [Radio Group](../components/radio.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

A radio group with sibling labels and hidden native inputs.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import {
    RdxRadioGroupDirective,
    RdxRadioIndicatorDirective,
    RdxRadioItemDirective,
    RdxRadioItemInputDirective
} from '@radix-ng/primitives/radio';
import { demoRadio } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'radio-default-example',
    template: `
        <form>
            <div [class]="r.group" rdxRadioRoot name="density" aria-label="View density">
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
export class RadioDefaultComponent {
    protected readonly r = demoRadio;
}
```
