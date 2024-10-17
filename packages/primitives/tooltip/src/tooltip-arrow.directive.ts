import { computed, Directive, effect, ElementRef, inject, input, Renderer2 } from '@angular/core';

@Directive({
    selector: '[rdxTooltipArrow]',
    standalone: true
})
export class RdxTooltipArrowDirective {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly renderer = inject(Renderer2);

    width = input<number>(10);
    height = input<number>(5);
    arrowSvgElement = computed<HTMLElement>(() => {
        const width = this.width();
        const height = this.height();

        const svgElement = this.renderer.createElement('svg', 'svg');
        this.renderer.setAttribute(svgElement, 'width', `${width}`);
        this.renderer.setAttribute(svgElement, 'height', `${height}`);
        this.renderer.setAttribute(svgElement, 'viewBox', '0 0 30 10');
        this.renderer.setAttribute(svgElement, 'fill', 'red');
        const polygonElement = this.renderer.createElement('polygon', 'svg');
        this.renderer.setAttribute(polygonElement, 'points', '0,0 30,0 15,10');
        this.renderer.appendChild(svgElement, polygonElement);

        return svgElement;
    });

    private readonly onArrowSvgElementChangeEffect = effect(() => {
        const arrowElement = this.arrowSvgElement();

        this.renderer.appendChild(this.elementRef.nativeElement, arrowElement);
    });
}
