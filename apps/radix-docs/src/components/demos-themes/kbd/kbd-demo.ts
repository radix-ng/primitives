import { Component } from '@angular/core';
import { RdxKbdComponent } from '@radix-ng/components/kbd';
import { RdxThemeDirective } from '@radix-ng/components/theme';

@Component({
    selector: 'kbd-demo',
    standalone: true,
    imports: [RdxThemeDirective, RdxKbdComponent],
    template: `
        <div rdxTheme>
            <rdx-kbd>Shift + Tab</rdx-kbd>
        </div>
    `
})
export class KbdComponent {}

export default KbdComponent;
