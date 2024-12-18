import { Component } from '@angular/core';
import { RdxThemeAvatarComponent } from '@radix-ng/components/avatar';
import { RdxThemeDirective } from '@radix-ng/components/theme';

@Component({
    selector: 'avatar-radius-demo',
    standalone: true,
    imports: [RdxThemeDirective, RdxThemeAvatarComponent],
    template: `
        <div rdxTheme>
            <div style="display: flex; gap: 1rem;">
                <rdx-theme-avatar radius="none" fallback="A" />
                <rdx-theme-avatar radius="large" fallback="A" />
                <rdx-theme-avatar radius="full" fallback="A" />
            </div>
        </div>
    `
})
export class AvatarRadiusComponent {}

export default AvatarRadiusComponent;