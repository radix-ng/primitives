import { Directive, ElementRef, inject } from '@angular/core';
import { injectTooltipRoot } from './tooltip-root.directive';

@Directive({
    selector: '[rdxTooltipTrigger]',
    standalone: true,
    host: {
        '[attr.data-state]': 'tooltipRoot.state()',
        '(pointermove)': 'onPointerMove($event)',
        '(pointerleave)': 'onPointerLeave()',
        '(pointerdown)': 'onPointerDown()',
        '(focus)': 'onFocus()',
        '(blur)': 'onBlur()',
        '(click)': 'onClick()'
    }
})
export class RdxTooltipTriggerDirective {
    /** @ignore */
    readonly tooltipRoot = injectTooltipRoot();
    /** @ignore */
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef<HTMLElement>);

    /** @ignore */
    private isPointerDown = false;
    /** @ignore */
    private isPointerInside = false;

    /** @ignore */
    onPointerMove(event: PointerEvent): void {
        if (event.pointerType === 'touch') {
            return;
        }

        if (!this.isPointerInside) {
            this.tooltipRoot.onTriggerEnter();
            this.isPointerInside = true;
        }
    }

    /** @ignore */
    onPointerLeave(): void {
        this.isPointerInside = false;
        this.tooltipRoot.onTriggerLeave();
    }

    /** @ignore */
    onPointerDown(): void {
        this.isPointerDown = true;

        this.elementRef.nativeElement.addEventListener(
            'pointerup',
            () => {
                this.isPointerDown = false;
            },
            { once: true }
        );
    }

    /** @ignore */
    onFocus(): void {
        if (!this.isPointerDown) {
            this.tooltipRoot.handleOpen();
        }
    }

    /** @ignore */
    onBlur(): void {
        this.tooltipRoot.handleClose();
    }

    /** @ignore */
    onClick(): void {
        this.tooltipRoot.handleClose();
    }
}
