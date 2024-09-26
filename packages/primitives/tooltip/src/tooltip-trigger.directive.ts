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
    readonly tooltipRoot = injectTooltipRoot();
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef<HTMLElement>);

    private isPointerDown = false;
    private isPointerInside = false;

    onPointerMove(event: PointerEvent): void {
        if (event.pointerType === 'touch') {
            return;
        }

        if (!this.isPointerInside) {
            this.tooltipRoot.onTriggerEnter();
            this.isPointerInside = true;
        }
    }

    onPointerLeave(): void {
        this.isPointerInside = false;
        this.tooltipRoot.onTriggerLeave();
    }

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

    onFocus(): void {
        if (!this.isPointerDown) {
            this.tooltipRoot.handleOpen();
        }
    }

    onBlur(): void {
        this.tooltipRoot.handleClose();
    }

    onClick(): void {
        this.tooltipRoot.handleClose();
    }
}
