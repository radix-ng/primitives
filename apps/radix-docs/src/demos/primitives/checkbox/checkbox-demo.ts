import { Component } from '@angular/core';

import {
    RdxCheckboxButtonDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxInputDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';

import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { Check, LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'radix-checkbox-demo',
    imports: [
        RdxLabelDirective,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxInputDirective,
        LucideAngularModule
    ],
    template: `
        <div style="display: flex; align-items: center;">
            <div rdxCheckboxRoot>
                <button class="CheckboxButton" id="r1" rdxCheckboxButton>
                    <lucide-angular class="CheckboxIndicator" [img]="CheckIcon" rdxCheckboxIndicator size="16" />
                </button>
                <input rdxCheckboxInput />
            </div>
            <label class="Label" rdxLabel htmlFor="r1">Accept terms and conditions.</label>
        </div>
    `,
    styleUrl: 'checkbox-demo.css'
})
export class CheckboxDemoComponent {
    readonly CheckIcon = Check;
}

export default CheckboxDemoComponent;
