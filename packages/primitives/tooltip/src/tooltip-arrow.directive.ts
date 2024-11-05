import { computed, Directive, effect, ElementRef, forwardRef, inject, input, Renderer2 } from '@angular/core';
import { RdxTooltipArrowToken } from './tooltip-arrow.token';
import { RdxTooltipSide } from './tooltip.types';

@Directive({
    selector: '[rdxTooltipArrow]',
    standalone: true,
    providers: [
        {
            provide: RdxTooltipArrowToken,
            useExisting: forwardRef(() => RdxTooltipArrowDirective)
        }
    ]
})
export class RdxTooltipArrowDirective {
    private readonly renderer = inject(Renderer2);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly width = input<number>(10);
    readonly height = input<number>(5);
    readonly arrowSvgElement = computed<HTMLElement>(() => {
        const width = this.width();
        const height = this.height();

        const svgElement = this.renderer.createElement('svg', 'svg');
        this.renderer.setAttribute(svgElement, 'width', `${width}`);
        this.renderer.setAttribute(svgElement, 'height', `${height}`);
        this.renderer.setAttribute(svgElement, 'viewBox', '0 0 30 10');
        const polygonElement = this.renderer.createElement('polygon', 'svg');
        this.renderer.setAttribute(polygonElement, 'points', '0,0 30,0 15,10');
        this.renderer.appendChild(svgElement, polygonElement);

        return svgElement;
    });

    positioning(params: { side: RdxTooltipSide }): void {
        this.elementRef.nativeElement.style.display = 'block';
        this.elementRef.nativeElement.style.position = 'absolute';

        const rotationTransform = this.getRotationTransform(params.side);

        this.elementRef.nativeElement.style.transform = `rotate(${rotationTransform})`;
        this.elementRef.nativeElement.style.top = '100%';
        this.elementRef.nativeElement.style.left = 'calc(50% - 5px)';
        this.elementRef.nativeElement.style.fill = 'red'; // !!!
    }

    private getRotationTransform(side: RdxTooltipSide): string {
        switch (side) {
            case 'bottom':
                return '180deg';
            case 'left':
                return '-90deg';
            case 'right':
                return '90deg';
            default:
                return '0deg';
        }
    }

    private readonly onArrowSvgElementChangeEffect = effect(() => {
        const arrowElement = this.arrowSvgElement();

        this.renderer.appendChild(this.elementRef.nativeElement, arrowElement);
    });
}
