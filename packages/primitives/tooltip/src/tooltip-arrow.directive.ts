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
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly width = input<number>(10);
    readonly height = input<number>(5);
    readonly arrowSvgElement = computed<HTMLElement>(() => {
        const width = this.width();
        const height = this.height();

        const svgElement = this.renderer.createElement('svg', 'svg');
        this.renderer.setAttribute(svgElement, 'width', `${width}`);
        this.renderer.setAttribute(svgElement, 'height', `${height}`);
        this.renderer.setAttribute(svgElement, 'viewBox', '0 0 30 10');
        this.renderer.setAttribute(svgElement, 'preserveAspectRatio', 'none');
        const polygonElement = this.renderer.createElement('polygon', 'svg');
        this.renderer.setAttribute(polygonElement, 'points', '0,0 30,0 15,10');
        this.renderer.appendChild(svgElement, polygonElement);

        return svgElement;
    });

    positioning(params: { side: RdxTooltipSide; sideOffset: number }): void {
        this.elementRef.nativeElement.parentElement?.setAttribute(
            'style',
            `position: relative; box-sizing: border-box`
        );
        this.elementRef.nativeElement.style.position = 'absolute';

        this.elementRef.nativeElement.style.height = `${this.height}px`;
        this.elementRef.nativeElement.style.transform = `rotate(${this.getRotationTransform(params.side)})`;
        this.elementRef.nativeElement.style.top = this.getTopOffset(params.side, params.sideOffset);

        if ([RdxTooltipSide.Top, RdxTooltipSide.Bottom].includes(params.side)) {
            this.elementRef.nativeElement.style.left = `calc(50% - ${this.width() / 2}px)`;
        }

        if (params.side === RdxTooltipSide.Left) {
            this.elementRef.nativeElement.style.left = `calc(100% - ${this.height() + 2}px)`;
        }

        if (params.side === RdxTooltipSide.Right) {
            this.elementRef.nativeElement.style.right = `calc(100% - ${this.height() + 2}px)`;
        }
    }

    private getTopOffset(side: RdxTooltipSide, sideOffset: number): string {
        switch (side) {
            case RdxTooltipSide.Top:
                return `calc(100% - ${15 - this.height()}px)`;
            case RdxTooltipSide.Bottom:
                return `-${this.height()}px`;
            case RdxTooltipSide.Left:
            case RdxTooltipSide.Right:
                return `calc(50% - ${this.width() / 2}px)`;
            default:
                return `calc(100% - ${sideOffset / 2}px)`;
        }
    }

    getRotationTransform(side: RdxTooltipSide): string {
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
