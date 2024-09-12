import { Component } from '@angular/core';
import { RdxCodeComponent } from '@radix-ng/components/code';
import { RdxThemeDirective } from '@radix-ng/components/theme';

@Component({
    selector: 'kbd-demo',
    standalone: true,
    imports: [RdxThemeDirective, RdxCodeComponent],
    template: `
        <div rdxTheme>
            <rdx-code>console.log()</rdx-code>
        </div>
    `
})
export class CodeComponent {}

export default CodeComponent;
