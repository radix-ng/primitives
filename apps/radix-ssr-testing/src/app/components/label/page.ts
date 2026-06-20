import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxLabelDirective } from '@radix-ng/primitives/label';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'app-label',
    imports: [RdxLabelDirective],
    template: `
        <label rdxLabel>Label</label>
    `
})
export default class Page {}
