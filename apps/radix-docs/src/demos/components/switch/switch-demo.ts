import { Component } from '@angular/core';
import { RdxThemeSwitchComponent } from '@radix-ng/components/switch';
import { RdxThemeDirective } from '@radix-ng/components/theme';

@Component({
    selector: 'switch-demo',
    standalone: true,
    imports: [RdxThemeSwitchComponent],
    hostDirectives: [RdxThemeDirective],
    template: `
        <rdx-theme-switch defaultChecked />
    `
})
export class SwitchComponent {}

export default SwitchComponent;
