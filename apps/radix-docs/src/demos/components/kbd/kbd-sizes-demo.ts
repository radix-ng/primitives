import { Component } from '@angular/core';
import { RdxKbdComponent } from '@radix-ng/components/kbd';
import { RdxThemeDirective } from '@radix-ng/components/theme';

@Component({
    selector: 'kbd-sizes-demo',
    standalone: true,
    imports: [RdxThemeDirective, RdxKbdComponent],
    template: `
        <div rdxTheme>
            <div class="rt-Flex rt-r-fd-column rt-r-ai-start rt-r-gap-2">
                <rdx-kbd size="1">Shift + Tab</rdx-kbd>
                <rdx-kbd size="2">Shift + Tab</rdx-kbd>
                <rdx-kbd size="3">Shift + Tab</rdx-kbd>
                <rdx-kbd size="4">Shift + Tab</rdx-kbd>
                <rdx-kbd size="5">Shift + Tab</rdx-kbd>
                <rdx-kbd size="6">Shift + Tab</rdx-kbd>
                <rdx-kbd size="7">Shift + Tab</rdx-kbd>
                <rdx-kbd size="8">Shift + Tab</rdx-kbd>
                <rdx-kbd size="9">Shift + Tab</rdx-kbd>
            </div>
        </div>
    `
})
export class KbdSizesComponent {}

export default KbdSizesComponent;
