import {
    Directive,
    effect,
    EventEmitter,
    inject,
    InjectionToken,
    input,
    Output,
    signal,
    untracked
} from '@angular/core';
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

    isOpen = signal<boolean>(this.open());
    @Output() onOpenChange = new EventEmitter<boolean>();

    toggle(isOpen?: boolean): void {
        if (isOpen === undefined) {
            this.isOpen.update((prevState) => !prevState);
        } else {
            this.isOpen.set(isOpen);
        }
    }

    private onToggleEffect = effect(() => {
        // TODO: remove initial emit behaviour
        this.onOpenChange.emit(this.isOpen());
    });

    private onOpenInputChangedEffect = effect(() => {
        const open = this.open();

        untracked(() => {
            const isOpen = this.isOpen();

            if (isOpen != open) {
                console.log('change');
                this.isOpen.set(open);
            }
        });
    });
}
