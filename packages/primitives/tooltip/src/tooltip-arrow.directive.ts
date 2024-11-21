import { computed, Directive, effect, ElementRef, forwardRef, inject, input, Renderer2 } from '@angular/core';
import { RdxTooltipArrowToken } from './tooltip-arrow.token';
import { RdxTooltipContentToken } from './tooltip-content.token';
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
    private readonly contentDirective = inject(RdxTooltipContentToken);
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly width = input<number>(10);
    readonly height = input<number>(5);
    readonly arrowSvgElement = computed<HTMLElement>(() => {
        const width = this.width();
        const height = this.height();

        const svgElement = this.renderer.createElement('svg', 'svg');
        this.renderer.setAttribute(svgElement, 'viewBox', '0 0 30 10');
        this.renderer.setAttribute(svgElement, 'width', String(width));
        this.renderer.setAttribute(svgElement, 'height', String(height));
        const polygonElement = this.renderer.createElement('polygon', 'svg');
        this.renderer.setAttribute(polygonElement, 'points', '0,0 30,0 15,10');
        this.renderer.setAttribute(svgElement, 'preserveAspectRatio', 'none');
        this.renderer.appendChild(svgElement, polygonElement);

        return svgElement;
    });

    private getTopOffset(side: RdxTooltipSide, sideOffset: number): string {
        switch (side) {
            case RdxTooltipSide.Top:
                return `100%`;
            case RdxTooltipSide.Bottom:
                return `-${this.height()}px`;
            case RdxTooltipSide.Left:
            case RdxTooltipSide.Right:
                return `calc(50% - ${this.height() / 2}px)`;
            default:
                return `calc(100% - ${sideOffset / 2}px)`;
        }
    }

    private getRotationTransform(side: RdxTooltipSide): string {
        switch (side) {
            case 'bottom':
                return 'rotate(180deg)';
            case 'left':
                return 'rotate(-90deg) translate(0, -50%)';
            case 'right':
                return 'rotate(90deg) translate(0, -50%)';
            default:
                return 'rotate(0deg)';
        }
    }

    private readonly onArrowSvgElementChangeEffect = effect(() => {
        const arrowElement = this.arrowSvgElement();

        this.renderer.appendChild(this.elementRef.nativeElement, arrowElement);
    });

    private readonly onSideChangeEffect = effect(() => {
        const side = this.contentDirective.side();
        const sideOffset = this.contentDirective.sideOffset();

        this.elementRef.nativeElement.parentElement?.setAttribute(
            'style',
            `position: relative; box-sizing:content-box`
        );
        this.elementRef.nativeElement.style.position = 'absolute';
        this.elementRef.nativeElement.style.boxSizing = '';

        this.elementRef.nativeElement.style.width = `${this.width()}px`;
        this.elementRef.nativeElement.style.height = `${this.height()}px`;
        this.elementRef.nativeElement.style.display = 'flex';
        this.elementRef.nativeElement.style.transform = this.getRotationTransform(side);
        this.elementRef.nativeElement.style.top = this.getTopOffset(side, sideOffset);

        if ([RdxTooltipSide.Top, RdxTooltipSide.Bottom].includes(side)) {
            this.elementRef.nativeElement.style.left = `calc(50% - ${this.width() / 2}px)`;
        }

        if (side === RdxTooltipSide.Left) {
            this.elementRef.nativeElement.style.left = `100%`;
        }

        if (side === RdxTooltipSide.Right) {
            this.elementRef.nativeElement.style.right = `100%`;
        }
    });
}
