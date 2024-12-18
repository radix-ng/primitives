import { Component } from '@angular/core';
import { RdxThemeSwitchComponent } from '@radix-ng/components/switch';
import { RdxThemeDirective } from '@radix-ng/components/theme';

@Component({
    selector: 'switch-radius-demo',
    standalone: true,
    imports: [RdxThemeDirective, RdxThemeSwitchComponent],
    hostDirectives: [RdxThemeDirective],
    template: `
        <div style="display: flex; align-items: center; gap: 8px;">
            <rdx-theme-switch radius="none" defaultChecked />
            <rdx-theme-switch radius="small" defaultChecked />
            <rdx-theme-switch radius="full" defaultChecked />
        </div>
    `
})
export class SwitchRadiusComponent {}

export default SwitchRadiusComponent;
