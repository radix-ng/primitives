import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RdxLabelDirective } from '@radix-ng/primitives/label';

@Component({
    standalone: true,
    imports: [RdxLabelDirective, CommonModule],
    template: `
        <label rdxLabel htmlFor="uniqId">First Name</label>
        <input class="Input" id="uniqId" type="text" />
    `
})
export class LabelDemoComponent {}

export default LabelDemoComponent;
