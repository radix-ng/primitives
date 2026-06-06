import { Component } from '@angular/core';

import {
    LucideAlignCenter as AlignCenter,
    LucideAlignLeft as AlignLeft,
    LucideAlignRight as AlignRight,
    LucideDynamicIcon
} from '@lucide/angular';
import { RdxToggle } from '@radix-ng/primitives/toggle';
import { RdxToggleGroup } from '@radix-ng/primitives/toggle-group';

@Component({
    selector: 'primitive-toggle-group-demo',
    standalone: true,
    imports: [RdxToggleGroup, RdxToggle, LucideDynamicIcon],
    template: `
        <div class="ToggleGroup" [value]="['center']" rdxToggleGroup aria-label="Text alignment">
            <button class="ToggleGroupItem" rdxToggle value="left" aria-label="Left aligned">
                <svg [lucideIcon]="AlignLeft" size="16" />
            </button>
            <button class="ToggleGroupItem" rdxToggle value="center" aria-label="Center aligned">
                <svg [lucideIcon]="AlignCenter" size="16" />
            </button>
            <button class="ToggleGroupItem" rdxToggle value="right" aria-label="Right aligned">
                <svg [lucideIcon]="AlignRight" size="16" />
            </button>
        </div>
    `,
    styleUrl: 'toggle-group-demo.css'
})
export class ToggleGroupDemoComponent {
    protected readonly AlignLeft = AlignLeft;
    protected readonly AlignCenter = AlignCenter;
    protected readonly AlignRight = AlignRight;
}

export default ToggleGroupDemoComponent;
