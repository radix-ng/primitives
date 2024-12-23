import { ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import {
    AfterViewInit,
    computed,
    Directive,
    effect,
    ElementRef,
    forwardRef,
    inject,
    input,
    Renderer2,
    signal,
    untracked
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RdxPopoverArrowToken } from './popover-arrow.token';
import { injectPopoverRoot } from './popover-root.inject';
import { getArrowPositionParams, getSideAndAlignFromAllPossibleConnectedPositions } from './popover.utils';

@Directive({
    selector: '[rdxPopoverArrow]',
    standalone: true,
    providers: [
        {
            provide: RdxPopoverArrowToken,
            useExisting: forwardRef(() => RdxPopoverArrowDirective)
        }
    ]
})
export class RdxPopoverArrowDirective implements AfterViewInit {
    /** @ignore */
    private readonly renderer = inject(Renderer2);
    /** @ignore */
    private readonly popoverRoot = injectPopoverRoot();
    /** @ignore */
    readonly elementRef = inject(ElementRef);

    /**
     * @description The width of the arrow in pixels.
     * @default 10
     */
    readonly width = input<number>(10);

    /**
     * @description The height of the arrow in pixels.
     * @default 5
     */
    readonly height = input<number>(5);

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
    private readonly position = toSignal(this.popoverRoot.popoverContentDirective().positionChange());

    /** @ignore */
    private anchorOrTriggerRect: DOMRect;

    constructor() {
        this.onArrowSvgElementChangeEffect();
        this.onContentPositionChangeEffect();
    }

    /** @ignore */
    ngAfterViewInit() {
        if (this.elementRef.nativeElement.parentElement) {
            this.renderer.setStyle(this.elementRef.nativeElement.parentElement, 'position', 'relative');
        }
        this.renderer.setStyle(this.elementRef.nativeElement, 'position', 'absolute');
        this.renderer.setStyle(this.elementRef.nativeElement, 'boxSizing', '');
        this.renderer.setStyle(this.elementRef.nativeElement, 'fontSize', '0px');
    }

    private setAnchorOrTriggerRect() {
        this.anchorOrTriggerRect = (
            this.popoverRoot.popoverAnchorDirective() ?? this.popoverRoot.popoverTriggerDirective()
        ).elementRef.nativeElement.getBoundingClientRect();
    }

    /** @ignore */
    private setPosition(position: ConnectedOverlayPositionChange) {
        this.setAnchorOrTriggerRect();
        const posParams = getArrowPositionParams(
            getSideAndAlignFromAllPossibleConnectedPositions(position.connectionPair),
            { width: this.width(), height: this.height() },
            { width: this.anchorOrTriggerRect.width, height: this.anchorOrTriggerRect.height }
        );

        this.renderer.setStyle(this.elementRef.nativeElement, 'top', posParams.top);
        this.renderer.setStyle(this.elementRef.nativeElement, 'bottom', '');
        this.renderer.setStyle(this.elementRef.nativeElement, 'left', posParams.left);
        this.renderer.setStyle(this.elementRef.nativeElement, 'right', '');
        this.renderer.setStyle(this.elementRef.nativeElement, 'transform', posParams.transform);
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
    private onContentPositionChangeEffect() {
        effect(() => {
            const position = this.position();
            untracked(() => {
                if (!position) {
                    return;
                }
                this.setPosition(position);
            });
        });
    }
}
