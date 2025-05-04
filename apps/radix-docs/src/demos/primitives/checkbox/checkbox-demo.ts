import { Component } from '@angular/core';

import {
    RdxCheckboxIndicatorDirective,
    RdxCheckboxInputDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';

import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { Check, LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'radix-checkbox-demo',
    standalone: true,
    imports: [
        RdxLabelDirective,
        RdxCheckboxRootDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxInputDirective,
        LucideAngularModule
    ],
    template: `
        <div style="display: flex; align-items: center;">
            <button class="CheckboxRoot" rdxCheckboxRoot>
                <lucide-angular class="CheckboxIndicator" [img]="CheckIcon" rdxCheckboxIndicator size="16" />
                <input id="r1" rdxCheckboxInput type="checkbox" />
            </button>
            <label class="Label" rdxLabel htmlFor="r1">Check Item</label>
        </div>
    `,
    styleUrl: 'checkbox-demo.css'
})
export class CheckboxDemoComponent {
    readonly CheckIcon = Check;
}

export default CheckboxDemoComponent;
