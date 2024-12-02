import { Component, computed, inject, OnInit } from '@angular/core';
import { RdxSliderRootComponent } from './slider-root.component';
import { convertValueToPercentage } from './utils';

@Component({
    selector: 'rdx-slider-range',
    standalone: true,
    host: {
        '[attr.data-disabled]': 'rootContext.disabled ? "" : undefined',
        '[attr.data-orientation]': 'rootContext.orientation',
        '[style]': 'rangeStyles'
    },
    template: `
        <ng-content />
    `
})
export class RdxSliderRangeComponent implements OnInit {
    protected rootContext = inject(RdxSliderRootComponent);

    rangeStyles: { [key: string]: string } = {};

    percentages = computed(() =>
        this.rootContext
            .modelValue()
            ?.map((value) => convertValueToPercentage(value, this.rootContext.min, this.rootContext.max))
    );

    offsetStart = computed(() => (this.rootContext.modelValue()!.length > 1 ? Math.min(...this.percentages()!) : 0));
    offsetEnd = computed(() => 100 - Math.max(...this.percentages()!));

    ngOnInit() {
        this.rangeStyles = {
            [this.rootContext.orientationContext.startEdge]: `${this.offsetStart()}%`,
            [this.rootContext.orientationContext.endEdge]: `${this.offsetEnd()}%`
        };
    }
}
