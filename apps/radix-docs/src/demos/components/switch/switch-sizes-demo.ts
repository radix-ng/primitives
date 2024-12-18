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
            <button rdxThemeSwitch size="1" defaultChecked></button>
            <button rdxThemeSwitch size="2" defaultChecked></button>
            <button rdxThemeSwitch size="3" defaultChecked></button>
        </div>
    `
})
export class SwitchSizedComponent {}

export default SwitchSizedComponent;
