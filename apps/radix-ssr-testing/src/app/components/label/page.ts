import { Component } from '@angular/core';
import { RdxLabelDirective } from '@radix-ng/primitives/label';

@Component({
    selector: 'app-label',
    imports: [RdxLabelDirective],
    template: `
        <label rdxLabel>Label</label>
    `
})
export default class Page {}
