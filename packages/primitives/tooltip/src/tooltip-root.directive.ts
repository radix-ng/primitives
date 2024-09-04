import { Directive, EventEmitter, inject, InjectionToken, input, Output, signal } from '@angular/core';
import { injectTooltipConfig } from './tooltip.config';

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
    ]
})
export class RdxTooltipRootDirective {
    readonly tooltipConfig = injectTooltipConfig();
    defaultOpen = input<boolean>(false);
    open = input<boolean>(this.defaultOpen());
    delayDuration = input<number>(this.tooltipConfig.delayDuration);
    disableHoverableContent = input<boolean>(this.tooltipConfig.disableHoverableContent ?? false);

    isOpenDelayed = signal<boolean>(false);
    isOpen = signal<boolean>(this.open());
    isPointerInTransit = signal<boolean>(false);
    openTimer = signal<number>(0);
    wasOpenDelayed = signal<boolean>(false);
    @Output() onOpenChange = new EventEmitter<boolean>();

    onTriggerEnter(): void {
        if (this.isOpenDelayed()) {
            this.handleDelayOpen();
        } else {
            this.handleOpen();
        }
    }

    onTriggerLeave(): void {
        if (this.disableHoverableContent()) {
            // handleClose()
            this.isOpen.set(false);
        } else {
            window.clearTimeout(this.openTimer());
        }
    }

    private handleDelayOpen(): void {
        console.log('handleDelayOpen');

        window.clearTimeout(this.openTimer());

        this.openTimer.set(
            window.setTimeout(() => {
                this.wasOpenDelayed.set(true);
                // setOpen(true)
                this.isOpen.set(true);
            })
        );
    }

    private handleOpen(): void {
        console.log('handleOpen');

        window.clearTimeout(this.openTimer());
        this.wasOpenDelayed.set(false);
        // setOpen(true)
        this.isOpen.set(true);
    }
}
