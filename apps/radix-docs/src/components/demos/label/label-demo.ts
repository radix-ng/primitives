import { Component } from '@angular/core';

import { RdxLabelDirective } from '@radix-ng/primitives/label';

@Component({
    standalone: true,
    imports: [RdxLabelDirective],
    template: `
        <label rdxLabel htmlFor="uniqId">First Name</label>
        <input class="Input" id="uniqId" type="text" />
    `
})
export class LabelDemoComponent {}

export default LabelDemoComponent;
