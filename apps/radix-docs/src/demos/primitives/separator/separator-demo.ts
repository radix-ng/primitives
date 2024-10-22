import { Component } from '@angular/core';

import { RdxSeparatorRootDirective } from '@radix-ng/primitives/separator';

@Component({
    standalone: true,
    imports: [RdxSeparatorRootDirective],
    template: `
        <div style="width: 100%; max-width: 300px; margin: 0 15px;">
            <div class="Text">Radix Primitives</div>
            <div class="Text" style="font-weight: 500;">An open-source UI component library.</div>
            <div class="SeparatorRoot" rdxSeparatorRoot style="margin: 15px 0;"></div>
            <div style="display: flex; height: 1.25rem; align-items: center;">
                <div class="Text">Blog</div>
                <div
                    class="SeparatorRoot"
                    rdxSeparatorRoot
                    decorative="decorative"
                    orientation="vertical"
                    style="margin: 0 15px;"
                ></div>
                <div class="Text">Docs</div>
                <div
                    class="SeparatorRoot"
                    rdxSeparatorRoot
                    decorative="decorative"
                    orientation="vertical"
                    style="margin: 0 15px;"
                ></div>
                <div class="Text">Source</div>
            </div>
        </div>
    `,
    styleUrl: 'separator-demo.css'
})
export class SeparatorDemoComponent {}

export default SeparatorDemoComponent;
