import { Component } from '@angular/core';

import { RdxToggleGroupDirective, RdxToggleGroupItemDirective } from '@radix-ng/primitives/toggle-group';
import { AlignCenter, AlignLeft, AlignRight, LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'primitive-toggle-group-demo',
    standalone: true,
    imports: [RdxToggleGroupDirective, RdxToggleGroupItemDirective, LucideAngularModule],
    template: `
        <div class="ToggleGroup" rdxToggleGroup value="center" aria-label="Text alignment">
            <button class="ToggleGroupItem" rdxToggleGroupItem value="left" aria-label="Left aligned">
                <lucide-icon [img]="AlignLeft" size="16" />
            </button>
            <button class="ToggleGroupItem" rdxToggleGroupItem value="center" aria-label="Center aligned">
                <lucide-icon [img]="AlignCenter" size="16" />
            </button>
            <button class="ToggleGroupItem" rdxToggleGroupItem value="right" aria-label="Right aligned">
                <lucide-icon [img]="AlignRight" name="align-right" size="16" />
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
