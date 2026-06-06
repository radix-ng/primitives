import { Component } from '@angular/core';

import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { RdxSwitchInput, RdxSwitchRoot, RdxSwitchThumb } from '@radix-ng/primitives/switch';

@Component({
    selector: 'primitive-switch-demo',
    standalone: true,
    imports: [RdxLabelDirective, RdxSwitchRoot, RdxSwitchInput, RdxSwitchThumb],
    template: `
        <label class="Label" rdxLabel htmlFor="airplane-mode-model">
            Airplane mode
            <button class="SwitchRoot" id="airplane-mode-model" rdxSwitchRoot>
                <input rdxSwitchInput />
                <span class="SwitchThumb" rdxSwitchThumb></span>
            </button>
        </label>
    `,
    styleUrl: 'switch-demo.css'
})
export class SwitchDemoComponent {}

export default SwitchDemoComponent;
