import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxAvatarFallbackDirective, RdxAvatarRootDirective } from '@radix-ng/primitives/avatar';

@Component({
    selector: 'app-avatar',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RdxAvatarRootDirective, RdxAvatarFallbackDirective],
    template: `
        <span rdxAvatarRoot>
            <span rdxAvatarFallback>A</span>
        </span>
    `
})
export default class AvatarComponent {}
