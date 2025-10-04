import { Component } from '@angular/core';
import { RdxToggleGroupDirective, RdxToggleGroupItemDirective } from '@radix-ng/primitives/toggle-group';

@Component({
    selector: 'app-toggle-group',
    imports: [RdxToggleGroupDirective, RdxToggleGroupItemDirective],
    template: `
        <div rdxToggleGroup value="1" type="single">
            <button rdxToggleGroupItem value="1">Item 1</button>
            <button rdxToggleGroupItem value="2">Item 2</button>
        </div>
    `
})
export default class Page {}
