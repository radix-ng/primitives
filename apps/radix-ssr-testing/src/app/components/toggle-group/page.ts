import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxToggle } from '@radix-ng/primitives/toggle';
import { RdxToggleGroup } from '@radix-ng/primitives/toggle-group';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'app-toggle-group',
    imports: [RdxToggleGroup, RdxToggle],
    template: `
        <div rdxToggleGroup [value]="['1']">
            <button rdxToggle value="1">Item 1</button>
            <button rdxToggle value="2">Item 2</button>
        </div>
    `
})
export default class Page {}
