import { Component } from '@angular/core';
import { RdxSliderThumbImplDirective } from './slider-thumb-impl.directive';

@Component({
    selector: 'rdx-slider-thumb',
    standalone: true,
    hostDirectives: [RdxSliderThumbImplDirective],
    template: `
        <ng-content />
    `
})
export class RdxSliderThumbComponent {}
