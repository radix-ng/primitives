import { Component } from '@angular/core';

import {
    LucideAlignCenter as AlignCenter,
    LucideAlignLeft as AlignLeft,
    LucideAlignRight as AlignRight,
    LucideDynamicIcon
} from '@lucide/angular';
import { RdxToggleGroupDirective, RdxToggleGroupItemDirective } from '@radix-ng/primitives/toggle-group';

@Component({
    selector: 'primitive-toggle-group-demo',
    standalone: true,
    imports: [RdxToggleGroupDirective, RdxToggleGroupItemDirective, LucideDynamicIcon],
    template: `
        <div class="ToggleGroup" rdxToggleGroup value="center" aria-label="Text alignment">
            <button class="ToggleGroupItem" rdxToggleGroupItem value="left" aria-label="Left aligned">
                <svg [lucideIcon]="AlignLeft" size="16" />
            </button>
            <button class="ToggleGroupItem" rdxToggleGroupItem value="center" aria-label="Center aligned">
                <svg [lucideIcon]="AlignCenter" size="16" />
            </button>
            <button class="ToggleGroupItem" rdxToggleGroupItem value="right" aria-label="Right aligned">
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
