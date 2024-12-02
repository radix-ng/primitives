import { computed, Directive, ElementRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RdxSliderRootComponent } from './slider-root.component';
import { convertValueToPercentage, getThumbInBoundsOffset } from './utils';

@Directive({
    selector: '[rdxSliderThumbImpl]',
    standalone: true,
    host: {
        role: 'slider',
        '[tabindex]': 'rootContext.disabled ? undefined : 0',

        '[attr.aria-valuenow]': 'rootContext.modelValue',
        '[attr.aria-valuemin]': 'rootContext.min',
        '[attr.aria-valuemax]': 'rootContext.max',
        '[attr.aria-orientation]': 'rootContext.orientation',

        '[attr.data-orientation]': 'rootContext.orientation',
        '[attr.data-disabled]': 'rootContext.disabled ? "" : undefined',

        '[style]': 'combinedStyles()',

        '(focus)': 'onFocus()'
    }
})
export class RdxSliderThumbImplDirective implements OnInit, OnDestroy {
    protected readonly rootContext = inject(RdxSliderRootComponent);
    private readonly elementRef = inject(ElementRef);

    isMounted = signal(false);

    thumbIndex = computed(() => {
        const thumbElement = this.elementRef.nativeElement;
        const index = this.rootContext.thumbElements.indexOf(thumbElement);
        return index >= 0 ? index : null;
    });

    value = computed(() => {
        const index = this.thumbIndex();
        if (index === null) return undefined;
        return this.rootContext.modelValue()?.[index];
    });

    percent = computed(() => {
        const val = this.value();
        if (val === undefined) return 0;
        return convertValueToPercentage(val, this.rootContext.min, this.rootContext.max);
    });

    transform = computed(() => {
        const percent = this.percent();
        const offset = this.thumbInBoundsOffset();
        return `calc(${percent}% + ${offset}px)`;
    });

    orientationSize = computed(() => {
        const rect = this.elementRef.nativeElement.getBoundingClientRect();
        return this.rootContext.orientationContext.size === 'width' ? rect.width : rect.height;
    });

    thumbInBoundsOffset = computed(() => {
        const size = this.orientationSize();
        const percent = this.percent();
        const direction = this.rootContext.orientationContext.direction;
        return size ? getThumbInBoundsOffset(size, percent, direction) : 0;
    });

    combinedStyles = computed(() => {
        const startEdge = this.rootContext.orientationContext.startEdge;
        const percent = this.percent();
        const offset = this.thumbInBoundsOffset();

        return {
            position: 'absolute',
            transform: 'var(--rdx-slider-thumb-transform)',
            display: this.isMounted() && this.value() === undefined ? 'none' : undefined,
            [startEdge]: `calc(${percent}% + ${offset}px)`
        };
    });

    onFocus() {
        if (this.thumbIndex() !== null) {
            this.rootContext.valueIndexToChange.set(this.thumbIndex()!);
        }
    }

    ngOnInit() {
        const thumbElement = this.elementRef.nativeElement;
        this.rootContext.thumbElements.push(thumbElement);
        this.isMounted.set(true);
    }

    ngOnDestroy() {
        const thumbElement = this.elementRef.nativeElement;
        const index = this.rootContext.thumbElements.indexOf(thumbElement);
        if (index >= 0) this.rootContext.thumbElements.splice(index, 1);

        this.isMounted.set(false);
    }
}
