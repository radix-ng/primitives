import { Component, ElementRef, OnDestroy, OnInit, inject } from '@angular/core';
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
export class RdxSliderThumbComponent implements OnInit, OnDestroy {
    private readonly rootContext = inject(RdxSliderRootComponent);
    private readonly elementRef = inject(ElementRef);

    ngOnInit() {
        this.rootContext.thumbElements.push(this.elementRef.nativeElement);
    }

    ngOnDestroy() {
        const index = this.rootContext.thumbElements.indexOf(this.elementRef.nativeElement);
        if (index >= 0) this.rootContext.thumbElements.splice(index, 1);
    }
}
