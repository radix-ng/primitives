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
            <span class="AvatarRoot" rdxAvatarRoot>
                <img
                    class="AvatarImage"
                    rdxAvatarImage
                    src="https://images.unsplash.com/photo-1511485977113-f34c92461ad9?ixlib=rb-1.2.1&w=128&h=128&dpr=2&q=80"
                    alt="Pedro Duarte"
                />
                <span class="AvatarFallback" rdxAvatarFallback rdxDelayMs="600">JD</span>
            </span>
            <span class="AvatarRoot" rdxAvatarRoot>
                <span class="AvatarFallback" rdxAvatarFallback>PD</span>
            </span>
        </div>
    `,
    styleUrl: 'avatar-demo.css'
})
export class AvatarDemoComponent {}

export default AvatarDemoComponent;
