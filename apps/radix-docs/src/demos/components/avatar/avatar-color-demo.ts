import { Component } from '@angular/core';
import { RdxThemeAvatarComponent } from '@radix-ng/components/avatar';
import { RdxThemeDirective } from '@radix-ng/components/theme';

@Component({
    selector: 'avatar-color-demo',
    standalone: true,
    imports: [RdxThemeAvatarComponent],
    hostDirectives: [RdxThemeDirective],
    template: `
        <div style="display: flex; gap: 1rem;">
            <rdx-theme-avatar variant="solid" color="indigo" fallback="A" />
            <rdx-theme-avatar variant="solid" color="cyan" fallback="A" />
            <rdx-theme-avatar variant="solid" color="orange" fallback="A" />
            <rdx-theme-avatar variant="solid" color="crimson" fallback="A" />
        </div>
    `
})
export class AvatarColorComponent {}

export default AvatarColorComponent;
