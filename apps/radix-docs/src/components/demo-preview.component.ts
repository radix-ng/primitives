import { Component } from '@angular/core';

@Component({
    selector: 'demo-preview',
    standalone: true,
    template: `
        <div
            class="grid min-h-[140px] w-full auto-cols-auto grid-flow-col grid-rows-1 place-items-center overflow-x-scroll rounded-lg p-6 lg:overflow-visible"
        >
            <ng-content></ng-content>
        </div>
    `
})
export default class DemoPreviewComponent {}
