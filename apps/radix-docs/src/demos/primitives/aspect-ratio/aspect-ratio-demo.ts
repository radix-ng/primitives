import { Component } from '@angular/core';

import { RdxAspectRatioDirective } from '@radix-ng/primitives/aspect-ratio';

@Component({
    selector: 'radix-aspect-ratio',
    standalone: true,
    imports: [RdxAspectRatioDirective],
    template: `
        <div class="Container">
            <div [ratio]="16 / 9" rdxAspectRatio>
                <img
                    class="Image"
                    src="https://images.unsplash.com/photo-1535025183041-0991a977e25b?w=300&dpr=2&q=80"
                    alt="Landscape photograph by Tobias Tullius"
                />
            </div>
        </div>
    `,
    styleUrl: 'aspect-ratio-demo.css'
})
export class AspectRatioDemoComponent {}

export default AspectRatioDemoComponent;
