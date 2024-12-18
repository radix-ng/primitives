import { Component } from '@angular/core';
import { RdxThemeAvatarComponent } from '@radix-ng/components/avatar';
import { RdxThemeDirective } from '@radix-ng/components/theme';

@Component({
    selector: 'avatar-demo',
    standalone: true,
    imports: [RdxThemeAvatarComponent],
    hostDirectives: [RdxThemeDirective],
    template: `
        <div style="display: flex; align-items: center; gap: 1rem;">
            <rdx-theme-avatar
                src="https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?&w=256&h=256&q=70&crop=focalpoint&fp-x=0.5&fp-y=0.3&fp-z=1&fit=crop"
                fallback="A"
            />
            <rdx-theme-avatar fallback="A" />
        </div>
    `
})
export class AvatarComponent {}

export default AvatarComponent;
