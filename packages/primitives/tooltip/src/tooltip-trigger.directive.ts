import { Directive, signal } from '@angular/core';
import { injectTooltipRoot } from './tooltip-root.directive';

@Directive({
    selector: '[rdxTooltipTrigger]',
    standalone: true,
    host: {
        '[attr.data-state]': 'getState()',
        '(pointermove)': 'onPointerMove($event)',
        '(pointerleave)': 'onPointerLeave()'
    }
})
export class RdxTooltipTriggerDirective {
    private tooltipRoot = injectTooltipRoot();
    private hasPointerMoveOpened = signal<boolean>(false);

    getState(): string {
        // TODO: set correct states
        // correct states is: "closed" | "delayed-open" | "instant-open"
        return this.tooltipRoot.isOpen() ? 'open' : 'closed';
    }

    onPointerMove(event: PointerEvent): void {
        if (event.pointerType === 'touch') {
            return;
        }

        if (!this.hasPointerMoveOpened() && !this.tooltipRoot.isPointerInTransit()) {
            this.tooltipRoot.onTriggerEnter();
            this.hasPointerMoveOpened.set(true);
        }
    }

    onPointerLeave(): void {
        this.tooltipRoot.onTriggerLeave();
        this.hasPointerMoveOpened.set(false);
    }
}
