import { Component } from '@angular/core';
import { RdxThemeSwitchComponent } from '@radix-ng/components/switch';
import { RdxThemeDirective } from '@radix-ng/components/theme';

@Component({
    selector: 'switch-sizes-demo',
    standalone: true,
    imports: [RdxThemeDirective, RdxThemeSwitchComponent],
    hostDirectives: [RdxThemeDirective],
    template: `
        <div style="display: flex; align-items: center; gap: 8px;">
            <rdx-theme-switch size="1" defaultChecked />
            <rdx-theme-switch size="2" defaultChecked />
            <rdx-theme-switch size="3" defaultChecked />
        </div>
    `
})
export class SwitchSizedComponent {}

export default SwitchSizedComponent;
