import { Component } from '@angular/core';
import { RdxThemeAvatarComponent } from '@radix-ng/components/avatar';
import { RdxThemeDirective } from '@radix-ng/components/theme';

@Component({
    selector: 'avatar-sizes-demo',
    standalone: true,
    imports: [RdxThemeDirective, RdxThemeAvatarComponent],
    template: `
        <div rdxTheme>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <rdx-theme-avatar
                    size="1"
                    src="https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?&w=256&h=256&q=70&crop=focalpoint&fp-x=0.5&fp-y=0.3&fp-z=1&fit=crop"
                    fallback="A"
                />
                <rdx-theme-avatar
                    size="2"
                    src="https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?&w=256&h=256&q=70&crop=focalpoint&fp-x=0.5&fp-y=0.3&fp-z=1&fit=crop"
                    fallback="A"
                />
                <rdx-theme-avatar
                    size="3"
                    src="https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?&w=256&h=256&q=70&crop=focalpoint&fp-x=0.5&fp-y=0.3&fp-z=1&fit=crop"
                    fallback="A"
                />
                <rdx-theme-avatar
                    size="4"
                    src="https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?&w=256&h=256&q=70&crop=focalpoint&fp-x=0.5&fp-y=0.3&fp-z=1&fit=crop"
                    fallback="A"
                />
                <rdx-theme-avatar
                    size="5"
                    src="https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?&w=256&h=256&q=70&crop=focalpoint&fp-x=0.5&fp-y=0.3&fp-z=1&fit=crop"
                    fallback="A"
                />
                <rdx-theme-avatar
                    size="6"
                    src="https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?&w=256&h=256&q=70&crop=focalpoint&fp-x=0.5&fp-y=0.3&fp-z=1&fit=crop"
                    fallback="A"
                />
                <rdx-theme-avatar
                    size="7"
                    src="https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?&w=256&h=256&q=70&crop=focalpoint&fp-x=0.5&fp-y=0.3&fp-z=1&fit=crop"
                    fallback="A"
                />
                <rdx-theme-avatar
                    size="8"
                    src="https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?&w=256&h=256&q=70&crop=focalpoint&fp-x=0.5&fp-y=0.3&fp-z=1&fit=crop"
                    fallback="A"
                />
            </div>
        </div>
    `
})
export class AvatarSizeComponent {}

export default AvatarSizeComponent;
