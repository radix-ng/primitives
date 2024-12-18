import { Component } from '@angular/core';
import { RdxThemeAvatarComponent } from '@radix-ng/components/avatar';
import { RdxThemeDirective } from '@radix-ng/components/theme';

@Component({
    selector: 'avatar-hc-demo',
    standalone: true,
    imports: [RdxThemeAvatarComponent],
    hostDirectives: [RdxThemeDirective],
    template: `
        <div style="display: inline-grid; grid-template-rows: repeat(2, 1fr); gap: 8px; grid-auto-flow: column;">
            <rdx-theme-avatar variant="solid" color="indigo" fallback="A" />
            <rdx-theme-avatar variant="solid" color="indigo" fallback="A" highContrast />
            <rdx-theme-avatar variant="solid" color="cyan" fallback="A" />
            <rdx-theme-avatar variant="solid" color="cyan" fallback="A" highContrast />
            <rdx-theme-avatar variant="solid" color="orange" fallback="A" />
            <rdx-theme-avatar variant="solid" color="orange" fallback="A" highContrast />
            <rdx-theme-avatar variant="solid" color="crimson" fallback="A" />
            <rdx-theme-avatar variant="solid" color="crimson" fallback="A" highContrast />
            <rdx-theme-avatar variant="solid" color="gray" fallback="A" />
            <rdx-theme-avatar variant="solid" color="gray" fallback="A" highContrast />
        </div>
    `
})
export class AvatarHcComponent {}

export default AvatarHcComponent;
