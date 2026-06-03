import { Component } from '@angular/core';

import {
    RdxCheckboxButtonDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxInputDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';

import { LucideCheck as Check, LucideDynamicIcon } from '@lucide/angular';
import { RdxLabelDirective } from '@radix-ng/primitives/label';

@Component({
    selector: 'radix-checkbox-demo',
    imports: [
        RdxLabelDirective,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxInputDirective,
        LucideDynamicIcon
    ],
    template: `
        <div style="display: flex; align-items: center;">
            <div [checked]="true" rdxCheckboxRoot>
                <button class="CheckboxButton" id="r1" rdxCheckboxButton>
                    <svg class="CheckboxIndicator" [lucideIcon]="CheckIcon" rdxCheckboxIndicator size="16" />
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
