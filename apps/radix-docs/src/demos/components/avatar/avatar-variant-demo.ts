import { Component } from '@angular/core';
import { RdxThemeAvatarComponent } from '@radix-ng/components/avatar';
import { RdxThemeDirective } from '@radix-ng/components/theme';

@Component({
    selector: 'avatar-variant-demo',
    standalone: true,
    imports: [RdxThemeAvatarComponent],
    hostDirectives: [RdxThemeDirective],
    template: `
        <div style="display: flex; gap: 1rem;">
            <rdx-theme-avatar variant="solid" fallback="A" />
            <rdx-theme-avatar variant="soft" fallback="A" />
        </div>
    `
})
export class AvatarVariantComponent {}

export default AvatarVariantComponent;
