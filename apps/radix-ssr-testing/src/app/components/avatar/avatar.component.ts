import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxAvatarFallbackDirective,
    RdxAvatarImageDirective,
    RdxAvatarRootDirective
} from '@radix-ng/primitives/avatar';

@Component({
    selector: 'app-avatar',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RdxAvatarRootDirective, RdxAvatarImageDirective, RdxAvatarFallbackDirective],
    template: `
        <span rdxAvatarRoot>
            <span rdxAvatarFallback>A</span>
        </span>
    `
})
export default class AvatarComponent {}
