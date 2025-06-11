import { NumberInput } from '@angular/cdk/coercion';
import { ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
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
import { toSignal } from '@angular/core/rxjs-interop';
import {
    getArrowPositionParams,
    getSideAndAlignFromAllPossibleConnectedPositions,
    RDX_POSITIONING_DEFAULTS
} from '@radix-ng/primitives/core';
import { RdxHoverCardArrowToken } from './hover-card-arrow.token';
import { injectHoverCardRoot } from './hover-card-root.inject';

/**
 * @group Components
 */
@Directive({
    selector: '[rdxHoverCardArrow]',
    providers: [
        {
            provide: RdxHoverCardArrowToken,
            useExisting: forwardRef(() => RdxHoverCardArrowDirective)
        }
    ]
})
export class RdxHoverCardArrowDirective {
    /** @ignore */
    private readonly renderer = inject(Renderer2);
    /** @ignore */
    private readonly rootDirective = injectHoverCardRoot();
    /** @ignore */
    readonly elementRef = inject(ElementRef);

    /**
     * The width of the arrow in pixels.
     * @group Props
     * @defaultValue 10
     */
    readonly width = input<number, NumberInput>(RDX_POSITIONING_DEFAULTS.arrow.width, { transform: numberAttribute });

    /**
     * The height of the arrow in pixels.
     * @group Props
     * @defaultValue 5
     */
    readonly height = input<number, NumberInput>(RDX_POSITIONING_DEFAULTS.arrow.height, { transform: numberAttribute });

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

    /** @ignore */
    private readonly currentArrowSvgElement = signal<HTMLOrSVGElement | undefined>(void 0);
    /** @ignore */
    private readonly position = toSignal(this.rootDirective.contentDirective().positionChange());

    /** @ignore */
    private anchorOrTriggerRect: DOMRect;

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
        this.onArrowSvgElementChangeEffect();
        this.onContentPositionAndArrowDimensionsChangeEffect();
    }

    /** @ignore */
    private setAnchorOrTriggerRect() {
        this.anchorOrTriggerRect = (
            this.rootDirective.anchorDirective() ?? this.rootDirective.triggerDirective()
        ).elementRef.nativeElement.getBoundingClientRect();
    }

    /** @ignore */
    private setPosition(position: ConnectedOverlayPositionChange, arrowDimensions: { width: number; height: number }) {
        this.setAnchorOrTriggerRect();
        const posParams = getArrowPositionParams(
            getSideAndAlignFromAllPossibleConnectedPositions(position.connectionPair),
            { width: arrowDimensions.width, height: arrowDimensions.height },
            { width: this.anchorOrTriggerRect.width, height: this.anchorOrTriggerRect.height }
        );

        this.renderer.setStyle(this.elementRef.nativeElement, 'top', posParams.top);
        this.renderer.setStyle(this.elementRef.nativeElement, 'bottom', '');
        this.renderer.setStyle(this.elementRef.nativeElement, 'left', posParams.left);
        this.renderer.setStyle(this.elementRef.nativeElement, 'right', '');
        this.renderer.setStyle(this.elementRef.nativeElement, 'transform', posParams.transform);
        this.renderer.setStyle(this.elementRef.nativeElement, 'transformOrigin', posParams.transformOrigin);
    }

    /** @ignore */
    private onArrowSvgElementChangeEffect() {
        effect(() => {
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
    }

    /** @ignore */
    private onContentPositionAndArrowDimensionsChangeEffect() {
        effect(() => {
            const position = this.position();
            const arrowDimensions = { width: this.width(), height: this.height() };
            untracked(() => {
                if (!position) {
                    return;
                }
                this.setPosition(position, arrowDimensions);
            });
        });
    }
}
