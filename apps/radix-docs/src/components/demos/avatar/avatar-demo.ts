import { Component } from '@angular/core';

import {
    RdxAvatarFallbackDirective,
    RdxAvatarImageDirective,
    RdxAvatarRootDirective
} from '@radix-ng/primitives/avatar';

@Component({
    standalone: true,
    imports: [RdxAvatarRootDirective, RdxAvatarImageDirective, RdxAvatarFallbackDirective],
    template: `
        <div style="display: flex; gap: 20px">
            <span class="AvatarRoot" rdxAvatarRoot>
                <img
                    class="AvatarImage"
                    rdxAvatarImage
                    src="https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
                    alt="Colm Tuite"
                />
                <span class="AvatarFallback" rdxAvatarFallback rdxDelayMs="600">CT</span>
            </span>
        </div>
    `
})
export class AvatarDemoComponent {}

export default AvatarDemoComponent;
