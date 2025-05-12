import { Component } from '@angular/core';

import { RdxToggleDirective } from '@radix-ng/primitives/toggle';
import { Italic, LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'primitive-toggle-demo',
    standalone: true,
    imports: [RdxToggleDirective, LucideAngularModule],
    template: `
        <button class="Toggle" rdxToggle aria-label="Toggle italic">
            <lucide-angular [img]="Italic" size="16" />
        </button>
    `,
    styleUrl: 'toggle-demo.css'
})
export class ToggleDemoComponent {
    protected readonly Italic = Italic;
}

export default ToggleDemoComponent;
