import { Component } from '@angular/core';

import { RdxLabelDirective } from '@radix-ng/primitives/label';

@Component({
    selector: 'primitive-label-demo',
    standalone: true,
    imports: [RdxLabelDirective],
    template: `
        <label class="LabelRoot" rdxLabel htmlFor="firstName">First Name</label>
        <input class="Input" id="firstName" type="text" value="Pedro Duarte" />
    `,
    styleUrl: 'label-demo.css'
})
export class LabelDemoComponent {}

export default LabelDemoComponent;
