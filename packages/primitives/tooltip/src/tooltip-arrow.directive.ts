import { NumberInput } from '@angular/cdk/coercion';
import { ConnectionPositionPair } from '@angular/cdk/overlay';
import {
    afterNextRender,
    computed,
    Directive,
    effect,
    ElementRef,
    forwardRef,
    inject,
    input,
    numberAttribute,
    Renderer2,
    signal,
    untracked
} from '@angular/core';
import { getArrowPositionParams, getSideAndAlignFromAllPossibleConnectedPositions } from '@radix-ng/primitives/core';
import { RdxTooltipArrowToken } from './tooltip-arrow.token';
import { RdxTooltipContentToken } from './tooltip-content.token';
import { injectTooltipRoot } from './tooltip-root.directive';

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
    /** @ignore */
    readonly tooltipRoot = injectTooltipRoot();
    /** @ignore */
    private readonly renderer = inject(Renderer2);
    /** @ignore */
    private readonly contentDirective = inject(RdxTooltipContentToken);
    /** @ignore */
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /**
     * The width of the arrow in pixels.
     */
    readonly width = input<number, NumberInput>(10, { transform: numberAttribute });

    /**
     * The height of the arrow in pixels.
     */
    readonly height = input<number, NumberInput>(5, { transform: numberAttribute });

    /**
     * @ignore
     * */
    private triggerRect: DOMRect;

    /** @ignore */
    private readonly currentArrowSvgElement = signal<HTMLOrSVGElement | undefined>(void 0);

    /** @ignore */
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

    constructor() {
        afterNextRender({
            write: () => {
                if (this.elementRef.nativeElement.parentElement) {
                    this.renderer.setStyle(this.elementRef.nativeElement.parentElement, 'position', 'relative');
                }
                this.renderer.setStyle(this.elementRef.nativeElement, 'position', 'absolute');
                this.renderer.setStyle(this.elementRef.nativeElement, 'boxSizing', '');
                this.renderer.setStyle(this.elementRef.nativeElement, 'fontSize', '0px');
            }
        });
    }

    /** @ignore */
    private setTriggerRect() {
        this.triggerRect = this.tooltipRoot.tooltipTriggerDirective().elementRef.nativeElement.getBoundingClientRect();
    }

    /** @ignore */
    private setPosition(position: ConnectionPositionPair, arrowDimensions: { width: number; height: number }) {
        this.setTriggerRect();
        const posParams = getArrowPositionParams(
            getSideAndAlignFromAllPossibleConnectedPositions(position),
            { width: arrowDimensions.width, height: arrowDimensions.height },
            { width: this.triggerRect.width, height: this.triggerRect.height }
        );

        this.renderer.setStyle(this.elementRef.nativeElement, 'top', posParams.top);
        this.renderer.setStyle(this.elementRef.nativeElement, 'bottom', '');
        this.renderer.setStyle(this.elementRef.nativeElement, 'left', posParams.left);
        this.renderer.setStyle(this.elementRef.nativeElement, 'right', '');
        this.renderer.setStyle(this.elementRef.nativeElement, 'transform', posParams.transform);
    }

    /** @ignore */
    private readonly onArrowSvgElementChangeEffect = effect(() => {
        const arrowElement = this.arrowSvgElement();
        untracked(() => {
            const currentArrowSvgElement = this.currentArrowSvgElement();
            if (currentArrowSvgElement) {
                this.renderer.removeChild(this.elementRef.nativeElement, currentArrowSvgElement);
            }
            this.currentArrowSvgElement.set(arrowElement);
            this.renderer.setStyle(this.elementRef.nativeElement, 'width', `${this.width()}px`);
            this.renderer.setStyle(this.elementRef.nativeElement, 'height', `${this.height()}px`);
            this.renderer.appendChild(this.elementRef.nativeElement, this.currentArrowSvgElement());
        });
    });

    /** @ignore */
    private readonly onContentPositionAndArrowDimensionsChangeEffect = effect(() => {
        const position = this.contentDirective.position();
        const arrowDimensions = { width: this.width(), height: this.height() };
        untracked(() => {
            if (!position) {
                return;
            }
            this.setPosition(position, arrowDimensions);
        });
    });
}
