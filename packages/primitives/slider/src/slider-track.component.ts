import { Component, inject } from '@angular/core';
import { RdxSliderRootComponent } from './slider-root.component';

@Component({
    selector: 'rdx-slider-track',
    standalone: true,
    host: {
        '[attr.data-disabled]': "rootContext.disabled() ? '' : undefined",
        '[attr.data-orientation]': 'rootContext.orientation()'
    },
    template: `
        <ng-content />
    `
})
export class RdxSliderTrackComponent {
    protected readonly rootContext = inject(RdxSliderRootComponent);
}
