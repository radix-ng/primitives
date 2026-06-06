import { Component } from '@angular/core';

import { LucideItalic as Italic, LucideDynamicIcon } from '@lucide/angular';
import { RdxToggle } from '@radix-ng/primitives/toggle';

@Component({
    selector: 'primitive-toggle-demo',
    standalone: true,
    imports: [RdxToggle, LucideDynamicIcon],
    template: `
        <button class="Toggle" rdxToggle aria-label="Toggle italic">
            <svg [lucideIcon]="Italic" size="16" />
        </button>
    `,
    styleUrl: 'toggle-demo.css'
})
export class ToggleDemoComponent {
    protected readonly Italic = Italic;
}

export default ToggleDemoComponent;
