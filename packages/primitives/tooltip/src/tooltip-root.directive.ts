import { computed, Directive, EventEmitter, inject, InjectionToken, input, Output, signal } from '@angular/core';
import { injectTooltipConfig } from './tooltip.config';

export type RdxTooltipState = 'delayed-open' | 'instant-open' | 'closed';

export const RdxTooltipRootToken = new InjectionToken<RdxTooltipRootDirective>('RdxTooltipRootToken');

export function injectTooltipRoot(): RdxTooltipRootDirective {
    return inject(RdxTooltipRootToken);
}

@Directive({
    selector: '[rdxTooltipRoot]',
    standalone: true,
    providers: [
        {
            provide: RdxTooltipRootToken,
            useExisting: RdxTooltipRootDirective
        }
    ],
    exportAs: 'rdxTooltipRoot'
})
export class RdxTooltipRootDirective {
    readonly tooltipConfig = injectTooltipConfig();
    defaultOpen = input<boolean>(false);
    open = input<boolean>(this.defaultOpen());

    delayDuration = input<number>(this.tooltipConfig.delayDuration);
    disableHoverableContent = input<boolean>(this.tooltipConfig.disableHoverableContent ?? false);

    openTimer = 0;
    skipDelayTimer = 0;

    isOpen = signal<boolean>(this.open());
    isOpenDelayed = signal<boolean>(true);
    wasOpenDelayed = signal<boolean>(false);
    state = computed<RdxTooltipState>(() => {
        const currentIsOpen = this.isOpen();
        const currentWasOpenDelayed = this.wasOpenDelayed();

        if (currentIsOpen) {
            return currentWasOpenDelayed ? 'delayed-open' : 'instant-open';
        }

        return 'closed';
    });

    @Output() onOpenChange = new EventEmitter<boolean>();

    onTriggerEnter(): void {
        console.log('onTriggerEnter');

        if (this.isOpenDelayed()) {
            this.handleDelayedOpen();
        } else {
            this.handleOpen();
        }
    }

    onTriggerLeave(): void {
        console.log('onTriggerLeave');

        /*if (this.disableHoverableContent()) {
            this.handleClose();
        } else {
            window.clearTimeout(this.openTimer);
        }*/

        window.clearTimeout(this.openTimer);
        this.handleClose();
    }

    onOpen(): void {
        window.clearTimeout(this.skipDelayTimer);
        this.isOpenDelayed.set(false);
    }

    onClose(): void {
        window.clearTimeout(this.skipDelayTimer);

        this.skipDelayTimer = window.setTimeout(() => {
            this.isOpenDelayed.set(true);
        }, this.tooltipConfig.skipDelayDuration);
    }

    private handleDelayedOpen(): void {
        window.clearTimeout(this.openTimer);

        this.openTimer = window.setTimeout(() => {
            this.wasOpenDelayed.set(true);
            this.setOpen(true);
        }, this.delayDuration());
    }

    private handleOpen(): void {
        this.wasOpenDelayed.set(false);
        this.setOpen(true);
    }

    private handleClose(): void {
        window.clearTimeout(this.openTimer);
        this.setOpen(false);
    }

    private setOpen(open = false): void {
        if (open) {
            this.onOpen();

            document.dispatchEvent(new CustomEvent('tooltip.open'));
        } else {
            this.onClose();
        }

        this.isOpen.set(open);
        this.onOpenChange.emit(open);
    }
}
