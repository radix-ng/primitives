import { NumberInput } from '@angular/cdk/coercion';
import {
    AfterViewInit,
    computed,
    Directive,
    ElementRef,
    inject,
    input,
    numberAttribute,
    Renderer2
} from '@angular/core';

/**
 * Directive to maintain an aspect ratio for an element.
 * The element will have its `padding-bottom` dynamically calculated
 * based on the provided aspect ratio to maintain the desired ratio.
 * The content inside the element will be positioned absolutely.
 */
@Directive({
    selector: '[rdxAspectRatio]',
    exportAs: 'rdxAspectRatio',
    standalone: true,
    host: {
        '[style.position]': `'relative'`,
        '[style.width]': `'100%'`,
        '[style.padding-bottom]': 'paddingBottom()'
    }
})
export class RdxAspectRatioDirective implements AfterViewInit {
    private element = inject(ElementRef);
    private renderer = inject(Renderer2);

    /**
     * The desired aspect ratio (e.g., 16/9).
     * By default, it is set to 1 (which results in a square, 1:1).
     */
    readonly ratio = input<number, NumberInput>(1, { transform: numberAttribute });

    /**
     * Dynamically computed `padding-bottom` style for the element.
     * This value is calculated based on the inverse of the aspect ratio.
     *
     * If the ratio is zero, it defaults to `0%` to avoid division by zero.
     *
     * @ignore
     */
    protected readonly paddingBottom = computed(() => {
        const ratioValue = this.ratio();
        return `${ratioValue !== 0 ? (1 / ratioValue) * 100 : 0}%`;
    });

    ngAfterViewInit() {
        const content = this.element.nativeElement.firstElementChild;
        if (content) {
            // Set the content to cover the entire element with absolute positioning
            this.renderer.setStyle(content, 'position', 'absolute');
            this.renderer.setStyle(content, 'inset', '0');
        }
    }
}
