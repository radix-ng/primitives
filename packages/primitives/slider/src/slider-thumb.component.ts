import { Component, inject } from '@angular/core';
import { RdxSliderRootComponent } from './slider-root.component';
import { RdxSliderThumbImplDirective } from './slider-thumb-impl.directive';

@Component({
    selector: 'rdx-slider-thumb',
    standalone: true,
    hostDirectives: [RdxSliderThumbImplDirective],
    template: `
        <ng-content />
    `
})
export class RdxSliderThumbComponent {
    private readonly rootContext = inject(RdxSliderRootComponent);
}
